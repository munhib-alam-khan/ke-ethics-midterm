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
