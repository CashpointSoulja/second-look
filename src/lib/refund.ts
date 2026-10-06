import type { Analysis, Grade, Verdict } from "./types";

// ASSUMPTION for the demo: resale value of a piece relative to grade A.
// Real factors should come from Fleek's own price data per category.
export const GRADE_FACTOR: Record<Grade, number> = { A: 1, B: 0.7, C: 0.4 };
export const REVIEW_THRESHOLD = 0.6;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Turns a raw analysis into the final verdict shown to the buyer. */
export function finalVerdict(a: Analysis, claimed: Grade): Verdict {
  if (a.confidence < REVIEW_THRESHOLD) return "NEEDS_REVIEW";
  const below = GRADE_FACTOR[a.true_grade] < GRADE_FACTOR[claimed];
  const hasNewDamage = a.defects.some((d) => d.status !== "DISCLOSED");
  if (a.verdict === "BELOW_GRADE" && below && hasNewDamage) return "BELOW_GRADE";
  if (a.verdict === "MATCH" && !below) return "MATCH";
  return "NEEDS_REVIEW"; // model contradicted itself or damage was only what the listing disclosed
}

/** Indicative refund: listed-grade value minus received-grade value, only for new/worsened damage. */
export function refundFor(unitPrice: number, claimed: Grade, trueGrade: Grade | null, verdict: Verdict | null) {
  if (verdict !== "BELOW_GRADE" || !trueGrade) return 0;
  const ratio = GRADE_FACTOR[trueGrade] / GRADE_FACTOR[claimed];
  return ratio >= 1 ? 0 : round2(unitPrice * (1 - ratio));
}

export const gbp = (n: number) => `£${n.toFixed(2)}`;
