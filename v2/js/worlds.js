/* ==========================================================================
   WORLDS — layered environments placed at real depths.
   Units: world units; camera at z looks toward +z; scale = 1000 / (z - camZ).
   D(sx, sy, ss, z): place a layer so that, seen from the reference camera
   (0,0,0), its centre is at screen (sx, sy) with screen scale ss.
   ========================================================================== */
(function () {
  const D = (sx, sy, ss, z, extra) => Object.assign({ x: (sx - 960) * z / 1000, y: (sy - 540) * z / 1000, s: ss * z / 1000, z }, extra || {});
  const A = (n) => window.ASSETS[n];
  const W = window.WORLDS = {};
  const HELP = window.WORLD_HELP = { D };

  /* ------------------------------------------------------------------ HOME
     Room interior (z 400..1000) sits behind our house's front window (z -150).
     Pulling the camera back through that window reveals the whole feeder. */
  const HOUSE_H = [4400, 4800, 4300, 5200, 4600, 4500, 5600, 4700, 5000, 4400];
  const STREET_CAM = { x: 5000, y: -2018, z: -11261, roll: 0 };
  const houses = HOUSE_H.map((h, i) => {
    const ours = i === 2, ppw = ours ? 0.75 : 0.3;
    return { k: 'house_' + i, img: ours ? 'house_ours' : 'house_' + i, x: (i - 2) * 2000, y: 1760 - (h + 400) / 2, z: -150, s: 1 / ppw, h, ppw };
  });
  HELP.houses = houses;
  HELP.STREET_CAM = STREET_CAM;

  // wires: computed so they meet the transformer and every roof at the street framing
  function wiresSVG(cls) {
    const kh = 1000 / (-150 - STREET_CAM.z), kp = 1000 / (-1200 - STREET_CAM.z), kw = 1000 / (-700 - STREET_CAM.z);
    const scr = (x, y, k) => [960 + (x - STREET_CAM.x) * k, 540 + (y - STREET_CAM.y) * k];
    const toPx = ([X, Y]) => [((STREET_CAM.x + (X - 960) / kw) + 6000) / 10, ((STREET_CAM.y + (Y - 540) / kw) + 7000) / 10];
    const poleX = 7000, armY = -2166 + (134 - 1300) * 2.9;
    const paths = houses.map(hs => {
      const side = hs.x < poleX ? -1 : 1;
      const [tx, ty] = toPx(scr(poleX + side * 760, armY, kp));
      const [rx, ry] = toPx(scr(hs.x + (side < 0 ? 500 : -500), 1760 - hs.h + 60, kh));
      const mx = (tx + rx) / 2, my = Math.max(ty, ry) + 22 + Math.abs(rx - tx) * 0.05;
      return `<path d="M${tx.toFixed(1)},${ty.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${rx.toFixed(1)},${ry.toFixed(1)}"/>`;
    }).join('');
    const [l0, l0y] = toPx(scr(-6000, armY - 300, kp)), [p0, p0y] = toPx(scr(poleX - 760, armY, kp));
    const [p1, p1y] = toPx(scr(poleX + 760, armY, kp)), [r0, r0y] = toPx(scr(17000, armY - 200, kp));
    const mains = `<path class="main" d="M${l0},${l0y} Q${(l0 + p0) / 2},${p0y + 40} ${p0},${p0y}"/><path class="main" d="M${p1},${p1y} Q${(p1 + r0) / 2},${p1y + 40} ${r0},${r0y}"/>`;
    return `<svg class="${cls}" viewBox="0 0 2200 800" width="2200" height="800">${mains}${paths}</svg>`;
  }

  const leds = [0, 1, 2, 3, 4].map(i => `<i style="left:${225 + i * 52}px;top:322px"></i>`).join('');

  W.home = {
    id: 'home',
    cam: { x: -30, y: 150, z: 90 },
    layers: [
      { k: 'sky', img: 'h_sky', x: 2500, y: -12000, z: 40000, s: 47 },
      { k: 'far', img: 'h_skyline_far', x: 5000, y: -2455, z: 20000, s: 21 },
      { k: 'mid', img: 'h_skyline_mid', x: 5000, y: -2268, z: 8000, s: 14 },
      // room interior
      Object.assign({ k: 'wallDark', img: 'room_wall_dark' }, D(960, 540, 1, 1000)),
      Object.assign({ k: 'wallLit', img: 'room_wall_lit' }, D(960, 540, 1, 1000)),
      Object.assign({ k: 'window', img: 'room_window' }, D(530, 350, 0.5, 995)),
      Object.assign({ k: 'curtain', img: 'room_curtain', cls: 'sway' }, D(812, 400, 0.56, 980)),
      Object.assign({ k: 'kitchenDark', img: 'room_kitchen_dark' }, D(1830, 620, 0.5, 900)),
      Object.assign({ k: 'kitchenLit', img: 'room_kitchen_lit' }, D(1830, 620, 0.5, 900)),
      Object.assign({ k: 'shelf', img: 'room_shelf' }, D(1430, 440, 0.42, 860)),
      Object.assign({ k: 'leds', w: 820, h: 540, html: `<div class="leds">${leds}</div>` }, D(1430, 440, 0.42, 859)),
      Object.assign({ k: 'lampDark', img: 'room_lamp_dark' }, D(1500, 700, 0.5, 760)),
      Object.assign({ k: 'lampLit', img: 'room_lamp_lit' }, D(1500, 700, 0.5, 760)),
      Object.assign({ k: 'lampGlow', w: 1000, h: 1000, html: '<div class="glow amber"></div>' }, D(1500, 560, 1.1, 755)),
      Object.assign({ k: 'fanHub', img: 'room_fan_hub' }, D(1060, 40, 0.45, 650)),
      Object.assign({ k: 'fan', w: 1400, h: 1400, html: `<div class="fanwrap"><img alt="" class="fanspin" data-src="assets/img/room_fan_blades.webp"></div>` }, D(1060, 150, 0.55, 652)),
      Object.assign({ k: 'tableDark', img: 'room_table_dark' }, D(960, 1160, 1, 430)),
      Object.assign({ k: 'tableLit', img: 'room_table_lit' }, D(960, 1160, 1, 430)),
      Object.assign({ k: 'cup', img: 'room_cup' }, D(1300, 930, 0.4, 420)),
      Object.assign({ k: 'bill', img: 'bill', html: '<div class="bstamp">Paid.<br>On time.</div>' }, D(620, 905, 0.42, 400), { r: -7 }),
      { k: 'boxDark', img: 'room_box_dark', x: 0, y: 0, z: 418, s: 2 },
      { k: 'boxLit', img: 'room_box_lit', x: 0, y: 0, z: 418, s: 2 },
      // neighbourhood
      ...houses.map(h => ({ k: h.k, img: h.img, x: h.x, y: h.y, z: h.z, s: h.s })),
      { k: 'road', img: 'h_road', x: 5000, y: 3950, z: -300, s: 7.3 },
      { k: 'wires', w: 2200, h: 800, html: wiresSVG('wires'), x: 5000, y: -3000, z: -700, s: 10 },
      { k: 'wiresGlow', w: 2200, h: 800, html: wiresSVG('wires glow'), x: 5000, y: -3000, z: -701, s: 10, o: 0 },
      { k: 'pole', img: 'h_pole', x: 7000, y: -2166, z: -1200, s: 2.9 },
      Object.assign({ k: 'hphone', img: 'im_phone', o: 0, r: -10 }, D(1230, 900, 0.3, 425)),
      { k: 'hl', w: 200, h: 470, html: '<div class="hlbox"></div>', x: 0, y: -590, z: -152, s: 10, o: 0 },
      { k: 'bracket', w: 2000, h: 70, html: '<div class="bracket"><span>One feeder: one operational unit</span></div>', x: 5000, y: 1960, z: -160, s: 10, o: 0 },
      { k: 'ripple', w: 700, h: 700, html: '<div class="ripples"><i></i><i></i><i></i><i></i></div>', x: 7000, y: -4240, z: -1190, s: 10, o: 0 },
      { k: 'wash', w: 1920, h: 1080, html: '<div class="moonwash"></div>', x: 960, y: 540, z: null, s: 1, o: 0 }
    ],
    fx: {
      fan(world, speed, T) {
        const img = world.el.querySelector('.fanspin');
        if (!img) return;
        if (!world._fanAnim) world._fanAnim = img.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 520, iterations: Infinity });
        const a = world._fanAnim;
        if (document.body.classList.contains('lowmo')) { a.playbackRate = speed ? 0.0001 : 0.0001; return; }
        const from = a.playbackRate, t0 = performance.now();
        cancelAnimationFrame(world._fanRaf);
        const step = () => {
          const u = Math.min(1, (performance.now() - t0) / (T || 1));
          a.playbackRate = Math.max(0.0001, from + (speed - from) * (1 - Math.pow(1 - u, 2)));
          if (u < 1) world._fanRaf = requestAnimationFrame(step);
        };
        step();
      }
    }
  };
})();

