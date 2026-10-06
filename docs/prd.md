# PRD — Second Look

| | |
|---|---|
| Owner | Ayo Ahmed (Special Projects) |
| Status | Hackathon build, 26 Sep 2026 → pilot proposal |
| Related | [One-pager](one-pager.md) · [RFC](rfc.md) · [Roadmap](roadmap.md) · [Demo script](demo-script.md) |

## 1. Problem

Fleek buyers order bundles at a stated grade (A/B/C). When pieces arrive below grade, the buyer has to put the case together themselves:

1. dig out the listing photo
2. photograph the item
3. describe the damage
4. work out what it's worth
5. argue it with the supplier through support

That slows everyone down, makes outcomes inconsistent, and puts trust at risk right after the moment Fleek's buyer protection promises to cover ("Something arrive that wasn't what you ordered? You're covered.").

Evidence is anecdotal, not measured: see the Trustpilot and Reddit quotes in the [one-pager](one-pager.md).

## 2. Users

| User | Job to be done | Today |
|---|---|---|
| **Reseller (buyer)**, Vinted/Depop/eBay seller buying 1–50 bundles a month | "Show that what arrived isn't what I paid for, and get a fair amount back without a long back-and-forth." | Manual photos, free-text complaint, no pricing logic |
| **Supplier** | "Only pay out for damage I actually caused, and keep disclosed flaws out of it." | Hard to tell what was disclosed in the listing apart from new damage |
| **Fleek support / QC** | "Resolve disputes quickly and consistently, and spot suppliers who stretch grades." | Unstructured tickets |

## 3. Goals

- **G1.** A buyer can go from the last arrival photo to an evidence-ready dispute pack in under 2 minutes during the demo. The pilot will measure this against a pack made by hand.
- **G2.** Every flagged piece shows: the listing photo and arrival photo side by side, where the defects are, whether each defect is *new*, *worse* or *disclosed*, the image model's reasoning, and the refund maths.
- **G3.** Suppliers only pay for damage that was new or got worse. Disclosed flaws never count toward a refund.
- **G4.** The demo runs live on a public URL even with no image model connected, using a scripted fallback.

## 4. Non-goals (this version)

- Payments, refunds or ledger postings of any kind.
- Filing disputes automatically. The buyer reviews, copies and sends the message.
- Binding grade decisions, or claims about model accuracy.
- Supplier-side tooling or dispatch scans (roadmap: Later).
- Accounts, auth, multiple buyers.
- Checking every piece in a 500-piece bale (demo bundles are 3 pieces).

## 5. User stories and acceptance criteria

**US1. See my deliveries.** As a buyer, I see the orders delivered to me, each showing the order value, price per piece, claimed grade and how many pieces I've checked.
- AC: `/orders` lists 3 seeded orders with supplier, value in £, £/pc, grade, state and checked/flagged counts.

**US2. Check a piece.** As a buyer, I upload a photo of a piece I've received and immediately see it being scanned.
- AC: tapping "Upload received photo" opens the camera or gallery. The photo is resized in the browser, and a scan animation plays for at least 2.4 seconds.
- AC: a "use the sample arrival photo" option exists, so the demo never depends on a real camera.

**US3. Understand the verdict.** As a buyer, I see a big MATCH / BELOW GRADE / NEEDS REVIEW badge, the arrived grade, the confidence, a plain-English reason, and numbered boxes on the areas flagged in the photo.
- AC: each defect has a type, a note and a status of NEW, WORSENED or DISCLOSED, colour-coded red, orange and blue.
- AC: confidence below 0.6, or a result that contradicts itself, becomes NEEDS REVIEW and adds nothing to the refund.

**US4. Compare with the listing.** As a buyer or supplier, I can put the listing photo next to the arrival photo and see which flaws the supplier disclosed.

**US5. Build the dispute.** As a buyer, one tap turns every below-grade piece into a dispute pack showing the refund maths per piece and a firm, professional message to the supplier.
- AC: refund = unit price × (1 − received-grade factor ÷ listed-grade factor), counted only for NEW or WORSENED damage.
- AC: the message includes the order ID, delivery date, each piece's listed and arrived grade, the issues, refund lines, photo links, the total, and a 48-hour reply request.
- AC: "Copy message" copies plain text that pastes cleanly into email, WhatsApp or Fleek support.

**US6. Track outcomes.** As a buyer, `/disputes` shows each order, the pieces flagged, the value to reclaim and the status, with totals.
- AC: order states follow DELIVERED → VERIFYING → DISPUTED | CLEAN → RESOLVED. Invalid transitions are rejected on the server.

## 6. Success metrics

| Type | Metric | Hackathon | Pilot |
|---|---|---|---|
| Primary | Median minutes, last photo → evidence-ready pack | Demo under 2 minutes | Measure against a hand-made pack on the same sample |
| Guardrail | False-positive rate (flagged BELOW GRADE, human reviewer disagrees) | n/a | Report weekly; pause if it rises above the agreed threshold |
| Guardrail | Missing or poor photo rate | n/a | Track |
| Guardrail | Gap between proposed and agreed refund | n/a | Track the median absolute £ gap |
| Guardrail | Buyer and supplier appeals | n/a | Track |

No baselines or targets are claimed until the pilot produces data.

## 7. Risks

- **Model error or overconfidence.** Mitigations: a confidence threshold, a NEEDS REVIEW state, boxes labelled "areas flagged for review", and a human sends every message.
- **Gaming (buyer damages an item and then photographs it).** Next: capture guidance and a timestamp window. Later: a supplier dispatch scan as the baseline.
- **Grade factors are assumptions.** Replace them with Fleek price data per category before the pilot.
- **Photo consent and retention.** A policy is needed before production.
