import { gbp } from "./refund";
import type { Item, Order } from "./types";

const date = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

/** Deterministic, evidence-filled message. No LLM, so it never invents facts. */
export function disputeMessage(order: Order, items: Item[], origin: string) {
  const flagged = items.filter((i) => i.verdict === "BELOW_GRADE");
  const review = items.filter((i) => i.verdict === "NEEDS_REVIEW");
  const total = flagged.reduce((s, i) => s + (i.refund_gbp ?? 0), 0);
  const abs = (u: string | null) => (u ? new URL(u, origin).toString() : "n/a");

  const lines = flagged.map((i, n) => {
    const issues = i.defects.filter((d) => d.status !== "DISCLOSED").map((d) => `${d.note}${d.status === "WORSENED" ? " (worse than listed)" : ""}`);
    return [
      `${n + 1}. ${i.name}. Listed grade ${i.claimed_grade}, arrived grade ${i.true_grade}.`,
      `   Issues not shown in the listing: ${issues.join("; ")}.`,
      `   Refund requested: ${gbp(i.refund_gbp ?? 0)} (unit price ${gbp(i.unit_price_gbp)}).`,
      `   Listing photo: ${abs(i.listing_photo_url)}`,
      `   Arrival photo: ${abs(i.received_photo_url)}`,
    ].join("\n");
  });

  return [
    `Subject: Condition dispute for order ${order.id} (${order.title})`,
    ``,
    `Hello ${order.supplier},`,
    ``,
    `Order ${order.id} was delivered on ${date(order.delivered_at)} and was sold as grade ${order.claimed_grade}. I checked ${items.filter((i) => i.verdict).length} of ${items.length} pieces on arrival. ${flagged.length} arrived below their listed grade, with damage that was not shown or disclosed in the listing:`,
    ``,
    ...lines.flatMap((l) => [l, ""]),
    `Total refund requested: ${gbp(total)}.`,
    `This is the difference between the listed-grade and received-grade value of each affected piece. Pieces that match their listing, or whose flaws were disclosed, are not included.`,
    ...(review.length ? [``, `${review.length} further piece(s) are unclear from the photos and are not part of this claim.`] : []),
    ``,
    `Please confirm the refund, or reply with evidence showing otherwise, within 48 hours.`,
    ``,
    `Kind regards,`,
    `[Your name / shop]`,
  ].join("\n");
}
