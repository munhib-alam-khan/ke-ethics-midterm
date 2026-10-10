# Motion notes: what the reference films do, and how v2 uses it

Method: I extracted frames with FFmpeg around every detected scene change, at 8–12 fps (`ffmpeg -vf "select='gt(scene,0.18)'"` to find cuts, then `fps=8…12,tile` sheets). Then I compared consecutive frames for each layer's movement. Nothing from the films is reused: no people, text, language, landmarks or branding.

## Observations

| Film | Technique observed (frame evidence) | Used in v2 |
|---|---|---|
| Photo-tile collage (17 s) | Rectangular photo fragments slide in from all four edges at **different constant speeds**, overlapping and occluding one another. Typography words travel as tiles inside the collage. The busy field then **clears to black**, leaving one readable word ("nothing"). | Scene 15: fieldwork fragments arrive from every edge at staggered speeds, then settle under the stamp. Scene 3: the collage builds, then the right half darkens behind the readable distinction. |
| Pastel collage / gramophone (50 s) | Opens extremely close on the gramophone horn, then **pulls back** to reveal it on a table while ribbons unfurl along **curved paths**. Birds fly through at different depths, one passing **right in front of the camera as a wipe**. The camera keeps rising to reveal a winding road of roses, and type rises from behind the road. Close-up faces **cut to full figures inside a wider world**. A final busy city collage assembles and then **settles to a clean cream background** with typography. Petals drift across cuts to bridge them. | Scene 1 opens close on the bill and the camera steps back into the room. Scene 2's pull-back makes the room one window in one house. Scene 3's microphone fragment sweeps through the foreground as a wipe. The bill reappears across scenes 1, 11, 12 and 22. Scene 11 frames each page, then pulls back to the whole book. |
| Painterly city (12 s) | Slow push on a painted figure, then **directional smear wipes** (fast lateral motion blur) into a close-up face, then into an aerial crossing. Inside each shot, small elements keep moving while the frame holds. | Scene changes use lateral camera travel with parallax (press → household, household → rooftops through the window). Holds use slow camera drift and curtain sway, while text stays still. The rich painterly palette is used for the human-consequence scenes (5–7). |
| Alley in shafts of light (15 s) | Almost static. Atmosphere comes from light shafts and haze, with a very slow drift. | The household's practical light (lamp, router LEDs, stove) does the storytelling. Holds use only gentle drift. |

## Motion language adopted

- **2.5D camera through a composed environment.** Every world is a stack of separate raster layers at real depths. One pinhole camera projects them, so parallax, dolly-through-window, pull-back, crane-down and occlusion come from the geometry, not from separate zooms.
- **Independent foreground, middle and background.** Layers at different depths move at different apparent speeds for the same camera move.
- **Curved, staggered entries.** Each object has its own delay, duration, easing, Bézier path (`via`) and mid-flight rotation (`spin`). Nothing moves in lock-step.
- **Object continuity.** The paid bill, the room window, the household objects and the feeder recur and carry meaning between scenes.
- **Busy → settled.** Major sequences take about 3–6 s of choreography, then land. Text appears only after the landing, and stays still.
- **Holds.** Slow camera drift (a few percent over 20–40 s), curtain sway and fan rotation run during holds; nothing flashes.
- **Low-motion mode (M).** Positions jump to their final pose and only opacity crossfades. No camera travel, spin or ambient animation.
