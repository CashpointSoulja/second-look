"use server";

import { headers } from "next/headers";
import { refresh } from "next/cache";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { pool, sql } from "@/lib/db";
import { disputeMessage } from "@/lib/dispute";
import { canTransition } from "@/lib/state";
import type { Item, Order } from "@/lib/types";

async function load(orderId: string) {
  const [order] = await sql<Order>("select * from orders where id = $1", [orderId]);
  if (!order) throw new Error("Order not found");
  const items = await sql<Item>("select * from items where order_id = $1 order by position", [orderId]);
  return { order, items };
}

export async function buildDispute(orderId: string) {
  const { order, items } = await load(orderId);
  const flagged = items.filter((i) => i.verdict === "BELOW_GRADE");
  if (!flagged.length || !canTransition(order.state, "DISPUTED")) throw new Error("Nothing to dispute");
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const total = flagged.reduce((s, i) => s + (i.refund_gbp ?? 0), 0);
  await sql(
    `insert into disputes (id, order_id, message, items_flagged, total_refund_gbp)
     values ($1, $2, $3, $4, $5)
     on conflict (order_id) do update set message = excluded.message, items_flagged = excluded.items_flagged,
       total_refund_gbp = excluded.total_refund_gbp`,
    [`DSP-${orderId.slice(4)}`, orderId, disputeMessage(order, items, origin), flagged.length, total],
  );
  await sql("update orders set state = 'DISPUTED' where id = $1", [orderId]);
  redirect(`/order/${orderId}/dispute`);
}

export async function markClean(orderId: string) {
  const { order, items } = await load(orderId);
  if (items.some((i) => !i.verdict || i.verdict === "BELOW_GRADE") || !canTransition(order.state, "CLEAN"))
    throw new Error("Order is not clean");
  await sql("update orders set state = 'CLEAN' where id = $1", [orderId]);
  refresh();
}

export async function resolveOrder(orderId: string) {
  const { order } = await load(orderId);
  if (!canTransition(order.state, "RESOLVED")) throw new Error(`Cannot resolve from ${order.state}`);
  await sql("update orders set state = 'RESOLVED' where id = $1", [orderId]);
  await sql("update disputes set status = 'RESOLVED', resolved_at = now() where order_id = $1", [orderId]);
  refresh();
}

/** Restores the seeded demo data so the live demo can be re-run. Demo rows only. */
export async function resetDemo() {
  const seed = await readFile(path.join(process.cwd(), "db", "seed.sql"), "utf8");
  await pool.query(seed);
  redirect("/orders");
}
