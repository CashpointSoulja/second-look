# Second Look — problem brief

Ayo Ahmed · 26 September 2026 · Hackathon concept, not a Fleek product claim

## The problem

A wholesale buyer orders to a stated condition grade. When the bundle arrives, some pieces may not resell at the expected price. The evidence is scattered across listing images, arrival photos, order values and support messages. The buyer has to prove the mismatch and then negotiate what it is worth.

**Buyer voice.** A February 2026 reviewer said: *"ordered some lululemon leggings A/B grade, most were grade C! Holes, bad stains, bobbling, didn't even bother trying to sell on."* ([Trustpilot review](https://ca.trustpilot.com/review/joinfleek.com))

A separate reseller wrote: *"the suppliers [are] really stretching the grading. Ie you order A and B grades and they hide tears and other damage."* The same reseller noted they did get refunds on the affected items. ([Reddit thread, 7 April 2026](https://www.reddit.com/r/JoinFleek/comments/1sevagi/anyone_here_using_fleek_for_sourcing/))

These are individual reports, not a measured failure rate.

## Why it matters

Fleek calls itself a wholesale secondhand marketplace connecting resellers and suppliers. It says FleekSort grades, prices and catalogues from a single photo in six seconds, and that trusted grades let buyers source at scale ([Fleek's own account](https://www.joinfleek.com/careers)).

What's missing is a check at the moment of receipt: can the buyer show, piece by piece, what arrived against what was sold? If that check is slow or disputed, trust and repeat sourcing are at risk. That is our bet, not a proven cause and effect.

## The bet: buyer-side verification

- The buyer uploads received-item photos alongside the listing image and claimed grade.
- A vision agent flags possible below-grade items. It explains the visible defects and how uncertain it is, and unclear cases go to a person for review.
- It puts together an evidence pack and an indicative refund calculation for the buyer to review and discuss with the supplier. Nothing is filed or paid out automatically.

## Measure it

**Primary pilot metric:** median minutes from the final photo upload to an evidence-ready dispute pack, compared with a pack prepared by hand on the same sample.

**Guardrails:**
- false-positive rate, after human review
- rate of missing or poor photos
- difference between the proposed and the agreed refund
- appeals from buyers and suppliers

We don't claim a baseline or target yet.

## Not today

No payments, supplier-side tooling, automated refunds, binding grade decisions or claims about model accuracy. The hackathon demo uses seeded orders and produces output a person can review. Production use would need consent and a tested grading rubric.

## Next bets

1. Blind-test agent grades against buyer, supplier and QC decisions.
2. Add capture guidance and minimum evidence rules at delivery.
3. Connect review decisions to real dispute outcomes, to calibrate refund estimates.
4. Feed verified receipt-side exceptions into upstream supplier and QC quality reporting.
