import type { OrderState } from "./types";

// DELIVERED → VERIFYING → DISPUTED | CLEAN → RESOLVED
const NEXT: Record<OrderState, OrderState[]> = {
  DELIVERED: ["VERIFYING"],
  VERIFYING: ["VERIFYING", "DISPUTED", "CLEAN"],
  DISPUTED: ["RESOLVED"],
  CLEAN: ["RESOLVED"],
  RESOLVED: [],
};

export const canTransition = (from: OrderState, to: OrderState) => NEXT[from].includes(to);
export const canVerify = (s: OrderState) => canTransition(s, "VERIFYING");
