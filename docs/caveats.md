# Caveats

Plain notes on what Second Look is and is not.

- **Independent concept.** Second Look is an independent concept by Ayomide Ahmed. It is not an official Fleek product, and it is not endorsed by or affiliated with Fleek.
- **Hosting.** The live demo runs on Vercel at https://second-look-nine.vercel.app, with Neon Postgres for order data and Vercel Blob for uploaded photos.
- **Synthetic photos.** The listing and arrival photos in the demo are synthetic illustrations, not photos of real stock or real deliveries.
- **Fictional suppliers.** Suppliers such as Lahore Reclaim Co., Vintage Mile and Atelier Seconde are fictional. Order IDs, prices and grades are seeded demo data.
- **No real Fleek data.** No real Fleek orders, buyers, suppliers, listings or internal data are used. The quoted buyer reviews come from public pages and are linked at source.
- **Scripted verdicts.** When no vision model credentials are configured, the app returns scripted demo verdicts and labels them "Scripted demo verdict" on screen. The walkthrough video shows the live site in that mode.
- **Indicative refunds.** Refund figures use a demo grade-value table (A 1.0, B 0.7, C 0.4). They are indicative, not agreed values.
- **Nothing is sent automatically.** The app drafts a dispute message; a person reviews and sends it. Nothing is filed or paid automatically.
- **Hypotheses, not results.** Claims about repeat-buyer rate and dispute leakage are hypotheses to test, not measured outcomes.
- **Walkthrough video.** `public/media/second-look-walkthrough.mp4` is a screen recording of the live site at phone width with a synthetic voiceover and burned-in subtitles.
