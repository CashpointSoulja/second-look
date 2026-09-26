import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveOrder } from "@/app/actions";
import { ActionButton } from "@/components/action-button";
import { CopyButton } from "@/components/copy-button";
import { Photo } from "@/components/photo";
import { Card, GradeChip, StateChip } from "@/components/ui";
import { getOrder } from "@/lib/queries";
import { gbp, GRADE_FACTOR } from "@/lib/refund";

export default async function DisputePage({ params }: PageProps<"/order/[id]/dispute">) {
  const { id } = await params;
  const data = await getOrder(id);
  if (!data?.dispute) notFound();
  const { order, items, dispute } = data;
  const flagged = items.filter((i) => i.verdict === "BELOW_GRADE");
  const review = items.filter((i) => i.verdict === "NEEDS_REVIEW");
  const disputedShare = Math.round((dispute.total_refund_gbp / order.value_gbp) * 100);

  return (
    <div className="space-y-4">
      <Link href={`/order/${order.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink">
        ← {order.id}
      </Link>

      <section className="rounded-card bg-ink p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-fleek">Dispute pack · {dispute.id}</p>
          <StateChip state={order.state} />
        </div>
        <p className="mt-3 text-4xl font-extrabold tracking-tight">{gbp(dispute.total_refund_gbp)}</p>
        <p className="mt-1 text-sm text-white/70">
          indicative refund on {dispute.items_flagged} of {items.length} pieces · {disputedShare}% of the {gbp(order.value_gbp)} order · {order.supplier}
        </p>
      </section>

      <Card className="p-4">
        <h2 className="font-bold">Refund maths</h2>
        <p className="mt-1 text-xs text-muted">
          Refund = unit price × (1 − received-grade value ÷ listed-grade value). Value per grade (demo assumption): A {GRADE_FACTOR.A} · B {GRADE_FACTOR.B} · C {GRADE_FACTOR.C}. Only new or worsened damage counts.
        </p>
        <div className="mt-3 divide-y divide-line">
          {flagged.map((i) => (
            <div key={i.id} className="flex items-center gap-3 py-3">
              <div className="flex shrink-0 gap-1">
                <Photo src={i.listing_photo_url} alt="Listing" className="h-12 w-12 rounded-lg" />
                <Photo src={i.received_photo_url} alt="Arrival" className="h-12 w-12 rounded-lg ring-2 ring-below" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{i.name}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-muted">
                  <GradeChip grade={i.claimed_grade} /> → <GradeChip grade={i.true_grade ?? "?"} />
                  <span className="ml-1">
                    {gbp(i.unit_price_gbp)} × (1 − {GRADE_FACTOR[i.true_grade!]}/{GRADE_FACTOR[i.claimed_grade]})
                  </span>
                </p>
              </div>
              <p className="font-extrabold text-below">{gbp(i.refund_gbp ?? 0)}</p>
            </div>
          ))}
          <div className="flex justify-between pt-3 text-sm font-extrabold">
            <span>Total</span>
            <span>{gbp(dispute.total_refund_gbp)}</span>
          </div>
        </div>
        {review.length > 0 && (
          <p className="mt-3 rounded-lg bg-review-soft px-3 py-2 text-xs font-medium text-review">
            {review.length} piece(s) need human review and are not included in the total.
          </p>
        )}
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold">Message to supplier</h2>
            <p className="text-xs text-muted">Built from the evidence above. Read it, edit it, then send it through Fleek support.</p>
          </div>
        </div>
        <pre className="mt-3 max-h-[28rem] overflow-auto whitespace-pre-wrap rounded-xl bg-canvas p-4 font-sans text-[13px] leading-relaxed">{dispute.message}</pre>
        <div className="mt-3 flex flex-wrap gap-2">
          <CopyButton text={dispute.message} />
          {order.state === "DISPUTED" && (
            <ActionButton action={resolveOrder.bind(null, order.id)} variant="ghost">
              Mark resolved
            </ActionButton>
          )}
        </div>
      </Card>
    </div>
  );
}
