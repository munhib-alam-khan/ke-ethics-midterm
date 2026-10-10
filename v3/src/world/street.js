// The street: one coherent Karachi lane at night. Our house (index 0, x = 0)
// has a real first-floor room behind an open front window, so the camera can
// start at the paid bill and pull out through the window onto the feeder.
import * as THREE from 'three';
import * as T from './tex.js';
import { reg, std, basic, box, plane, cyl, group, glow, contact, card, tex, seg, lerp } from './kit.js';

export const ANCH = {};            // named world-space anchor points for HTML labels
export const TICK = [];            // per-frame callbacks (dt, t)

const FLOOR = 3.4;

export function buildStreet(scene, fonts) {
  const root = group(scene);
  root.name = 'street';

  // --------------------------------------------------------------- materials
  const asphalt = std({ map: tex('asphalt', () => T.asphalt(3), { repeat: [30, 2] }), roughness: 0.95 });
  const pave = std({ map: tex('pave', () => T.tiles(4, '#8d8577', '#7f786b', 512, 6), { repeat: [60, 1] }), roughness: 0.95 });
  const curb = std({ color: 0x9b9384 });
  const dark = std({ color: 0x1c1a19, roughness: 0.7 });
  const metal = std({ color: 0x2b2b2e, roughness: 0.5, metalness: 0.6 });
  const tankMat = std({ color: 0x1b1d22, roughness: 0.5 });
  const tankBlue = std({ color: 0x23466e, roughness: 0.6 });
  const grilleTex = tex('grille', () => T.grille(512, '#0f0c0b', 5), {});
  grilleTex.wrapS = grilleTex.wrapT = THREE.ClampToEdgeWrapping;
  const grilleMat = new THREE.MeshStandardMaterial({ map: grilleTex, transparent: true, alphaTest: 0.4, roughness: 0.6, side: THREE.DoubleSide });
  const frameMat = std({ color: 0x2a211b });

  // windows on this feeder share a handful of glow materials driven by "power"
  const feederWins = [];
  const otherWins = [];
  const winMats = [];
  for (let i = 0; i < 6; i++) {
    const t = T.toTex(T.windowGlow(100 + i * 7));
    t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
    winMats.push(t);
  }
  function winMaterial(i, feeder) {
    const m = new THREE.MeshStandardMaterial({ color: 0x080809, emissive: 0xffffff, emissiveMap: winMats[i % winMats.length], emissiveIntensity: 1.2, roughness: 0.3 });
    m.userData.base = 0.8 + ((i * 37) % 10) / 12;
    (feeder ? feederWins : otherWins).push(m);
    return m;
  }

  // --------------------------------------------------------------- ground
  const road = plane(220, 10, asphalt, 0, 0, 7, root); road.rotation.x = -Math.PI / 2;
  // lane paint, faded
  const paint = std({ color: 0xb9ae8f, roughness: 0.9 });
  for (let x = -100; x < 100; x += 6) { const p = plane(2.6, 0.14, paint, x, 0.01, 7, root); p.rotation.x = -Math.PI / 2; }
  const sw1 = box(220, 0.22, 2.4, pave, 0, 0.11, 0.9, root);
  const sw2 = box(220, 0.22, 2.4, pave, 0, 0.11, 13.1, root);
  box(220, 0.26, 0.18, curb, 0, 0.13, 2.1, root);
  box(220, 0.26, 0.18, curb, 0, 0.13, 11.9, root);
  // wet patches that catch light
  const wet = new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.12, metalness: 0.2, transparent: true, opacity: 0.55 });
  [[-6, 5.2, 5, 2.2], [8, 9, 7, 1.6], [2.5, 6.5, 3, 1.2], [-15, 8.2, 6, 1.8]].forEach(([x, z, w, d]) => { const p = plane(w, d, wet, x, 0.012, z, root); p.rotation.x = -Math.PI / 2; });
  const ground = plane(400, 400, std({ color: 0x14130f }), 0, -0.02, 0, root); ground.rotation.x = -Math.PI / 2;

  // --------------------------------------------------------------- houses
  const palette = ['#e8c39a', '#bcd6c8', '#e7b3a1', '#e2d39a', '#b3c8de', '#efe0bf', '#d8b4c8', '#c9d79f', '#e9cfa8'];
  const accent = ['#3f7f7a', '#b5583a', '#e8a33d', '#6f5a8a', '#2f5d7c', '#8a3b2c'];
  const houses = [];

  function facadeWindow(parent, x, y, w, h, mat, withGrille = true) {
    box(w + 0.24, h + 0.24, 0.12, frameMat, x, y, 0.04, parent);
    const g = plane(w, h, mat, x, y, 0.11, parent);
    if (withGrille) { const gr = plane(w, h, grilleMat, x, y, 0.2, parent); gr.renderOrder = 2; }
    // chajja sunshade
    const ch = box(w + 0.7, 0.08, 0.7, parent.userData.trim, x, y + h / 2 + 0.32, 0.35, parent);
    ch.rotation.x = 0.18;
    return g;
  }

  function addRoofStuff(g, w, h, r, seed) {
    // parapet
    const pm = g.userData.trim;
    box(w, 0.9, 0.18, pm, 0, h + 0.45, 0.0, g);
    box(0.18, 0.9, 9.6, pm, -w / 2 + 0.09, h + 0.45, -4.8, g);
    box(0.18, 0.9, 9.6, pm, w / 2 - 0.09, h + 0.45, -4.8, g);
    // water tanks (the black plastic tanks of every Karachi roof)
    const n = 1 + Math.floor(r() * 2);
    for (let i = 0; i < n; i++) {
      const tx = -w / 2 + 1.2 + r() * (w - 2.4), tz = -2 - r() * 5;
      const s = 0.55 + r() * 0.25;
      const stand = box(1.3 * s * 2, 1.2, 1.3 * s * 2, metal, tx, h + 0.6, tz, g);
      const t = cyl(s, s * 1.05, s * 2.2, r() < 0.7 ? tankMat : tankBlue, tx, h + 1.2 + s * 1.1, tz, g, 18);
      cyl(s * 0.35, s * 0.35, 0.12, tankMat, tx, h + 1.2 + s * 2.25, tz, g, 12);
    }
    // stair room on some
    if (r() < 0.5) box(2.6, 2.4, 2.6, g.userData.wall, w / 2 - 1.8, h + 1.2, -6.5, g);
    // dish / antenna
    if (r() < 0.5) { const d = cyl(0.02, 0.02, 1.6, metal, -w / 2 + 0.8, h + 1.7, -1.2, g, 6); }
  }

  function house(i, x, w, floors, opts = {}) {
    const r = T.rng(1000 + i * 31);
    const g = group(root, x, 0, 0);
    const col = palette[i % palette.length];
    const wall = std({ map: T.toTex(T.plaster(40 + i, col), { repeat: [w / 6, floors * FLOOR / 6] }), roughness: 0.95 });
    const trimCol = new THREE.Color(col).multiplyScalar(0.82);
    const trim = std({ color: trimCol, roughness: 0.9 });
    g.userData.wall = wall; g.userData.trim = trim;
    const h = floors * FLOOR;
    if (!opts.custom) box(w, h, 10, wall, 0, h / 2, -5, g);
    // floor bands
    for (let f = 1; f <= floors; f++) box(w + 0.1, 0.22, 0.3, trim, 0, f * FLOOR - 0.06, 0.1, g);
    // ground floor: gate + boundary wall
    const gateCol = std({ color: new THREE.Color(accent[(i * 3) % accent.length]).multiplyScalar(0.6), roughness: 0.55, metalness: 0.4 });
    box(w, 2.1, 0.22, wall, 0, 1.05, 1.9, g);
    box(2.4, 1.95, 0.08, gateCol, -w / 2 + 1.8, 1.05, 2.07, g);
    box(1.0, 2.0, 0.12, frameMat, w / 2 - 1.4, 1.0, 0.03, g);       // front door behind wall
    // windows
    const wins = [];
    for (let f = opts.custom ? 2 : 1; f < floors; f++) {
      const y = f * FLOOR + 1.6;
      const nw = w > 6.6 ? 2 : 1;
      for (let k = 0; k < nw; k++) {
        const wx = nw === 1 ? (r() - 0.5) * 1.2 : (k ? 1.55 : -1.55);
        const m = winMaterial(i * 5 + f * 2 + k, opts.feeder !== false);
        wins.push(facadeWindow(g, wx, y, nw === 1 ? 2.2 : 1.7, 1.5, m));
      }
      // balcony on some
      if (r() < 0.35 && !opts.custom) {
        box(w * 0.6, 0.16, 1.1, trim, 0, f * FLOOR + 0.05, 0.55, g);
        for (let b = 0; b < 9; b++) box(0.04, 0.9, 0.04, metal, -w * 0.3 + b * (w * 0.6 / 8), f * FLOOR + 0.55, 1.08, g);
        box(w * 0.6, 0.05, 0.05, metal, 0, f * FLOOR + 1.0, 1.08, g);
      }
      // split AC unit
      if (r() < 0.55) box(0.85, 0.6, 0.35, std({ color: 0xd8d6cf, roughness: 0.6 }), (r() < 0.5 ? -1 : 1) * (w / 2 - 0.7), f * FLOOR + 0.6, 0.2, g);
    }
    // ground-floor window behind the wall top
    addRoofStuff(g, w, h, r, i);
    houses.push({ g, x, w, h, wins, i });
    return g;
  }

  // our house: x = 0, w = 7, three floors, with an open first-floor room
  const OUR_W = 7.2;
  const our = house(0, 0, OUR_W, 3, { custom: true });
  const ourWall = our.userData.wall;
  {
    const W = OUR_W, D = 10;
    box(W, FLOOR, D, ourWall, 0, FLOOR / 2, -D / 2, our);                        // ground floor block
    box(W, FLOOR, D, ourWall, 0, FLOOR * 2.5, -D / 2, our);                      // top floor block
    // first-floor shell around the room (facade with a real opening)
    const y0 = FLOOR, y1 = FLOOR * 2;
    const wx0 = -1.35, wx1 = 1.35, wy0 = y0 + 0.95, wy1 = y0 + 2.6;
    const t = 0.25;
    box(wx0 + W / 2, FLOOR, t, ourWall, (-W / 2 + wx0) / 2, (y0 + y1) / 2, -t / 2, our);
    box(W / 2 - wx1, FLOOR, t, ourWall, (W / 2 + wx1) / 2, (y0 + y1) / 2, -t / 2, our);
    box(wx1 - wx0, wy0 - y0, t, ourWall, 0, (y0 + wy0) / 2, -t / 2, our);
    box(wx1 - wx0, y1 - wy1, t, ourWall, 0, (wy1 + y1) / 2, -t / 2, our);
    box(t, FLOOR, D, ourWall, -W / 2 + t / 2, (y0 + y1) / 2, -D / 2, our);
    box(t, FLOOR, D, ourWall, W / 2 - t / 2, (y0 + y1) / 2, -D / 2, our);
    box(W, FLOOR, t, ourWall, 0, (y0 + y1) / 2, -D + t / 2, our);
    // window frame + open grille (the camera flies through the open sash)
    const fr = std({ color: 0x3a2c22, roughness: 0.6 });
    box(wx1 - wx0 + 0.2, 0.12, 0.34, fr, 0, wy0 - 0.02, 0.0, our);
    box(wx1 - wx0 + 0.2, 0.12, 0.34, fr, 0, wy1 + 0.02, 0.0, our);
    box(0.12, wy1 - wy0, 0.34, fr, wx0 - 0.04, (wy0 + wy1) / 2, 0, our);
    box(0.12, wy1 - wy0, 0.34, fr, wx1 + 0.04, (wy0 + wy1) / 2, 0, our);
    const ch = box(wx1 - wx0 + 0.9, 0.08, 0.8, our.userData.trim, 0, wy1 + 0.36, 0.4, our); ch.rotation.x = 0.18;
    // opened grille leaves swung outward
    const leafL = group(our, wx0, (wy0 + wy1) / 2, 0.18);
    const leafR = group(our, wx1, (wy0 + wy1) / 2, 0.18);
    const lw = (wx1 - wx0) / 2;
    plane(lw, wy1 - wy0, grilleMat, lw / 2, 0, 0, leafL);
    plane(lw, wy1 - wy0, grilleMat, -lw / 2, 0, 0, leafR);
    leafL.rotation.y = -1.9; leafR.rotation.y = 1.9;
    ANCH.window = new THREE.Vector3(0, (wy0 + wy1) / 2, 0);
    buildRoom(our, W, D, y0, fonts);
  }

  // the rest of the row (north side, this feeder)
  const layout = [[-1, 6.4, 3], [-2, 7.0, 4], [-3, 6.2, 3], [-4, 6.8, 4], [-5, 6.0, 2], [1, 6.6, 4], [2, 6.2, 3], [3, 7.2, 4], [4, 6.4, 3]];
  let left = -OUR_W / 2, right = OUR_W / 2;
  layout.forEach(([k, w, f], n) => {
    let x;
    if (k < 0) { x = left - 0.15 - w / 2; left = x - w / 2; } else { x = right + 0.15 + w / 2; right = x + w / 2; }
    house(n + 1, x, w, f);
  });
  // far ends, not on this feeder (they keep their light in the blackout)
  for (let k = 0; k < 4; k++) {
    const w = 6.5;
    house(20 + k, left - 0.15 - w / 2 - k * 6.65, w, 3 + (k % 2), { feeder: false });
    house(30 + k, right + 0.15 + w / 2 + k * 6.65, w, 3 + ((k + 1) % 2), { feeder: false });
  }
  // the camera's house index map for labels: our house first, then neighbours left→right
  houses.sort((a, b) => a.x - b.x);
  houses.forEach(h => { if (Math.abs(h.x) < 40 && h.i < 20) ANCH['h' + h.i] = new THREE.Vector3(h.x, h.h + 2.4, 0.5); });
  ANCH.houses = houses.filter(h => h.i < 20).map(h => h.i);

  // opposite row (south side, facing north), seen from inside the room
  const south = group(root, 0, 0, 26.4);
  south.rotation.y = Math.PI;
  {
    let x = -60;
    let i = 0;
    while (x < 60) {
      const w = 6 + (i % 3) * 0.6, f = 2 + ((i * 7) % 3);
      const r = T.rng(5000 + i * 13);
      const g = group(south, x + w / 2, 0, 0);
      const col = palette[(i + 4) % palette.length];
      const wall = std({ map: T.toTex(T.plaster(80 + i, col), { repeat: [1, f / 2] }) });
      const trim = std({ color: new THREE.Color(col).multiplyScalar(0.8) });
      g.userData.wall = wall; g.userData.trim = trim;
      box(w, f * FLOOR, 10, wall, 0, f * FLOOR / 2, -5, g);
      for (let fl = 1; fl <= f; fl++) box(w + 0.1, 0.2, 0.3, trim, 0, fl * FLOOR - 0.06, 0.1, g);
      box(w, 2.1, 0.22, wall, 0, 1.05, 1.9, g);
      for (let fl = 1; fl < f; fl++) {
        const m = winMaterial(200 + i * 3 + fl, false);
        facadeWindow(g, (r() - 0.5) * 1.6, fl * FLOOR + 1.6, 2.0, 1.4, m);
      }
      addRoofStuff(g, w, f * FLOOR, r, i);
      x += w + 0.15; i++;
    }
  }

  // --------------------------------------------------------------- pole, transformer, wires
  const poleMat = std({ color: 0x5a564f, roughness: 0.8 });
  const poles = [-24, -10.5, 8.5, 24, -38, 38];
  poles.forEach(px => {
    cyl(0.14, 0.2, 10.5, poleMat, px, 5.25, 2.3, root, 10);
    box(2.4, 0.14, 0.14, metal, px, 9.8, 2.3, root);
    [-1, 0, 1].forEach(k => cyl(0.05, 0.05, 0.22, std({ color: 0x9b8f7a }), px + k * 0.9, 9.95, 2.3, root, 8));
  });
  // transformer on the -10.5 pole
  const TX = -10.5;
  const tr = group(root, TX, 6.6, 2.3);
  box(2.0, 0.16, 1.1, metal, 0, -0.95, 0, tr);
  const trBody = cyl(0.62, 0.62, 1.5, std({ color: 0x5f6a63, roughness: 0.6, metalness: 0.3 }), 0, 0, 0.1, tr, 18);
  for (let k = 0; k < 8; k++) box(0.06, 1.2, 0.3, std({ color: 0x4f5953 }), Math.cos(k / 8 * Math.PI * 2) * 0.68, 0, 0.1 + Math.sin(k / 8 * Math.PI * 2) * 0.68, tr).rotation.y = -k / 8 * Math.PI * 2;
  [-0.3, 0, 0.3].forEach(k => cyl(0.07, 0.09, 0.4, std({ color: 0x8a6f4c }), k, 0.95, 0.1, tr, 8));
  const trGlow = glow('255,190,110', 2.2, tr, 0, 1.3, 0.4, 0);
  ANCH.pole = new THREE.Vector3(TX, 10.6, 2.3);
  ANCH.transformer = new THREE.Vector3(TX, 6.6, 2.4);

  // streetlights (sodium) on the poles near us
  const sodium = [];
  [TX, 8.5, -24, 24].forEach(px => {
    const arm = box(0.1, 0.1, 1.8, metal, px, 8.2, 3.1, root);
    const head = box(0.5, 0.16, 0.8, metal, px, 8.12, 3.9, root);
    const bulb = plane(0.4, 0.6, basic({ color: 0xffb35c }), px, 8.03, 3.9, root); bulb.rotation.x = Math.PI / 2;
    const g = glow('255,170,90', 3.2, root, px, 7.9, 3.9, 0.9);
    const L = new THREE.SpotLight(0xff9a48, 60, 22, 0.95, 0.6, 1.6);
    L.position.set(px, 8.0, 3.9); L.target.position.set(px, 0, 5.6);
    root.add(L, L.target);
    sodium.push({ bulb, g, L });
  });

  // wires: catenaries between poles, service drops to every feeder house
  const wireMat = std({ color: 0x0c0b0b, roughness: 0.6 });
  const pulseMat = new THREE.ShaderMaterial({
    uniforms: { uP: { value: -1 }, uG: { value: 0 }, uC: { value: new THREE.Color(1.0, 0.62, 0.22) } },
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform float uP; uniform float uG; uniform vec3 uC; varying vec2 vUv;
      void main(){ float d = abs(vUv.x - uP); float pulse = exp(-d*d*90.0); float a = uG * (0.25 + 2.2*pulse);
        gl_FragColor = vec4(uC * a * 3.0, a); }`
  });
  function wire(points, r = 0.035, glowToo = true) {
    const curve = new THREE.CatmullRomCurve3(points);
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, r, 5, false), wireMat);
    root.add(m);
    if (glowToo) { const gm = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, r * 2.4, 6, false), pulseMat); root.add(gm); }
    return m;
  }
  const sag = (a, b, s = 0.7, n = 6) => { const pts = []; for (let k = 0; k <= n; k++) { const t = k / n; pts.push(new THREE.Vector3(lerp(a.x, b.x, t), lerp(a.y, b.y, t) - Math.sin(t * Math.PI) * s, lerp(a.z, b.z, t))); } return pts; };
  const sorted = poles.slice().sort((a, b) => a - b);
  for (let k = 0; k < sorted.length - 1; k++) for (const dz of [-0.9, 0, 0.9]) {
    const a = new THREE.Vector3(sorted[k] + dz * 0.0, 9.95, 2.3 + dz * 0.0), b = new THREE.Vector3(sorted[k + 1], 9.95, 2.3);
    a.x += dz; b.x += dz;
    wire(sag(a, b, 0.6), 0.03, dz === 0 && Math.abs(sorted[k]) < 30 && Math.abs(sorted[k + 1]) < 30);
  }
  // drops: from the line to each feeder house's first-floor band
  houses.filter(h => h.i < 20).forEach(h => {
    const px = Math.max(-24, Math.min(24, h.x));
    const a = new THREE.Vector3(px + 0.4, 9.7, 2.3), b = new THREE.Vector3(h.x + (h.w / 2 - 0.6), FLOOR * 2 + 0.3, 0.25);
    wire(sag(a, b, 0.45, 8), 0.02, true);
  });
  // a kunda (illegal hook) tangle on the far right house
  const kh = houses.find(h => h.i === 8) || houses[houses.length - 1];
  for (let k = 0; k < 3; k++) wire(sag(new THREE.Vector3(24 - k * 0.3, 9.6, 2.3), new THREE.Vector3(kh.x - 1 + k * 0.4, 5.2 + k * 0.3, 0.3), 1.2 + k * 0.3, 8), 0.018, false);

  // --------------------------------------------------------------- city beyond
  const cityTex = [0, 1, 2].map(k => { const t = T.toTex(T.cityWindows(70 + k, 0.35 + k * 0.08)); return t; });
  const cityMats = cityTex.map(t => new THREE.MeshStandardMaterial({ color: 0x0d0f15, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 1.1, roughness: 0.9 }));
  const rr = T.rng(77);
  for (let k = 0; k < 140; k++) {
    const side = k % 2 ? 1 : -1;
    const z = side < 0 ? -14 - rr() * 120 : 40 + rr() * 110;
    const x = (rr() - 0.5) * 300;
    const h = 8 + rr() * (rr() < 0.15 ? 70 : 26);
    const w = 8 + rr() * 14;
    const m = box(w, h, w * (0.6 + rr()), cityMats[k % 3], x, h / 2, z, root);
    const tt = m.material.emissiveMap;
    // per-building texture scale via UV repeat in geometry
    const uv = m.geometry.attributes.uv;
    for (let q = 0; q < uv.count; q++) uv.setXY(q, uv.getX(q) * w / 12, uv.getY(q) * h / 24);
  }
  cityTex.forEach(t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; });

  // --------------------------------------------------------------- sky
  const skyU = { uTop: { value: new THREE.Color(0x070b18) }, uMid: { value: new THREE.Color(0x18213d) }, uLow: { value: new THREE.Color(0x4a3a52) }, uGlow: { value: new THREE.Color(0x9a5e48) } };
  const skyMat = new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `uniform vec3 uTop, uMid, uLow, uGlow; varying vec3 vP;
      void main(){ float h = vP.y; vec3 c = mix(uLow, uMid, smoothstep(0.0, 0.18, h)); c = mix(c, uTop, smoothstep(0.18, 0.7, h));
        c = mix(uGlow, c, smoothstep(-0.02, 0.07, h)); gl_FragColor = vec4(c, 1.0); }` });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), skyMat);
  scene.add(sky);
  sky.renderOrder = -10;
  const NIGHT = [0x070b18, 0x18213d, 0x4a3a52, 0x9a5e48].map(c => new THREE.Color(c));
  const DUSK = [0x1d2550, 0x5a4a78, 0xd9825a, 0xffb36a].map(c => new THREE.Color(c));
  const DAWN = [0x3a5a8a, 0x8fb0c8, 0xe8d2b0, 0xfff0d0].map(c => new THREE.Color(c));
  reg('dusk', 0, v => { const k = ['uTop', 'uMid', 'uLow', 'uGlow']; k.forEach((n, i) => skyU[n].value.copy(NIGHT[i]).lerp(DUSK[i], Math.min(1, v)).lerp(DAWN[i], Math.max(0, v - 1))); });
  const moon = glow('235,235,255', 60, scene, -160, 210, 380, 0.9);
  const moonDisc = new THREE.Mesh(new THREE.CircleGeometry(9, 32), basic({ color: 0xf2efe6, fog: false }));
  moonDisc.position.set(-160, 210, 380); moonDisc.lookAt(0, 0, 0); scene.add(moonDisc);
  const moonBack = glow('235,235,255', 60, scene, 160, 190, -380, 0.6);
  const moonDisc2 = moonDisc.clone(); moonDisc2.position.set(160, 190, -380); moonDisc2.lookAt(0, 0, 0); scene.add(moonDisc2);
  // stars
  const sg = new THREE.BufferGeometry();
  const sp = [];
  const sr = T.rng(9);
  for (let k = 0; k < 900; k++) { const th = sr() * Math.PI * 2, ph = sr() * 0.9 + 0.25; sp.push(Math.cos(th) * Math.cos(ph) * 560, Math.sin(ph) * 560, Math.sin(th) * Math.cos(ph) * 560); }
  sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xbfc8e8, size: 1.4, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.7 }));
  scene.add(stars);

  // --------------------------------------------------------------- global light
  const hemi = new THREE.HemisphereLight(0x5a6c9a, 0x1a1410, 0.55);
  scene.add(hemi);
  const moonL = new THREE.DirectionalLight(0x9fb2e0, 0.55);
  moonL.position.set(-60, 90, 120);
  scene.add(moonL);

  // --------------------------------------------------------------- params
  reg('power', 1, v => {
    feederWins.forEach(m => { m.emissiveIntensity = m.userData.base * v; });
    sodium.forEach(s => { s.L.intensity = 60 * v; s.g.material.opacity = 0.9 * v; s.bulb.material.color.setRGB(lerp(0.12, 1, v), lerp(0.1, 0.7, v), lerp(0.08, 0.36, v)); });
  });
  reg('others', 1, v => otherWins.forEach(m => { m.emissiveIntensity = m.userData.base * v; }));
  reg('city', 1, v => cityMats.forEach(m => { m.emissiveIntensity = 1.1 * v; }));
  reg('wireGlow', 0, v => { pulseMat.uniforms.uG.value = v; trGlow.material.opacity = v * 0.9; });
  reg('wirePulse', -0.2, v => { pulseMat.uniforms.uP.value = v; });
  reg('night', 1, v => { hemi.intensity = 0.55 * v + 0.2; moonL.intensity = 0.55 * v + 0.1; });


  // ---------------------------------------------------------- recommendation markers (scenes 19–20)
  const kunda = houses.find(h => h.i === 8) || houses[houses.length - 1];
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xc4623f, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.RingGeometry(3.6, 4.0, 48), ringMat); ring.rotation.x = -Math.PI / 2; ring.position.set(kunda.x, 0.3, 0.5); root.add(ring);
  const ringSpot = new THREE.SpotLight(0xff8a5a, 0, 30, 0.35, 0.6, 1.2); ringSpot.position.set(kunda.x, 22, 6); ringSpot.target.position.set(kunda.x, 0, 0); root.add(ringSpot, ringSpot.target);
  ANCH.kunda = new THREE.Vector3(kunda.x, kunda.h + 3.5, 0.5);
  const floatCard = (canvas, w, x, y, z) => { const m = card(canvas, w, root); m.material = new THREE.MeshBasicMaterial({ map: m.material.map, transparent: true, depthWrite: false, side: THREE.DoubleSide }); m.position.set(x, y, z); m.renderOrder = 6; m.visible = false; return m; };
  const noticeC = T.paperText([{ text: 'OUTAGE UPDATE · YOUR FEEDER', font: 'Plex Mono', size: 30, weight: 500, letter: '3px', color: '#8a4a22', after: 14 }, { text: 'Cause: scheduled maintenance', font: 'Fraunces', size: 54, weight: 600, after: 6 }, { text: 'Restoration: uncertain', font: 'Fraunces', size: 54, weight: 600, after: 6 }, { text: 'Next update: 20:30', font: 'Fraunces', size: 54, weight: 600, color: '#a3311f', after: 18 }, { text: 'ILLUSTRATIVE MODEL — NOT A RESULT', font: 'Plex Mono', size: 22, color: '#8a7c68' }], { w: 900, h: 560, pad: 52, seed: 91 });
  const notice = floatCard(noticeC, 6.5, 16, 14, 20);
  ANCH.notice = notice;
  const ticketC = T.paperText([{ text: 'RECURRING COMPLAINT', font: 'Plex Mono', size: 30, weight: 500, letter: '3px', color: '#8a4a22', after: 14 }, { text: 'Owner: named', font: 'Fraunces', size: 54, weight: 600, after: 6 }, { text: 'Next step: set', font: 'Fraunces', size: 54, weight: 600, after: 6 }, { text: 'Resolved? Customer confirms', font: 'Fraunces', size: 54, weight: 600, color: '#2c6e68', after: 18 }, { text: 'PROPOSED PROCESS — ILLUSTRATIVE', font: 'Plex Mono', size: 22, color: '#8a7c68' }], { w: 900, h: 560, pad: 52, seed: 92 });
  const ticket = floatCard(ticketC, 6.5, 16, 14, 20);
  ANCH.ticket = ticket;
  const ledgerC = T.paperText([{ text: 'BEFORE THE NEXT HEARING', font: 'Plex Mono', size: 30, weight: 500, letter: '3px', color: '#8a4a22', after: 14 }, { text: 'Evidence', font: 'Fraunces', size: 54, weight: 600, after: 6 }, { text: 'Outstanding issues', font: 'Fraunces', size: 54, weight: 600, after: 6 }, { text: 'Commitments to review', font: 'Fraunces', size: 54, weight: 600, color: '#2c6e68', after: 18 }, { text: 'PROPOSED — ILLUSTRATIVE', font: 'Plex Mono', size: 22, color: '#8a7c68' }], { w: 900, h: 560, pad: 52, seed: 93 });
  const ledger = floatCard(ledgerC, 6.5, 17, 14, 20);
  ANCH.ledger = ledger;
  // a line from our house to the ticket (the complaint travels to an owner)
  const tPath = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 7.5, 0.5), new THREE.Vector3(6, 13, 10), new THREE.Vector3(13, 14, 19)]);
  const tLine = new THREE.Mesh(new THREE.TubeGeometry(tPath, 60, 0.05, 5), new THREE.MeshBasicMaterial({ color: 0x8fc3bc, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
  root.add(tLine); tLine.visible = false;
  const tCount = tLine.geometry.index.count;
  const showCard = (m, v, y0) => { m.visible = v > 0.001; m.material.opacity = v; m.position.y = y0 - (1 - v) * 2; m.scale.setScalar(0.85 + 0.15 * v); };
  reg('rTarget', 0, v => { ringMat.opacity = 0.9 * v; ringSpot.intensity = 90 * v; ring.scale.setScalar(1 + (1 - v) * 0.6); });
  reg('rNotice', 0, v => showCard(notice, v, 14));
  reg('rTicket', 0, v => { showCard(ticket, v, 14); tLine.visible = v > 0.001; tLine.geometry.setDrawRange(0, Math.floor(tCount * v / 3) * 3); });
  reg('rLedger', 0, v => showCard(ledger, v, 14));
  TICK.push((dt, t) => {
    [notice, ticket, ledger].forEach((m, k) => { if (m.visible) { m.lookAt(m.position.x - 1, m.position.y + 6, m.position.z + 20); m.position.x += Math.sin(t * 0.5 + k) * 0.002; } });
    ring.rotation.z = t * 0.3;
  });

  return { root, houses, sky, stars };
}

// ------------------------------------------------------------------ the room
function buildRoom(our, W, D, y0, fonts) {
  const room = group(our, 0, y0, 0);
  const paint = std({ map: T.toTex(T.plaster(501, '#9cc1b6'), { repeat: [2, 1] }), roughness: 0.95 });
  const paint2 = std({ map: T.toTex(T.plaster(502, '#e3d6b8'), { repeat: [2, 1] }), roughness: 0.95 });
  const floorMat = std({ map: T.toTex(T.tiles(7, '#b9a37f', '#a48e6b', 512, 4), { repeat: [3, 2.5] }), roughness: 0.55 });
  const woodMat = std({ map: T.toTex(T.wood(8, '#6b4428')), roughness: 0.6 });
  const darkWood = std({ map: T.toTex(T.wood(9, '#3f2716')), roughness: 0.6 });
  const iw = W - 0.5, id = D - 0.5;
  // interior skins
  const fl = plane(iw, id, floorMat, 0, 0.005, -D / 2, room); fl.rotation.x = -Math.PI / 2;
  const ce = plane(iw, id, std({ color: 0xe9e1cf }), 0, FLOOR - 0.01, -D / 2, room); ce.rotation.x = Math.PI / 2;
  const back = plane(iw, FLOOR, paint, 0, FLOOR / 2, -D + 0.26, room);
  const lw = plane(id, FLOOR, paint, -W / 2 + 0.26, FLOOR / 2, -D / 2, room); lw.rotation.y = Math.PI / 2;
  const rw = plane(id, FLOOR, paint2, W / 2 - 0.26, FLOOR / 2, -D / 2, room); rw.rotation.y = -Math.PI / 2;
  // inner face of the front wall (with the opening) — four strips
  const fx0 = -1.35, fx1 = 1.35, fy0 = 0.95, fy1 = 2.6;
  [[(-iw / 2 + fx0) / 2, FLOOR / 2, fx0 + iw / 2, FLOOR], [(iw / 2 + fx1) / 2, FLOOR / 2, iw / 2 - fx1, FLOOR], [0, fy0 / 2, fx1 - fx0, fy0], [0, (fy1 + FLOOR) / 2, fx1 - fx0, FLOOR - fy1]]
    .forEach(([x, y, w, h]) => { const p = plane(w, h, paint2, x, y, -0.26, room); p.rotation.y = Math.PI; });
  // skirting
  box(iw, 0.12, 0.04, darkWood, 0, 0.06, -D + 0.28, room);

  // curtains
  const curtainTex = T.toTex((() => { const [c, g] = T.canvas(256, 512); g.fillStyle = '#b5583a'; g.fillRect(0, 0, 256, 512); for (let i = 0; i < 16; i++) { g.fillStyle = `rgba(0,0,0,${0.08 + (i % 2) * 0.12})`; g.fillRect(i * 16, 0, 9, 512); } g.fillStyle = 'rgba(240,190,90,.5)'; for (let y = 40; y < 512; y += 80) for (let x = 8; x < 256; x += 32) { g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); } return c; })());
  const curtain = std({ map: curtainTex, side: THREE.DoubleSide, roughness: 1 });
  const cg = new THREE.PlaneGeometry(0.9, 2.3, 12, 1);
  const pos = cg.attributes.position; for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin(pos.getX(i) * 14) * 0.05);
  const cL = new THREE.Mesh(cg, curtain); cL.position.set(fx0 - 0.25, 1.75, -0.34); room.add(cL);
  const cR = new THREE.Mesh(cg, curtain); cR.position.set(fx1 + 0.25, 1.75, -0.34); room.add(cR);
  box(3.9, 0.04, 0.04, std({ color: 0x6b5a45, metalness: 0.5, roughness: 0.4 }), 0, 2.92, -0.34, room);

  // table + chair near the window
  const tg = group(room, 0.1, 0, -1.25);
  box(1.7, 0.06, 0.95, woodMat, 0, 0.76, 0, tg);
  [[-0.78, -0.4], [0.78, -0.4], [-0.78, 0.4], [0.78, 0.4]].forEach(([x, z]) => box(0.06, 0.74, 0.06, darkWood, x, 0.37, z, tg));
  contact(2.6, 1.8, tg, 0, 0.01, 0, 0.5);
  const chair = group(room, 0.0, 0, -2.15);
  box(0.5, 0.05, 0.5, darkWood, 0, 0.46, 0, chair); box(0.5, 0.6, 0.05, darkWood, 0, 0.78, -0.23, chair);
  [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]].forEach(([x, z]) => box(0.04, 0.46, 0.04, darkWood, x, 0.23, z, chair));
  chair.rotation.y = 0.25;

  // the bill (paper with live text) — illustrative, generic, no company branding
  const billCanvas = T.paperText([
    { text: 'ELECTRICITY BILL', font: 'Plex Mono', size: 30, weight: 500, letter: '4px', color: '#6a5d4c', after: 4 },
    { text: 'Residential · Monthly statement', font: 'Plex Mono', size: 24, color: '#8a7c68', after: 26 },
    { text: 'Amount due', font: 'Source Sans 3', size: 34, color: '#5a5248', after: 0 },
    { text: 'PKR  ·  ·  ·  ·', font: 'Anton', size: 92, color: '#2a2622', after: 18 },
    { text: 'Due date: 12th of the month', font: 'Source Sans 3', size: 30, color: '#5a5248', after: 6 },
    { text: 'Account ········', font: 'Plex Mono', size: 26, color: '#8a7c68' }
  ], { w: 760, h: 1000, pad: 64, torn: false, seed: 3 });
  {
    const g = billCanvas.getContext('2d');
    g.save(); g.translate(400, 760); g.rotate(-0.16);
    g.strokeStyle = 'rgba(178,58,42,.88)'; g.lineWidth = 12; g.strokeRect(-250, -95, 500, 190);
    g.lineWidth = 3; g.strokeRect(-232, -77, 464, 154);
    g.fillStyle = 'rgba(178,58,42,.9)'; g.font = '400 96px Anton'; g.textAlign = 'center'; g.fillText('PAID', 0, 8);
    g.font = '500 34px "Plex Mono"'; g.fillText('ON TIME', 0, 58);
    g.restore();
    // ink speckle on stamp
    g.globalCompositeOperation = 'destination-out';
    const r = T.rng(5); for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.5})`; g.fillRect(150 + r() * 500, 640 + r() * 240, 2 + r() * 3, 2 + r() * 3); }
    g.globalCompositeOperation = 'source-over';
  }
  const bill = card(billCanvas, 0.42, null);
  const billG = group(room, -0.12, 0.795, -1.2);
  billG.add(bill);
  const qA = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, Math.PI + 0.2)), qB = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.32, Math.PI, 0.05));
  bill.quaternion.copy(qA);
  ANCH.bill = billG;

  // pen + glasses-ish props
  const pen = cyl(0.008, 0.008, 0.16, std({ color: 0x1f3b6b }), 0.16, 0.8, -1.05, room, 8); pen.rotation.z = Math.PI / 2; pen.rotation.y = 0.6;
  // phone face-down
  box(0.08, 0.01, 0.16, std({ color: 0x111111, roughness: 0.3 }), -0.45, 0.8, -1.4, room).rotation.y = 0.4;
  // tea cup
  const cup = cyl(0.04, 0.032, 0.08, std({ color: 0xf2efe8, roughness: 0.3 }), 0.42, 0.83, -1.45, room, 16);

  // table lamp
  const lamp = group(room, 0.62, 0.79, -1.5);
  cyl(0.1, 0.12, 0.03, std({ color: 0x2a2a2a, metalness: 0.6, roughness: 0.3 }), 0, 0.015, 0, lamp, 18);
  cyl(0.012, 0.012, 0.36, std({ color: 0x8b6d3c, metalness: 0.8, roughness: 0.3 }), 0, 0.2, 0, lamp, 8);
  const shadeMat = new THREE.MeshStandardMaterial({ color: 0xe7d2a8, emissive: 0xffb860, emissiveIntensity: 0.9, side: THREE.DoubleSide, roughness: 0.8 });
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.17, 0.2, 24, 1, true), shadeMat); shade.position.y = 0.42; lamp.add(shade);
  const lampLight = new THREE.PointLight(0xffb769, 6, 7, 1.6);
  lampLight.position.set(0, 0.36, 0); lamp.add(lampLight);
  const lampGlow = glow('255,190,110', 0.9, lamp, 0, 0.38, 0, 0.75);

  // ceiling tube light + fan
  const tube = box(1.2, 0.05, 0.06, new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xe8f4ff, emissiveIntensity: 2.0 }), -2.2, 2.6, -4.2, room);
  tube.rotation.y = Math.PI / 2; tube.position.set(-W / 2 + 0.34, 2.55, -3.5);
  const tubeLight = new THREE.PointLight(0xdfeeff, 7, 9, 1.4);
  tubeLight.position.set(-W / 2 + 0.9, 2.5, -3.4); room.add(tubeLight);
  const fan = group(room, 0.2, FLOOR - 0.05, -2.6);
  cyl(0.02, 0.02, 0.35, metal(), 0, -0.17, 0, fan, 8);
  const hub = group(fan, 0, -0.38, 0);
  cyl(0.12, 0.1, 0.12, std({ color: 0xd9d4c8, roughness: 0.5 }), 0, 0, 0, hub, 18);
  const bladeMat = std({ color: 0xcfc7b4, roughness: 0.6 });
  for (let k = 0; k < 3; k++) { const b = box(0.6, 0.012, 0.13, bladeMat, 0.42, -0.02, 0, null); const bg = group(hub); bg.rotation.y = k * Math.PI * 2 / 3; bg.add(b); b.rotation.x = 0.12; }
  ANCH.fan = new THREE.Vector3(0.2, y0 + FLOOR - 0.45, -2.6);

  // wall shelf with router (left wall)
  const shelf = group(room, -W / 2 + 0.45, 1.55, -1.9);
  box(0.36, 0.04, 0.9, darkWood, 0, 0, 0, shelf);
  const router = box(0.22, 0.05, 0.3, std({ color: 0x18181a, roughness: 0.4 }), 0.02, 0.05, 0, shelf);
  [-0.06, 0.06].forEach(z => { const a = cyl(0.006, 0.006, 0.2, std({ color: 0x111111 }), -0.06, 0.16, z, shelf, 6); a.rotation.z = 0.15; });
  const ledMat = new THREE.MeshBasicMaterial({ color: 0x5dff9b });
  const leds = [];
  for (let k = 0; k < 4; k++) { const l = box(0.012, 0.008, 0.012, ledMat.clone(), 0.13, 0.06, -0.09 + k * 0.06, shelf); leds.push(l); }
  const ledGlow = glow('120,255,170', 0.25, shelf, 0.14, 0.06, 0, 0.6);
  // books
  ['#7a2e22', '#2f5d7c', '#c9a14a', '#3f6b4f'].forEach((c, k) => box(0.2, 0.26, 0.05, std({ color: c }), 0.02, 0.15, 0.22 + k * 0.055, shelf));
  ANCH.router = new THREE.Vector3(-W / 2 + 0.5, y0 + 1.62, -1.9);

  // kitchen corner on the back-right: counter + hotplate (cooking)
  const kit = group(room, W / 2 - 0.85, 0, -1.15);
  box(1.0, 0.9, 1.0, std({ color: 0x6c645a }), 0, 0.45, 0, kit);
  box(1.04, 0.04, 1.04, std({ color: 0x2b2a28, roughness: 0.3 }), 0, 0.92, 0, kit);
  const coilMat = new THREE.MeshStandardMaterial({ color: 0x1a1210, emissive: 0xff5a1a, emissiveIntensity: 2.2 });
  const coil = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.012, 6, 28), coilMat); coil.rotation.x = Math.PI / 2; coil.position.set(-0.1, 0.95, 0.1); kit.add(coil);
  const coil2 = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.01, 6, 20), coilMat); coil2.rotation.x = Math.PI / 2; coil2.position.set(-0.1, 0.95, 0.1); kit.add(coil2);
  const pot = cyl(0.13, 0.12, 0.14, std({ color: 0x9a9a9a, metalness: 0.8, roughness: 0.3 }), -0.1, 1.04, 0.1, kit, 20);
  const steam = glow('255,240,220', 0.5, kit, -0.1, 1.3, 0.1, 0.18);
  const coilLight = new THREE.PointLight(0xff6a2a, 1.2, 2.5, 2); coilLight.position.set(-0.1, 1.15, 0.1); kit.add(coilLight);
  ANCH.stove = new THREE.Vector3(W / 2 - 0.95, y0 + 1.05, -1.05);
  // wall clock
  const clockC = (() => { const [c, g] = T.canvas(256, 256); g.fillStyle = '#f3ede0'; g.beginPath(); g.arc(128, 128, 120, 0, 7); g.fill(); g.lineWidth = 10; g.strokeStyle = '#3a2c22'; g.stroke(); g.fillStyle = '#2a2622'; for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; g.fillRect(128 + Math.cos(a) * 96 - 4, 128 + Math.sin(a) * 96 - 4, 8, 8); } g.lineWidth = 8; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 + 50, 128 - 30); g.stroke(); g.lineWidth = 5; g.beginPath(); g.moveTo(128, 128); g.lineTo(128 - 10, 128 - 90); g.stroke(); return c; })();
  
  // calendar
  const cal = card(T.paperText([{ text: 'SEPTEMBER', font: 'Anton', size: 64, color: '#b23a2a' }, { text: '1  2  3  4  5  6  7   8  9  10 11 12 13 14   15 16 17 18 19 20 21   22 23 24 25 26 27 28   29 30', font: 'Plex Mono', size: 34, lh: 1.5 }], { w: 400, h: 520, pad: 30, torn: false }), 0.42, room);
  cal.position.set(-1.0, 1.8, -D + 0.28);
  // rug
  const rug = plane(2.4, 1.6, std({ map: T.toTex((() => { const [c, g] = T.canvas(512, 340); g.fillStyle = '#7a2e22'; g.fillRect(0, 0, 512, 340); g.strokeStyle = '#e8a33d'; g.lineWidth = 10; g.strokeRect(20, 20, 472, 300); g.strokeStyle = '#2f5d7c'; g.lineWidth = 6; g.strokeRect(44, 44, 424, 252); for (let i = 0; i < 6; i++) { g.save(); g.translate(256, 170); g.rotate(i * Math.PI / 3); g.fillStyle = '#c9a14a'; g.fillRect(-6, -90, 12, 80); g.restore(); } return c; })()), roughness: 1 }), 0.3, 0.01, -2.6, room);
  rug.rotation.x = -Math.PI / 2;
  // sofa against right wall
  const sofa = group(room, W / 2 - 0.75, 0, -3.6);
  const sofaMat = std({ color: 0x3f6b5f, roughness: 1 });
  box(0.9, 0.45, 2.0, sofaMat, 0, 0.3, 0, sofa); box(0.25, 0.8, 2.0, sofaMat, 0.32, 0.55, 0, sofa);
  [-0.85, 0.85].forEach(z => box(0.9, 0.6, 0.2, sofaMat, 0, 0.4, z, sofa));
  box(0.4, 0.4, 0.12, std({ color: 0xe8a33d }), 0.1, 0.65, -0.5, sofa).rotation.y = 0.3;
  // moonlight spilling in through the window once the power is gone
  const moonIn = new THREE.SpotLight(0x8fa6dd, 0, 14, 0.5, 0.8, 1.2);
  moonIn.position.set(-1.5, 3.5, 4.5); moonIn.target.position.set(0.3, 0.4, -2.0);
  room.add(moonIn, moonIn.target);
  // dust motes in the lamp light
  const dg = new THREE.BufferGeometry(); const dp = []; const dr = T.rng(42);
  for (let k = 0; k < 220; k++) dp.push((dr() - 0.5) * 3, 0.6 + dr() * 2.4, -0.5 - dr() * 3.5);
  dg.setAttribute('position', new THREE.Float32BufferAttribute(dp, 3));
  const motes = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xffe2b0, size: 0.012, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending }));
  room.add(motes);


  // ---------------------------------------------------------- analysis props (scenes 11–13)
  // the household's burdens as objects that rise around the bill (utilitarianism)
  const objs = [];
  const mkObj = (name, mesh, rest, float) => { room.add(mesh); mesh.position.set(...rest); objs.push({ name, mesh, rest, float, rot: mesh.rotation.clone() }); const a = group(our, 0, 0, 0); ANCH[name] = a; return mesh; };
  const batt = group(null); box(0.34, 0.24, 0.18, std({ color: 0x3a3f8a, roughness: 0.5 }), 0, 0.12, 0, batt); box(0.05, 0.04, 0.05, std({ color: 0xb23a2a }), -0.1, 0.26, 0, batt); box(0.05, 0.04, 0.05, std({ color: 0x222222 }), 0.1, 0.26, 0, batt);
  mkObj('uBatt', batt, [W / 2 - 1.3, 0.0, -2.4], [-0.95, 1.55, -1.05]);
  const lapG = group(null); box(0.36, 0.02, 0.25, std({ color: 0x2a2a2e, metalness: 0.5, roughness: 0.4 }), 0, 0, 0, lapG); const lsc = box(0.36, 0.24, 0.012, new THREE.MeshStandardMaterial({ color: 0x111, emissive: 0x4a6a84, emissiveIntensity: 0.6 }), 0, 0.12, -0.12, lapG); lsc.rotation.x = -0.2;
  mkObj('uWork', lapG, [W / 2 - 0.8, 0.55, -3.3], [-0.45, 1.95, -1.15]);
  const potG = group(null); cyl(0.13, 0.12, 0.14, std({ color: 0x9a9a9a, metalness: 0.8, roughness: 0.3 }), 0, 0.07, 0, potG, 20); cyl(0.14, 0.14, 0.015, std({ color: 0x777777, metalness: 0.8 }), 0, 0.145, 0, potG, 20);
  mkObj('uCook', potG, [W / 2 - 0.65, 0.94, -1.35], [0.15, 2.1, -1.2]);
  const bucket = group(null); cyl(0.15, 0.12, 0.3, std({ color: 0x2f6a9a, roughness: 0.6 }), 0, 0.15, 0, bucket, 18);
  mkObj('uWater', bucket, [W / 2 - 1.6, 0.0, -1.6], [0.75, 1.95, -1.15]);
  const clkObj = card(clockC, 0.3, null);
  mkObj('uTime', clkObj, [0.9, 2.45, -D + 0.3], [1.2, 1.55, -1.05]);
  // three illustrative documents for virtue ethics
  const vdoc = (head, lines, seed) => T.paperText([{ text: head, font: 'Plex Mono', size: 30, weight: 500, letter: '3px', color: '#8a4a22', after: 14 }].concat(lines.map(t => ({ text: t, font: 'Source Sans 3', size: 40, lh: 1.2, after: 10 }))).concat([{ gap: 10 }, { text: 'ILLUSTRATIVE — NOT A KE RECORD', font: 'Plex Mono', size: 22, color: '#8a7c68' }]), { w: 760, h: 760, pad: 56, seed });
  const vd = [
    card(vdoc('HONESTY · OUTAGE NOTICE', ['Known: a fault on your feeder.', 'Uncertain: restoration time.', 'Next update: 21:30.'], 31), 0.36, room),
    card(vdoc('RESPONSIBILITY · COMPLAINT', ['Owner: a named team.', 'Next step: site check.', 'Response: substantive — not “forwarded”.'], 32), 0.36, room),
    card(vdoc('JUDGEMENT · PLAN', ['Hardship weighed with technical limits.', 'Commit only to what can be supported.'], 33), 0.36, room)
  ];
  const vdRest = [[-0.45, 0.8, -1.12, 0.12], [0.05, 0.802, -1.0, -0.05], [0.55, 0.804, -1.1, -0.14]];
  const qFlat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, Math.PI));
  vd.forEach((m, k) => { ANCH['vd' + k] = m; m.visible = false; });
  // a cold spotlight on the bill (deontology)
  const billSpot = new THREE.SpotLight(0xe8eeff, 0, 4, 0.3, 0.6, 1.2); billSpot.position.set(-0.1, 2.9, -1.3); billSpot.target = billG; room.add(billSpot);
  reg('uObjs', 0, v => objs.forEach((o, k) => {
    const e = seg(v, k * 0.1, 0.6 + k * 0.1);
    o.mesh.position.set(lerp(o.rest[0], o.float[0], e), lerp(o.rest[1], o.float[1], e) + Math.sin(e * Math.PI) * 0.3, lerp(o.rest[2], o.float[2], e));
    o.mesh.rotation.y = o.rot.y + e * (k % 2 ? 0.5 : -0.5);
    ANCH[o.name].position.copy(o.mesh.position); ANCH[o.name].position.y += y0 + 0.3;
  }));
  reg('vDocs', 0, v => vd.forEach((m, k) => {
    const e = seg(v, k * 0.15, 0.6 + k * 0.15);
    m.visible = e > 0.001;
    const r0 = vdRest[k];
    m.position.set(r0[0] + (1 - e) * (k - 1) * 0.6, r0[1] + (1 - e) * 1.2, r0[2] - (1 - e) * 0.8);
    m.quaternion.copy(qFlat); m.rotateZ(r0[3] + (1 - e) * 0.8);
  }));
  reg('billSpot', 0, v => { billSpot.intensity = 2.6 * v; });

  // params
  let fanSpeed = 1;
  reg('lamp', 1, v => { lampLight.intensity = 6 * v; shadeMat.emissiveIntensity = 0.9 * v; lampGlow.material.opacity = 0.45 * v; motes.material.opacity = 0.6 * v; });
  reg('tube', 1, v => { tube.material.emissiveIntensity = 2.0 * v; tubeLight.intensity = 7 * v; });
  reg('leds', 1, v => { leds.forEach((l, k) => l.material.color.setRGB(0.36 * v + 0.04, 1 * v + 0.04, 0.6 * v + 0.04)); ledGlow.material.opacity = 0.6 * v; });
  reg('cook', 1, v => { coilMat.emissiveIntensity = 2.2 * v; coilLight.intensity = 1.2 * v; steam.material.opacity = 0.18 * v; });
  reg('fan', 1, v => { fanSpeed = v; });
  reg('moonIn', 0, v => { moonIn.intensity = 40 * v; });
  reg('billLift', 0, v => {
    // the bill lifts off the table and turns toward the camera
    billG.position.set(lerp(-0.12, -0.05, v), lerp(0.795, 1.25, v), lerp(-1.2, -1.75, v));
    bill.quaternion.slerpQuaternions(qA, qB, v);
  });
  let fanAngle = 0;
  TICK.push((dt, t) => {
    fanAngle += dt * fanSpeed * 9;
    hub.rotation.y = fanAngle;
    motes.rotation.y = Math.sin(t * 0.05) * 0.2;
    motes.position.y = Math.sin(t * 0.3) * 0.03;
    curtain.map.offset.x = Math.sin(t * 0.4) * 0.01;
  });

  function metal() { return std({ color: 0x8a8578, metalness: 0.7, roughness: 0.35 }); }
}
