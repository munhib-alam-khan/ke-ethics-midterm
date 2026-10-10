/* Scenes 1–4: household → shared darkness → controversy → investigation.
   Layer overrides mix pose keys (x y z s r o) with timing keys
   (d t e via spin sPeak oD oT oPeak pD pT) — see engine.js. */
(function () {
  const S = window.SCENES = window.SCENES || [];
  const H = window.WORLD_HELP;
  const C = window.CONTENT;
  const houses = H.houses;
  const lightsOff = { wallLit: { o: 0 }, kitchenLit: { o: 0 }, lampLit: { o: 0 }, lampGlow: { o: 0 }, tableLit: { o: 0 }, boxLit: { o: 0 }, leds: { o: 0 } };
  const illus = (u, t, pos) => `<div data-u="${u}" class="illus" style="${pos}">${t}</div>`;

  /* ---------------------------------------------------------------- 1 */
  S.push(Object.assign({}, C.s01, {
    id: 's01', world: 'home', thumb: 'room_wall_lit',
    cues: ['Close on the paid bill in the lamp-lit room; the stamp lands.',
      'ADVANCE → the bill lifts and turns toward us, the camera steps back into the room; router lights die, the lamp fails, the fan winds down.'],
    ui: `
      <div data-u="scrim" class="scrim b" style="height:46%"></div>
      <div data-u="t1" class="abs" style="left:1010px;top:690px;width:860px"><h1 class="h1 shadow-t">You pay your electricity bill.</h1></div>
      <p data-u="t2" class="abs body shadow-t" style="left:1010px;top:920px;font-size:46px">On time. <span class="amber">Every month.</span></p>
      <div data-u="t3" class="abs" style="left:900px;top:860px;width:960px"><h1 class="h1 shadow-t">Then the lights go out.</h1></div>
      <div data-u="tagRouter" class="tag off anch">Router — offline</div>
      <div data-u="tagFan" class="tag off anch">Fan — winding down</div>
      <div data-u="tagStove" class="tag off anch">Cooking — stopped</div>
      ${illus('il', 'Illustrative household — not an interview participant', 'right:28px;top:24px')}`,
    states: [
      { dur: 2400, cam: { x: -20, y: 120, z: 40, roll: -1.2 }, fx: { fan: 1 },
        drift: { z: 18, x: 6, dur: 22000 },
        U: { scrim: { d: 0, t: 800, from: { y: 0 } }, t1: { d: 500, from: { x: 50 } }, t2: { d: 1500, from: { y: 24 } }, il: { d: 300, from: { y: -10 } } } },
      { dur: 3600, cam: { x: 80, y: -40, z: -60, roll: 0.8 }, fx: { fan: 0 },
        L: Object.assign({
          bill: { x: -140, y: 60, z: 300, r: -12, d: 0, t: 0.62, e: 'io', via: { x: 0, y: -60, z: 330 }, spin: -9 },
          wash: { o: 0.5, oD: 0.45, oT: 0.4 }
        }, {
          leds: { o: 0, oD: 0.28, oT: 0.05 }, lampGlow: { o: 0, oD: 0.40, oT: 0.1 }, lampLit: { o: 0, oD: 0.40, oT: 0.1 },
          kitchenLit: { o: 0, oD: 0.34, oT: 0.16 }, wallLit: { o: 0, oD: 0.42, oT: 0.32 }, tableLit: { o: 0, oD: 0.42, oT: 0.32 }, boxLit: { o: 0, oD: 0.42, oT: 0.3 }
        }),
        drift: { z: -14, dur: 22000 },
        U: { scrim: {}, t3: { d: 1700, from: { y: 30 } }, il: {},
          tagRouter: { d: 1250, from: { x: -20 }, anchor: { k: 'shelf', lx: -75, ly: 55, ax: -330, ay: -20 } },
          tagStove: { d: 1500, from: { x: -20 }, anchor: { k: 'kitchenDark', lx: -70, ly: 10, ax: -330, ay: -60 } },
          tagFan: { d: 2300, from: { x: -20 }, anchor: { k: 'fanHub', lx: 0, ly: 200, ax: 120, ay: 20 } } } }
    ]
  }));

  /* ---------------------------------------------------------------- 2 */
  const tagU = {};
  houses.forEach((h, i) => {
    tagU['h' + i] = { d: 4300 + i * 90, from: { y: -50, r: (i % 2 ? 6 : -6) }, e: 'back', anchor: { k: h.k, lx: 0, ly: -(h.h + 400) * h.ppw / 2 + 400 * h.ppw, ax: 0, ay: -78 } };
  });
  const tagHTML = houses.map((h, i) => {
    const kind = i === 3 ? 'unpaid' : i === 8 ? 'theft' : 'paid';
    const label = i === 2 ? 'You · paid' : kind === 'paid' ? 'Paid' : kind === 'unpaid' ? 'Unpaid' : 'Hooked line';
    return `<div data-u="h${i}" class="htag ${kind} anch">${label}</div>`;
  }).join('');
  S.push(Object.assign({}, C.s02, {
    id: 's02', world: 'home', thumb: 'house_0',
    cues: ['The camera eases toward the back window, then pulls back out through the front window: the room becomes one window in one house on one feeder. Illustrative tags land on ten houses.',
      'ADVANCE → the camera settles on the transformer; the feeder wires pulse once from the pole to every house, paying or not.',
      'ADVANCE → tags clear, the camera lifts to the sky; the case question lands.'],
    L: Object.assign({}, lightsOff, { bill: {} }),
    ui: `
      <div data-u="scrimT" class="scrim t" style="height:44%"></div>
      <div data-u="l1" class="abs" style="left:96px;top:56px;width:1500px"><p class="body shadow-t" style="font-size:42px">Your neighbour may have an unpaid bill. Someone further down the street may be stealing electricity.</p></div>
      <p data-u="l2" class="abs body shadow-t amber" style="left:96px;top:176px;font-size:42px">You have done neither.</p>
      <div data-u="l3" class="abs" style="left:96px;top:70px;width:1700px"><h1 class="h1 shadow-t">But you share the darkness.</h1></div>
      <div data-u="l4" class="abs" style="left:96px;top:70px;width:1728px">
        <div class="mega shadow-t" style="font-size:150px">Who should bear the cost?</div>
        <p class="body shadow-t" style="margin-top:22px;width:1480px">When a company faces a collective financial problem, how much of the burden can it fairly place on an individual customer who has fulfilled their responsibility?</p>
      </div>
      ${tagHTML}
      <div data-u="cap" class="abs cite" style="left:96px;bottom:34px;width:1700px;color:var(--cream)">ILLUSTRATIVE EXAMPLE: 8 paying households, 2 defaulting (one unpaid bill, one illegal hook). Not measured data from our interviews.</div>
      <div data-u="fd" class="abs cite" style="left:0;top:0;color:var(--amber)">ONE FEEDER</div>`,
    states: [
      { dur: 5600, cam: Object.assign({}, H.STREET_CAM),
        spec: { cam: [{ t: 0.2, x: -60, y: -10, z: 240, e: 'io' }], camEnd: { e: 'io', logz: 1000 } },
        L: { bill: { d: 0, t: 0.25 }, wash: { o: 0, oD: 0.35, oT: 0.3 } },
        drift: { z: -380, x: 60, dur: 24000 },
        U: Object.assign({ scrimT: { d: 3200, t: 1000, from: { y: -30 } }, l1: { d: 3600, from: { y: -26 } }, l2: { d: 4300, from: { x: -30 } }, cap: { d: 5000, from: { y: 10 } } }, tagU) },
      { dur: 3000, cam: { x: 6500, y: -2450, z: -9300, roll: -0.6 },
        L: { wiresGlow: { o: 0.16, d: 0.15, t: 0.85, oD: 0.15, oT: 0.85, oPeak: 0.85, pD: 0.15, pT: 0.75 } },
        drift: { z: -260, dur: 22000 },
        U: Object.assign({ scrimT: {}, l3: { d: 900, from: { y: -30 } }, cap: {},
          fd: { d: 1100, from: { y: -12 }, anchor: { k: 'pole', lx: 0, ly: -860, ax: 70, ay: -10 } } }, tagU) },
      { dur: 3000, cam: { x: 5000, y: -3900, z: -12800, roll: 0 },
        L: { wiresGlow: { o: 0.08 } },
        drift: { z: -300, dur: 24000 },
        U: { scrimT: {}, l4: { d: 900, from: { y: 40 } } } }
    ]
  }));

  /* ---------------------------------------------------------------- 3 */
  const LAND = H.PRESS_LAND, BOARD = H.PRESS_BOARD, at = H.at;
  const FOLD = H.PRESS_FOLDERS;
  const offFolders = {};
  FOLD.forEach(([k, img, t, sub, sx, sy], i) => { offFolders[k] = Object.assign(at(BOARD, sx + (i % 2 ? 500 : -500), sy + 1300, 0.8, 1000), { r: [-25, 20, 18, -22][i], o: 0 }); });
  S[1].exit = { cam: { x: 5000, y: -6500, z: -9000 }, frac: 0.75, Ldef: { e: 'in', oD: 0.1, oT: 0.6 } };
  S.push(Object.assign({}, C.s03, {
    id: 's03', world: 'press', thumb: 'p_chamber',
    cues: ['Editorial collage assembles: illustrated fragments arrive on separate curved paths (one sweeps through the foreground), the reporting summary slips settle, the camera tracks across and lands on the distinction.'],
    L: Object.assign({}, offFolders),
    enter: {
      cam: { x: -900, y: -260, z: -700, roll: -6 },
      L: {
        board: { o: 1, y: 3800, r: 4 },
        chamber: { x: -2600, y: -300, z: 1300, r: -18, o: 1 },
        lines: { x: 2200, y: -1500, z: 1500, r: 25, o: 1 },
        nameplates: { x: -1700, y: 1500, z: 900, r: -30, o: 1 },
        chair: { x: 2800, y: 400, z: 1200, r: 32, o: 1 },
        docs: { x: 1600, y: 1600, z: 800, r: -35, o: 1 },
        mic: { x: -1500, y: 900, z: -260, r: -45, o: 1 },
        chip: { y: -1500, z: 700, r: -14, o: 1 },
        s1: { x: 1900, y: 900, z: 500, r: 18, o: 1 },
        s2: { x: 2100, y: 200, z: 600, r: -14, o: 1 },
        s3: { x: -1600, y: 1300, z: 650, r: 12, o: 1 }
      }
    },
    ui: `
      <div data-u="scrimR" class="scrim r" style="width:52%"></div>
      <div data-u="triad" class="abs triad" style="left:1060px;top:220px;width:780px">
        <div class="row"><span class="who">The CEO</span><span class="what">Absent.</span></div>
        <div class="row"><span class="who">Representatives, led by the distribution head</span><span class="what">Attended.</span></div>
        <div class="row"><span class="who">The committee</span><span class="what">Asked them to leave.</span></div>
      </div>
      <p data-u="why" class="abs body sm" style="left:1060px;top:760px;width:760px;border-left:5px solid var(--amber);padding-left:20px">The CEO was not expelled. <b>Why he did not attend is not established</b> — by the reporting or by our interviews.</p>
      <p data-u="src" class="abs cite" style="left:96px;bottom:26px;width:1720px;background:rgba(20,18,16,.78);padding:6px 12px">Our summary of published reporting — not a reproduction of the article: Khan, A. (2026, September 24). NEPRA and K-Electric representatives grilled over power outages. <i>Business Recorder</i>. Sept 24 is the publication date.</p>
      ${illus('il', 'Fragments are illustrations — not images of the meeting', 'right:28px;top:24px')}`,
    states: [
      { dur: 4800, cam: Object.assign({}, LAND),
        spec: { cam: [{ t: 0.45, x: -320, y: -80, z: -300, roll: -2, e: 'io' }], camEnd: { e: 'io' } },
        L: {
          board: { d: 0, t: 0.45, e: 'out', oD: 0, oT: 0.05 },
          mic: { d: 0, t: 0.72, e: 'io', via: { x: -200, y: 120, z: -380 }, spin: 30 },
          chamber: { d: 0.04, t: 0.62, e: 'out', via: { x: -1400, y: -700, z: 900 } },
          lines: { d: 0.12, t: 0.55, e: 'out', via: { x: 2000, y: -300, z: 1200 }, spin: -12 },
          nameplates: { d: 0.18, t: 0.55, e: 'out', via: { x: -1300, y: 600, z: 700 } },
          chair: { d: 0.22, t: 0.6, e: 'out', via: { x: 1800, y: -500, z: 900 }, spin: 10 },
          docs: { d: 0.3, t: 0.5, e: 'out', via: { x: 1600, y: 400, z: 600 } },
          chip: { d: 0.36, t: 0.4, e: 'back' },
          s1: { d: 0.42, t: 0.38, e: 'back', via: { x: 1000, y: 100, z: 600 } },
          s2: { d: 0.5, t: 0.36, e: 'back', via: { x: 1200, y: -200, z: 700 } },
          s3: { d: 0.58, t: 0.36, e: 'back', via: { x: -600, y: 900, z: 700 } }
        },
        drift: { z: 40, x: 20, dur: 24000 },
        U: { scrimR: { d: 3000, t: 900, from: { x: 80 } }, triad: { d: 3500, from: { x: 60 } }, why: { d: 4300, from: { y: 20 } }, src: { d: 4500, from: { y: 10 } }, il: { d: 4000, from: { y: -10 } } } }
    ]
  }));

  /* ---------------------------------------------------------------- 4 */
  const intoA = (sx, sy, d) => Object.assign(at(BOARD, 470 + sx, 330 + sy, 0.18, 995), { o: 0, r: 0, d, t: 0.5, e: 'in', oD: d + 0.35, oT: 0.15 });
  const onBoard = {};
  FOLD.forEach(([k, img, t, sub, sx, sy], i) => { onBoard[k] = Object.assign(at(BOARD, sx, sy, 0.8, 1000), { r: [-3, 2.5, 2, -2.5][i], o: 1, d: 0.15 + i * 0.1, t: 0.55, e: 'out', via: { y: at(BOARD, sx, sy, 1, 1000).y + 600 } }); });
  const CARD_CAM = { x: BOARD.x + 380, y: BOARD.y + 200, z: BOARD.z + 380, roll: 0 };
  const cardPose = i => Object.assign(at(CARD_CAM, 1380 + (i % 2 ? 40 : -20), 235 + i * 200, 0.78, 960 - i), { o: 1, r: [-4, 3, -2, 3.5][i], d: 0.25 + i * 0.1, t: 0.5, e: 'back' });
  S.push(Object.assign({}, C.s04, {
    id: 's04', world: 'press', thumb: 'p_folder_d',
    cues: ['The collage files itself away: fragments drop into “Published reporting” while three more source folders swing in; the camera pulls back to the research board.',
      'ADVANCE → the camera moves to the interview folder; four anonymised index cards fan out of the notebook. 2 residents + 2 employees.'],
    ui: `
      <p data-u="q" class="abs cite" style="left:96px;top:1008px;width:1720px;color:var(--ink);font-size:26px">But a confrontation alone cannot tell us whether a company acted ethically.</p>
      <div data-u="panel" class="abs" style="left:0;top:0;width:900px;height:1080px;background:linear-gradient(90deg, rgba(20,18,16,.94) 70%, rgba(20,18,16,0))"></div>
      <div data-u="two" class="abs" style="left:96px;top:96px;width:800px">
        <div class="mega amber" style="font-size:118px">2 residents</div>
        <div class="mega" style="font-size:118px">+ 2 employees</div>
      </div>
      <ul data-u="list" class="abs rule-list" style="left:96px;top:420px;width:720px">
        <li><span class="k">Consent</span>Obtained before each interview.</li>
        <li><span class="k">Confidentiality</span>Both employees are anonymised.</li>
        <li><span class="k">Sample</span>Small and access-based — situated perspectives, not a survey.</li>
      </ul>
      <p data-u="comp" class="abs h3 it" style="left:96px;top:860px;width:760px">And the picture became more complicated.</p>`,
    states: [
      { dur: 3800, cam: Object.assign({}, BOARD),
        spec: { cam: [{ t: 0.35, x: 180, y: -40, z: 40, roll: 1.5, e: 'io' }], camEnd: { e: 'io' } },
        L: Object.assign({
          chamber: intoA(-40, 0, 0.0), chair: intoA(30, 20, 0.05), mic: intoA(10, -10, 0.08), nameplates: intoA(-10, 30, 0.1),
          chip: intoA(0, -30, 0.12), s1: intoA(-20, 0, 0.14), s2: intoA(20, 10, 0.16), s3: intoA(0, 20, 0.18),
          docs: Object.assign(at(BOARD, 1450, 330, 0.2, 995), { o: 0, r: 0, d: 0.1, t: 0.55, e: 'in', oD: 0.5, oT: 0.15 }),
          lines: Object.assign(at(BOARD, 470, 800, 0.2, 995), { o: 0, r: 0, d: 0.12, t: 0.55, e: 'in', oD: 0.52, oT: 0.15 }),
          notebook: { o: 1, d: 0.5, t: 0.4, oD: 0.5, oT: 0.2, e: 'out' }
        }, onBoard),
        drift: { z: 30, dur: 24000 },
        U: { q: { d: 2600, from: { y: 16 } } } },
      { dur: 3200, cam: Object.assign({}, CARD_CAM),
        L: Object.assign({}, Object.fromEntries(Object.entries(onBoard).map(([k, v]) => [k, Object.assign({}, v, { d: 0, t: 0.5, via: undefined, o: k === 'fD' ? 1 : 0.3 })])),
          { chamber: intoA(0, 0, 0), chair: intoA(0, 0, 0), mic: intoA(0, 0, 0), nameplates: intoA(0, 0, 0), chip: intoA(0, 0, 0), s1: intoA(0, 0, 0), s2: intoA(0, 0, 0), s3: intoA(0, 0, 0),
            docs: Object.assign(at(BOARD, 1450, 330, 0.2, 995), { o: 0 }), lines: Object.assign(at(BOARD, 470, 800, 0.2, 995), { o: 0 }),
            notebook: { o: 1, r: -6 },
            c1: cardPose(0), c2: cardPose(1), c3: cardPose(2), c4: cardPose(3) }),
        drift: { z: 24, dur: 24000 },
        U: { panel: { d: 300, t: 800, from: { x: -120 } }, two: { d: 700, from: { x: -60 } }, list: { d: 1500, from: { y: 24 } }, comp: { d: 2300, from: { y: 20 } } } }
    ]
  }));
})();
