/* Scenes 15–22: evaluation, consequences, recommendations, conclusion. */
(function () {
  const S = window.SCENES, H = window.WORLD_HELP, C = window.CONTENT, at = H.at, D = H.D;
  const illus = (u, t, pos) => `<div data-u="${u}" class="illus" style="${pos}">${t}</div>`;
  const lightsOff = { wallLit: { o: 0 }, kitchenLit: { o: 0 }, lampLit: { o: 0 }, lampGlow: { o: 0 }, tableLit: { o: 0 }, boxLit: { o: 0 }, leds: { o: 0 } };
  const ROOM_TABLE_CAM = { x: 150, y: 170, z: 110, roll: 0.6 };

  /* ---------------------------------------------------------------- 15 */
  S[13].exit = { cam: { x: 0, y: 0, z: 700 }, frac: 0.65, L: { pD: { x: -3000, o: 0 }, pU: { x: 3000, o: 0 }, pV: { x: -3000, y: 900, o: 0 } }, Ldef: { e: 'in', oT: 0.5 } };
  S.push(Object.assign({}, C.s15, {
    id: 's15', world: 'field', thumb: 'f_tent',
    cues: ['A busy fieldwork and customer-service collage slides in from every edge at different speeds; the three company-reported figures arrive on curved paths and the composition settles under the 2025 stamp.'],
    enterDelta: { tent: { x: -2400, r: -10, o: 1 }, hooks: { y: -1600, r: 10, o: 1 }, headset: { x: 2400, r: 12, o: 1 }, forms: { x: 1800, y: 1400, r: -12, o: 1 }, fmeter: { x: -1800, y: 1500, r: 14, o: 1 }, fladder: { x: 2600, y: 400, r: -8, o: 1 },
      stampC: { y: -900, r: -12, o: 1 }, n1: { x: 1600, y: -800, r: 20, o: 1 }, n2: { x: -1700, y: 900, r: -18, o: 1 }, n3: { x: 1900, y: 1000, r: 16, o: 1 } },
    enter: { cam: { x: 0, y: 0, z: -260, roll: -3 }, L: { bg: { o: 1 } } },
    ui: `
      <div data-u="dated" class="abs" style="left:1240px;top:800px;width:600px;background:rgba(20,18,16,.9);padding:20px 26px"><p class="body sm" style="font-size:31px">Published January 2, 2026. These activities <b>predate the September 2026 hearing</b> — they are not a response to it.</p></div>
      <p data-u="src" class="abs cite" style="left:96px;bottom:22px;width:1728px;background:rgba(20,18,16,.8);padding:6px 12px">Source: K-Electric. (2026b, January 2). Year in review: K-Electric shows steady progress during 2025. Company-reported outputs; not independently verified; not the net return on the camps.</p>
      ${illus('il', 'Illustrative fragments', 'right:28px;top:24px')}`,
    states: [
      { dur: 4600, cam: { x: 0, y: 0, z: 0, roll: 0 },
        L: { bg: { oT: 0.2 }, tent: { d: 0, t: 0.45, e: 'out' }, hooks: { d: 0.06, t: 0.4, e: 'out' }, headset: { d: 0.1, t: 0.48, e: 'out' }, forms: { d: 0.16, t: 0.42, e: 'out' }, fmeter: { d: 0.2, t: 0.45, e: 'out' }, fladder: { d: 0.24, t: 0.4, e: 'out' },
          stampC: { d: 0.4, t: 0.3, e: 'back' }, n1: { d: 0.46, t: 0.36, e: 'back', via: { x: 1200, y: -300, z: 500 }, spin: -10 }, n2: { d: 0.54, t: 0.36, e: 'back', via: { x: -800, y: 600, z: 500 }, spin: 10 }, n3: { d: 0.62, t: 0.34, e: 'back', via: { x: 900, y: 900, z: 500 }, spin: -8 } },
        drift: { z: 20, roll: 0.6, dur: 26000 },
        U: { dated: { d: 3900, from: { y: 20 } }, src: { d: 4200, from: { y: 10 } }, il: { d: 3800 } } }
    ]
  }));

  /* ---------------------------------------------------------------- 16 (back into the household) */
  S[14].exit = { cam: { x: 0, y: 0, z: -1600 }, frac: 0.8, L: { n1: { z: 6000, o: 0 }, n2: { z: 6000, o: 0 }, n3: { z: 6000, o: 0 }, stampC: { z: 5000, o: 0 } }, Ldef: { e: 'in', oD: 0.1, oT: 0.5 } };
  S.push(Object.assign({}, C.s16, {
    id: 's16', world: 'home', thumb: 'room_wall_dark',
    cues: ['The aggregate figures recede into the distance; the camera returns from the street through our window to the dark table, the bill and a phone.'],
    L: Object.assign({}, lightsOff, { wash: { o: 0.42 }, hphone: { o: 1 } }),
    enter: { cam: Object.assign({}, H.STREET_CAM, { z: H.STREET_CAM.z - 1500 }), L: { hphone: { o: 0 } } },
    ui: `
      <div data-u="scrim" class="scrim r" style="width:62%"></div>
      <h2 data-u="h" class="abs h2" style="left:960px;top:70px;width:870px">Did paying customers experience better service?</h2>
      <p data-u="h2" class="abs body sm" style="left:960px;top:260px;width:860px;color:#e3dccb">The cited activity figures do not establish that outcome for our interviewees.</p>
      ${[['1', 'A communication channel exists.', 'An app can have many users…'], ['2', 'Accurate information reaches the customer.', '…while a customer still receives no useful outage update.'], ['3', 'The underlying problem is resolved.', 'Connected — but different achievements.']].map((r, i) =>
        `<div data-u="a${i}" class="abs ach2" style="left:960px;top:${380 + i * 150}px"><span class="n">${r[0]}</span><div><p class="h3" style="font-size:40px">${r[1]}</p><p class="body sm" style="color:var(--teal);font-size:30px">${r[2]}</p></div></div>`).join('')}
      <div data-u="rel" class="abs" style="left:96px;top:880px;width:1728px;background:rgba(14,12,10,.9);padding:20px 28px"><p class="body sm" style="font-size:31px"><b>98.2% system reliability, FY25</b> — company-reported, aggregate (K-Electric, 2026). It cannot be equated with uninterrupted supply at every home, and household outage hours cannot be derived from it.</p></div>
      ${illus('il', 'Illustration', 'left:28px;top:24px')}`,
    states: [
      { dur: 5400, cam: Object.assign({}, ROOM_TABLE_CAM), spec: { camEnd: { e: 'io', logz: 1000 }, L: { hphone: { oD: 0.75, oT: 0.2 } } },
        L: { hphone: { d: 0.7, t: 0.3, e: 'out' } },
        drift: { z: 14, dur: 26000 },
        U: { scrim: { d: 3800, t: 800, from: { x: 60 } }, h: { d: 4100, from: { y: 18 } }, h2: { d: 4400 }, a0: { d: 4600, from: { x: 40 } }, a1: { d: 4900, from: { x: 40 } }, a2: { d: 5200, from: { x: 40 } }, rel: { d: 5500, from: { y: 16 } }, il: { d: 4000 } } }
    ]
  }));

  /* ---------------------------------------------------------------- 17 */
  S[15].exit = { cam: Object.assign({}, ROOM_TABLE_CAM, { y: ROOM_TABLE_CAM.y + 500, z: 360 }), frac: 0.7, Ldef: { e: 'in', oT: 0.5 } };
  const DC = H.DOCS_CAM;
  S.push(Object.assign({}, C.s17, {
    id: 's17', world: 'docs', thumb: 'd_desk',
    cues: ['A clearly labelled paraphrase of the August 31, 2026 order slides onto the desk and settles.', 'ADVANCE → a second sheet slides over: the prior PKR 50 million fine as history, and alternative explanations.'],
    L: { sh2: { x: at(DC, 2600, 560, 0.72, 990).x, r: 14 } },
    enterDelta: { sh1: { y: 1500, r: -14, o: 1 }, glasses: { x: 900, y: 500, r: 30, o: 1 } },
    enter: { cam: { x: -200, y: 200, z: -300, roll: -3 }, L: { desk: { o: 1 } } },
    ui: `
      <div data-u="r1" class="abs" style="left:1060px;top:160px;width:770px">
        <h2 class="h2">More than a disagreement.</h2>
        <p class="body" style="margin-top:22px">A documented regulatory challenge to the practice.</p>
        <p class="body sm" style="margin-top:30px;color:#e3dccb">We treat it as the regulator’s finding and direction. We do not claim a final court outcome.</p>
      </div>`,
    states: [
      { dur: 3800, cam: { x: 0, y: 0, z: 0, roll: 0 },
        L: { desk: { oT: 0.25 }, sh1: { d: 0.08, t: 0.55, e: 'out', via: { y: 600 }, spin: 6 }, glasses: { d: 0.2, t: 0.5, e: 'out' } },
        drift: { z: 16, dur: 26000 },
        U: { r1: { d: 2400, from: { x: 40 } } } },
      { dur: 3200, cam: { x: 90, y: 0, z: 30, roll: 0.5 },
        L: { sh2: { x: at(DC, 1430, 560, 0.72, 990).x, r: 1.8, o: 1, d: 0, t: 0.6, e: 'out', via: { y: at(DC, 1430, 300, 1, 990).y }, spin: -8, oT: 0.15 } },
        drift: { z: 14, dur: 26000 },
        U: {} }
    ]
  }));

  /* ---------------------------------------------------------------- 18 */
  S[16].exit = { cam: { x: 0, y: -400, z: 500 }, frac: 0.7, L: { sh1: { y: -1600, r: -20, o: 0 }, sh2: { y: -1600, r: 20, o: 0 } }, Ldef: { e: 'in', oT: 0.5 } };
  S.push(Object.assign({}, C.s18, {
    id: 's18', world: 'home', thumb: 'h_pole',
    cues: ['From the sky the camera descends onto the dark feeder; rings spread out from the transformer as three kinds of consequence separate reported burdens from future risks.'],
    L: Object.assign({}, lightsOff, { ripple: { o: 1 } }),
    enter: { cam: Object.assign({}, H.STREET_CAM, { y: H.STREET_CAM.y - 7000, z: H.STREET_CAM.z - 2000 }) },
    ui: `
      <div data-u="scrim" class="scrim t" style="height:72%;background:linear-gradient(to bottom, rgba(12,11,10,.94) 0%, rgba(12,11,10,.84) 68%, rgba(12,11,10,0) 100%)"></div>
      <div data-u="k" class="abs kicker" style="left:96px;top:46px">Consequences · ● reported or documented &nbsp; ○ risk, not yet measured</div>
      ${[['Financial', ['● Theft and non-payment constrain resources for supply (company explanation).', '● Prior PKR 50 million fine — regulatory history (NEPRA, 2026).', '○ Targeted controls and upgrades need funding; compliance cost not estimated.'], 'var(--amber)'],
         ['Household', ['● UPS and battery spending, interrupted work and internet, cooking, water pumping, time seeking updates.', '○ Households without backup may carry far more of the hardship.'], 'var(--cream)'],
         ['Reputational', ['● Distrust of explanations and leadership in customer accounts.', '○ Unsupported suspicions spread where explanations are missing.'], 'var(--teal)']].map((c, i) =>
        `<div data-u="c${i}" class="abs" style="left:${96 + i * 584}px;top:100px;width:540px"><div class="mega" style="font-size:72px;color:${c[2]}">${c[0]}</div>${c[1].map(t => `<p class="body sm" style="font-size:29px;margin-top:12px">${t}</p>`).join('')}</div>`).join('')}
      <div data-u="lim" class="abs" style="left:96px;top:968px;width:1728px;background:rgba(14,12,10,.9);padding:14px 24px"><p class="body sm" style="font-size:30px"><b>Limitation:</b> four interviews cannot quantify citywide effects. No company-wide loss, household income loss or appliance-damage figure is estimated here.</p></div>`,
    states: [
      { dur: 4400, cam: Object.assign({}, H.STREET_CAM, { y: H.STREET_CAM.y + 600, z: H.STREET_CAM.z - 600 }),
        L: { ripple: { oD: 0.5, oT: 0.2 } },
        drift: { z: -200, dur: 26000 },
        U: { scrim: { d: 2000, t: 900, from: { y: -30 } }, k: { d: 2400 }, c0: { d: 2700, from: { y: 20 } }, c1: { d: 3000, from: { y: 20 } }, c2: { d: 3300, from: { y: 20 } }, lim: { d: 3900, from: { y: 14 } } } }
    ]
  }));

  /* ---------------------------------------------------------------- 19–20 recommendations (miniature) */
  S[17].exit = { cam: Object.assign({}, H.STREET_CAM, { y: H.STREET_CAM.y + 4000, z: H.STREET_CAM.z + 3000 }), frac: 0.7, Ldef: { e: 'in', oT: 0.5 } };
  const MS = H.MINI_CAM;
  const camAtScreen = (sx, z) => ({ x: at(MS, sx, 540, 1, 1000).x, y: 40, z, roll: 0 });
  const rail = (u, on) => {
    const ms = [['Baseline', 'day 0', 0], ['30 days', 'updates', 18], ['60 days', 'complaints', 36], ['90 days', 'targeted plan', 54], ['Before next', 'hearing', 74], ['Quarterly', 'review', 94]];
    return `<div data-u="${u}" class="rail ink">${'<div class="line"></div>' + ms.map((m, i) => `<div class="m ${on.includes(i) ? 'on' : ''}" style="left:${m[2] + 3}%"><i></i>${m[0]}<br>${m[1]}</div>`).join('')}<div class="cite" style="position:absolute;left:0;top:-40px;color:#2c5a56">PROPOSED management milestones — not legal deadlines, and not permission to delay binding compliance</div></div>`;
  };
  const head = (u, n, t) => `<div data-u="${u}" class="abs rechead"><span class="mega">${n}</span><h2 class="h2">${t}</h2></div>`;
  const chip = (u, k, v, x, y, w) => `<div data-u="${u}" class="abs chip2" style="left:${x}px;top:${y}px;width:${w || 520}px"><span>${k}</span>${v}</div>`;
  const glowsOn = Object.fromEntries([...Array(10).keys()].filter(i => i !== 3 && i !== 8).map((i, j) => [`g${i}`, { o: 1, oD: 0.66 + j * 0.03, oT: 0.12 }]));
  const housesRise = Object.fromEntries([...Array(10).keys()].map(i => [`m${i}`, { y: 900, o: 1 }]));
  S.push(Object.assign({}, C.s19, {
    id: 's19', world: 'mini', thumb: 'o_mh0',
    cues: ['The street is rebuilt as a cream-and-teal model. Illustrative: the whole feeder starts dark; inspection rings mark only the two defaulting houses and the others light — a shift from collective interruption to targeted intervention. Owner, proposed deadline and measure settle in turn.',
      'ADVANCE → the camera tracks to operations: an outage update travels from the control desk along a curve to a customer’s phone.'],
    enterDelta: Object.assign({ pole: { y: 900, o: 1 }, wires: { o: 0 } }, housesRise),
    enter: { cam: { x: 0, y: -700, z: -700, roll: -3 }, L: { ground: { o: 1 } } },
    ui: `
      ${head('h1', '01', 'Targeted loss reduction and a costed compliance programme')}
      ${chip('o1', 'Owner', 'Distribution and regulatory teams; finance costs it', 96, 640)}
      ${chip('w1', 'Proposed deadline', 'Pilot areas, requirements and barriers within 90 days', 96, 742)}
      ${chip('m1', 'Success measure', 'Recovery alongside interruption hours for compliant customers', 700, 640, 620)}
      <p data-u="g1" class="abs guard" style="left:700px;top:760px;width:620px">A pilot must not postpone compliance with binding directions.</p>
      ${head('h2', '02', 'Clearer outage updates')}
      ${chip('o2', 'Owner', 'Customer service with distribution', 96, 640)}
      ${chip('w2', 'Proposed deadline', 'Within 30 days', 96, 742)}
      ${chip('m2', 'Success measure', 'Update accuracy — communicated vs actual restoration, checked monthly; phone and on-ground channels kept', 700, 640, 700)}
      <div data-u="stampP" class="abs stampP">Proposed — not implemented</div>
      <div data-u="ill" class="abs cite" style="left:1240px;top:140px;width:600px;color:#2c5a56;text-align:right">ILLUSTRATIVE MODEL — what the proposal aims at, not a result.</div>
      ${rail('r1', [3])}${rail('r2', [1])}`,
    states: [
      { dur: 5600, cam: { x: 0, y: -60, z: -120, roll: 0 },
        L: Object.assign({ ground: { oT: 0.2 }, pole: { d: 0.08, t: 0.35, e: 'back' }, wires: { o: 1, oD: 0.4, oT: 0.15 }, rings: { o: 1, oD: 0.52, oT: 0.1 } },
          Object.fromEntries([...Array(10).keys()].map(i => [`m${i}`, { d: 0.05 + i * 0.03, t: 0.3, e: 'back' }])), glowsOn),
        drift: { z: 18, dur: 26000 },
        U: { h1: { d: 600, from: { x: -40 } }, stampP: { d: 900, from: { y: -16, r: -8 } }, ill: { d: 4300 }, o1: { d: 4600, from: { y: 16 } }, w1: { d: 4900, from: { y: 16 } }, m1: { d: 5200, from: { y: 16 } }, g1: { d: 5500, from: { y: 10 } }, r1: { d: 5000, from: { y: 20 } } } },
      { dur: 4400, cam: camAtScreen(480, -380),
        L: Object.assign({ wires: { o: 1 }, rings: { o: 0 } }, Object.fromEntries([...Array(10).keys()].filter(i => i !== 3 && i !== 8).map(i => [`g${i}`, { o: 1 }])),
          { upd: Object.assign(at(MS, 1080, 640, 1.3, 900), { o: 1, d: 0.25, t: 0.5, e: 'io', via: at(MS, 480, 60, 1, 860), spin: 10, oD: 0.22, oT: 0.1 }) }),
        drift: { z: 16, dur: 26000 },
        U: { h2: { d: 400, from: { x: -40 } }, stampP: {}, o2: { d: 3200, from: { y: 16 } }, w2: { d: 3450, from: { y: 16 } }, m2: { d: 3700, from: { y: 16 } }, r2: { d: 3300, from: { y: 20 } } } }
    ]
  }));
  S[18].L = { upd: Object.assign(at(MS, -100, 420, 0.6, 900), { o: 0 }) };
  S.push(Object.assign({}, C.s20, {
    id: 's20', world: 'mini', thumb: 'o_owner',
    cues: ['The camera tracks to a case-owner desk: one complaint travels from the household to a named owner, a substantive response travels back, and the customer confirms resolution. Labelled a proposed process.',
      'ADVANCE → the camera reaches the hearing table: a prepared response, a written commitment and a later review are threaded together.'],
    L: Object.assign({ wires: { o: 1 } }, Object.fromEntries([...Array(10).keys()].filter(i => i !== 3 && i !== 8).map(i => [`g${i}`, { o: 1 }])), { upd: Object.assign(at(MS, 1080, 640, 1.3, 900), { o: 0 }) }),
    ui: `
      ${head('h3', '03', 'Give recurring complaints an owner')}
      ${chip('o3', 'Owner', 'The complaint function — one named owner per recurring case', 96, 640, 560)}
      ${chip('w3', 'Proposed deadline', 'Within 60 days; publish aggregate resolution measures', 96, 742, 560)}
      ${chip('m3', 'Success measure', 'Repeat complaints, time to a substantive response, customer-confirmed resolution — not closure counts', 720, 640, 680)}
      <p data-u="e3" class="abs guard" style="left:720px;top:790px;width:680px">Employees can raise recurring fairness concerns safely, without retaliation.</p>
      <div data-u="pp" class="abs cite" style="left:1240px;top:140px;width:600px;color:#2c5a56;text-align:right">PROPOSED PROCESS — not an existing, verified practice.</div>
      ${head('h4', '04', 'Prepared, authorised engagement — and documented follow-up')}
      ${chip('o4', 'Owner', 'KE leadership, with the committee', 96, 640, 560)}
      ${chip('w4', 'Proposed deadline', 'Agreed before the next hearing; reviewed over the following quarter', 96, 742, 560)}
      ${chip('m4', 'Success measure', 'Documented commitments and service outcomes — not attendance alone', 720, 640, 680)}
      <p data-u="e4" class="abs guard" style="left:720px;top:770px;width:680px">The committee tests the answers and documents follow-up; reasons for any substitution are explained.</p>
      <div data-u="stampP" class="abs stampP">Proposed — not implemented</div>
      ${rail('r3', [2])}${rail('r4', [4, 5])}`,
    states: [
      { dur: 5200, cam: camAtScreen(1715, -420),
        L: { cmp: Object.assign(at(MS, 2350, 700, 1.3, 900), { o: 1, d: 0.12, t: 0.32, e: 'io', via: at(MS, 1715, 260, 1, 860), spin: -8, oD: 0.1, oT: 0.08 }),
          rsp: Object.assign(at(MS, 1080, 640, 1.3, 899), { o: 1, d: 0.5, t: 0.3, e: 'io', via: at(MS, 1715, 220, 1, 860), spin: 8, oD: 0.48, oT: 0.08 }),
          ok: { o: 1, d: 0.82, t: 0.15, e: 'back', oD: 0.82, oT: 0.08 } },
        drift: { z: 14, dur: 26000 },
        U: { h3: { d: 400, from: { x: -40 } }, stampP: { d: 600 }, pp: { d: 1200 }, o3: { d: 4200, from: { y: 16 } }, w3: { d: 4450, from: { y: 16 } }, m3: { d: 4700, from: { y: 16 } }, e3: { d: 4950 }, r3: { d: 4300, from: { y: 20 } } } },
      { dur: 4600, cam: camAtScreen(3780, -420),
        L: { cmp: { o: 0 }, rsp: { o: 0 }, ok: { o: 0 },
          fold: { o: 1, d: 0.25, t: 0.4, e: 'out', via: { y: at(MS, 3360, 200, 1, 900).y }, spin: -10, oD: 0.25, oT: 0.1 },
          commit: { o: 1, d: 0.42, t: 0.4, e: 'out', via: { y: at(MS, 3820, 160, 1, 895).y }, spin: 10, oD: 0.42, oT: 0.1 },
          thread: { o: 1, oD: 0.75, oT: 0.2 } },
        drift: { z: 14, dur: 26000 },
        U: { h4: { d: 400, from: { x: -40 } }, stampP: {}, o4: { d: 3400, from: { y: 16 } }, w4: { d: 3650, from: { y: 16 } }, m4: { d: 3900, from: { y: 16 } }, e4: { d: 4150 }, r4: { d: 3500, from: { y: 20 } } } }
    ]
  }));
  S[19].L.cmp = Object.assign(at(MS, 1080, 700, 0.6, 900), { o: 0 });
  S[19].L.rsp = Object.assign(at(MS, 2350, 640, 0.6, 899), { o: 0 });
  S[19].L.fold = Object.assign(at(MS, 3360, 1500, 1.3, 900), { o: 0 });
  S[19].L.commit = Object.assign(at(MS, 3820, 1500, 1.3, 895), { o: 0 });
  S[19].states[1].L.fold = Object.assign(at(MS, 3360, 560, 1.3, 900), S[19].states[1].L.fold);
  S[19].states[1].L.commit = Object.assign(at(MS, 3820, 560, 1.3, 895), S[19].states[1].L.commit);

  /* ---------------------------------------------------------------- 21 */
  S[19].exit = { cam: { x: at(MS, 3780, 540, 1, 1000).x, y: -1800, z: -900 }, frac: 0.7, Ldef: { e: 'in', oT: 0.5 } };
  S.push(Object.assign({}, C.s21, {
    id: 's21', world: 'dusk', thumb: 'u_sky',
    cues: ['Dusk over the city; the camera rises slowly past the wires: the limitations.', 'ADVANCE → the camera lifts again as the balanced conclusion settles.'],
    enter: { cam: { x: -200, y: 700, z: -500, roll: 2 }, L: { sky: { o: 1 }, far: { o: 1 }, mid: { o: 1 }, poles: { o: 1, y: 900 } } },
    ui: `
      <div data-u="k" class="abs kicker" style="left:96px;top:90px">Research limitations</div>
      <h1 data-u="h" class="abs h1 shadow-t" style="left:96px;top:130px;width:1500px">Four interviews cannot represent all of Karachi.</h1>
      <ul data-u="l" class="abs rule-list" style="left:96px;top:400px;width:1400px">
        <li><span class="k">They cannot</span>establish the cause of every outage, or quantify the city’s economic losses. The sample was access-based, and interviewer framing may have shaped some answers.</li>
        <li><span class="k">They can</span>show how the policy is experienced — and where the company’s explanation leaves an ethical question unanswered.</li>
      </ul>
      <p data-u="b" class="abs body shadow-t" style="left:96px;top:110px;width:1728px;color:#e3dccb">We began with a household that had paid its bill. We then heard why the company struggles to recover what it is owed. <b>A fair response has to take both seriously.</b></p>
      <div data-u="ck" class="abs kicker" style="left:96px;top:330px">Our conclusion</div>
      <p data-u="c1" class="abs h1 shadow-t" style="left:96px;top:380px;width:1728px;font-size:84px">Financial sustainability should guide the design of the remedy.</p>
      <p data-u="c2" class="abs h1 it amber shadow-t" style="left:96px;top:590px;width:1728px;font-size:84px">It cannot, on its own, settle whether the burden has been distributed fairly.</p>`,
    states: [
      { dur: 4400, cam: { x: 0, y: 0, z: 0, roll: 0 },
        L: { poles: { d: 0.15, t: 0.5, e: 'out' }, dim: { o: 0.42 } },
        drift: { y: -60, z: 20, dur: 26000 },
        U: { k: { d: 2600 }, h: { d: 2900, from: { y: 24 } }, l: { d: 3500, from: { y: 20 } } } },
      { dur: 3200, cam: { x: 60, y: -260, z: 60, roll: 0 },
        L: { dim: { o: 0.55 } },
        drift: { y: -40, dur: 26000 },
        U: { b: { d: 600, from: { y: 16 } }, ck: { d: 1200 }, c1: { d: 1500, from: { y: 24 } }, c2: { d: 2400, from: { y: 24 } } } }
    ]
  }));

  /* ---------------------------------------------------------------- 22 */
  S[20].exit = { cam: { x: 60, y: -900, z: 200 }, frac: 0.75, Ldef: { e: 'in', oT: 0.5 } };
  S.push(Object.assign({}, C.s22, {
    id: 's22', world: 'home', thumb: 'bill',
    cues: ['The camera returns from the street through the window to the paid bill on the dark table. The lights are not shown restored. The closing question holds in silence. (Further advances do nothing; press E for the evidence section.)'],
    L: Object.assign({}, lightsOff, { wash: { o: 0.45 } }),
    enter: { cam: Object.assign({}, H.STREET_CAM, { z: H.STREET_CAM.z - 1500 }) },
    ui: `
      <div data-u="scrim" class="scrim r" style="width:66%"></div>
      <p data-u="q" class="abs h1 it" style="left:900px;top:250px;width:920px;font-size:88px;line-height:1.08">Does paying the bill lead to fairer service<span class="amber"> — and an answer they can trust?</span></p>
      ${illus('il', 'Illustrative household', 'right:28px;top:24px')}`,
    states: [
      { dur: 6000, cam: { x: -20, y: 120, z: 40, roll: -1.2 }, spec: { camEnd: { e: 'io', logz: 1000 } },
        drift: { z: 10, dur: 40000 },
        U: { scrim: { d: 4400, t: 1000, from: { x: 60 } }, q: { d: 4900, t: 1400, from: { y: 24 } }, il: { d: 4800 } } }
    ]
  }));
})();
