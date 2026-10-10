# Asset & source register

## Images

**Origin of every image:** original work created for this presentation. Each plate and cutout was drawn as a procedural SVG composition in `tools/build_svgs.py` / `tools/svg_more.py`, rasterised locally with Chromium (`tools/render_svg.mjs`), then painted with a brush-stroke renderer (`tools/paint.py`, numpy + Pillow) that adds oriented strokes, paper texture, grain and torn-paper borders.
**Licence:** created by the project team with AI assistance; free to use for this coursework. No third-party photographs, stock imagery or generated-model imagery is included.
**Why this route:** the build environment's network policy blocked image hosts (Wikimedia Commons, Unsplash, Pexels, Openverse, Flickr) and no image-generation model was available, so the photographic layer was replaced by painted illustration, a deliberate alternative rather than a placeholder.
**Evidence status:** every image is an **illustration, not evidence**. Scenes where an image could be mistaken for documentary material carry a discreet on-screen label (e.g. *"Illustration — not an image of the meeting"*, *"Illustrative household — not an interview participant"*, *"Illustrative objects"*).
**What is deliberately absent:** no participant or employee faces or likenesses; no KE logo or branding; no newspaper layouts imitating the real article; no reproduced NEPRA document text; no signatures; no meeting footage. Nothing from the four inspiration videos (people, text, language, landmarks, branding) is reused; they informed art direction and motion only and are not stored in this repository.

Rebuild all art offline with `tools/build_art.sh` (about 1 minute on 4 cores).

| File | Depicts | Size | Weight |
|---|---|---|---|
| `assets/img/bill.webp` | Generic electricity bill (no company branding, no real text) | 760×1000 | 127 KB |
| `assets/img/bucket.webp` | Water bucket | 560×600 | 37 KB |
| `assets/img/clock.webp` | Wall clock at 2:40 (overnight) | 560×560 | 44 KB |
| `assets/img/coil.webp` | Coil of cable | 600×500 | 29 KB |
| `assets/img/committee.webp` | Generic committee room with an empty witness chair (symbol only — not the actual meeting) | 1920×1080 | 415 KB |
| `assets/img/correspondence.webp` | Desk of letters and envelopes (unanswered correspondence) | 1920×1080 | 450 KB |
| `assets/img/desk.webp` | Research desk with four source folders | 1920×1080 | 445 KB |
| `assets/img/distribution.webp` | Night distribution scene: transformer pole, meter bank, ladder, work lamp, tool bag | 1920×1080 | 494 KB |
| `assets/img/dusk_sky.webp` | Dusk sky over the city with poles, wires and birds | 1920×1080 | 452 KB |
| `assets/img/envelope.webp` | Envelope | 700×480 | 52 KB |
| `assets/img/iron.webp` | Clothes iron | 640×440 | 30 KB |
| `assets/img/kunda.webp` | Illegal hook ("kunda") connection on a line | 900×500 | 25 KB |
| `assets/img/laptop.webp` | Laptop (remote work) | 900×620 | 75 KB |
| `assets/img/ledger.webp` | Open account ledger | 900×620 | 93 KB |
| `assets/img/meter.webp` | Electromechanical energy meter | 520×720 | 70 KB |
| `assets/img/mic.webp` | Gooseneck hearing microphone | 520×820 | 21 KB |
| `assets/img/paper_sheet.webp` | Paper sheet used for paraphrases and paper backdrop | 1000×1300 | 126 KB |
| `assets/img/paper_slip.webp` | Torn paper slip used behind on-screen text | 1100×340 | 39 KB |
| `assets/img/phone.webp` | Smartphone with a generic outage-app screen (no text) | 520×960 | 90 KB |
| `assets/img/pot.webp` | Electric hotplate with cooking pot | 700×560 | 35 KB |
| `assets/img/rooftops.webp` | Hazy Gulshan-style rooftops: water tanks, motor pump, pipes, wires | 1920×1080 | 469 KB |
| `assets/img/room_dark.webp` | Same interior after the power fails (moonlight; router, lamp and hotplate off) | 1920×1080 | 426 KB |
| `assets/img/room_lit.webp` | Karachi household interior at dusk — window grille, city view, curtain, fan, router, lamp, hotplate, chai cup | 1920×1080 | 484 KB |
| `assets/img/router.webp` | Wi-Fi router | 460×340 | 15 KB |
| `assets/img/scale.webp` | Brass balance scale (deliberately unweighed) | 1400×1000 | 81 KB |
| `assets/img/street_dark.webp` | Same neighbourhood with the feeder down | 1920×1080 | 485 KB |
| `assets/img/street_lit.webp` | Ten-house neighbourhood sharing one pole-mounted feeder transformer, windows lit | 1920×1080 | 627 KB |
| `assets/img/table_amber.webp` | Amber-lit table for the weighing scene | 1920×1080 | 413 KB |
| `assets/img/tent.webp` | Facilitation-camp canopy with table and chairs | 1000×760 | 54 KB |
| `assets/img/tools.webp` | Spanner and pliers | 760×520 | 23 KB |
| `assets/img/ups.webp` | UPS unit and battery | 820×620 | 68 KB |

Code-drawn supporting layers, all inline SVG/CSS in `js/manifest.js` and `css/style.css`: wires and feeder lines, the clothesline, ripple rings, the timeline rail, scrims, ribbons, rubber stamps and tags.

## Fonts (bundled in `assets/fonts/`, SIL Open Font License 1.1; licence texts included)

| Family | Use | Source |
|---|---|---|
| Fraunces (400, 600, 700, 900, italics) | Headlines, quotations | npm `@fontsource/fraunces` 5.3.0 |
| Anton | Poster typography | npm `@fontsource/anton` 5.3.0 |
| Source Sans 3 | Body text | npm `@fontsource/source-sans-3` 5.3.0 |
| IBM Plex Mono | Kickers, citations, labels | npm `@fontsource/ibm-plex-mono` 5.3.0 |

## Runtime dependencies

None. Plain HTML/CSS/JS with no frameworks, CDNs or network requests at runtime (verified by `tools/test_controls.mjs`). Playwright/Chromium and Python are used only by the optional build and QA tools.

## Sources (bibliographic data copied exactly from the report)

See `js/references.js`, rendered in the in-deck evidence section (key **E**) with clickable links and the scenes that cite each source.

| Key | Reference | Used for |
|---|---|---|
| Khan (2026) | *Business Recorder*, Sept 24, 2026 | Hearing summary (scene 3); typeset as **our summary**, not a facsimile |
| NEPRA (2026) | Order under s.27C, Aug 31, 2026 | Regulatory record (scene 17); **paraphrase**, no document text reproduced |
| NEPRA (2025) | Complaint decision, Jul 11, 2025 | Alternative explanations (scene 17) |
| K-Electric (2026b) | Year in review 2025, Jan 2, 2026 | 25,000+ drives, 310 camps, PKR 409m (scene 15), labelled company-reported 2025 activities |
| K-Electric (2026a) | Sustainability report release, Jan 7, 2026 | 98.2% FY25 reliability (scene 16); see BUILD_NOTES on the "2026s" citation |
| K-Electric (n.d.) | FAQs | KE's published position (scene 4) |
| Sinnott-Armstrong (2023); Alexander & Moore (2024); Hursthouse & Pettigrove (2026) | *Stanford Encyclopedia of Philosophy* | Theory scenes 11–14 |
| Interviews (Oct 3, 4, 5, 9, 2026) | Report Appendices A–D | Scenes 4–10; exact quotations only |
| Recordings folder | OneDrive/SharePoint link (Appendix E) | Listed in the evidence section only; never opened during the presentation |
