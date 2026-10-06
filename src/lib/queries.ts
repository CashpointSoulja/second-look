import { connection } from "next/server";
import { sql } from "./db";
import type { Dispute, Item, Order } from "./types";

export type OrderSummary = Order & { pieces: number; checked: number; flagged: number };

export async function listOrders() {
  await connection();
  return sql<OrderSummary>(
    `select o.*, count(i.*)::int as pieces,
            count(i.verdict)::int as checked,
            count(*) filter (where i.verdict = 'BELOW_GRADE')::int as flagged
       from orders o join items i on i.order_id = o.id
      group by o.id order by o.delivered_at desc`,
  );
}

export async function getOrder(id: string) {
  await connection();
  const [order] = await sql<Order>("select * from orders where id = $1", [id]);
  if (!order) return null;
  const items = await sql<Item>("select * from items where order_id = $1 order by position", [id]);
  const [dispute] = await sql<Dispute>("select * from disputes where order_id = $1", [id]);
  return { order, items, dispute: dispute ?? null };
}

export async function listDisputes() {
  await connection();
  return sql<Order & { pieces: number; flagged: number; reclaim: number; dispute_status: string | null; created_at: string | null }>(
    `select o.*, count(i.*)::int as pieces,
            count(*) filter (where i.verdict = 'BELOW_GRADE')::int as flagged,
            coalesce(d.total_refund_gbp, sum(coalesce(i.refund_gbp, 0)))::float as reclaim,
            d.status as dispute_status, d.created_at
       from orders o join items i on i.order_id = o.id left join disputes d on d.order_id = o.id
      group by o.id, d.id order by o.delivered_at desc`,
  );
}
