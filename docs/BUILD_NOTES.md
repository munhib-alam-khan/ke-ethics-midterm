# Build notes

## How factual conflicts were resolved
The **report controls facts**; the **script controls sequence and delivery**. Where they diverge, the screen follows the report and the notes keep the script's wording.

| # | Script / brief | Report | Resolution on screen |
|---|---|---|---|
| 1 | "NEPRA's August 2026 order" | Dated **August 31, 2026** | Full date shown (scene 17). |
| 2 | "Several interviewees believed the delegates should have been allowed to answer" | Names **Imad and Employee 1** | Slide names both (scene 13). The spoken line is unchanged. |
| 3 | "KE reports aggregate system reliability…" | 98.2% FY25 cited as **"K-Electric, 2026s"**, which matches no reference-list entry | Shown as "company-reported, aggregate (K-Electric, 2026)" and linked to 2026a (the Jan 7, 2026 sustainability release), the most likely source. **Please verify and correct the report's in-text citation before submission.** |
| 4 | No passage comparing the three theories | Report has an explicit comparison | Scene 14 shows the comparison. An **optional ~20 s bridging line** drawn from the report is in the notes. |
| 5 | No passage on financial/reputational consequences | Report section "Financial, Reputational and Other Consequences" | Scene 18 covers it. An **optional ~25 s bridging passage** is in the notes. If time is short, the presenter can advance through it with one sentence. |
| 6 | Hearing date | Report gives only the **publication date** (Sept 24, 2026) of the Business Recorder article | Screen says "reporting published Sept 24, 2026" and does not assert a meeting date. |
| 7 | Brief asked for an authentic clipping *or* a labelled summary | Article could not be fetched (network policy) | A **typeset summary of published reporting**, explicitly labelled as not a reproduction. No fake newspaper layout. |
| 8 | Brief asked for a NEPRA excerpt *or* a labelled paraphrase | PDF could not be fetched | A **labelled paraphrase** using only the report's wording. Nothing is highlighted as document text. |
| 9 | Brief mentions "ownership and escalation of recurring complaints" | Report: complaint ownership within 60 days, plus an employee escalation route without retaliation | Both shown (Rec 3). |
| 10 | Brief: Employee 2's quotation "about acknowledging unresolved problems" | Exact text: *"jo masle hal nahi huwe, inhe manna bhi jawabdehi ka hissa hai"* | Used verbatim (first letter capitalised) with the report's translation. |
| 11 | Interviewer referred to the CEO "being expelled" (Appendix E) | Report: the interviewer's statement is mistaken; the **delegates** were asked to leave | Scene 3 states explicitly: "The CEO was not expelled." |

## Accuracy guardrails built into the scenes
- The CEO was summoned and absent. The delegates, led by the distribution head, were asked to leave. No motive is suggested anywhere.
- The "8 paying / 2 defaulting" street (scene 2) carries the label *"Illustrative example … not measured data from our interviews."*
- "~12 hours a day" (scene 7) has its qualification directly beneath it: *participant-reported, durations varied (~4, 8, 10, 12), not independently verified.*
- Resident 2's allegations (billing, collusion, extra tax) appear only as unsupported suspicions that indicate distrust.
- Employee views are labelled "personal views — not an official KE statement" on every employee scene. No faces are shown.
- KE's 2025 figures carry the stamp "Company-reported · 2025 activities" and the note that they predate the September 2026 hearing.
- The PKR 50m fine is labelled **prior regulatory history**. No final court outcome is claimed.
- The 30/60/90-day milestones are labelled "PROPOSED management milestones — not legal deadlines, and not permission to delay binding compliance". The street stays dark: nothing is shown as implemented.
- No invented amounts, weights, welfare calculation, stock-price effect, income loss or appliance damage.

## Speaking-time balance
Advances 1–8 (opening, controversy, investigation) take about 2–2.5 minutes. Interviews (scenes 5–10) take about 3 minutes, and theory, evaluation, recommendations and conclusion (scenes 11–22) about 5.5–6 minutes. Analysis and recommendations therefore take well over half the speaking time.

