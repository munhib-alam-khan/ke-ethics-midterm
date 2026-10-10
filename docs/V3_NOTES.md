# v3 — live 3D rebuild: build, motion and asset notes

## Why a new medium

The v2 feedback was "still the same… things are out of place n glitching". v2 moved about 130 pre-painted image layers in the DOM. The likely causes of the glitching were:

- images arriving late over the network;
- GPU memory pressure from many large composited layers;
- hidden worlds rasterising on first show.

Repositioning those layers could not fix this. v3 replaces the layers with **one real-time WebGL scene** (three.js 0.170) with real lights, a real camera and post-processing. Text stays in HTML so it is sharp on a projector.

## How it works

| Part | File | Notes |
|---|---|---|
| Renderer + post | `v3/src/world/render.js` | ACES tone mapping, UnrealBloom, final pass: vignette, film grain, grade, fade-to-black and whip blur for cuts, tilt-shift for the "miniature" street |
| Street + room | `v3/src/world/street.js` | A Karachi lane at night: 10 houses on one feeder, far houses on another, an opposite row, transformer, poles and wires (with a travelling pulse shader), sodium lights, a background city, sky, moon and stars. House 0 has a real first-floor room behind an open window: table, paid bill, lamp, tube light, fan, router, hot plate, curtains |
| Other sets | `v3/src/sets/*.js` | chamber (committee room), desk (evidence), imad (cut-away flat block), roofs (Gulshan at dusk), ops (network model), studio (slabs, plinths, pillars, miniature city) |
| Textures | `v3/src/world/tex.js` | Every texture is drawn at load time on a canvas: plaster, asphalt, tiles, wood, grilles, window glows, paper with live text, city windows. **No image files** |
| Engine | `v3/src/deck/engine.js` | State model, camera paths (Catmull-Rom with look-target paths), parameter tweens, two-phase cuts between sets, HTML labels pinned to 3D anchors, text reveals |
| Scenes | `v3/src/deck/scenes.js` | 22 scenes and 37 advances: camera, light and object targets and timing, plus on-screen text |
| Shell | `v3/src/ui/shell.js` | Notes, overview, evidence, blackout, help, HUD, keys, presenter sync (same keys as v1/v2) |

**Glitch-proofing**

- **Complete targets.** Every state is a complete target: camera pose plus every animatable value. Any jump (forward, back, overview, a key held down or mashed) is one tween from wherever things are to that target. Nothing accumulates, so a state cannot be left half-built.
- **No mid-show compilation.** Shaders for every set are compiled behind the loader (`renderer.compile` per set). This avoids hitches the first time a set appears.
- **Only one set is visible at a time.** Cuts between sets swap visibility under a full fade or whip, so the light configuration never changes mid-frame.
- **No image downloads.** Textures are generated in memory and the fonts are local, so nothing can pop in late.
- **Capped pixel ratio, plus a quality fallback.** If the first 90 frames after start average under ~38 fps, the pixel ratio drops (up to twice).
- **Low motion (M).** Every move becomes a 0.5 s dip to black and a cut. Text simply fades in.

**Build:** `cd v3 && npm install && npm run build` writes `v3/dist/deck.js`, a single IIFE bundle with three.js and GSAP inlined. It is committed, so the presentation runs from `file://` or GitHub Pages without a build step.

## Motion design per scene (summary)

The full per-advance list is in `docs/SCENE_MANIFEST_V3.md`.

- **The opening is one continuous shot.**
  - It begins close on the paid bill in a lamp-lit room.
  - On the advance, the bill lifts toward us. The router dies, the lamp stutters out, the tube light and stove cut, and the fan winds down. Through the window the whole street goes dark at the same moment.
  - The next advance flies over the table, through the open window and up over the road to find the dark feeder. Ten illustrative tags are pinned to real houses.
  - The camera then moves to the transformer, where a pulse travels down every wire. It finally cranes into the sky for the question.
- **Committee room.**
  - We arrive from above. An empty, cold-lit chair has a "Chief Executive" nameplate.
  - Three faceless representatives walk out through a lit door while the triad lands.
  - The room returns later twice: for Employee 2's refusal to speculate (the question mark is left unresolved) and for "the standard applies to the committee too".
- **The evidence desk** (noir blinds light). Paper physically lands:
  - source covers;
  - interview cards joined by a red string;
  - KE's company-reported slips under a stamp;
  - the paraphrased NEPRA order.
