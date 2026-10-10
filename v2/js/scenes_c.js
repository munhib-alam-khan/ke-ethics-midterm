/* Scenes 11–14: the three theories, examined with the same household objects. */
(function () {
  const S = window.SCENES, H = window.WORLD_HELP, C = window.CONTENT, at = H.at;
  const EC = H.EVAL_CAM, OB = H.EVAL_OBJ;
  const COMPANY = ['pole', 'meters', 'reel', 'toolbox', 'ledger'];
  const HOUSE = ['battery', 'laptop', 'stove', 'bucket', 'clock', 'ebill'];
  const LEFT_CAM = { x: at(EC, 560, 620, 1, 1000).x, y: at(EC, 560, 600, 1, 1000).y, z: 420, roll: -1.5 };
  const RIGHT_CAM = { x: at(EC, 1430, 620, 1, 1000).x, y: at(EC, 1430, 600, 1, 1000).y, z: 420, roll: 1.5 };
  const WIDE = { x: 0, y: 30, z: -40, roll: 0 };

  S[9].exit = { cam: { x: 0, y: 0, z: 500 }, frac: 0.6, Ldef: { e: 'in', oT: 0.5 } };

  /* ---------------------------------------------------------------- 11 */
  const enterU = { table: { o: 1 }, book: { o: 1, y: 1600, r: 6 } };
  COMPANY.forEach((k, i) => { enterU[k] = { x: -2600 - i * 200, y: -300 + i * 180, r: -40 + i * 12, o: 1 }; });
  HOUSE.forEach((k, i) => { enterU[k] = { x: 2600 + i * 200, y: -400 + i * 160, r: 40 - i * 10, o: 1 }; });
  const tim = {};
  COMPANY.forEach((k, i) => { tim[k] = { d: 0.06 + i * 0.05, t: 0.3, e: 'out', via: { y: OB[k].y - 500 }, spin: (i % 2 ? 20 : -20) }; });
  HOUSE.forEach((k, i) => { tim[k] = { d: 0.42 + i * 0.045, t: 0.3, e: 'out', via: { y: OB[k].y - 500 }, spin: (i % 2 ? -18 : 18) }; });
  S.push(Object.assign({}, C.s11, {
    id: 's11', world: 'eval', thumb: 'e_book',
    cues: ['An open evaluation book: the camera frames the company page while recovery, maintenance and supply objects land on it, tracks to the household page as backup power, work, cooking, water and time arrive, then pulls back to show both pages of one evaluation. Nothing is weighed.',
      'ADVANCE → three alternatives slide into the gutter between the pages; the conclusion settles below.'],
    L: { labL: {}, labR: {} },
    enterDelta: enterU,
    enter: { cam: Object.assign({}, LEFT_CAM, { z: 200, x: LEFT_CAM.x - 300 }) },
    ui: `
      <div data-u="title" class="abs mega" style="left:0;top:24px;width:1920px;text-align:center;font-size:132px;color:#2a2622">Utilitarianism</div>
      <p data-u="q" class="abs body" style="left:96px;top:170px;width:1728px;text-align:center;font-size:38px;color:#2a2622">Which response produces the best overall consequences — <b style="color:#a3311f">for everyone affected?</b></p>
      <p data-u="nw" class="abs cite" style="left:96px;top:1010px;width:1728px;text-align:center;color:#3a342c">Both pages belong to one evaluation. Nothing here is weighed: no reliable figures exist to quantify these consequences, and we do not invent them.</p>
      <div data-u="band" class="abs" style="left:0;top:760px;width:1920px;height:320px;background:linear-gradient(to top, rgba(24,20,16,.95) 62%, rgba(24,20,16,0))"></div>
      <div data-u="concl" class="abs" style="left:96px;top:840px;width:1728px">
        <p class="h3">A recovery figure cannot, by itself, show that the overall outcome is good.</p>
        <p class="body sm" style="margin-top:10px">Compare collective outages with targeted enforcement, better metering and network improvements — using actual costs and service outcomes.</p>
        <p class="cite" style="margin-top:6px">Theory: Sinnott-Armstrong (2023), Consequentialism, <i>Stanford Encyclopedia of Philosophy</i></p>
      </div>`,
    states: [
      { dur: 5600, cam: Object.assign({}, WIDE),
        spec: { cam: [{ t: 0.3, x: LEFT_CAM.x, y: LEFT_CAM.y, z: LEFT_CAM.z, roll: LEFT_CAM.roll, e: 'out' }, { t: 0.62, x: RIGHT_CAM.x, y: RIGHT_CAM.y, z: RIGHT_CAM.z, roll: RIGHT_CAM.roll, e: 'io' }], camEnd: { e: 'io' } },
        L: Object.assign({ table: { oT: 0.2 }, book: { d: 0, t: 0.28, e: 'out' } }, tim),
        drift: { z: 24, dur: 26000 },
        U: { title: { d: 4600, from: { y: -30 } }, q: { d: 5000, from: { y: 14 } }, nw: { d: 5400, from: { y: 10 } } } },
      { dur: 3000, cam: { x: 0, y: 140, z: -90, roll: 0 },
        L: { alt1: { o: 1, d: 0.1, t: 0.45, e: 'back', via: { x: -900, y: -300 } }, alt2: { o: 1, d: 0.2, t: 0.45, e: 'back', via: { x: 900, y: -200 } }, alt3: { o: 1, d: 0.3, t: 0.45, e: 'back', via: { x: 0, y: 900 } } },
        drift: { z: 16, dur: 26000 },
        U: { title: {}, band: { d: 1300, t: 700, from: { y: 60 } }, concl: { d: 1600, from: { y: 24 } } } }
    ]
  }));
  // alternatives start out of frame
  S[10].L = Object.assign(S[10].L, { alt1: { x: at(EC, -500, 470, 1, 940).x }, alt2: { x: at(EC, 2400, 640, 1, 939).x }, alt3: { y: at(EC, 960, 1600, 1, 938).y } });
  S[10].states[1].L.alt1 = Object.assign({ x: at(EC, 960, 470, 1, 940).x }, S[10].states[1].L.alt1);
  S[10].states[1].L.alt2 = Object.assign({ x: at(EC, 960, 640, 1, 939).x }, S[10].states[1].L.alt2);
  S[10].states[1].L.alt3 = Object.assign({ y: at(EC, 960, 810, 1, 938).y }, S[10].states[1].L.alt3);

  /* ---------------------------------------------------------------- 12 (home world: the paid bill returns to its household) */
  const D = H.D;
  const lightsOff = { wallLit: { o: 0 }, kitchenLit: { o: 0 }, lampLit: { o: 0 }, lampGlow: { o: 0 }, tableLit: { o: 0 }, boxLit: { o: 0 }, leds: { o: 0 } };
  S[10].exit = { cam: { x: 600, y: 300, z: 800 }, frac: 0.75, L: { ebill: Object.assign({}, OB.ebill, { z: 120, x: 300, y: 200, r: -20, o: 1 }) }, Ldef: { e: 'in', oD: 0.3, oT: 0.5 } };
  S.push(Object.assign({}, C.s12, {
    id: 's12', world: 'home', thumb: 'house_ours',
    cues: ['The paid bill sweeps out of the evaluation book and lands back on the table of its own household, in the dark.',
      'ADVANCE → the camera pulls back through the window: one paying house is outlined inside one feeder; the whole row goes dark together.'],
    L: Object.assign({}, lightsOff, { wash: { o: 0.4 } }),
    enter: { cam: { x: -20, y: 120, z: 40, roll: -1 }, L: { bill: Object.assign({}, D(620, 905, 0.42, 400), { x: 700, y: -600, z: 60, r: -40, o: 1 }), wallDark: { o: 1 }, tableDark: { o: 1 } }, keep: true },
    ui: `
      <div data-u="scrimR" class="scrim r" style="width:58%"></div>
      <div data-u="title" class="abs mega" style="left:1010px;top:110px;font-size:166px">Deontology</div>
      <h2 data-u="q" class="abs h2" style="left:1010px;top:300px;width:820px">What does a paying customer have a right to expect?</h2>
      <p data-u="b" class="abs body sm" style="left:1010px;top:560px;width:800px">If I have paid for my service, what justifies making my access depend on someone else’s conduct?</p>
      <div data-u="scrimT" class="scrim t" style="height:56%"></div>
      <h2 data-u="h" class="abs h2 shadow-t" style="left:96px;top:56px;width:1728px">A feeder is a convenient operational unit — <span class="amber">not a unit of individual responsibility.</span></h2>
      <p data-u="b2" class="abs body sm shadow-t" style="left:96px;top:240px;width:1500px">Using compliant households’ deprivation as leverage against others’ default risks treating them as instruments. Targeting identified theft or default better respects individual responsibility — if procedures are lawful and reliable.</p>
      <p data-u="c2" class="abs cite" style="left:96px;top:390px">An ethical argument (Alexander &amp; Moore, 2024). We claim no legal right beyond what NEPRA’s direction establishes.</p>
      <div data-u="paid" class="htag anch">Paid</div>`,
    states: [
      { dur: 3400, cam: { x: -20, y: 120, z: 40, roll: -1.2 },
        L: { bill: Object.assign({}, D(620, 905, 0.42, 400), { r: -7, d: 0, t: 0.6, e: 'out', via: { x: 200, y: -300, z: 140 }, spin: 25 }) },
        drift: { z: 16, dur: 26000 },
        U: { scrimR: { d: 900, t: 800, from: { x: 60 } }, title: { d: 1300, from: { y: 26 } }, q: { d: 1900, from: { y: 16 } }, b: { d: 2600, from: { y: 12 } } } },
      { dur: 5400, cam: Object.assign({}, H.STREET_CAM, { y: H.STREET_CAM.y - 200 }),
        spec: { cam: [{ t: 0.15, x: -40, y: 0, z: 160, e: 'io' }], camEnd: { e: 'io', logz: 1000 } },
        L: { hl: { o: 1, oD: 0.7, oT: 0.2 }, bracket: { o: 1, oD: 0.78, oT: 0.2 }, wash: { o: 0, oD: 0.3, oT: 0.3 } },
        drift: { z: -300, dur: 26000 },
        U: { scrimT: { d: 3600, t: 900, from: { y: -20 } }, h: { d: 4000, from: { y: -20 } }, b2: { d: 4600, from: { y: 12 } }, c2: { d: 5000 },
          paid: { d: 4400, from: { y: -40 }, e: 'back', anchor: { k: 'house_2', lx: 0, ly: -(4700 * 0.75) / 2 + 300, ax: 0, ay: -80 } } } }
    ]
  }));

  /* ---------------------------------------------------------------- 13 (correspondence: statement -> unresolved issue -> proposed commitment) */
  const CC = H.CORR_CAM;
  const d1 = at(CC, 2600, 420, 0.62, 1000), d3 = at(CC, 4000, 420, 0.62, 1000);
  const D_CAM = n => ({ x: [d1.x, at(CC, 3300, 520, 1, 1000).x, d3.x][n], y: 0, z: 380, roll: [-2, 1.5, -1][n] });
  const OVER = { x: at(CC, 3300, 520, 1, 1000).x, y: 40, z: -300, roll: 0 };
  S[11].exit = { cam: Object.assign({}, H.STREET_CAM, { y: H.STREET_CAM.y - 3000, z: H.STREET_CAM.z + 2000 }), frac: 0.7, Ldef: { e: 'in', oT: 0.5 } };
  C.s13a = { script: [C.s13.script[0].split('\nAnd this standard also applies to the committee.')[0], 'And this standard also applies to the committee.' + C.s13.script[0].split('\nAnd this standard also applies to the committee.')[1]] };
  S.push(Object.assign({}, C.s13, {
    id: 's13', world: 'corr', thumb: 'c_note', script: C.s13a.script,
    cues: ['The camera travels along the desk through three documents — an honest public statement, a complaint record still open, a proposed commitment — and pulls back so each behaviour sits under its virtue.',
      'ADVANCE → the camera moves on to the hearing table: the same standard applies to the committee.'],
    L: { l1: { o: 0 }, l2: { o: 0 }, e1: { o: 0.6 }, e2: { o: 0.6 }, mic: { o: 0 } },
    enter: { cam: Object.assign({}, D_CAM(0), { x: D_CAM(0).x - 900, z: 0 }), L: { desk: { o: 1 } } },
    enterDelta: { d1: { y: -1300, r: -20, o: 1 }, d2: { y: 1400, r: 18, o: 1 }, d3: { y: -1300, r: 14, o: 1 } },
    ui: `
      <div data-u="title" class="abs mega" style="left:96px;top:40px;font-size:140px">Virtue ethics</div>
      <p data-u="q" class="abs body" style="left:96px;top:200px;width:1500px">What do honesty, responsibility and practical judgement look like <b>in behaviour?</b></p>
      <div data-u="v1" class="abs vlab" style="left:170px;top:800px"><b>Honesty</b>Acknowledges hardship; separates the known from the uncertain.</div>
      <div data-u="v2" class="abs vlab" style="left:710px;top:800px"><b>Responsibility</b>Follows a complaint through to a meaningful response.</div>
      <div data-u="v3" class="abs vlab" style="left:1250px;top:800px"><b>Practical judgement</b>Weighs hardship and technical reality; promises only what it can support.</div>
      <p data-u="ill" class="abs cite" style="left:96px;top:1010px;width:1728px;text-align:center">The three documents are illustrative examples of behaviour, not KE records.</p>
      <div data-u="scrimL" class="scrim l" style="width:70%"></div>
      <div data-u="k2" class="abs kicker teal" style="left:96px;top:250px">The standard applies to the committee too</div>
      <p data-u="c1" class="abs body" style="left:96px;top:310px;width:1080px">Public scrutiny needs difficult questions — and a fair opportunity to respond. Imad and Employee 1 both believed the delegates should have been allowed to answer.</p>
      <p data-u="c2" class="abs body" style="left:96px;top:560px;width:1080px;color:var(--amber)">Expelling representatives may communicate anger. Anger alone does not produce an explanation or restore electricity.</p>
      <p data-u="cite" class="abs cite" style="left:96px;bottom:36px">Theory: Hursthouse &amp; Pettigrove (2026), Virtue ethics, <i>Stanford Encyclopedia of Philosophy</i></p>`,
    states: [
      { dur: 6400, cam: Object.assign({}, OVER),
        spec: { cam: [{ t: 0.22, ...D_CAM(0), e: 'out' }, { t: 0.45, ...D_CAM(1), e: 'io' }, { t: 0.68, ...D_CAM(2), e: 'io' }], camEnd: { e: 'io' } },
        L: { d1: { o: 1, d: 0.02, t: 0.22, e: 'out' }, d2: { o: 1, d: 0.25, t: 0.22, e: 'out' }, d3: { o: 1, d: 0.48, t: 0.22, e: 'out' } },
        drift: { z: 18, dur: 26000 },
        U: { title: { d: 5200, from: { y: -24 } }, q: { d: 5500, from: { y: 12 } }, v1: { d: 5700, from: { y: 20 } }, v2: { d: 5850, from: { y: 20 } }, v3: { d: 6000, from: { y: 20 } }, ill: { d: 6100 } } },
      { dur: 3600, cam: { x: at(CC, 4900, 640, 1, 1000).x + 120, y: 120, z: 260, roll: 1 },
        L: { d1: { o: 1 }, d2: { o: 1 }, d3: { o: 1 }, plates: { o: 1, d: 0.2, t: 0.5, e: 'out', oD: 0.2, oT: 0.3 } },
        drift: { z: 14, dur: 26000 },
        U: { scrimL: { d: 1200, t: 800, from: { x: -60 } }, title: {}, k2: { d: 1600 }, c1: { d: 1900, from: { y: 16 } }, c2: { d: 2600, from: { y: 16 } }, cite: { d: 3000 } } }
    ]
  }));
  S[12].states[0].L.plates = { o: 0 };

  /* ---------------------------------------------------------------- 14 (compare: layered planes) */
  S[12].exit = { cam: { x: at(CC, 4900, 640, 1, 1000).x, y: 0, z: 800 }, frac: 0.6, Ldef: { e: 'in', oT: 0.5 } };
  S.push(Object.assign({}, C.s14, {
    id: 's14', world: 'eval', thumb: 'e_table',
    cues: ['Three planes slide in at different depths — the paid bill (boundary), the evaluation book (remedy), a letter (implementation) — and the camera eases round them into a frontal, readable stack over the tension line.'],
    L: Object.assign({ book: { o: 0 }, labL: { o: 0 }, labR: { o: 0 } }, ...COMPANY.concat(HOUSE).map(k => ({ [k]: { o: 0 } }))),
    enterDelta: { pD: { x: -2400, r: -12, o: 1 }, pU: { x: 2400, r: 10, o: 1 }, pV: { x: -2400, y: 600, r: -8, o: 1 } },
    enter: { cam: { x: 600, y: -300, z: -300, roll: 5 }, L: { table: { o: 1 } } },
    ui: `
      <div data-u="k" class="abs kicker" style="left:96px;top:52px;color:#7a3a1c">Comparing the theories · how they work together</div>
      <div data-u="bar" class="abs" style="left:96px;top:880px;width:1728px;border-top:4px solid #a3311f;padding-top:18px">
        <p class="h3 ink" style="font-size:46px">Financial sustainability matters — <span style="color:#a3311f">but it cannot automatically override the compliant customer’s claim.</span></p>
        <p class="body sm" style="margin-top:8px;color:#3a342c;font-size:30px">Where they pull apart: consequences may favour a gradual transition; duties limit how long innocent households bear its costs.</p>
      </div>`,
    states: [
      { dur: 4400, cam: { x: 0, y: 0, z: 0, roll: 0 },
        L: { table: { oT: 0.2 }, pD: { o: 1, d: 0.1, t: 0.5, e: 'out' }, pU: { o: 1, d: 0.2, t: 0.5, e: 'out' }, pV: { o: 1, d: 0.3, t: 0.5, e: 'out' } },
        drift: { z: 14, x: 10, dur: 26000 },
        U: { k: { d: 2600 }, bar: { d: 3200, from: { y: 24 } } } }
    ]
  }));
})();