## Testing performed
- **Browser inspection:** yes. Every reveal state was screenshotted in headless Chromium at 1920×1080 and reviewed visually. A full low-motion pass ran at 1366×768, and spot checks ran at 1024×768 (4:3, letterboxed). The previews in `previews/` come from these runs.
- **Controls:** `node tools/test_controls.mjs` runs 36 automated checks: arrow/space/PgDn/PgUp/Home/End, 25 rapid clicks forwards and back (one active scene, correct step classes), backward entry at the previous scene's last reveal, end clamp, notes/overview/evidence/blackout/help/low-motion toggles, Escape handling, fullscreen request, hidden HUD, URL-hash restore, no audio/video elements, no network requests, no page errors. All pass.
- **Not testable headlessly:** true fullscreen on a physical projector, and frame rate on the actual classroom laptop. Rehearse once on the presentation machine; press **M** for low-motion mode if transitions stutter.

## Known limitations
- The art is painted illustration, not photography. Photographic plates could be swapped in later by replacing files in `assets/img/` with the same names and sizes.
- The presenter window (**P**) needs the deck served over `http://` (see README). On `file://` use the on-screen notes (**N**).

---

# v2 motion revision: build notes

**Where it lives:** `v2/index.html` (self-contained: `v2/css`, `v2/js`, `v2/assets`; fonts shared from `assets/fonts`). The published v1 deck at the repository root is unchanged. It is also preserved on the branch `claude/k-electric-cinematic-presentation-pq9921-v1`. A `v1-static` tag exists locally, but the git proxy refused the tag push.

**What changed:**
- **Engine:** v1 used CSS class reveals over flat plates. v2 adds `v2/js/engine.js`, a 2.5D pinhole-camera engine. Each world is a stack of independent raster/HTML layers at real depths. Transitions are sampled into per-layer WAAPI keyframes (transform + opacity only), with each layer's own delay, easing, Bézier path and spin. Camera waypoints and log-space dollies make the through-the-window moves feel even. Interruptions read the exact current pose, so rapid clicks and reversals never jump or stack. Going back replays the forward choreography mirrored.
- **Assets:** 126 separately painted layers in nine worlds (household and neighbourhood, editorial collage and research board, Imad's household, Gulshan rooftops, operations miniature, two-worlds seam, correspondence desk, evaluation book, fieldwork collage, regulatory desk, recommendation miniature, dusk city), plus HTML text layers inside the worlds where text must travel with an object (folder labels, index cards, outage update, complaint, commitment).
- **Script mapping:** unchanged, verified programmatically against v1. The only structural change: **scene 13 (virtue ethics) is now two reveals**, split at "And this standard also applies to the committee." v2 has 37 reveal states (36 advances) against v1's 36 (35 advances).

**Factual guardrails carried over (checked programmatically):** company-reported 2025 figures with date and "predate the hearing"; the participant-reported ~12-hour estimate with its qualification attached; PKR 50m labelled prior history; the NEPRA paraphrase label; "The CEO was not expelled" and "reason not established"; employee "personal views" labels; exact quotations with dates; "PROPOSED — not implemented" and "not legal deadlines / not permission to delay binding compliance" on every recommendation; recommendation visuals labelled illustrative or proposed process; the recommendation houses never shown as an implemented result.

**Testing actually performed:**
- `node tools/v2/test_controls.mjs`: 36 automated checks, all passing (keys, rapid clicking both ways, back-into-previous-scene at its last reveal, end hold, notes, overview, evidence, blackout, help, low motion, fullscreen request, hidden HUD, hash restore, no audio or video, no network, no errors).
- Every reveal state screenshotted after its choreography at 1920×1080 and reviewed. Spot checks at 1366×768 in low-motion mode and at 1024×768 (4:3 letterbox).
- **Motion reviewed from browser recordings, not stills.** Four recordings in `v2/previews/*.webm` (Playwright, 1280×720, 25 fps), inspected as dense frame sheets: household → blackout → neighbourhood; controversy → interviews; utilitarianism → deontology; recommendations 1–4. Problems found this way were fixed: the press board fading instead of arriving, blank ground during miniature pans, recommendation cards too small, the operations desk hidden behind chips, and collisions between labels and titles.
- **Performance:** in headless Chromium with software rendering (no GPU), the heaviest transition (the household pull-back) averaged 32.8 ms per frame (about 30 fps), with a 95th percentile of 50 ms. A laptop with GPU compositing should do better, but I could not test that here. **Rehearse on the classroom machine.** If it stutters, press **M** (low motion: no camera travel, positions cut, short crossfades).
- Not testable here: real projector colour and brightness, and the classroom laptop's GPU. The dark scenes (1, 2, 6, 12, 16, 22) keep text on scrims and moonlit mid-tones, but check them on the projector.
