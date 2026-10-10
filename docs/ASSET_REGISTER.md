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


---

# v2 motion revision: layered assets (`v2/assets/img/`)

**Origin:** original work for this presentation. Each layer is drawn as its own procedural SVG composition (`tools/v2/*.py`), rasterised locally in Chromium (`tools/render_svg.mjs`) and finished with `tools/v2/paint2.py`. That finisher has five treatments for visual range: **warm** (fine brushwork, household realism), **rich** (bold saturated painterly colour, human consequences), **paper** (cream/teal/amber paper-craft miniatures, systems and operations), **halftone** (newsprint dot screen, editorial collage) and **clean** (documents). Rebuild everything with `python3 tools/v2/build.py home press imad gulshan ops rest` (about 3 minutes).

**Why not photographs or AI generation:** I re-checked during the revision. Image hosts (Wikimedia, Unsplash, Pexels, Openverse, Flickr) are still blocked by the session's network policy. The connected Adobe tools can edit images but not generate them ("generative editing is not currently available"), and licensing Adobe Stock would have spent the account owner's credits without permission. Layers are therefore painted illustration, separated so they can move independently. Any layer can later be swapped for a licensed photographic cut-out with the same name.

**Evidence status:** all images are illustrations, not evidence, and are labelled on screen where confusion is possible. The collage fragments in scene 3 are illustrated halftones, labelled *"Fragments are illustrations — not images of the meeting"*. No faces or likenesses of participants or employees. No KE branding. No reproduced articles or documents. Text, quotations, figures and citations are always live HTML, never baked into artwork.

