// Applies db/migrations/*.sql once each (tracked in schema_migrations); `--seed` also loads db/seed.sql.
// Usage: node --env-file=.env.local scripts/migrate.mjs [--seed]
import pg from "pg";
import { readdir, readFile } from "node:fs/promises";

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL_UNPOOLED is not set");

const client = new pg.Client({ connectionString: url.replace("sslmode=require", "sslmode=verify-full") });
await client.connect();
try {
  await client.query("create table if not exists schema_migrations (name text primary key, applied_at timestamptz default now())");
  const dir = new URL("../db/migrations/", import.meta.url);
  for (const name of (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort()) {
    const { rowCount } = await client.query("select 1 from schema_migrations where name = $1", [name]);
    if (rowCount) continue;
    await client.query("begin");
    await client.query(await readFile(new URL(name, dir), "utf8"));
    await client.query("insert into schema_migrations (name) values ($1)", [name]);
    await client.query("commit");
    console.log("applied", name);
  }
  if (process.argv.includes("--seed")) {
    await client.query(await readFile(new URL("../db/seed.sql", import.meta.url), "utf8"));
    console.log("seeded");
  }
} finally {
  await client.end();
}