- **Imad's flat.** The block loses power partway through the shot, and only the phone's empty outage page stays lit. The service responses then rise as speech bubbles. The quotation is held over the dark silhouette of the block.
- **Gulshan at dusk.** Labels sit on a UPS, a pump and a flickering bulb. The camera then drops to two neighbouring windows: one has backup, one has only a candle.
- **Network model.** Interruption kinds separate by colour, and revenue particles flow back while hooked lines return nothing. For the quotation, everything dims except one paying house. For scene 10, the two accounts stream in from opposite edges and meet.
- **Theories, using the same household objects.**
  - The battery, laptop, pot, bucket and clock rise around the bill (nothing is weighed).
  - A single cold spotlight falls on the bill, then the camera pulls back out to the feeder.
  - Three illustrative papers settle on the table.
  - The studio slabs rise and line up.
- **Evaluation.** Three plinths light unevenly (channel, then information, then resolution). Pillars of consequence rise in turn.
- **Recommendations on the street, seen as a lit miniature.**
  - A targeting ring marks only the hooked line.
  - An honest outage update hangs over the street.
  - A complaint thread travels to an owner.
  - A hearing brief appears.
  - Owner, deadline and measure chips appear with the 30/60/90 rail. Everything is labelled proposed and illustrative.
- **Limits.** Four small lights appear on an abstract miniature city.
- **Return.** The camera drifts back in through the same window to the same bill in moonlight.

## Asset register (v3)

| Asset | Origin | Licence |
|---|---|---|
| All geometry (houses, room, furniture, chamber, figures, desk, flats, roofs, network model, studio, city) | Procedural, written for this project in `v3/src/**` | Project's own |
| All textures (plaster, wood, tiles, asphalt, grilles, window glows, paper, bill, cards, phone screens, city windows, emblem) | Drawn at runtime on canvas by `v3/src/world/tex.js` and the set files | Project's own |
| Figures in the committee room | Faceless mannequins (box/capsule/sphere) — no likeness of any person | Project's own |
| Fonts | Fraunces, Anton, Source Sans 3, IBM Plex Mono — `assets/fonts/` (shared with v1/v2) | SIL OFL 1.1 |
| three.js 0.170.0 | npm, bundled into `v3/dist/deck.js` | MIT |
| GSAP 3.12.5 | npm, bundled into `v3/dist/deck.js` | GSAP standard "no charge" licence |
| Overview thumbnails `v3/assets/thumbs/*.jpg` | Screenshots of this presentation | Project's own |

No photograph, logo, real document, article text or likeness is used. The bill, papers, phone screens and nameplates are generic and are labelled illustrative on screen. The emblem in the chamber is an abstract roundel, not a real insignia.

## Content and accuracy (unchanged from v1/v2)

- The script, speaker notes, sources, references, interview table and recordings link come from the same `content.js` and `references.js`.
- On-screen qualifications are carried over word for word:
  - the CEO was summoned and absent, the representatives were asked to leave, and the CEO was not expelled; no motive is stated;
  - the 8 paying / 2 defaulting example is labelled illustrative;
  - ~12 hours is participant-reported and unverified;
  - both employees are anonymised and speaking in a personal capacity;
  - the three quotations are exact;
  - the KE 2025 figures are company-reported and predate the hearing;
  - 98.2% is company-reported and aggregate;
  - the NEPRA order is shown as a paraphrase with no court outcome, and the PKR 50m fine is earlier history;
  - recommendations and milestones are proposed management deadlines, and pilots cannot delay binding compliance.
- New visual metaphors are labelled where they could be mistaken for data:
  - "Illustrative network model";
  - "Abstract city — four lights for four interviews, not locations";
  - "Illustrative room · faceless figures — not images of the meeting";
  - "Illustrative screen".

## Testing record

- `node tools/v3/test_controls.mjs`: keyboard, overlays, rapid advance and reverse, hash restore, offline check, no audio or video (results in the commit message and README).
- `node tools/v3/stills.mjs <dir> all`: every advance after it settles (in `previews/v3/`).
- `node tools/v3/record.mjs`: frame-exact preview videos using the virtual clock (`?capture`), in `previews/v3/*.mp4`.
- Headless Chromium can only test with software WebGL (SwiftShader), at about 1–3 fps. Real GPUs run the same scenes far faster, so these runs are a correctness check, not a performance measure. **Before presenting, rehearse once on the actual laptop and projector.** If it stutters, press M (low motion) or open with `?q=0` (no antialiasing, pixel ratio 1).
