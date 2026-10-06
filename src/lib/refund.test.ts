import { describe, expect, it } from "vitest";
import { finalVerdict, refundFor } from "./refund";
import { canTransition, canVerify } from "./state";
import type { Analysis, Defect } from "./types";

const base: Analysis = { verdict: "BELOW_GRADE", true_grade: "C", confidence: 0.9, reason: "", defects: [] };
const newStain: Defect = { type: "stain", severity: "major", status: "NEW", bbox: [0, 0, 0.1, 0.1], note: "" };
const disclosed: Defect = { ...newStain, status: "DISCLOSED" };

describe("refundFor", () => {
  it("charges the grade gap on below-grade pieces", () => {
    expect(refundFor(18, "A", "C", "BELOW_GRADE")).toBe(10.8);
    expect(refundFor(28, "B", "C", "BELOW_GRADE")).toBe(12);
  });
  it("is zero for matches, reviews and non-drops", () => {
    expect(refundFor(18, "A", "C", "NEEDS_REVIEW")).toBe(0);
    expect(refundFor(18, "B", "A", "BELOW_GRADE")).toBe(0);
    expect(refundFor(18, "A", null, "BELOW_GRADE")).toBe(0);
  });
});

describe("finalVerdict", () => {
  it("flags new damage below the claimed grade", () => {
    expect(finalVerdict({ ...base, defects: [newStain] }, "A")).toBe("BELOW_GRADE");
  });
  it("sends disclosed-only damage to review, not refund", () => {
    expect(finalVerdict({ ...base, defects: [disclosed] }, "A")).toBe("NEEDS_REVIEW");
  });
  it("sends low confidence to review", () => {
    expect(finalVerdict({ ...base, confidence: 0.4, defects: [newStain] }, "A")).toBe("NEEDS_REVIEW");
  });
  it("accepts matches at or above grade", () => {
    expect(finalVerdict({ ...base, verdict: "MATCH", true_grade: "A" }, "B")).toBe("MATCH");
  });
});

describe("order state machine", () => {
  it("follows DELIVERED → VERIFYING → DISPUTED|CLEAN → RESOLVED", () => {
    expect(canVerify("DELIVERED")).toBe(true);
    expect(canTransition("VERIFYING", "DISPUTED")).toBe(true);
    expect(canTransition("VERIFYING", "CLEAN")).toBe(true);
    expect(canTransition("DISPUTED", "RESOLVED")).toBe(true);
    expect(canTransition("DELIVERED", "DISPUTED")).toBe(false);
    expect(canVerify("DISPUTED")).toBe(false);
    expect(canVerify("RESOLVED")).toBe(false);
  });
});
