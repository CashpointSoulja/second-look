import Link from "next/link";
import { Card } from "@/components/ui";

export const metadata = { title: "Pitch · Second Look" };

const QUOTES = [
  {
    text: "ordered some lululemon leggings A/B grade, most were grade C! Holes, bad stains, bobbling, didn't even bother trying to sell on.",
    who: "Trustpilot reviewer, February 2026",
    href: "https://ca.trustpilot.com/review/joinfleek.com",
  },
  {
    text: "the suppliers [are] really stretching the grading. Ie you order A and B grades and they hide tears and other damage",
    who: "Reseller on r/JoinFleek, 7 April 2026 (who also noted refunds were given)",
    href: "https://www.reddit.com/r/JoinFleek/comments/1sevagi/anyone_here_using_fleek_for_sourcing/",
  },
];

const ROADMAP = [
  {
    when: "Now · 26 Sep 2026",
    tag: "Shipped at the hackathon",
    items: ["Listing vs arrival photo scan with defect boxes", "New / worsened / disclosed damage split", "Indicative refund + evidence-ready dispute pack", "Order state ledger"],
  },
  {
    when: "Next · Oct – Dec 2026",
    tag: "Pilot with 20 buyers",
    items: ["Blind-test agent grades against buyer, supplier and QC decisions", "Capture guidance + minimum evidence rules at delivery", "Link review decisions to real dispute outcomes to calibrate refunds"],
  },
  {
    when: "Later · H1 2027",
    tag: "Close the loop upstream",
    items: ["Supplier dispatch scan becomes the baseline", "Verified exceptions feed supplier quality scores and QC", "Refund suggestions inside buyer protection, human-approved"],
  },
];

export default function PitchPage() {
  return (
    <div className="space-y-6">
      {/* v2 roadmap slide: 16:9 on desktop so it can be screenshotted straight into a deck */}
      <section className="rounded-card bg-ink p-5 text-white sm:aspect-video sm:p-8">
        <div className="flex h-full flex-col">
          <p className="text-xs font-bold uppercase tracking-wider text-fleek">Second Look · v2 roadmap</p>
          <h1 className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">
            From &ldquo;prove it&rdquo; to trusted grades on both ends of the parcel
          </h1>
          <div className="mt-5 grid flex-1 gap-3 sm:grid-cols-3">
            {ROADMAP.map((col, i) => (
              <div key={col.when} className={`rounded-xl p-4 ${i === 0 ? "bg-fleek text-ink" : "bg-white/8 ring-1 ring-white/15"}`}>
                <p className="text-sm font-extrabold">{col.when}</p>
                <p className={`text-[11px] font-bold uppercase tracking-wide ${i === 0 ? "text-ink/70" : "text-fleek"}`}>{col.tag}</p>
                <ul className="mt-3 space-y-1.5 text-[13px] font-medium leading-snug">
                  {col.items.map((t) => (
                    <li key={t} className="flex gap-2">
                      <span aria-hidden>{i === 0 ? "✓" : "→"}</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-white/60">Dates are proposed bets, not commitments. Pilot metric: minutes from last photo to evidence-ready pack.</p>
        </div>
      </section>

      <article className="space-y-4">
        <header>
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Problem brief · Ayo Ahmed · 26 September 2026</p>
          <p className="text-[11px] text-subtle">Hackathon concept, not a Fleek product claim</p>
        </header>

        <Card className="space-y-3 p-5">
          <h2 className="text-lg font-extrabold">The problem</h2>
          <p className="text-sm leading-relaxed">
            A wholesale buyer orders to a stated condition grade. When the bundle arrives, some pieces may not resell at the expected price. The evidence is scattered across listing images, arrival photos, order values and support messages. The buyer has to prove the mismatch and then negotiate what it is worth.
          </p>
          <div className="space-y-2">
            {QUOTES.map((q) => (
              <blockquote key={q.href} className="rounded-xl border-l-4 border-fleek bg-canvas p-3">
                <p className="text-sm font-medium italic">&ldquo;{q.text}&rdquo;</p>
                <a href={q.href} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-muted underline underline-offset-2">
                  {q.who}
                </a>
              </blockquote>
            ))}
          </div>
          <p className="text-xs text-muted">These are individual reports, not a measured failure rate.</p>
        </Card>

        <Card className="space-y-2 p-5">
          <h2 className="text-lg font-extrabold">Why it matters</h2>
          <p className="text-sm leading-relaxed">
            Fleek calls itself a wholesale secondhand marketplace connecting resellers and suppliers. It says FleekSort grades, prices and catalogues from a single photo in six seconds, and that trusted grades let buyers source at scale (
            <a className="underline" href="https://www.joinfleek.com/careers" target="_blank" rel="noreferrer">Fleek</a>
            ). What&rsquo;s missing is a check at the moment of receipt: can the buyer show, piece by piece, what arrived against what was sold? If that check is slow or disputed, trust and repeat sourcing are at risk. That is our bet, not a proven cause and effect.
          </p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="space-y-2 p-5">
            <h2 className="text-lg font-extrabold">The bet: buyer-side verification</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              <li>The buyer uploads an arrival photo next to the listing photo and claimed grade.</li>
              <li>An image model compares the arrival photo with the listing photo and the disclosed flaws. It flags possible below-grade pieces, explains the visible defects and says how sure it is. Unclear cases go to a person.</li>
              <li>It puts together an evidence pack and an indicative refund for the buyer to review. Nothing is filed or paid out automatically.</li>
            </ul>
          </Card>
          <Card className="space-y-2 p-5">
            <h2 className="text-lg font-extrabold">Measure it</h2>
            <p className="text-sm">
              <span className="font-bold">Primary:</span> median minutes from the last photo upload to an evidence-ready dispute pack, compared with a pack prepared by hand on the same sample.
            </p>
            <p className="text-sm">
              <span className="font-bold">Guardrails:</span> false-positive rate after human review · rate of missing or poor photos · gap between proposed and agreed refund · appeals from buyers and suppliers.
            </p>
            <p className="text-xs text-muted">We don&rsquo;t claim a baseline or target yet.</p>
          </Card>
        </div>

        <Card className="space-y-2 p-5">
          <h2 className="text-lg font-extrabold">Not today</h2>
          <p className="text-sm">
            No payments, supplier-side tooling, automated refunds, binding grade decisions or claims about model accuracy. The demo uses seeded orders and output a person can review. Production use would need consent and a tested grading rubric.
          </p>
        </Card>

        <Link href="/order/FLK-24817" className="block rounded-xl bg-fleek py-4 text-center font-bold text-ink hover:bg-fleek-dark">
          Try the live demo →
        </Link>
      </article>
    </div>
  );
}