/* ------------------------------------------------------------------ PRESS (editorial collage → research board) */
(function () {
  const H = window.WORLD_HELP;
  // place a layer so that from camera `cam` it appears at screen (sx, sy) with screen scale ss
  H.at = (cam, sx, sy, ss, z, extra) => Object.assign({ x: cam.x + (sx - 960) * (z - cam.z) / 1000, y: cam.y + (sy - 540) * (z - cam.z) / 1000, s: ss * (z - cam.z) / 1000, z }, extra || {});
  const at = H.at;
  const LAND = H.PRESS_LAND = { x: 250, y: 40, z: 120, roll: 0 };
  const BOARD = H.PRESS_BOARD = { x: 0, y: 40, z: -260, roll: 0 };
  const slip = (cls, html, w, h) => ({ w, h, cls: 'slipL ' + cls, html: `<div class="slipin">${html}</div>` });
  const folderLabel = (n, t, sub) => `<div class="flabel"><div class="kicker" style="color:#7a3a1c">Source ${n}</div><div class="fl-t">${t}</div><div class="fl-s">${sub}</div></div>`;
  const card = (t, sub) => `<div class="cardin"><div class="c-t">${t}</div><div class="c-s">${sub}</div></div>`;
  const folders = [
    ['fA', 'p_folder_a', 'Published reporting', 'Business Recorder · September 2026', 470, 330],
    ['fB', 'p_folder_b', 'Regulatory documents', 'NEPRA decision (Jul 2025) · NEPRA order (Aug 31, 2026)', 1450, 330],
    ['fC', 'p_folder_c', 'KE’s published position', 'FAQs · 2025 year in review · sustainability release', 470, 800],
    ['fD', 'p_folder_d', 'Four interviews', 'October 3–9, 2026 · English & Urdu', 1450, 800]
  ];
  H.PRESS_FOLDERS = folders;
  window.WORLDS.press = {
    id: 'press',
    cam: Object.assign({}, LAND),
    layers: [
      { k: 'board', img: 'p_board', x: 0, y: 0, z: 1600, s: 2.6 },
      Object.assign({ k: 'lines', img: 'p_lines', r: 5 }, at(LAND, 1520, 190, 0.5, 1060)),
      Object.assign({ k: 'chamber', img: 'p_chamber', r: -3 }, at(LAND, 690, 500, 0.92, 1020)),
      Object.assign({ k: 'nameplates', img: 'p_nameplates', r: 4 }, at(LAND, 330, 930, 0.62, 980)),
      Object.assign({ k: 'chair', img: 'p_chair', r: 4 }, at(LAND, 1440, 560, 0.7, 960)),
      Object.assign({ k: 'docs', img: 'p_docs', r: -7 }, at(LAND, 1230, 960, 0.55, 940)),
      Object.assign({ k: 'mic', img: 'p_mic', r: -9 }, at(LAND, 1790, 840, 0.5, 900)),
      Object.assign({ k: 'chip', w: 760, h: 120, cls: 'chipL', html: '<div class="chip"><b>September 2026</b> · Sindh Assembly special committee on prolonged power outages</div>', r: -2 }, at(LAND, 470, 128, 1, 840)),
      Object.assign({ k: 's1' }, slip('a', '<span class="sk">Reporting published 24 Sep 2026</span>A special committee examined prolonged power outages.', 800, 150), at(LAND, 500, 290, 1, 860, { r: -1.5 })),
      Object.assign({ k: 's2' }, slip('b', 'The CEO <b>had been summoned.</b>', 800, 110), at(LAND, 470, 445, 1, 862, { r: 1.2 })),
      Object.assign({ k: 's3' }, slip('c', 'The distribution head apologised on the CEO’s behalf and said the representatives <b>did not hold the CEO’s authority.</b>', 820, 190), at(LAND, 520, 620, 1, 864, { r: -0.8 })),
      // research board (scene 4)
      ...folders.map(([k, img, t, sub, sx, sy], i) => Object.assign({ k, img, html: folderLabel(i + 1, t, sub), o: 0, r: [-3, 2.5, 2, -2.5][i] }, at(BOARD, sx, sy, 0.8, 1000))),
      Object.assign({ k: 'notebook', img: 'p_notebook', o: 0, r: -4 }, at(BOARD, 1640, 900, 0.36, 980)),
      ...[['c1', 'Resident · Imad', 'Gulistan-e-Jauhar · interview Oct 3, 2026 · named with consent'],
          ['c2', 'Employee 1 · Distribution', 'Assistant Manager · anonymised · Oct 4, 2026'],
          ['c3', 'Resident 2 · Gulshan', 'Name not supplied · Oct 5, 2026'],
          ['c4', 'Employee 2 · Communication', 'People, culture & communication · anonymised · Oct 9, 2026']].map(([k, t, s], i) =>
        Object.assign({ k, img: 'p_card', html: card(t, s), o: 0, r: [-5, 3, -2, 4][i] }, at(BOARD, 1640, 900, 0.25, 970 - i)))
    ]
  };
})();
