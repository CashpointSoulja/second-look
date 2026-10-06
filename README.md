# Second Look

**Buyer-side condition checks for Fleek wholesale orders.** Photograph what arrived, compare it with the listing, and get an evidence-ready dispute pack in one tap.

> Hackathon concept built for Fleek (London, 26 Sep 2026). Not an official Fleek product. Demo photos are synthetic illustrations and suppliers are fictional.

**Live demo:** https://second-look-nine.vercel.app · **Pitch + v2 roadmap:** https://second-look-nine.vercel.app/pitch

## Why

Fleek buyers order bundles at a stated grade. When pieces arrive below grade, the buyer has to prove it and negotiate the value by hand:

> "ordered some lululemon leggings A/B grade, most were grade C! Holes, bad stains, bobbling…" ([Trustpilot, Feb 2026](https://ca.trustpilot.com/review/joinfleek.com))

Second Look adds the missing check at receipt, piece by piece. The full problem brief is in [docs/one-pager.md](docs/one-pager.md).

## How it works

```
Upload arrival photo ─► scan animation ─► image model compares arrival vs listing
      │                                   (claimed grade + disclosed flaws)
      ▼
Defects boxed: NEW · WORSENED · DISCLOSED ─► verdict MATCH / BELOW GRADE / NEEDS REVIEW
      │
      ▼
Refund = unit price × (1 − received-grade value ÷ listed-grade value)   ← new/worse damage only
      │
      ▼
Dispute pack: maths + firm supplier message ─► Copy ─► /disputes ledger
```

Order states: `DELIVERED → VERIFYING → DISPUTED | CLEAN → RESOLVED`

Nothing is filed or paid automatically. A human reviews and sends every message.

## 2-minute demo

1. Open `/disputes`, then tap **Reset demo data**.
2. Go to `/orders`, then open **Lululemon activewear bundle**.
3. On piece 1, tap **Upload received photo** (or *use the sample arrival photo*). The scan runs, a red **BELOW GRADE** badge appears, and the bleach stain is boxed.
4. Piece 2 comes back green **MATCH**: the pilling was disclosed, so it doesn't count. Piece 3 comes back red: a hole plus a pulled seam.
5. Tap **Build dispute pack**. The refund maths shows £10.80 + £9.60 = **£20.40**. Tap **Copy message**.
6. `/disputes` shows the ledger, and `/pitch` has the v2 roadmap slide.

The full talk track is in [docs/demo-script.md](docs/demo-script.md).

## Docs

| Doc | What |
|---|---|
| [One-pager](docs/one-pager.md) | Problem brief in buyers' own words |
| [PRD](docs/prd.md) | Problem, goals, non-goals, user stories, acceptance criteria, metrics |
| [RFC](docs/rfc.md) | Architecture, data model, image model contract, fallback, security, limits |
| [Roadmap](docs/roadmap.md) | Now / Next / Later bets with dates |
| [Demo script](docs/demo-script.md) | Launch artifact: the 2-minute walkthrough |
| [Caveats](docs/caveats.md) | Hosting, synthetic data and non-affiliation notes |
| [Walkthrough video](public/media/second-look-walkthrough.mp4) | 89-second vertical walkthrough of the live site |

## Stack

Next.js 16 (App Router, TypeScript, Tailwind v4) on **Vercel** · **Neon Postgres** (Vercel Marketplace) · **Vercel Blob** for photos · an **image model** through Vercel AI Gateway (set with `VISION_MODEL`), with structured output.

If no image model is connected, the app falls back to scripted verdicts, clearly labelled "Scripted demo verdict (image model not connected)", so the demo always runs. The live demo runs in that mode.

## Run it

```bash
pnpm install
vercel link && vercel env pull .env.local   # Neon, Blob and image model (OIDC) variables
pnpm db:seed                                 # applies db/migrations/*.sql, then db/seed.sql
pnpm dev
```

| Command | Does |
|---|---|
| `pnpm test` | Refund maths and state machine unit tests |
| `pnpm typecheck` / `pnpm lint` / `pnpm build` | Checks |
| `pnpm db:migrate` | Apply new migrations only |

Every push to `main` auto-deploys to Vercel.
