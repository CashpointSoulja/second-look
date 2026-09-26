import { put } from "@vercel/blob";
import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@/lib/db";
import { finalVerdict, refundFor } from "@/lib/refund";
import { canVerify } from "@/lib/state";
import { aiConfigured, analyse } from "@/lib/verify";
import type { Analysis, Item, OrderState } from "@/lib/types";

export const maxDuration = 60;

const MAX_BYTES = 4 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

type Row = Item & { fallback_result: Analysis | null; state: OrderState };

export async function POST(req: NextRequest, ctx: RouteContext<"/api/items/[id]/verify">) {
  const { id } = await ctx.params;
  const [item] = await sql<Row>(
    "select i.*, o.state from items i join orders o on o.id = i.order_id where i.id = $1",
    [id],
  );
  if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });
  if (!canVerify(item.state))
    return NextResponse.json({ error: `Order is ${item.state}; verification is closed` }, { status: 409 });

  const form = await req.formData();
  const file = form.get("photo");
  let arrivalUrl: string;
  if (file instanceof File) {
    if (!TYPES.includes(file.type)) return NextResponse.json({ error: "Upload a JPG, PNG or WebP photo" }, { status: 415 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: "Photo must be under 4 MB" }, { status: 413 });
    const blob = await put(`received/${id}.jpg`, file, { access: "public", addRandomSuffix: true, contentType: file.type });
    arrivalUrl = blob.url;
  } else if (form.get("demo") === "1" && item.demo_arrival_url) {
    arrivalUrl = item.demo_arrival_url;
  } else {
    return NextResponse.json({ error: "No photo provided" }, { status: 400 });
  }

  let analysis: Analysis | null = null;
  let source: "ai" | "scripted" = "ai";
  let note: string | undefined;
  if (aiConfigured()) {
    try {
      analysis = await analyse({
        claimed: item.claimed_grade,
        itemName: item.name,
        listingUrl: item.listing_photo_url,
        arrivalUrl,
        disclosed: item.listing_defects,
      });
    } catch (e) {
      note = e instanceof Error ? e.message : "AI unavailable";
      console.error("verify: AI failed, using scripted fallback", note);
    }
  }
  if (!analysis) {
    if (!item.fallback_result) return NextResponse.json({ error: "AI unavailable and no scripted verdict" }, { status: 503 });
    analysis = item.fallback_result;
    source = "scripted";
  }

  const verdict = finalVerdict(analysis, item.claimed_grade);
  const refund = refundFor(item.unit_price_gbp, item.claimed_grade, analysis.true_grade, verdict);
  const [updated] = await sql<Partial<Row>>(
    `update items set received_photo_url = $2, verdict = $3, true_grade = $4, confidence = $5,
            agent_reason = $6, defects = $7, refund_gbp = $8, source = $9, verified_at = now()
      where id = $1 returning *`,
    [id, arrivalUrl, verdict, analysis.true_grade, analysis.confidence, analysis.reason, JSON.stringify(analysis.defects), refund, source],
  );
  delete updated.fallback_result; // the scripted answer key never reaches the browser
  await sql("update orders set state = 'VERIFYING' where id = $1 and state = 'DELIVERED'", [item.order_id]);
  return NextResponse.json({ item: updated, note });
}
