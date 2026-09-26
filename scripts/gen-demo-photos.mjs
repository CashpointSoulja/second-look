// Generates the illustrative demo photo pairs (listing + arrival) via Vercel AI Gateway.
// Run once: node --env-file=.env.local scripts/gen-demo-photos.mjs [slug ...]
// Output is committed to public/demo so the deployed demo never depends on this script.
import { generateText } from "ai";
import { mkdir, writeFile, readFile, access, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const MODEL = "google/gemini-3.1-flash-image";
const OUT = new URL("../public/demo/", import.meta.url);

const LISTING_STYLE =
  "Realistic smartphone photo for a wholesale secondhand clothing listing. Single garment laid flat, neatly spread, shot straight down on a plain light grey concrete warehouse floor, even daylight, whole garment in frame, no people, no text, no logos overlay, no watermark. Square framing.";
const ARRIVAL_STYLE =
  "Re-photograph this exact same garment (same colour, cut and details) as a buyer would on arrival: laid flat on a light oak wooden table at home, warmer indoor light, slightly different angle, whole garment in frame, no people, no text, no watermark. Square framing.";

const PIECES = [
  { slug: "lulu-align-black", listing: "Black Lululemon Align high-rise full-length leggings in excellent condition.", arrival: "Add a large, obvious pale orange-white bleach stain on the upper front of the left thigh, roughly palm sized, clearly visible." },
  { slug: "lulu-define-navy", listing: "Navy Lululemon Define zip-up fitted jacket with light fabric pilling visible on both cuffs, otherwise good condition.", arrival: "Keep the same light pilling on the cuffs. No other damage." },
  { slug: "lulu-wunder-olive", listing: "Olive green Lululemon Wunder Under leggings in excellent, like-new condition.", arrival: "Add a small ragged hole at the right knee and a visibly pulled, puckered seam on the left inner calf." },
  { slug: "tee-harley-black", listing: "Faded black 1990s Harley-Davidson graphic t-shirt with a cracked eagle print, visible overall fading and a small light mark near the neckline.", arrival: "Keep the same fading, cracked print and small neckline mark. No other damage." },
  { slug: "tee-band-white", listing: "White vintage single-stitch band t-shirt with a black tour print, clean and bright.", arrival: "Add clear yellow sweat stains at both underarms and make the collar visibly stretched and wavy." },
  { slug: "tee-nike-grey", listing: "Heather grey vintage Nike t-shirt with a small centre chest swoosh, clean, like new.", arrival: "No damage, same clean condition." },
  { slug: "designer-burberry-scarf", listing: "Classic beige Burberry check cashmere scarf with fringed ends, folded once, excellent condition.", arrival: "No damage, same excellent condition." },
  { slug: "designer-rl-cable", listing: "Cream Ralph Lauren cable-knit wool crew-neck jumper, excellent condition.", arrival: "Add three small moth holes clustered on the front body below the chest, clearly visible against the cream knit." },
  { slug: "designer-tommy-harrington", listing: "Navy Tommy Hilfiger harrington jacket with a small light scuff on the left cuff, otherwise good condition.", arrival: "Make the left cuff scuff much larger and frayed, and show the zip pull missing its tab (broken zip pull)." },
];

const exists = (p) => access(p).then(() => true, () => false);

async function image(content) {
  const r = await generateText({ model: MODEL, messages: [{ role: "user", content }] });
  const f = r.files.find((x) => x.mediaType.startsWith("image/"));
  if (!f) throw new Error("no image returned");
  return Buffer.from(f.uint8Array);
}

// macOS `sips` resizes/converts without adding an image dependency to the app.
async function saveJpg(buf, url) {
  const out = fileURLToPath(url);
  const tmp = `${out}.src`;
  await writeFile(tmp, buf);
  await promisify(execFile)("sips", ["-Z", "900", "-s", "format", "jpeg", "-s", "formatOptions", "80", tmp, "--out", out]);
  await rm(tmp);
}

async function run(p) {
  const listingPath = new URL(`${p.slug}-listing.jpg`, OUT);
  const arrivalPath = new URL(`${p.slug}-arrival.jpg`, OUT);
  if (!(await exists(listingPath))) {
    await saveJpg(await image([{ type: "text", text: `${p.listing} ${LISTING_STYLE}` }]), listingPath);
  }
  if (!(await exists(arrivalPath))) {
    const listing = await readFile(listingPath);
    const buf = await image([
      { type: "file", mediaType: "image/jpeg", data: listing },
      { type: "text", text: `${ARRIVAL_STYLE} ${p.arrival}` },
    ]);
    await saveJpg(buf, arrivalPath);
  }
  console.log("ok", p.slug);
}

await mkdir(OUT, { recursive: true });
const only = process.argv.slice(2);
const results = await Promise.allSettled(PIECES.filter((p) => !only.length || only.includes(p.slug)).map(run));
results.forEach((r) => r.status === "rejected" && console.error("fail", r.reason?.message ?? r.reason));
