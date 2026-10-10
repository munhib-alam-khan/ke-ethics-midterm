/* Worlds for scenes 5–22. Layers are authored in screen space against each world's
   key camera with at(cam, sx, sy, screenScale, z); the engine supplies the depth. */
(function () {
  const H = window.WORLD_HELP, at = H.at, W = window.WORLDS;
  const O = { x: 0, y: 0, z: 0, roll: 0 };
  const L = (k, img, cam, sx, sy, ss, z, extra) => Object.assign({ k, img }, at(cam, sx, sy, ss, z), extra || {});
  const Hx = (k, w, h, html, cam, sx, sy, ss, z, extra) => Object.assign({ k, w, h, html }, at(cam, sx, sy, ss, z), extra || {});

  /* ------------------------------------------------ IMAD (rich painterly household) */
  const IC = H.IMAD_CAM = { x: 0, y: -20, z: 60, roll: 0 };
  const IR = H.IMAD_ROOM = { x: 0, y: 0, z: -120, roll: 0 };
  // object "home" spots inside the room (seen from IR) and constellation spots (seen from IC)
  H.IMAD_HOME = {
    phone: at(IR, 1690, 640, 0.12, 885, { r: -70 }), clock: at(IR, 640, 210, 0.22, 990), stove: at(IR, 470, 610, 0.36, 872),
    laptop: at(IR, 1520, 600, 0.34, 892), router: at(IR, 1280, 625, 0.24, 893), iron: at(IR, 780, 640, 0.22, 876)
  };
  H.IMAD_STAR = {
    phone: at(IC, 330, 520, 0.6, 640, { r: -6 }), clock: at(IC, 650, 290, 0.42, 700, { r: 4 }), stove: at(IC, 760, 720, 0.62, 620, { r: -2 }),
    laptop: at(IC, 1230, 560, 0.6, 600, { r: 3 }), router: at(IC, 1590, 400, 0.44, 660, { r: -5 }), iron: at(IC, 1600, 800, 0.46, 630, { r: 6 })
  };
  const cablePaths = () => {
    const P = { phone: [330, 760], clock: [650, 420], stove: [760, 820], laptop: [1230, 690], router: [1590, 500], iron: [1600, 900] };
    const s = [1060, 1000];
    return Object.entries(P).map(([k, [x, y]]) => `<path class="cab" d="M${s[0]},${s[1]} C${s[0]},${(s[1] + y) / 2 + 80} ${x},${y + 160} ${x},${y}"/>`).join('');
  };
  W.imad = {
    id: 'imad', cam: Object.assign({}, IC),
    layers: [
      L('bgDark', 'im_bg_dark', IR, 960, 540, 1.0, 1000), L('bgLit', 'im_bg_lit', IR, 960, 540, 1.0, 1000),
      Hx('type', 1900, 260, '<div class="bigtype teal">Gulistan-e-Jauhar</div>', IR, 960, 330, 1, 960, { o: 0 }),
      L('desk', 'im_desk', IR, 1450, 770, 0.62, 900), L('counter', 'im_counter', IR, 470, 840, 0.8, 880),
      L('plug', 'im_plug', IC, 1210, 990, 0.42, 560, { o: 0 }),
      Hx('cables', 1920, 1080, `<svg class="cables" viewBox="0 0 1920 1080">${cablePaths()}</svg>`, IC, 960, 540, 1, 590, { o: 0 }),
      ...['phone', 'clock', 'stove', 'laptop', 'router', 'iron'].map(k => Object.assign({ k, img: 'im_' + k, cls: 'obj' }, H.IMAD_HOME[k])),
      { k: 'dim', w: 1920, h: 1080, html: '<div class="dimwash"></div>', x: 960, y: 540, z: null, s: 1, o: 0 }
    ]
  };

  /* ------------------------------------------------ GULSHAN (rich heat rooftops) */
  const GC = H.GUL_CAM = { x: 0, y: 0, z: 0, roll: 0 };
  W.gulshan = {
    id: 'gulshan', cam: Object.assign({}, GC),
    layers: [
      L('sky', 'g_sky', GC, 960, 430, 1.1, 6000), L('far', 'g_far', GC, 960, 470, 0.78, 3000), L('mid', 'g_mid', GC, 960, 520, 0.8, 1800),
      L('roof', 'g_roof', GC, 960, 905, 0.92, 900),
      L('tank', 'g_tank', GC, 1640, 470, 0.52, 870), L('pump', 'g_pump', GC, 1260, 730, 0.46, 850),
      L('ups', 'g_ups', GC, 980, 770, 0.38, 800), L('battery', 'g_battery', GC, 760, 815, 0.33, 790),
      L('bucket', 'g_bucket', GC, 1500, 835, 0.3, 780), L('jerry', 'g_jerry', GC, 1830, 845, 0.26, 785),
      L('winA', 'g_win_backup', GC, 540, 540, 0.72, 640, { o: 0, r: -2 }), L('winB', 'g_win_none', GC, 1380, 540, 0.72, 640, { o: 0, r: 2 }),
      { k: 'dim', w: 1920, h: 1080, html: '<div class="dimwash"></div>', x: 960, y: 540, z: null, s: 1, o: 0 }
    ]
  };

  /* ------------------------------------------------ OPS (cream/teal/amber miniature) */
  const OC = H.OPS_CAM = { x: 0, y: 0, z: 0, roll: 0 };
  const tag = (t, s) => `<div class="htag2"><div class="ht-t">${t}</div><div class="ht-s">${s}</div></div>`;
  W.ops = {
    id: 'ops', cam: Object.assign({}, OC),
    layers: [
      L('ground', 'o_ground', OC, 960, 540, 0.95, 1100),
      ...[0, 1, 2, 3, 4].map(i => L('bh' + i, 'o_mh' + i, OC, 980 + i * 170, 250, 0.36, 1060)),
      L('board', 'o_board', OC, 1300, 440, 0.97, 1010),
      Hx('t1', 320, 330, tag('Scheduled load-shedding', 'A policy decision: needs notice and justification.'), OC, 970, 420, 1, 1004, { r: -2 }),
      Hx('t2', 320, 330, tag('Technical fault', 'Needs diagnosis and restoration.'), OC, 1300, 420, 1, 1003, { r: 1.5 }),
      Hx('t3', 320, 330, tag('Maintenance', 'Needs planning and advance information.'), OC, 1630, 420, 1, 1002, { r: -1 }),
      L('pole', 'o_pole', OC, 260, 640, 0.5, 960), L('kunda', 'o_kunda', OC, 520, 700, 0.45, 950),
      L('ladder', 'o_ladder', OC, 1840, 720, 0.42, 940), L('meters', 'o_meters', OC, 980, 830, 0.42, 920),
      L('reel', 'o_reel', OC, 200, 930, 0.36, 900), L('toolbox', 'o_toolbox', OC, 640, 940, 0.36, 905),
      L('ledger', 'o_ledger', OC, 1460, 900, 0.44, 900),
      { k: 'dim', w: 1920, h: 1080, html: '<div class="dimwash teal"></div>', x: 960, y: 540, z: null, s: 1, o: 0 }
    ]
  };

  /* ------------------------------------------------ MEET (two worlds slide together) */
  const MC = { x: 0, y: 0, z: 0, roll: 0 };
  W.meet = {
    id: 'meet', cam: Object.assign({}, MC),
    layers: [
      Object.assign({ k: 'left', img: 'im_bg_lit', cls: 'clipL' }, at(MC, 560, 540, 0.9, 1000)),
      Object.assign({ k: 'right', img: 'o_ground', cls: 'clipR' }, at(MC, 1420, 540, 0.85, 1000)),
      L('mlaptop', 'im_laptop', MC, 300, 760, 0.38, 900), L('mstove', 'im_stove', MC, 600, 860, 0.34, 890), L('mphone', 'im_phone', MC, 160, 560, 0.24, 910, { r: -8 }),
      L('mmeters', 'o_meters', MC, 1600, 820, 0.38, 900), L('mboard', 'o_board', MC, 1640, 330, 0.42, 950), L('mreel', 'o_reel', MC, 1300, 900, 0.3, 890),
      { k: 'seam', w: 60, h: 1400, html: '<div class="seam"></div>', x: 0, y: 0, z: 980, s: 0.98, r: 6 }
    ]
  };

  /* ------------------------------------------------ CORRESPONDENCE */
  const CC = H.CORR_CAM = { x: 0, y: 0, z: 0, roll: 0 };
  const doc = (kick, body, foot) => `<div class="docin"><div class="d-k">${kick}</div><div class="d-b">${body}</div><div class="d-f">${foot}</div></div>`;
  W.corr = {
    id: 'corr', cam: Object.assign({}, CC),
    layers: [
      L('desk', 'c_desk', CC, 960, 540, 1.0, 1200),
      L('l1', 'c_letter1', CC, 1220, 300, 0.4, 1040, { r: -12 }), L('l2', 'c_letter2', CC, 1700, 420, 0.4, 1030, { r: 9 }),
      L('e1', 'c_env1', CC, 1150, 850, 0.44, 1020, { r: 8 }), L('e2', 'c_env2', CC, 1760, 880, 0.44, 1015, { r: -6 }),
      L('mic', 'c_mic', CC, 1560, 600, 0.5, 950),
      // virtue-ethics path (scene 13): statement -> unresolved issue -> proposed commitment
      Object.assign({ k: 'd1', img: 'c_note', html: doc('An illustrative public statement', '“This issue remains. This is what we know — and this is still uncertain.”', 'Honesty: separate the known from the uncertain') }, at(CC, 2600, 420, 0.62, 1000, { r: -3, o: 0 })),
      Object.assign({ k: 'd2', img: 'c_note', html: doc('An illustrative complaint record', 'Status: <s>forwarded</s> — <b>still open</b>. No substantive response yet.', 'Responsibility: follow it through') + '<div class="openstamp">Open</div>' }, at(CC, 3300, 520, 0.62, 1000, { r: 2.5, o: 0 })),
      Object.assign({ k: 'd3', img: 'c_note', html: doc('A proposed commitment', 'Named owner · next update by a stated time · review after one quarter.', 'Practical judgement: promise what can be supported') }, at(CC, 4000, 420, 0.62, 1000, { r: -2, o: 0 })),
      Object.assign({ k: 'plates', img: 'p_nameplates' }, at(CC, 4900, 640, 0.6, 1000, { r: 2, o: 0 })),
      Hx('line', 1920, 400, '<svg class="cline" viewBox="0 0 1920 400"><path d="M-20,60 Q960,180 1940,60"/></svg>', CC, 960, 760, 1, 900, { o: 0 }),
      ...['Explanation', 'Authority', 'Commitment', 'Follow-through'].map((w, i) => Hx('peg' + i, 420, 120, `<div class="pegslip">${w}</div>`, CC, 250 + i * 470, 900 + Math.sin((i + 0.5) / 4 * Math.PI) * 70, 1, 895 - i, { o: 0, r: [-3, 2, -1.5, 2.5][i] }))
    ]
  };

  /* ------------------------------------------------ EVALUATION TABLE (theories) */
  const EC = H.EVAL_CAM = { x: 0, y: 0, z: 0, roll: 0 };
  const lab = (t, s) => `<div class="pagelab"><div class="pl-t">${t}</div><div class="pl-s">${s}</div></div>`;
  H.EVAL_OBJ = {
    pole: at(EC, 330, 520, 0.27, 985), meters: at(EC, 560, 560, 0.28, 980), reel: at(EC, 780, 650, 0.25, 975), toolbox: at(EC, 420, 760, 0.28, 970), ledger: at(EC, 720, 820, 0.27, 965),
    battery: at(EC, 1230, 610, 0.25, 980), laptop: at(EC, 1500, 560, 0.3, 978), stove: at(EC, 1700, 720, 0.27, 972), bucket: at(EC, 1290, 810, 0.21, 968), clock: at(EC, 1660, 410, 0.17, 985), ebill: at(EC, 1520, 850, 0.15, 960, { r: 8 })
  };
  const OB = H.EVAL_OBJ;
  W.eval = {
    id: 'eval', cam: Object.assign({}, EC),
    layers: [
      L('table', 'e_table', EC, 960, 540, 0.85, 1200),
      L('book', 'e_book', EC, 960, 620, 0.8, 1000),
      Hx('labL', 760, 160, lab('Company side', 'Recovery · maintenance · sustainable future supply'), EC, 560, 360, 1, 995),
      Hx('labR', 820, 160, lab('Household side', 'Backup power · interrupted work · cooking · water · time · unequal capacity to cope'), EC, 1400, 360, 1, 995),
      Object.assign({ k: 'pole', img: 'o_pole' }, OB.pole), Object.assign({ k: 'meters', img: 'o_meters' }, OB.meters), Object.assign({ k: 'reel', img: 'o_reel' }, OB.reel),
      Object.assign({ k: 'toolbox', img: 'o_toolbox' }, OB.toolbox), Object.assign({ k: 'ledger', img: 'o_ledger' }, OB.ledger),
      Object.assign({ k: 'battery', img: 'g_battery' }, OB.battery), Object.assign({ k: 'laptop', img: 'im_laptop' }, OB.laptop), Object.assign({ k: 'stove', img: 'im_stove' }, OB.stove),
      Object.assign({ k: 'bucket', img: 'g_bucket' }, OB.bucket), Object.assign({ k: 'clock', img: 'im_clock' }, OB.clock),
      Object.assign({ k: 'ebill', img: 'bill', html: '<div class="bstamp">Paid.<br>On time.</div>' }, OB.ebill),
      ...[['alt1', 'Targeted enforcement'], ['alt2', 'Better metering'], ['alt3', 'Network improvements']].map(([k, t], i) => Hx(k, 560, 150, `<div class="altcard">${t}</div>`, EC, 960, 470 + i * 170, 1, 940 - i, { o: 0, r: [-2, 1.5, -1][i] })),
      // comparison planes (scene 14)
      ...[['pD', 'Deontology', 'sets the boundary', 'Duties constrain unfair treatment of compliant customers.', '#9cc9c2', 'bill', 520, 260, 900],
          ['pU', 'Utilitarianism', 'chooses the remedy', 'Consequences help choose workable alternatives.', '#f0c27a', 'e_book', 860, 480, 820],
          ['pV', 'Virtue ethics', 'guides implementation', 'Character and practical judgement: candour, follow-through.', '#efe6d2', 'c_letter1', 1200, 700, 740]].map(([k, t, sub, body, col, img, sx, sy, z]) =>
        Hx(k, 1060, 220, `<div class="plane2" style="background-color:${col}"><img alt="" data-src="assets/img/${img}.webp"><div><div class="p2-t"><span>${t}</span> <i>${sub}</i></div><div class="p2-b">${body}</div></div></div>`, EC, sx, sy, 1, z, { o: 0 }))
    ]
  };

  /* ------------------------------------------------ FIELD (company-reported activity collage) */
  const FC = H.FIELD_CAM = { x: 0, y: 0, z: 0, roll: 0 };
  const num = (n, t) => `<div class="numslip"><div class="n-n">${n}</div><div class="n-t">${t}</div></div>`;
  W.field = {
    id: 'field', cam: Object.assign({}, FC),
    layers: [
      { k: 'bg', img: 'p_board', x: 0, y: 0, z: 1600, s: 2.7 },
      L('tent', 'f_tent', FC, 420, 420, 0.55, 1040, { r: -4 }), L('hooks', 'f_hooks', FC, 980, 260, 0.5, 1060, { r: 3 }),
      L('headset', 'f_headset', FC, 1560, 340, 0.45, 1030, { r: -5 }), L('forms', 'f_forms', FC, 1480, 800, 0.42, 1010, { r: 6 }),
      L('fmeter', 'f_meter', FC, 260, 820, 0.4, 1020, { r: 5 }), L('fladder', 'f_ladder', FC, 1780, 780, 0.4, 1050, { r: -3 }),
      Hx('stampC', 900, 110, '<div class="stampC">Company-reported · 2025 activities</div>', FC, 520, 110, 1, 900, { r: -3 }),
      Hx('n1', 600, 230, num('25,000+', 'anti-theft drives'), FC, 820, 560, 1, 880, { r: 2 }),
      Hx('n2', 600, 230, num('310', 'customer facilitation camps'), FC, 420, 790, 1, 870, { r: -2.5 }),
      Hx('n3', 760, 250, num('PKR 409 million', 'in recoveries associated with the initiatives'), FC, 1320, 600, 1, 860, { r: 1.5 })
    ]
  };

  /* ------------------------------------------------ DOCS (regulatory record) */
  const DC = H.DOCS_CAM = { x: 0, y: 0, z: 0, roll: 0 };
  W.docs = {
    id: 'docs', cam: Object.assign({}, DC),
    layers: [
      L('desk', 'd_desk', DC, 960, 540, 0.9, 1200),
      L('glasses', 'd_glasses', DC, 1620, 920, 0.4, 1060, { r: -12 }),
      Object.assign({ k: 'sh1', img: 'd_sheet', html: '<div class="sheetin"><div class="kicker" style="color:#a3311f">Paraphrase — not the document text</div><p class="sh-m">NATIONAL ELECTRIC POWER REGULATORY AUTHORITY</p><p class="sh-h">Order under Section 27C of the NEPRA Act 1997 — K-Electric</p><p class="sh-d">August 31, 2026</p><p>Directed KE to cease:</p><ul><li>unannounced, unscheduled or excessive load-shedding; and</li><li>feeder-level load-shedding based on aggregate technical and commercial losses.</li></ul><p>It challenged imposing interruptions on compliant customers because of others\u2019 defaults or theft.</p><p class="sh-c">Our paraphrase of NEPRA (2026), as summarised in our report.</p></div>' }, at(DC, 520, 560, 0.78, 1000, { r: -1.5 })),
      Object.assign({ k: 'sh2', img: 'd_sheet', html: '<div class="sheetin"><div class="kicker" style="color:#a3311f">Prior regulatory history</div><p>The August order refers to a <b>prior PKR 50 million fine</b> for related violations — <i>not</i> a new penalty arising from the September hearing.</p><div class="kicker" style="color:#a3311f;margin-top:34px">Alternative explanations</div><p>In a July 11, 2025 complaint decision, KE\u2019s account linked outages to losses and noted that damaged equipment and anti-theft disconnections could affect how interruptions are understood. Faults and maintenance also interrupt supply.</p><p>KE appealed NEPRA\u2019s earlier decision; we have not established that appeal\u2019s current disposition. Our interviews cannot establish the cause of any particular outage.</p><p class="sh-c">NEPRA (2026); NEPRA (2025, July 11)</p></div>', o: 0 }, at(DC, 1430, 560, 0.72, 990, { r: 1.8 }))
    ]
  };

  /* ------------------------------------------------ MINI street (recommendations) */
  const MS = H.MINI_CAM = { x: 0, y: 0, z: 0, roll: 0 };
  const mh = [];
  for (let i = 0; i < 10; i++) mh.push(L('m' + i, 'o_mh' + i, MS, 210 + i * 167, 380, 0.42, 1060), L('g' + i, 'o_mh' + i + '_glow', MS, 210 + i * 167, 380, 0.42, 1059, { o: 0 }));
  const wiresMini = () => {
    const tx = 1045, ty = 205;
    return `<svg class="mwires" viewBox="0 0 1920 1080">${[...Array(10).keys()].map(i => { const x = 210 + i * 167, y = 300; return `<path d="M${tx},${ty} Q${(tx + x) / 2},${Math.max(ty, y) + 40} ${x},${y}"/>`; }).join('')}</svg>`;
  };
  const card = (cls, html) => `<div class="mcard ${cls}">${html}</div>`;
  W.mini = {
    id: 'mini', cam: Object.assign({}, MS),
    layers: [
      { k: 'ground', img: 'o_ground', x: 1800, y: 300, z: 1300, s: 3.4 },
      ...mh,
      L('pole', 'o_pole', MS, 1045, 390, 0.42, 1040),
      Hx('wires', 1920, 1080, wiresMini(), MS, 960, 540, 1, 1050),
      Hx('rings', 1920, 1080, `<div class="ring" style="left:${210 + 3 * 167}px;top:420px"></div><div class="ring" style="left:${210 + 8 * 167}px;top:420px"></div>`, MS, 960, 540, 1, 1045, { o: 0 }),
      L('mdesk', 'o_desk', MS, -100, 560, 0.55, 960), L('mphone', 'o_phone', MS, 1080, 800, 0.26, 940, { r: -6 }),
      L('mowner', 'o_owner', MS, 2350, 840, 0.55, 960), L('mhear', 'o_hearing', MS, 3600, 830, 0.6, 960), L('mcal', 'o_calendar', MS, 4150, 700, 0.34, 940, { r: 4 }),
      Hx('upd', 470, 230, card('upd', '<div class="mc-k">Illustrative update · proposed format</div><b>Scheduled load-shedding</b><br>Restoration time uncertain<br>Next update: 21:30'), MS, -100, 420, 1.3, 900, { o: 0 }),
      Hx('cmp', 420, 170, card('cmp', '<div class="mc-k">Complaint</div>“Outage again tonight — no update.”'), MS, 1080, 700, 1.3, 900, { o: 0 }),
      Hx('rsp', 440, 190, card('rsp', '<div class="mc-k">Substantive response</div>Cause found · next step · named owner'), MS, 2350, 640, 1.3, 900, { o: 0 }),
      Hx('ok', 380, 110, card('ok', '✓ Resolution confirmed by the customer'), MS, 1080, 560, 1.3, 890, { o: 0 }),
      Hx('fold', 420, 300, card('fold', '<div class="mc-k">Prepared response</div>Evidence · outstanding issues · authorised representative'), MS, 3360, 560, 1.3, 900, { o: 0, r: -3 }),
      Hx('commit', 420, 300, card('commit', '<div class="mc-k">Written commitment</div>What will be done · by whom · by when'), MS, 3820, 560, 1.3, 895, { o: 0, r: 2 }),
      Hx('thread', 1920, 600, '<svg class="thread" viewBox="0 0 1920 600"><path d="M180,300 C420,120 560,480 820,300 S1260,140 1500,300"/></svg>', MS, 3700, 600, 1, 905, { o: 0 })
    ]
  };

  /* ------------------------------------------------ DUSK (limitations + conclusion) */
  const UC = { x: 0, y: 0, z: 0, roll: 0 };
  W.dusk = {
    id: 'dusk', cam: Object.assign({}, UC),
    layers: [
      L('sky', 'u_sky', UC, 960, 470, 1.15, 6000), L('far', 'u_far', UC, 960, 640, 0.8, 3000), L('mid', 'u_mid', UC, 960, 760, 0.8, 1600),
      L('poles', 'u_poles', UC, 960, 640, 0.75, 1000),
      { k: 'dim', w: 1920, h: 1080, html: '<div class="dimwash"></div>', x: 960, y: 540, z: null, s: 1, o: 0.35 }
    ]
  };
})();
