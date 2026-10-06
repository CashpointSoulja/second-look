import pg from "pg";
import { attachDatabasePool } from "@vercel/functions";

pg.types.setTypeParser(1700, parseFloat); // numeric → number

const globalForPool = globalThis as unknown as { pool?: pg.Pool };
export const pool =
  globalForPool.pool ??
  new pg.Pool({
    connectionString: process.env.DATABASE_URL?.replace("sslmode=require", "sslmode=verify-full"),
    max: 5,
  });
if (!globalForPool.pool) {
  globalForPool.pool = pool;
  attachDatabasePool(pool);
}

export async function sql<T extends pg.QueryResultRow>(text: string, params: unknown[] = []) {
  return (await pool.query<T>(text, params)).rows;
}