| Layer | World | Treatment | Pixels | Weight |
|---|---|---|---|---|
| `bill` | home | clean | 1200×1560 | 288 KB |
| `c_desk` | rest (correspondence) | paper / warm | 2600×1460 | 630 KB |
| `c_doc` | rest (correspondence) | paper / warm | 1000×1300 | 110 KB |
| `c_env1` | rest (correspondence) | paper / warm | 840×580 | 37 KB |
| `c_env2` | rest (correspondence) | paper / warm | 840×580 | 36 KB |
| `c_letter1` | rest (correspondence) | paper / warm | 820×1060 | 80 KB |
| `c_letter2` | rest (correspondence) | paper / warm | 820×1060 | 82 KB |
| `c_mic` | rest (correspondence) | paper / warm | 560×860 | 19 KB |
| `c_note` | rest (correspondence) | paper / warm | 1000×640 | 54 KB |
| `d_desk` | rest (regulatory desk) | warm / paper | 2600×1460 | 648 KB |
| `d_glasses` | rest (regulatory desk) | warm / paper | 700×300 | 21 KB |
| `d_sheet` | rest (regulatory desk) | warm / paper | 1000×1300 | 106 KB |
| `e_book` | rest (evaluation) | paper | 2300×1340 | 209 KB |
| `e_table` | rest (evaluation) | paper | 2600×1460 | 395 KB |
| `f_forms` | rest (fieldwork collage) | halftone | 956×1056 | 336 KB |
| `f_headset` | rest (fieldwork collage) | halftone | 956×816 | 350 KB |
| `f_hooks` | rest (fieldwork collage) | halftone | 1156×856 | 124 KB |
| `f_ladder` | rest (fieldwork collage) | halftone | 856×1156 | 133 KB |
| `f_meter` | rest (fieldwork collage) | halftone | 756×956 | 271 KB |
| `f_tent` | rest (fieldwork collage) | halftone | 1256×956 | 511 KB |
| `g_battery` | gulshan | rich | 620×580 | 42 KB |
| `g_bucket` | gulshan | rich | 540×600 | 30 KB |
| `g_far` | gulshan | rich | 3600×900 | 324 KB |
| `g_jerry` | gulshan | rich | 440×560 | 23 KB |
| `g_mid` | gulshan | rich | 3600×1100 | 445 KB |
| `g_pump` | gulshan | rich | 760×460 | 22 KB |
| `g_roof` | gulshan | rich | 2600×760 | 345 KB |
| `g_sky` | gulshan | rich | 2400×1350 | 488 KB |
| `g_tank` | gulshan | rich | 720×860 | 88 KB |
| `g_ups` | gulshan | rich | 620×660 | 48 KB |
| `g_win_backup` | gulshan | rich | 900×720 | 161 KB |
| `g_win_none` | gulshan | rich | 900×720 | 126 KB |
| `h_pole` | home | warm | 640×2600 | 58 KB |
| `h_road` | home | warm | 3000×600 | 298 KB |
| `h_sky` | home | warm | 2400×1350 | 539 KB |
| `h_skyline_far` | home | warm | 3600×1300 | 530 KB |
| `h_skyline_mid` | home | warm | 3600×1600 | 627 KB |
| `house_0` | home | warm | 600×1440 | 159 KB |
| `house_1` | home | warm | 600×1560 | 173 KB |
| `house_3` | home | warm | 600×1680 | 192 KB |
| `house_4` | home | warm | 600×1500 | 170 KB |
| `house_5` | home | warm | 600×1470 | 167 KB |
| `house_6` | home | warm | 600×1800 | 208 KB |
| `house_7` | home | warm | 600×1530 | 167 KB |
| `house_8` | home | warm | 600×1620 | 183 KB |
| `house_9` | home | warm | 600×1440 | 167 KB |
| `house_ours` | home | warm | 1500×3525 | 763 KB |
| `im_bg_dark` | imad | rich | 2400×1350 | 592 KB |
| `im_bg_lit` | imad | rich | 2400×1350 | 655 KB |
| `im_clock` | imad | rich | 580×580 | 43 KB |
| `im_counter` | imad | rich | 1150×520 | 108 KB |
| `im_desk` | imad | rich | 1100×560 | 29 KB |
| `im_iron` | imad | rich | 660×460 | 27 KB |
| `im_laptop` | imad | rich | 920×640 | 86 KB |
| `im_phone` | imad | rich | 520×960 | 86 KB |
| `im_plug` | imad | rich | 900×520 | 20 KB |
| `im_router` | imad | rich | 540×400 | 20 KB |
| `im_stove` | imad | rich | 720×600 | 45 KB |
| `o_board` | ops | paper | 1180×820 | 57 KB |
| `o_calendar` | ops | paper | 520×560 | 17 KB |
| `o_desk` | ops | paper | 860×600 | 18 KB |
| `o_ground` | ops | paper | 2600×1460 | 386 KB |
| `o_hearing` | ops | paper | 1100×640 | 27 KB |
| `o_kunda` | ops | paper | 640×960 | 17 KB |
| `o_ladder` | ops | paper | 420×1040 | 19 KB |
| `o_ledger` | ops | paper | 960×640 | 49 KB |
| `o_meters` | ops | paper | 940×720 | 52 KB |
| `o_mh0` | ops | paper | 380×520 | 19 KB |
| `o_mh0_glow` | ops | paper | 380×520 | 13 KB |
| `o_mh1` | ops | paper | 380×520 | 18 KB |
| `o_mh1_glow` | ops | paper | 380×520 | 14 KB |
| `o_mh2` | ops | paper | 380×520 | 20 KB |
| `o_mh2_glow` | ops | paper | 380×520 | 13 KB |
| `o_mh3` | ops | paper | 380×520 | 15 KB |
| `o_mh3_glow` | ops | paper | 380×520 | 9 KB |
| `o_mh4` | ops | paper | 380×520 | 15 KB |
| `o_mh4_glow` | ops | paper | 380×520 | 9 KB |
| `o_mh5` | ops | paper | 380×520 | 16 KB |
| `o_mh5_glow` | ops | paper | 380×520 | 9 KB |
| `o_mh6` | ops | paper | 380×520 | 17 KB |
| `o_mh6_glow` | ops | paper | 380×520 | 14 KB |
| `o_mh7` | ops | paper | 380×520 | 19 KB |
| `o_mh7_glow` | ops | paper | 380×520 | 13 KB |
| `o_mh8` | ops | paper | 380×520 | 15 KB |
| `o_mh8_glow` | ops | paper | 380×520 | 9 KB |
| `o_mh9` | ops | paper | 380×520 | 16 KB |
| `o_mh9_glow` | ops | paper | 380×520 | 9 KB |
| `o_owner` | ops | paper | 860×600 | 18 KB |
| `o_phone` | ops | paper | 360×640 | 14 KB |
| `o_pole` | ops | paper | 520×1400 | 18 KB |
| `o_reel` | ops | paper | 620×520 | 28 KB |
| `o_toolbox` | ops | paper | 620×420 | 15 KB |
| `p_board` | press | halftone / paper | 2400×1350 | 339 KB |
| `p_card` | press | halftone / paper | 860×520 | 42 KB |
| `p_chair` | press | halftone / paper | 768×968 | 288 KB |
| `p_chamber` | press | halftone / paper | 1556×976 | 652 KB |
| `p_docs` | press | halftone / paper | 968×768 | 256 KB |
| `p_folder_a` | press | halftone / paper | 940×660 | 43 KB |
| `p_folder_b` | press | halftone / paper | 940×660 | 44 KB |
| `p_folder_c` | press | halftone / paper | 940×660 | 44 KB |
| `p_folder_d` | press | halftone / paper | 940×660 | 44 KB |
| `p_lines` | press | halftone / paper | 1448×768 | 306 KB |
| `p_mic` | press | halftone / paper | 668×868 | 292 KB |
| `p_nameplates` | press | halftone / paper | 1348×568 | 269 KB |
| `p_notebook` | press | halftone / paper | 900×640 | 52 KB |
| `p_slip` | press | halftone / paper | 1100×300 | 30 KB |
| `room_box_dark` | home | warm | 1500×1000 | 277 KB |
| `room_box_lit` | home | warm | 1500×1000 | 313 KB |
| `room_cup` | home | warm | 400×380 | 16 KB |
| `room_curtain` | home | warm | 420×1320 | 74 KB |
| `room_fan_blades` | home | warm | 1400×1400 | 57 KB |
| `room_fan_hub` | home | warm | 240×520 | 5 KB |
| `room_kitchen_dark` | home | warm | 720×1500 | 183 KB |
| `room_kitchen_lit` | home | warm | 720×1500 | 202 KB |
| `room_lamp_dark` | home | warm | 620×920 | 21 KB |
| `room_lamp_lit` | home | warm | 620×920 | 27 KB |
| `room_shelf` | home | warm | 820×540 | 21 KB |
| `room_table_dark` | home | warm | 2600×620 | 278 KB |
| `room_table_lit` | home | warm | 2600×620 | 289 KB |
| `room_wall_dark` | home | warm | 2600×1460 | 599 KB |
| `room_wall_lit` | home | warm | 2600×1460 | 608 KB |
| `room_window` | home | warm | 1016×936 | 98 KB |
| `u_far` | rest (dusk city) | rich | 3600×1000 | 320 KB |
| `u_mid` | rest (dusk city) | rich | 3600×1100 | 445 KB |
| `u_poles` | rest (dusk city) | rich | 3600×1200 | 58 KB |
| `u_sky` | rest (dusk city) | rich | 2400×1350 | 552 KB |
