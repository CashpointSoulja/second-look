import { generateText, Output } from "ai";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Analysis, Grade, ListingDefect } from "./types";

const GATEWAY_MODEL = process.env.VISION_MODEL ?? "google/gemini-3.5-flash";
const OPENAI_MODEL = process.env.OPENAI_VISION_MODEL ?? "gpt-4.1-mini";

// OpenAI key wins; otherwise Vercel AI Gateway (OIDC arrives per request on Vercel).
export const aiConfigured = () =>
  Boolean(process.env.OPENAI_API_KEY || process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN || process.env.VERCEL);

const schema = z.object({
  verdict: z.enum(["MATCH", "BELOW_GRADE"]),
  true_grade: z.enum(["A", "B", "C"]),
  confidence: z.number().min(0).max(1),
  reason: z.string().describe("2–3 plain sentences a buyer and supplier can both follow"),
  defects: z.array(
    z.object({
      type: z.string().describe("stain | hole | pilling | fading | seam | stretch | hardware | scuff | mark | other"),
      severity: z.enum(["minor", "moderate", "major"]),
      status: z.enum(["DISCLOSED", "NEW", "WORSENED"]),
      x: z.number().min(0).max(1).describe("left edge of the defect box on the ARRIVAL photo, fraction of width"),
      y: z.number().min(0).max(1).describe("top edge, fraction of height"),
      w: z.number().min(0).max(1),
      h: z.number().min(0).max(1),
      note: z.string().describe("under 12 words"),
    }),
  ),
});
type Raw = z.infer<typeof schema>;

const RUBRIC = `Grading rubric (demo assumption):
A = no visible defects, minimal wear, resell at full price.
B = light wear only (light pilling, slight fading, tiny marks); resell as-is.
C = noticeable defects (stains, holes, broken hardware, heavy pilling, stretched collars); needs repair or heavy discount.`;

/** Loads a demo asset from /public or fetches a remote (Blob) URL. */
async function bytes(url: string) {
  if (url.startsWith("/")) return readFile(path.join(process.cwd(), "public", url));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function prompt(o: { claimed: Grade; itemName: string; disclosed: ListingDefect[] }) {
  const disclosed = o.disclosed.length ? o.disclosed.map((d) => `- ${d.note}`).join("\n") : "- none";
  return `You verify secondhand clothing condition for a wholesale marketplace.
Piece: ${o.itemName}. Claimed grade: ${o.claimed}.
${RUBRIC}
Defects the supplier disclosed in the listing:
${disclosed}

Image 1 is the LISTING photo. Image 2 is the ARRIVAL photo taken by the buyer.
Find every visible defect on the ARRIVAL photo and draw a tight box around each (x, y, w, h as fractions 0-1 of the image).
Mark each defect DISCLOSED (visible in listing or disclosed above), WORSENED (was there but is clearly worse) or NEW.
Verdict MATCH if the piece meets or exceeds the claimed grade; BELOW_GRADE only if new or worsened damage drops it below the claimed grade.
Estimate the true grade. Be conservative: if the photo is unclear, lower your confidence rather than guessing.`;
}

async function viaOpenAI(text: string, listing: Buffer, arrival: Buffer): Promise<Raw> {
  const img = (b: Buffer) => ({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${b.toString("base64")}` } });
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(40_000),
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: [{ type: "text", text }, img(listing), img(arrival)] }],
      response_format: { type: "json_schema", json_schema: { name: "verdict", strict: true, schema: z.toJSONSchema(schema, { target: "draft-7" }) } },
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? `OpenAI ${res.status}`);
  return schema.parse(JSON.parse(json.choices[0].message.content));
}

async function viaGateway(text: string, listing: Buffer, arrival: Buffer): Promise<Raw> {
  const { output } = await generateText({
    model: GATEWAY_MODEL,
    abortSignal: AbortSignal.timeout(40_000),
    output: Output.object({ schema }),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text },
          { type: "file", mediaType: "image/jpeg", data: listing },
          { type: "file", mediaType: "image/jpeg", data: arrival },
        ],
      },
    ],
  });
  return output;
}

export async function analyse(opts: {
  claimed: Grade;
  itemName: string;
  listingUrl: string;
  arrivalUrl: string;
  disclosed: ListingDefect[];
}): Promise<Analysis> {
  const [listing, arrival] = await Promise.all([bytes(opts.listingUrl), bytes(opts.arrivalUrl)]);
  const text = prompt(opts);
  const out = process.env.OPENAI_API_KEY ? await viaOpenAI(text, listing, arrival) : await viaGateway(text, listing, arrival);
  return {
    verdict: out.verdict,
    true_grade: out.true_grade,
    confidence: out.confidence,
    reason: out.reason,
    defects: out.defects.map(({ x, y, w, h, ...d }) => ({ ...d, bbox: [x, y, w, h] })),
  };
}
