/* Scenes 5–10: the four interviews and where they meet. */
(function () {
  const S = window.SCENES, H = window.WORLD_HELP, C = window.CONTENT, at = H.at;
  const illus = (u, t, pos) => `<div data-u="${u}" class="illus" style="${pos}">${t}</div>`;
  const OBJ = ['phone', 'clock', 'stove', 'laptop', 'router', 'iron'];
  const HOME = H.IMAD_HOME, STAR = H.IMAD_STAR, IC = H.IMAD_CAM, IR = H.IMAD_ROOM;
  const shift = (p, dx, dy, dz, r) => Object.assign({}, p, { x: p.x + (dx || 0), y: p.y + (dy || 0), z: p.z + (dz || 0) }, r !== undefined ? { r } : {});

  // leaving the press board: the camera pans away to the right
  S[3].exit = { cam: { x: H.PRESS_BOARD.x + 2600, y: H.PRESS_BOARD.y, z: H.PRESS_BOARD.z + 200 }, frac: 0.7, keep: true, Ldef: { e: 'in' } };

  /* ---------------------------------------------------------------- 5 */
  const lift = {};
  OBJ.forEach((k, i) => { lift[k] = Object.assign({}, STAR[k], { d: 0.36 + i * 0.07, t: 0.36, e: 'io', via: { x: (HOME[k].x + STAR[k].x) / 2, y: Math.min(HOME[k].y, STAR[k].y) - 260, z: 760 }, spin: [8, -10, 6, -6, 12, -8][i] }); });
  const dropped = {};
  OBJ.forEach((k, i) => { dropped[k] = Object.assign(shift(STAR[k], [-30, 20, -10, 30, -20, 10][i], 50, 70, STAR[k].r + [-8, 6, -4, 5, -9, 7][i]), { d: 0.08 + i * 0.04, t: 0.45, e: 'out' }); });
  const enterL = { bgDark: { x: 2900 }, bgLit: { x: 2900, o: 1 }, desk: { x: 3400, o: 1 }, counter: { x: 3600, o: 1 } };
  OBJ.forEach((k, i) => { enterL[k] = Object.assign({}, HOME[k], { x: HOME[k].x + 3500 + i * 120, y: HOME[k].y - 200 + i * 60, o: 1 }); });
  const tagA = (k, lx, ly, ax, ay, d) => ({ d, from: { x: -16 }, anchor: { k, lx, ly, ax, ay } });
  S.push(Object.assign({}, C.s05, {
    id: 's05', world: 'imad', thumb: 'im_bg_lit',
    cues: ['The household slides in from the right with depth; the camera settles, then the phone, clock, stove, laptop, router and iron lift out of the room on curved paths and gather in the foreground, each labelled with what the outage interrupts.',
      'ADVANCE → the plug is pulled: the cables die, every object drops back and dims; the two service responses arrive as paper slips.'],
    L: Object.assign({ bgDark: {}, bgLit: {} }, Object.fromEntries(OBJ.map(k => [k, Object.assign({}, HOME[k])]))),
    enter: { cam: { x: IR.x - 300, y: IR.y + 40, z: IR.z - 120, roll: -2 }, L: enterL },
    ui: `
      <div data-u="kick" class="abs kicker" style="left:96px;top:56px;color:#ffe2a8;text-shadow:0 2px 10px rgba(0,0,0,.6)">Imad · residential customer · Gulistan-e-Jauhar · interview, October 3, 2026</div>
      <div data-u="tPhone" class="tag anch" style="width:340px;white-space:normal">Overnight outages not announced on the app he checked</div>
      <div data-u="tClock" class="tag anch">Overnight</div>
      <div data-u="tStove" class="tag anch">Electric cooking</div>
      <div data-u="tLaptop" class="tag anch">His brother’s remote work</div>
      <div data-u="tRouter" class="tag anch">Internet</div>
      <div data-u="tIron" class="tag anch">Ironing · household routines</div>
      <p data-u="paid" class="abs body" style="left:96px;top:980px;font-size:34px;background:rgba(20,16,24,.82);padding:10px 22px"><b>Reported:</b> he generally pays on time.</p>
      <div data-u="s1" class="slip" style="left:1060px;top:120px;width:560px;font-family:var(--serif);font-style:italic;font-size:42px">Work is underway.</div>
      <div data-u="s2" class="slip" style="left:1250px;top:250px;width:620px;font-family:var(--serif);font-style:italic;font-size:42px">Your complaint has been forwarded.</div>
      <div data-u="s0" class="abs cite" style="left:1080px;top:84px;color:#fff;text-shadow:0 2px 8px #000">CUSTOMER-SERVICE RESPONSES, AS HE DESCRIBED THEM</div>
      <div data-u="plan" class="abs" style="left:96px;top:950px;width:1720px;background:rgba(20,16,24,.9);padding:18px 30px"><p class="body" style="font-size:36px">They may acknowledge a complaint. <span class="amber">They do very little to help a household plan its evening.</span></p></div>
      ${illus('il', 'Illustrative objects', 'right:28px;top:24px')}`,
    states: [
      { dur: 5400, cam: Object.assign({}, IC), spec: { cam: [{ t: 0.33, x: IR.x, y: IR.y, z: IR.z, roll: 0, e: 'out' }], camEnd: { e: 'io' } },
        L: Object.assign({
          bgDark: { d: 0, t: 0.32, e: 'out' }, bgLit: { o: 0.55, d: 0, t: 0.32, e: 'out', oD: 0.45, oT: 0.3 },
          desk: { d: 0.03, t: 0.32, e: 'out' }, counter: { d: 0.05, t: 0.32, e: 'out' },
          type: { o: 1, d: 0.42, t: 0.3, oD: 0.42, oT: 0.25, e: 'out' },
          plug: { o: 1, oD: 0.7, oT: 0.15 }, cables: { o: 1, oD: 0.74, oT: 0.12 }
        }, lift),
        drift: { z: 30, x: 10, dur: 24000 },
        U: { kick: { d: 3800, from: { y: -14 } },
          tPhone: tagA('phone', 0, 440, -150, 40, 4300), tClock: tagA('clock', 0, 300, 20, 30, 4400), tStove: tagA('stove', 0, 300, -110, 30, 4500),
          tLaptop: tagA('laptop', -100, 320, -40, 20, 4600), tRouter: tagA('router', 0, 200, -40, 30, 4700), tIron: tagA('iron', 0, 230, -120, 30, 4800),
          paid: { d: 5000, from: { y: 16 } }, il: { d: 4000 } } },
      { dur: 3200, cam: { x: IC.x, y: IC.y, z: IC.z + 50, roll: -1 },
        L: Object.assign({
          bgLit: { o: 0, oD: 0.18, oT: 0.4 }, dim: { o: 0.3, oD: 0.2, oT: 0.4 }, type: { o: 0.55 },
          plug: Object.assign(shift(at(IC, 1210, 990, 0.42, 560), 260, 70, 0, 38), { o: 1, d: 0, t: 0.32, e: 'out', spin: 25 }),
          cables: { o: 0, oD: 0.1, oT: 0.15 }
        }, dropped),
        drift: { z: 20, dur: 24000 },
        U: { kick: {}, tPhone: tagA('phone', 0, 440, -150, 40, 0), tClock: tagA('clock', 0, 300, 20, 30, 0), tStove: tagA('stove', 0, 300, -110, 30, 0),
          tLaptop: tagA('laptop', -100, 320, -40, 20, 0), tRouter: tagA('router', 0, 200, -40, 30, 0), tIron: tagA('iron', 0, 230, -120, 30, 0),
          s0: { d: 900, from: { y: -10 } }, s1: { d: 1000, from: { x: 300, y: -160, r: 14 }, via: { x: 120, y: -220 }, e: 'back' }, s2: { d: 1500, from: { x: 360, y: -60, r: -12 }, via: { x: 200, y: -180 }, e: 'back' },
          plan: { d: 2300, from: { y: 20 } }, il: {} } }
    ]
  }));

  /* ---------------------------------------------------------------- 6 */
  const fade = {};
  OBJ.forEach((k, i) => { fade[k] = Object.assign(shift(STAR[k], (STAR[k].x - IC.x) * 0.4, 260, -40, STAR[k].r), { o: 0, d: i * 0.04, t: 0.6, e: 'in', oD: 0.1 + i * 0.04, oT: 0.4 }); });
  S.push(Object.assign({}, C.s06, {
    id: 's06', world: 'imad', thumb: 'im_bg_dark',
    cues: ['The objects sink away and the camera drifts to the night window; motion quietens to give the quotation clear space. Translation and attribution follow, then the analytical finding.'],
    L: Object.assign({ bgLit: { o: 0 }, dim: { o: 0.55 }, type: { o: 0 }, plug: { o: 0 }, cables: { o: 0 } }, fade),
    ui: `
      <div data-u="scrim" class="scrim l" style="width:78%"></div>
      <div data-u="q" class="abs" style="left:120px;top:150px;width:1500px"><p class="quote shadow-t"><span class="mark">“</span>Agar sirf yeh humse sach hi bol le.<span class="mark">”</span></p></div>
      <p data-u="tr" class="abs trans shadow-t" style="left:120px;top:400px">If they would simply tell us the truth.</p>
      <p data-u="at" class="abs cite" style="left:120px;top:478px;font-size:24px">Imad, interview, October 3, 2026 · Roman Urdu; English translation by the research team</p>
      <div data-u="find" class="abs" style="left:120px;top:660px;width:1320px;border-top:3px solid var(--amber);padding-top:24px">
        <div class="kicker">Analytical finding</div>
        <p class="h3" style="margin-top:8px">Candour is part of the service.</p>
        <p class="body sm" style="margin-top:12px;color:#e9e2d2">He was not asking for uninterrupted electricity — he was asking for information he could trust: what is happening, what is uncertain, and when the next update will come.</p>
      </div>`,
    states: [
      { dur: 3800, cam: { x: 520, y: -300, z: 470, roll: 0 }, L: { bgLit: { oT: 0.3 }, dim: { oT: 0.5 } },
        drift: { z: 12, dur: 30000 },
        U: { scrim: { d: 400, t: 900, from: { x: -80 } }, q: { d: 900, t: 1100, from: { y: 26 } }, tr: { d: 1900, from: { y: 14 } }, at: { d: 2200, from: { y: 10 } }, find: { d: 3200, from: { y: 24 } } } }
    ]
  }));

  /* ---------------------------------------------------------------- 7 */
  S[5].exit = { cam: { x: 600, y: -320, z: 960 }, frac: 0.6, Ldef: { e: 'in', oD: 0.35, oT: 0.4 } };
  const GC = H.GUL_CAM;
  S.push(Object.assign({}, C.s07, {
    id: 's07', world: 'gulshan', thumb: 'g_sky',
    cues: ['Through the window into Gulshan: the camera cranes down over hazy rooftops; the tank, pump, UPS, battery and water containers rise into place. The ~12-hour figure lands with its qualification attached.',
      'ADVANCE → the equipment falls away; two households swing in — with backup, without — and the unsupported allegations are set aside as signs of distrust.'],
    enter: { cam: { x: 0, y: -1100, z: -900, roll: 4 },
      L: { sky: { o: 1 }, far: { o: 1 }, mid: { o: 1 }, roof: { o: 1, y: 900 }, tank: { o: 1, y: 1600 }, pump: { o: 1, x: 1900 }, ups: { o: 1, y: 1300 }, battery: { o: 1, y: 1300 }, bucket: { o: 1, y: 1300 }, jerry: { o: 1, y: 1300 } } },
    ui: `
      <div data-u="scrim" class="scrim l" style="width:60%"></div>
      <div data-u="kick" class="abs kicker" style="left:96px;top:70px">Resident 2 · Gulshan · interview, October 5, 2026</div>
      <p data-u="paid" class="abs body sm" style="left:96px;top:116px">Reported paying his bills consistently on time.</p>
      <div data-u="big" class="abs mega" style="left:96px;top:200px;font-size:170px">~12 hours<br><span class="amber">a day</span></div>
      <p data-u="qual" class="abs qual" style="left:96px;top:540px;width:820px">Participant-reported estimate. His account also described periods of about 4, 8, 10 or 12 hours. Not independently verified.</p>
      <div data-u="tUps" class="tag anch">UPS &amp; battery costs</div>
      <div data-u="tPump" class="tag anch">Difficulty pumping water</div>
      <div data-u="tVolt" class="tag anch">Voltage concerns</div>
      <div data-u="dark" class="abs" style="left:0;top:0;width:1920px;height:1080px;background:rgba(14,10,16,.55)"></div>
      <h2 data-u="h" class="abs h2 shadow-t" style="left:96px;top:56px">The same interruption does not fall equally.</h2>
      <p data-u="cA" class="abs body sm shadow-t" style="left:200px;top:860px;width:760px"><b>With backup equipment:</b> an inconvenience.</p>
      <p data-u="cB" class="abs body sm shadow-t" style="left:1060px;top:860px;width:760px"><b>Without it:</b> much greater hardship.</p>
      <div data-u="foot" class="abs" style="left:96px;top:950px;width:1728px;background:rgba(18,12,16,.88);padding:14px 22px">
        <p class="body sm" style="font-size:28px">He asked us to consider households that cannot afford backup — a plausible distributional concern, not a measured finding. <span class="amber">His further allegations (billing, collusion, an extra tax) are unsupported in our evidence; we treat them as signs of distrust, not findings.</span></p>
      </div>
      ${illus('il', 'Illustration', 'right:28px;top:24px')}`,
    states: [
      { dur: 4800, cam: Object.assign({}, GC),
        L: { roof: { d: 0.1, t: 0.5, e: 'out' }, tank: { d: 0.16, t: 0.5, e: 'back' }, pump: { d: 0.26, t: 0.45, e: 'out', via: { x: 1400, y: -400 } },
          ups: { d: 0.38, t: 0.4, e: 'back' }, battery: { d: 0.44, t: 0.4, e: 'back' }, bucket: { d: 0.5, t: 0.4, e: 'back' }, jerry: { d: 0.56, t: 0.38, e: 'back' } },
        drift: { z: 30, x: -20, dur: 26000 },
        U: { scrim: { d: 2400, t: 900, from: { x: -60 } }, kick: { d: 2800 }, paid: { d: 3000 }, big: { d: 3300, from: { y: 30 } }, qual: { d: 3800, from: { x: -20 } },
          tUps: { d: 4200, anchor: { k: 'ups', lx: -60, ly: -330, ax: -40, ay: -10 } }, tPump: { d: 4400, anchor: { k: 'pump', lx: 0, ly: -260, ax: 0, ay: -10 } },
          tVolt: { d: 4600, anchor: { k: 'mid', lx: 300, ly: -330, ax: 0, ay: 0 } }, il: { d: 3000 } } },
      { dur: 3800, cam: { x: 0, y: 40, z: 140, roll: 0 },
        L: { ups: { y: 1500, o: 0, d: 0, t: 0.4, e: 'in' }, battery: { y: 1500, o: 0, d: 0.04, t: 0.4, e: 'in' }, bucket: { y: 1500, o: 0, d: 0.08, t: 0.4, e: 'in' }, jerry: { y: 1500, o: 0, d: 0.1, t: 0.4, e: 'in' },
          pump: { o: 0.3 }, tank: { o: 0.4 }, dim: { o: 0.35 },
          winA: { o: 1, d: 0.25, t: 0.55, e: 'out', via: { x: -1400, y: -500, z: 500 }, spin: -10 }, winB: { o: 1, d: 0.33, t: 0.55, e: 'out', via: { x: 2600, y: -400, z: 500 }, spin: 12 } },
        drift: { z: 20, dur: 26000 },
        U: { dark: { d: 0, t: 900, from: {} }, h: { d: 1300, from: { y: -20 } }, cA: { d: 2400, from: { y: 16 } }, cB: { d: 2600, from: { y: 16 } }, foot: { d: 3100, from: { y: 20 } }, il: {} } }
    ]
  }));
  // windows start off-screen until scene 7, reveal 2
  S[6].L = { winA: { x: at(GC, -700, 540, 0.72, 640).x }, winB: { x: at(GC, 2700, 540, 0.72, 640).x } };
  S[6].states[1].L.winA = Object.assign({ x: at(GC, 540, 540, 0.72, 640).x }, S[6].states[1].L.winA);
  S[6].states[1].L.winB = Object.assign({ x: at(GC, 1380, 540, 0.72, 640).x }, S[6].states[1].L.winB);

  /* ---------------------------------------------------------------- 8 */
  S[6].exit = { cam: { x: 0, y: 40, z: 380 }, frac: 0.7, L: { winA: { x: -2400, z: 300, r: -20, o: 0 }, winB: { x: 2400, z: 300, r: 20, o: 0 } }, Ldef: { e: 'in', oT: 0.5 } };
  const OC = H.OPS_CAM;
  const drop = (k, dy, d) => ({ [k]: { y: -dy, o: 1 } });
  const opsEnter = Object.assign({ ground: { o: 1 } }, ...['bh0', 'bh1', 'bh2', 'bh3', 'bh4', 'board', 't1', 't2', 't3', 'pole', 'kunda', 'ladder', 'meters', 'reel', 'toolbox', 'ledger'].map((k, i) => ({ [k]: { y: -1400 - i * 60, o: 1, r: (i % 2 ? 14 : -12) } })));
  // y must be absolute: computed in app from state pose + delta (below)
  S.push(Object.assign({}, C.s08, {
    id: 's08', world: 'ops', thumb: 'o_board',
    cues: ['A cream-and-teal miniature of the distribution system is set out piece by piece; three tags swing onto the board — scheduled load-shedding, technical fault, maintenance — beside the ledger and an illegal hook.',
      'ADVANCE → the model steps back and dims; his quotation takes clear space.'],
    enterDelta: opsEnter,
    enter: { cam: { x: 0, y: -900, z: -700, roll: -4 } },
    ui: `
      <div data-u="kick" class="abs kicker teal" style="left:96px;top:60px;color:#2c5a56">Employee 1 · Assistant Manager, Distribution · anonymised<br>Personal views — not an official KE statement</div>
      <h2 data-u="h" class="abs h2" style="left:96px;top:150px;width:820px;color:var(--ink)">Not every interruption is the same problem.</h2>
      <div data-u="rev" class="abs" style="left:96px;top:360px;width:640px;background:rgba(247,241,226,.94);padding:22px 28px;box-shadow:0 10px 24px rgba(60,40,20,.25)">
        <p class="body sm ink" style="font-size:30px">Theft and unpaid bills strain a network that needs continuing expenditure. <b style="color:#a3311f">Electricity supplied without recovery is a real sustainability problem.</b></p>
        <p class="body sm ink" style="font-size:28px;margin-top:12px;font-style:italic">That explanation deserves consideration.</p>
      </div>
      <div data-u="q" class="abs" style="left:120px;top:250px;width:1680px"><p class="quote shadow-t" style="font-size:84px"><span class="mark">“</span>Explaining those challenges does not remove the company’s responsibility.<span class="mark">”</span></p></div>
      <p data-u="at" class="abs cite" style="left:120px;top:540px;font-size:24px">Employee 1, interview, October 4, 2026</p>
      <p data-u="both" class="abs body sm" style="left:120px;top:640px;width:1500px;color:var(--teal)">One described the hardship. The other explained the constraints. Both recognised that the paying customer still has a valid claim.</p>
      ${illus('il', 'Illustrative model', 'right:28px;bottom:24px')}`,
    states: [
      { dur: 4800, cam: Object.assign({}, OC),
        L: Object.assign({ ground: { d: 0, t: 0.5, e: 'out', oT: 0.2 } }, ...['bh0', 'bh1', 'bh2', 'bh3', 'bh4', 'board', 'pole', 'kunda', 'ladder', 'meters', 'reel', 'toolbox', 'ledger', 't1', 't2', 't3'].map((k, i) => ({ [k]: { d: 0.12 + i * 0.035, t: k[0] === 't' ? 0.34 : 0.3, e: 'back', spin: k[0] === 't' ? (i % 2 ? 18 : -18) : 0 } }))),
        drift: { z: 26, dur: 26000 },
        U: { kick: { d: 3400 }, h: { d: 3700, from: { y: 22 } }, rev: { d: 4300, from: { y: 20 } }, il: { d: 3600 } } },
      { dur: 3000, cam: { x: 0, y: -60, z: -280, roll: 0 },
        L: { dim: { o: 0.78, oT: 0.5 } },
        drift: { z: -10, dur: 30000 },
        U: { q: { d: 900, from: { y: 26 } }, at: { d: 1600 }, both: { d: 2200, from: { y: 16 } }, il: {} } }
    ]
  }));

  /* ---------------------------------------------------------------- 9 */
  S[7].exit = { cam: { x: at(OC, 1460, 900, 1, 900).x, y: at(OC, 1460, 900, 1, 900).y, z: 760 }, frac: 0.7, Ldef: { e: 'in', oD: 0.3, oT: 0.4 } };
  const CC = H.CORR_CAM;
  S.push(Object.assign({}, C.s09, {
    id: 's09', world: 'corr', thumb: 'c_desk',
    cues: ['Letters and envelopes slide across a teal desk from different directions as the camera tracks; the hearing microphone stands among unanswered correspondence (no faces).',
      'ADVANCE → her quotation; then four slips peg onto a line in order: explanation → authority → commitment → follow-through.'],
    enterDelta: { l1: { x: -2600, y: -400, r: -30, o: 1 }, l2: { x: 2400, y: -900, r: 40, o: 1 }, e1: { x: -1800, y: 1200, r: 30, o: 1 }, e2: { x: 2600, y: 900, r: -30, o: 1 }, mic: { y: 1400, o: 1 } },
    enter: { cam: { x: -700, y: 80, z: -260, roll: -3 }, L: { desk: { o: 1 } } },
    ui: `
      <div data-u="scrim" class="scrim l" style="width:66%"></div>
      <div data-u="kick" class="abs kicker teal" style="left:96px;top:60px;width:1300px">Employee 2 · people, culture &amp; communication · mid-level, 13 years · anonymised<br>Personal views — not an official company statement</div>
      <h2 data-u="h" class="abs h2" style="left:96px;top:220px;width:1060px">She did not know why the CEO missed the hearing — and refused to speculate.</h2>
      <p data-u="b1" class="abs body" style="left:96px;top:470px;width:1000px">That restraint matters: <b>we cannot turn an unknown motive into a proven ethical lapse.</b></p>
      <p data-u="b2" class="abs body sm" style="left:96px;top:640px;width:1000px;color:#e3dccb">Delegation can be reasonable — depending on what the summons required, and whether representatives arrived prepared and authorised.</p>
      <div data-u="q" class="abs" style="left:96px;top:200px;width:1700px"><p class="quote shadow-t" style="font-size:70px"><span class="mark">“</span>Jo masle hal nahi huwe, inhe manna bhi jawabdehi ka hissa hai.<span class="mark">”</span></p></div>
      <p data-u="tr" class="abs trans shadow-t" style="left:96px;top:390px;font-size:42px">Acknowledging unresolved problems is also part of accountability.</p>
      <p data-u="at" class="abs cite" style="left:96px;top:456px;font-size:24px">Employee 2, interview, October 9, 2026 · English translation by the research team</p>
      <p data-u="say" class="abs body sm" style="left:96px;top:1010px;font-size:28px;width:1728px;text-align:center;color:var(--amber)">“This issue remains. This is what we know. This is what we will do next.” <span class="cite" style="color:#cfc8bb">— our paraphrase of accountable leadership, not an interview quotation</span></p>`,
    states: [
      { dur: 4400, cam: Object.assign({}, CC),
        L: { desk: { oT: 0.25 }, l1: { d: 0.05, t: 0.5, e: 'out' }, l2: { d: 0.12, t: 0.5, e: 'out' }, e1: { d: 0.2, t: 0.5, e: 'out' }, e2: { d: 0.28, t: 0.5, e: 'out' }, mic: { d: 0.36, t: 0.45, e: 'back' } },
        drift: { x: 30, z: 20, dur: 26000 },
        U: { scrim: { d: 2400, t: 900, from: { x: -60 } }, kick: { d: 2800 }, h: { d: 3100, from: { y: 20 } }, b1: { d: 3700, from: { y: 16 } }, b2: { d: 4200, from: { y: 16 } } } },
      { dur: 4200, cam: { x: 0, y: 40, z: 60, roll: 0 },
        L: { l1: { x: at(CC, 1250, 120, 0.4, 1040).x, y: at(CC, 1250, 120, 0.4, 1040).y, r: -20, d: 0, t: 0.4 }, l2: { x: at(CC, 1850, 160, 0.4, 1030).x, r: 16, d: 0.03, t: 0.4 },
          mic: { o: 0.35 }, line: { o: 1, d: 0.25, oD: 0.25, oT: 0.2 },
          peg0: { o: 1, d: 0.35, t: 0.3, e: 'back', spin: 14, oD: 0.35, oT: 0.1 }, peg1: { o: 1, d: 0.45, t: 0.3, e: 'back', spin: -14, oD: 0.45, oT: 0.1 },
          peg2: { o: 1, d: 0.55, t: 0.3, e: 'back', spin: 12, oD: 0.55, oT: 0.1 }, peg3: { o: 1, d: 0.65, t: 0.3, e: 'back', spin: -12, oD: 0.65, oT: 0.1 } },
        drift: { z: 14, dur: 30000 },
        U: { scrim: {}, q: { d: 400, from: { y: 24 } }, tr: { d: 1200, from: { y: 12 } }, at: { d: 1500 }, say: { d: 3600, from: { y: 14 } } } }
    ]
  }));
  // pegs drop from above the line
  S[8].L = Object.fromEntries([0, 1, 2, 3].map(i => [`peg${i}`, { y: at(CC, 250 + i * 470, 900 + Math.sin((i + 0.5) / 4 * Math.PI) * 70, 1, 895 - i).y - 700 }]));
  S[8].states[1].L = Object.assign(S[8].states[1].L, Object.fromEntries([0, 1, 2, 3].map(i => [`peg${i}`, Object.assign({ y: at(CC, 250 + i * 470, 900 + Math.sin((i + 0.5) / 4 * Math.PI) * 70, 1, 895 - i).y }, S[8].states[1].L[`peg${i}`])])));

  /* ---------------------------------------------------------------- 10 */
  S[8].exit = { cam: { x: 0, y: 0, z: 200 }, frac: 0.7, L: { l1: { x: -3000, r: -40, o: 0 }, l2: { x: 3000, r: 40, o: 0 }, e1: { x: -3000, y: 1500, o: 0 }, e2: { x: 3000, y: 1500, o: 0 } }, Ldef: { e: 'in', oT: 0.5 } };
  S.push(Object.assign({}, C.s10, {
    id: 's10', world: 'meet', thumb: 'o_ground',
    cues: ['The warm household world and the teal miniature of the distribution system slide in from opposite sides and lock together at a seam; three shared findings settle across it, with the disagreement and the caveat.'],
    enterDelta: { left: { x: -2200, r: -6, o: 1 }, right: { x: 2200, r: 6, o: 1 }, mlaptop: { x: -2600, o: 1 }, mstove: { x: -2800, o: 1 }, mphone: { x: -2500, o: 1 }, mmeters: { x: 2600, o: 1 }, mboard: { x: 2500, o: 1 }, mreel: { x: 2800, o: 1 }, seam: { y: -1600, o: 1 } },
    ui: `
      <div data-u="dark" class="abs" style="left:0;top:0;width:1920px;height:1080px;background:rgba(14,12,10,.5)"></div>
      <div data-u="k" class="abs kicker" style="left:96px;top:56px;width:1728px;text-align:center">Where the accounts meet</div>
      <p data-u="hl" class="abs h3 shadow-t" style="left:96px;top:110px;width:780px;font-size:44px">Customers emphasise <span class="amber">immediate hardship.</span></p>
      <p data-u="hr" class="abs h3 shadow-t" style="left:1044px;top:110px;width:780px;text-align:right;font-size:44px">Employees emphasise <span class="teal-t">implementation constraints.</span></p>
      ${[['1', 'Paying customers’ fairness concerns are recognised — by the residents, and by Employee 1.'], ['2', 'Clear outage explanations and complaint follow-up matter — to both sides.'], ['3', 'Accountability requires action after explanation.']].map((r, i) =>
        `<div data-u="a${i}" class="slip" style="left:${360 + i * 30}px;top:${270 + i * 165}px;width:1180px;font-size:38px;display:grid;grid-template-columns:70px 1fr;align-items:center"><span style="font-family:var(--poster);font-size:64px;color:var(--rust)">${r[0]}</span><span>${r[1]}</span></div>`).join('')}
      <div data-u="diff" class="abs" style="left:96px;top:800px;width:1728px;text-align:center">
        <p class="body sm shadow-t">They also differ: Imad saw the CEO’s absence as reducing trust; Employee 2 refused to infer a motive.</p>
        <p class="qual" style="display:inline-block;text-align:left;margin-top:18px;font-size:28px;width:1500px">Agreement among four access-based interviews is not independent verification of the hearing — and interviewer framing may have shaped some answers.</p>
      </div>`,
    states: [
      { dur: 4400, cam: { x: 0, y: 0, z: 0, roll: 0 },
        L: { left: { d: 0, t: 0.5, e: 'out' }, right: { d: 0.02, t: 0.5, e: 'out' }, mlaptop: { d: 0.06, t: 0.5, e: 'out' }, mstove: { d: 0.1, t: 0.5, e: 'out' }, mphone: { d: 0.12, t: 0.5, e: 'out' },
          mmeters: { d: 0.06, t: 0.5, e: 'out' }, mboard: { d: 0.1, t: 0.5, e: 'out' }, mreel: { d: 0.12, t: 0.5, e: 'out' }, seam: { d: 0.45, t: 0.3, e: 'back' } },
        drift: { z: 20, dur: 26000 },
        U: { dark: { d: 1800, t: 800, from: {} }, k: { d: 2200 }, hl: { d: 2400, from: { x: -40 } }, hr: { d: 2500, from: { x: 40 } },
          a0: { d: 2900, from: { y: 60, r: -4 }, e: 'back' }, a1: { d: 3200, from: { y: 60, r: 4 }, e: 'back' }, a2: { d: 3500, from: { y: 60, r: -3 }, e: 'back' }, diff: { d: 4200, from: { y: 16 } } } }
    ]
  }));
})();
