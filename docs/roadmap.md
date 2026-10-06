# Roadmap — Second Look

Dates are proposed bets, not commitments. Each bet has a question it answers and a signal that decides whether it continues.

```
NOW (26 Sep 2026)         NEXT (Oct–Dec 2026)             LATER (H1 2027)
Buyer-side check  ──────► Pilot + calibrate  ───────────► Close the loop upstream
```

## Now: hackathon, 26 Sep 2026 (shipped)

- Listing-vs-arrival photo scan, with defect boxes and a new / worsened / disclosed split
- Verdict with confidence, and a human-review state
- Indicative refund maths and an evidence-ready supplier message, copied by hand
- Order state machine and disputes ledger

## Next: pilot, Oct – Dec 2026

| Bet | Dates | Question | Keep going if… |
|---|---|---|---|
| **Blind test** of agent grades against buyer, supplier and QC decisions on 200 past disputes | Oct 2026 | Does the agent agree with human adjudicators often enough to be useful? | Agreement is good enough to cut down reviewer time (threshold agreed with QC before the test) |
| **Pilot** with 20 repeat buyers, measuring minutes from last photo to pack | Oct – Nov 2026 | Is it meaningfully faster than doing it by hand? | Median time clearly beats the manual baseline, and false positives stay within the guardrail |
| **Capture guidance** and minimum evidence rules at delivery (angles, close-ups, time window) | Nov 2026 | Do better photos cut NEEDS REVIEW and appeals? | Poor-photo rate falls |
| **Calibrate refunds** against real agreed outcomes | Dec 2026 | Are the grade factors fair? | The gap between proposed and agreed refunds narrows |

## Later: H1 2027

| Bet | Why |
|---|---|
| **Supplier dispatch scan** becomes the baseline (same scan, run before the parcel ships) | Settles "damaged in transit or by the buyer?" and protects honest suppliers |
| **Supplier quality scores** built from verified exceptions, fed to QC and FleekSort | Fixes grading upstream instead of refunding downstream |
| **In-app buyer protection**: refund suggestions go into Fleek's existing claim flow, and a human approves every payout | Fewer tickets and consistent outcomes, with no automatic payouts |

## Explicitly not planned

Automatic refunds, binding model grades, and anything else that removes a human from payout decisions.
