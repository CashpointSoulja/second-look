import type { OrderState, Verdict } from "@/lib/types";

export function Card({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-card border border-line bg-white ${className}`}>{children}</div>;
}

export function GradeChip({ grade, label }: { grade: string; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-cream px-2 py-0.5 text-xs font-bold text-ink">
      {label && <span className="font-medium text-muted">{label}</span>}
      Grade {grade}
    </span>
  );
}

const STATE_STYLE: Record<OrderState, string> = {
  DELIVERED: "bg-canvas text-muted border-line",
  VERIFYING: "bg-fleek-soft text-ink border-fleek",
  DISPUTED: "bg-below-soft text-below border-below/30",
  CLEAN: "bg-match-soft text-match border-match/30",
  RESOLVED: "bg-ink text-white border-ink",
};

export function StateChip({ state }: { state: OrderState }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${STATE_STYLE[state]}`}>
      {state}
    </span>
  );
}

const VERDICT: Record<Verdict, { label: string; cls: string; icon: string }> = {
  MATCH: { label: "Matches listing", cls: "bg-match text-white", icon: "M5 12l5 5L20 7" },
  BELOW_GRADE: { label: "Below grade", cls: "bg-below text-white", icon: "M12 8v5m0 3.5v.5M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" },
  NEEDS_REVIEW: { label: "Needs human review", cls: "bg-review text-white", icon: "M12 8v4m0 4h.01M12 21a9 9 0 110-18 9 9 0 010 18z" },
};

export function VerdictBadge({ verdict, size = "lg" }: { verdict: Verdict; size?: "lg" | "sm" }) {
  const v = VERDICT[verdict];
  return (
    <span className={`verdict-pop inline-flex items-center gap-2 rounded-xl font-extrabold uppercase tracking-wide ${v.cls} ${size === "lg" ? "px-4 py-2.5 text-lg" : "px-2 py-0.5 text-[11px]"}`}>
      <svg viewBox="0 0 24 24" className={size === "lg" ? "h-6 w-6" : "h-3.5 w-3.5"} fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
        <path d={v.icon} />
      </svg>
      {v.label}
    </span>
  );
}

const FLOW: OrderState[] = ["DELIVERED", "VERIFYING", "DISPUTED", "RESOLVED"];
export function StateStepper({ state }: { state: OrderState }) {
  const flow = state === "CLEAN" ? (["DELIVERED", "VERIFYING", "CLEAN", "RESOLVED"] as OrderState[]) : FLOW;
  const at = flow.indexOf(state);
  return (
    <ol className="flex items-center gap-1.5 text-[10px] font-bold tracking-wide sm:text-[11px]">
      {flow.map((s, i) => (
        <li key={s} className="flex flex-1 flex-col gap-1">
          <span className={`h-1.5 rounded-full ${i <= at ? "bg-fleek" : "bg-line"}`} />
          <span className={i === at ? "text-ink" : "text-subtle"}>{s}</span>
        </li>
      ))}
    </ol>
  );
}
