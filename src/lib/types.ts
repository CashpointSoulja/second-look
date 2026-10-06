export type Grade = "A" | "B" | "C";
export type OrderState = "DELIVERED" | "VERIFYING" | "DISPUTED" | "CLEAN" | "RESOLVED";
export type Verdict = "MATCH" | "BELOW_GRADE" | "NEEDS_REVIEW";
export type DefectStatus = "DISCLOSED" | "NEW" | "WORSENED";

export type Defect = {
  type: string;
  severity: "minor" | "moderate" | "major";
  status: DefectStatus;
  bbox: [number, number, number, number]; // x, y, w, h as 0–1 fractions of the arrival photo
  note: string;
};

export type ListingDefect = { type: string; severity: string; note: string };

export type Analysis = {
  verdict: Exclude<Verdict, "NEEDS_REVIEW">;
  true_grade: Grade;
  confidence: number;
  reason: string;
  defects: Defect[];
};

export type Order = {
  id: string;
  supplier: string;
  title: string;
  claimed_grade: string;
  value_gbp: number;
  state: OrderState;
  delivered_at: string;
};

export type Item = {
  id: string;
  order_id: string;
  position: number;
  name: string;
  claimed_grade: Grade;
  unit_price_gbp: number;
  listing_photo_url: string;
  demo_arrival_url: string | null;
  listing_defects: ListingDefect[];
  received_photo_url: string | null;
  verdict: Verdict | null;
  true_grade: Grade | null;
  confidence: number | null;
  agent_reason: string | null;
  defects: Defect[];
  refund_gbp: number | null;
  source: "ai" | "scripted" | null;
};

export type Dispute = {
  id: string;
  order_id: string;
  message: string;
  items_flagged: number;
  total_refund_gbp: number;
  status: "OPEN" | "RESOLVED";
  created_at: string;
};
