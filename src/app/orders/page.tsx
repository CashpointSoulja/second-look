import Link from "next/link";
import { Photo } from "@/components/photo";
import { Card, StateChip } from "@/components/ui";
import { listOrders } from "@/lib/queries";
import { sql } from "@/lib/db";
import { gbp } from "@/lib/refund";

export default async function OrdersPage() {
  const orders = await listOrders();
  const thumbs = await sql<{ order_id: string; listing_photo_url: string }>(
    "select order_id, listing_photo_url from items order by position",
  );
  const toCheck = orders.filter((o) => o.state === "DELIVERED" || o.state === "VERIFYING").length;

  return (
    <div className="space-y-5">
      <section className="rounded-card bg-fleek p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-ink/70">Buyer protection, with evidence</p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight sm:text-3xl">
          {toCheck} deliver{toCheck === 1 ? "y" : "ies"} to check
        </h1>
        <p className="mt-2 max-w-md text-sm font-medium text-ink/80">
          Photograph each piece as you unpack it. Second Look compares it with the listing, flags anything below grade and drafts the dispute for you.
        </p>
      </section>

      <div className="space-y-3">
        {orders.map((o) => (
          <Link key={o.id} href={`/order/${o.id}`} className="block transition active:scale-[0.99]">
            <Card className="overflow-hidden hover:border-fleek">
              <div className="flex gap-1 bg-cream p-1">
                {thumbs.filter((t) => t.order_id === o.id).map((t) => (
                  <Photo key={t.listing_photo_url} src={t.listing_photo_url} alt="" className="aspect-square flex-1 rounded-lg" />
                ))}
              </div>
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-bold leading-snug">{o.title}</h2>
                    <p className="text-sm text-muted">
                      {o.supplier} · <span className="font-mono text-xs">{o.id}</span>
                    </p>
                  </div>
                  <StateChip state={o.state} />
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-lg font-extrabold">{gbp(o.value_gbp)}</p>
                    <p className="text-xs text-muted">
                      {gbp(o.value_gbp / o.pieces)}/pc · {o.pieces}pcs · Grade {o.claimed_grade}
                    </p>
                  </div>
                  <p className="text-right text-xs font-semibold text-muted">
                    {o.checked}/{o.pieces} checked
                    {o.flagged > 0 && <span className="ml-1.5 rounded bg-below-soft px-1.5 py-0.5 text-below">{o.flagged} below grade</span>}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
