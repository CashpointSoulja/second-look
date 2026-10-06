import Link from "next/link";
import { notFound } from "next/navigation";
import { buildDispute, markClean, resolveOrder } from "@/app/actions";
import { ActionButton } from "@/components/action-button";
import { ItemCheck } from "@/components/item-check";
import { Card, StateChip, StateStepper } from "@/components/ui";
import { getOrder } from "@/lib/queries";
import { gbp } from "@/lib/refund";
import { canVerify } from "@/lib/state";

export default async function OrderPage({ params }: PageProps<"/order/[id]">) {
  const { id } = await params;
  const data = await getOrder(id);
  if (!data) notFound();
  const { order, items, dispute } = data;

  const checked = items.filter((i) => i.verdict).length;
  const flagged = items.filter((i) => i.verdict === "BELOW_GRADE");
  const reclaim = flagged.reduce((s, i) => s + (i.refund_gbp ?? 0), 0);
  const allClean = checked === items.length && flagged.length === 0;
  const locked = !canVerify(order.state);

  return (
    <div className="space-y-4">
      <Link href="/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink">
        ← Orders
      </Link>

      <Card className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold leading-tight">{order.title}</h1>
            <p className="text-sm text-muted">
              {order.supplier} · <span className="font-mono text-xs">{order.id}</span>
            </p>
          </div>
          <StateChip state={order.state} />
        </div>
        <dl className="grid grid-cols-3 gap-2 text-center">
          {[
            ["Order value", gbp(order.value_gbp)],
            ["Listed grade", order.claimed_grade],
            ["Pieces", String(items.length)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-canvas py-2">
              <dt className="text-[11px] font-semibold text-muted">{k}</dt>
              <dd className="font-extrabold">{v}</dd>
            </div>
          ))}
        </dl>
        <StateStepper state={order.state} />
      </Card>

      <div className="space-y-3">
        {items.map((item) => (
          <ItemCheck key={item.id} item={item} locked={locked} />
        ))}
      </div>

      {/* Sticky summary bar: the next step is always one tap away */}
      <div className="fixed inset-x-0 bottom-[60px] z-20 border-t border-line bg-white/95 backdrop-blur sm:bottom-0">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-bold">
              {checked}/{items.length} checked
              {flagged.length > 0 && <span className="text-below"> · {flagged.length} below grade</span>}
            </p>
            <p className="text-xs text-muted">
              {flagged.length > 0 ? `${gbp(reclaim)} indicative refund` : allClean ? "Everything matches the listing" : "Check each piece as you unpack"}
            </p>
          </div>
          {order.state === "VERIFYING" && flagged.length > 0 && (
            <ActionButton action={buildDispute.bind(null, order.id)}>Build dispute pack</ActionButton>
          )}
          {order.state === "VERIFYING" && allClean && (
            <ActionButton action={markClean.bind(null, order.id)} variant="dark">Mark order clean</ActionButton>
          )}
          {order.state === "DISPUTED" && dispute && (
            <Link href={`/order/${order.id}/dispute`} className="rounded-xl bg-ink px-5 py-3 text-sm font-bold text-white">
              View dispute pack
            </Link>
          )}
          {order.state === "CLEAN" && (
            <ActionButton action={resolveOrder.bind(null, order.id)} variant="dark">Close order</ActionButton>
          )}
        </div>
      </div>
    </div>
  );
}
