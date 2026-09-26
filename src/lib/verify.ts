import { generateText, Output } from "ai";
import { z } from "zod";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Analysis, Grade, ListingDefect } from "./types";

const MODEL = process.env.VISION_MODEL ?? "google/gemini-3.5-flash";
export const aiConfigured = () => Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);

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

export async function analyse(opts: {
  claimed: Grade;
  itemName: string;
  listingUrl: string;
  arrivalUrl: string;
  disclosed: ListingDefect[];
}): Promise<Analysis> {
  const [listing, arrival] = await Promise.all([bytes(opts.listingUrl), bytes(opts.arrivalUrl)]);
  const disclosed = opts.disclosed.length ? opts.disclosed.map((d) => `- ${d.note}`).join("\n") : "- none";
  const { output } = await generateText({
    model: MODEL,
    abortSignal: AbortSignal.timeout(40_000),
    output: Output.object({ schema }),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `You verify secondhand clothing condition for a wholesale marketplace.
Piece: ${opts.itemName}. Claimed grade: ${opts.claimed}.
${RUBRIC}
Defects the supplier disclosed in the listing:
${disclosed}

Image 1 is the LISTING photo. Image 2 is the ARRIVAL photo taken by the buyer.
Find every visible defect on the ARRIVAL photo and draw a tight box around each.
Mark each defect DISCLOSED (visible in listing or disclosed above), WORSENED (was there but is clearly worse) or NEW.
Verdict MATCH if the piece meets or exceeds the claimed grade; BELOW_GRADE only if new or worsened damage drops it below the claimed grade.
Estimate the true grade. Be conservative: if the photo is unclear, lower your confidence rather than guessing.`,
          },
          { type: "file", mediaType: "image/jpeg", data: listing },
          { type: "file", mediaType: "image/jpeg", data: arrival },
        ],
      },
    ],
  });
  return {
    verdict: output.verdict,
    true_grade: output.true_grade,
    confidence: output.confidence,
    reason: output.reason,
    defects: output.defects.map(({ x, y, w, h, ...d }) => ({ ...d, bbox: [x, y, w, h] })),
  };
}
