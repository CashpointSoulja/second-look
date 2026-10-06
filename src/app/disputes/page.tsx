import Link from "next/link";
import { resetDemo } from "@/app/actions";
import { ActionButton } from "@/components/action-button";
import { Card, StateChip } from "@/components/ui";
import { listDisputes } from "@/lib/queries";
import { gbp } from "@/lib/refund";

export default async function DisputesPage() {
  const rows = await listDisputes();
  const open = rows.filter((r) => r.state === "DISPUTED");
  const resolved = rows.filter((r) => r.dispute_status === "RESOLVED");
  const sum = (xs: typeof rows) => xs.reduce((s, r) => s + r.reclaim, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold">Disputes ledger</h1>
        <p className="text-sm text-muted">Every delivery, what was flagged, and what it is worth.</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          ["Open disputes", String(open.length)],
          ["Value in dispute", gbp(sum(open))],
          ["Resolved", gbp(sum(resolved))],
        ].map(([k, v]) => (
          <Card key={k} className="p-3">
            <p className="text-[11px] font-semibold text-muted">{k}</p>
            <p className="text-lg font-extrabold">{v}</p>
          </Card>
        ))}
      </div>

      <Card className="divide-y divide-line">
        <div className="hidden grid-cols-[1.6fr_0.8fr_0.8fr_1fr] gap-3 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-subtle sm:grid">
          <span>Order</span>
          <span>Flagged</span>
          <span>Value</span>
          <span className="text-right">Status</span>
        </div>
        {rows.map((r) => (
          <Link
            key={r.id}
            href={r.dispute_status ? `/order/${r.id}/dispute` : `/order/${r.id}`}
            className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 px-4 py-3 transition hover:bg-canvas sm:grid-cols-[1.6fr_0.8fr_0.8fr_1fr] sm:items-center"
          >
            <span>
              <span className="block text-sm font-bold">{r.title}</span>
              <span className="text-xs text-muted">
                {r.supplier} · <span className="font-mono">{r.id}</span>
              </span>
            </span>
            <span className="text-sm font-semibold sm:order-none">
              {r.flagged}/{r.pieces} <span className="text-xs font-medium text-muted sm:hidden">flagged</span>
            </span>
            <span className={`text-sm font-extrabold ${r.reclaim > 0 ? "text-below" : "text-muted"}`}>{gbp(r.reclaim)}</span>
            <span className="text-right">
              <StateChip state={r.state} />
            </span>
          </Link>
        ))}
      </Card>

      <div className="rounded-card border border-dashed border-line p-4 text-center">
        <p className="text-xs text-muted">Demo controls: put every order back to DELIVERED so the demo can run again.</p>
        <ActionButton action={resetDemo} variant="ghost" className="mt-2">
          Reset demo data
        </ActionButton>
      </div>
    </div>
  );
}
