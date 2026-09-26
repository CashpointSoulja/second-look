<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Second Look — project notes

- Stack: Next.js 16 on Vercel (project `cashpointsouljas-projects/second-look`, prod https://second-look-nine.vercel.app), Neon Postgres + Vercel Blob via Marketplace, AI Gateway (`VISION_MODEL`, default `google/gemini-3.5-flash`).
- Env: `vercel env pull .env.local`. Never commit `.env*` (except `.env.example`).
- Verify before pushing: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`.
- DB: migrations in `db/migrations/*.sql` (`pnpm db:migrate`), idempotent demo seed in `db/seed.sql` (`pnpm db:seed`, also the in-app "Reset demo data"). Local and prod share one Neon database.
- Business rules live in `src/lib/refund.ts` (verdict + refund) and `src/lib/state.ts` (order state machine), not in the prompt.
- Demo photos: `pnpm photos` (needs AI Gateway credit), output committed to `public/demo`.
- Push to `main` auto-deploys.
