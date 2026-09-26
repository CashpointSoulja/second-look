import Link from "next/link";
import { PixelField, PlusSticker, StarBurst } from "@/components/decor";
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
      <section className="rise relative overflow-hidden rounded-card border-2 border-ink bg-fleek p-6 sticker-shadow">
        <StarBurst className="absolute -right-10 -top-10 h-48 w-48 opacity-90 sm:-right-4 sm:h-56 sm:w-56" />
        <PixelField className="absolute -bottom-2 right-24 hidden h-16 w-28 sm:block" cols={7} rows={4} />
        <PlusSticker color="#4d6bff" className="float absolute bottom-4 right-6 h-9 w-9" />
        <PlusSticker color="#ff2d95" className="float absolute right-40 top-4 hidden h-6 w-6 sm:block" style={{ animationDelay: "1.2s" }} />
        <div className="relative max-w-md">
          <p className="font-[family-name:var(--font-pixel)] text-[11px] uppercase tracking-wider text-ink/80">Buyer protection, with receipts</p>
          <h1 className="mt-1 text-3xl font-black leading-[1.05] sm:text-4xl">
            {toCheck} deliver{toCheck === 1 ? "y" : "ies"}
            <br />
            to check ✦
          </h1>
          <p className="mt-3 text-sm font-semibold text-ink/80">
            Snap each piece as you unpack. We compare it with the listing, flag anything below grade and draft the dispute for you.
          </p>
        </div>
      </section>

      <div className="space-y-4">
        {orders.map((o, idx) => (
          <Link key={o.id} href={`/order/${o.id}`} className="rise block" style={{ animationDelay: `${120 + idx * 90}ms` }}>
            <Card className="lift overflow-hidden border-2 border-ink">
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
