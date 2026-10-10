// Imad's household (illustrative): a cut-away apartment block in
// Gulistan-e-Jauhar. His flat holds the stove, his brother's laptop and
// router, the iron, and a phone with an outage page that shows nothing.
import * as THREE from 'three';
import * as T from '../world/tex.js';
import { reg, std, basic, box, plane, cyl, group, glow, contact, card, seg, lerp, smooth } from '../world/kit.js';
import { anchor, skyline } from './common.js';

export function buildImad(scene, ANCH, TICK) {
  const OFF = [6000, 0, 0];
  const root = group(scene, ...OFF);
  root.visible = false;
  const FW = 5.2, FH = 3.2, FD = 4.6;           // flat width/height/depth
  const cols = 3, rows = 4;
  const shell = std({ map: T.toTex(T.plaster(61, '#d9c7a5'), { repeat: [3, 3] }), roughness: 0.95 });
  const slab = std({ color: 0x9d9282, roughness: 0.9 });
  const ground = plane(200, 200, std({ color: 0x17140f }), 0, 0, 0, root); ground.rotation.x = -Math.PI / 2;
  // block body: slabs and cross walls, front open
  const BW = cols * FW, BH = rows * FH;
  for (let r = 0; r <= rows; r++) box(BW + 0.4, 0.22, FD + 0.4, slab, 0, r * FH, -FD / 2, root);
  for (let c = 0; c <= cols; c++) box(0.22, BH, FD + 0.4, shell, -BW / 2 + c * FW, BH / 2, -FD / 2, root);
  box(BW + 0.4, BH, 0.22, shell, 0, BH / 2, -FD - 0.1, root);
  // slab edges (front faces) for a crisp section-cut look
  const cut = basic({ color: 0x14110e });
  for (let r = 0; r <= rows; r++) box(BW + 0.42, 0.24, 0.02, cut, 0, r * FH, 0.21, root);
  for (let c = 0; c <= cols; c++) box(0.24, BH, 0.02, cut, -BW / 2 + c * FW, BH / 2, 0.21, root);
  // roof tanks
  [-4, 1.5, 5].forEach((x, k) => cyl(0.6, 0.62, 1.3, std({ color: 0x1b1d22 }), x, BH + 0.9, -2 - k * 0.4, root, 16));

  const wallCols = ['#3f7f7a', '#e8a33d', '#b5583a', '#6f8fb0', '#c9b27a', '#8a6fa0', '#7a9a6a', '#d98a6a', '#5a8a9a', '#c26a5a', '#9ab07a', '#e0c08a'];
  const flats = [];
  const lightMats = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x0 = -BW / 2 + c * FW, y0 = r * FH;
    const g = group(root, x0 + FW / 2, y0, 0);
    const col = wallCols[(r * cols + c) % wallCols.length];
    const wm = std({ map: T.toTex(T.plaster(70 + r * 3 + c, col), { repeat: [1, 1] }), roughness: 0.95 });
    plane(FW - 0.25, FH - 0.24, wm, 0, FH / 2, -FD + 0.02, g);
    const L = plane(FD, FH - 0.24, wm, -FW / 2 + 0.12, FH / 2, -FD / 2, g); L.rotation.y = Math.PI / 2;
    const Rr = plane(FD, FH - 0.24, wm, FW / 2 - 0.12, FH / 2, -FD / 2, g); Rr.rotation.y = -Math.PI / 2;
    const fl = plane(FW - 0.25, FD, std({ map: T.toTex(T.tiles(80 + c, '#b8a37f', '#a38e6b', 256, 4), { repeat: [2, 2] }), roughness: 0.6 }), 0, 0.115, -FD / 2, g); fl.rotation.x = -Math.PI / 2;
    // ceiling light panel (emissive) for every flat
    const lm = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: r * cols + c === 4 ? 0xfff0d8 : (c + r) % 2 ? 0xffe2b0 : 0xe8f2ff, emissiveIntensity: 1.6 });
    lightMats.push(lm);
    box(1.0, 0.04, 0.12, lm, 0, FH - 0.16, -FD + 0.4, g);
    // back window with glow of the night outside
    const win = plane(1.4, 1.1, basic({ color: 0x1a2440 }), (c - 1) * 0.6, 1.8, -FD + 0.04, g);
    // generic furniture silhouettes in the neighbours' flats
    if (r * cols + c !== 4) {
      const fm = std({ color: new THREE.Color(col).multiplyScalar(0.45) });
      box(1.4, 0.5, 0.7, fm, -1.2, 0.36, -FD + 0.6, g); box(0.8, 0.75, 0.5, fm, 1.4, 0.48, -FD + 0.5, g);
      if ((r + c) % 2) { box(0.06, 1.4, 0.06, fm, 1.8, 0.8, -1.5, g); }
    }
    flats.push({ g, r, c });
  }
  // Imad's flat is the centre of row 1 (index 4): x = 0, y0 = FH
  const home = group(root, 0, FH, 0);
  anchor(root, 'imadFlat', 0, FH + 2.6, -1, ANCH);
  const wood = std({ map: T.toTex(T.wood(64, '#6a4428')), roughness: 0.55 });
  // kitchen counter + stove (left)
  box(1.6, 0.9, 0.6, std({ color: 0x6c645a }), -1.6, 0.56, -FD + 0.42, home);
  box(1.64, 0.04, 0.64, std({ color: 0x2b2a28, roughness: 0.3 }), -1.6, 1.02, -FD + 0.42, home);
  const flameMat = new THREE.MeshStandardMaterial({ color: 0x0a0a20, emissive: 0x3a7aff, emissiveIntensity: 2.5 });
  const flame = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 6, 20), flameMat); flame.rotation.x = Math.PI / 2; flame.position.set(-1.9, 1.06, -FD + 0.45); home.add(flame);
  const pan = cyl(0.16, 0.14, 0.08, std({ color: 0x2a2a2a, metalness: 0.7, roughness: 0.4 }), -1.9, 1.12, -FD + 0.45, home, 20);
  const stoveGlow = glow('90,140,255', 0.5, home, -1.9, 1.08, -FD + 0.45, 0.7);
  anchor(root, 'imadStove', -1.9, FH + 1.2, -FD + 0.45, ANCH);
  // desk with laptop (remote work) on the right
  box(1.3, 0.05, 0.65, wood, 1.4, 0.82, -FD + 0.5, home);
  [[0.6, -0.28], [2.0, -0.28], [0.6, 0.28], [2.0, 0.28]].forEach(([x, z]) => box(0.04, 0.72, 0.04, wood, x, 0.45, -FD + 0.5 + z, home));
  const lap = group(home, 1.35, 0.85, -FD + 0.5);
  box(0.42, 0.02, 0.28, std({ color: 0x2a2a2e, metalness: 0.5, roughness: 0.4 }), 0, 0.01, 0, lap);
  const scrC = (() => { const [c, g] = T.canvas(512, 320); g.fillStyle = '#16202c'; g.fillRect(0, 0, 512, 320); g.fillStyle = '#26384c'; g.fillRect(0, 0, 512, 34); [[16, 50], [180, 50], [344, 50], [16, 186], [180, 186], [344, 186]].forEach(([x, y]) => { g.fillStyle = '#2f4a62'; g.fillRect(x, y, 152, 120); g.fillStyle = '#4a6a84'; g.beginPath(); g.arc(x + 76, y + 52, 22, 0, 7); g.fill(); g.fillRect(x + 46, y + 80, 60, 26); }); return c; })();
  const scrMat = new THREE.MeshBasicMaterial({ map: T.toTex(scrC) });
  const scr = plane(0.42, 0.26, scrMat, 0, 0.14, -0.14, lap); scr.rotation.x = -0.15;
  box(0.43, 0.27, 0.01, std({ color: 0x2a2a2e }), 0, 0.14, -0.147, lap).rotation.x = -0.15;
  const lapGlow = glow('140,190,255', 0.9, lap, 0, 0.16, -0.05, 0.35);
  anchor(root, 'imadLaptop', 1.35, FH + 1.15, -FD + 0.4, ANCH);
  const router = box(0.2, 0.05, 0.14, std({ color: 0x18181a }), 2.0, 0.875, -FD + 0.3, home);
  const rLeds = []; for (let k = 0; k < 3; k++) rLeds.push(box(0.012, 0.01, 0.01, new THREE.MeshBasicMaterial({ color: 0x5dff9b }), 1.94 + k * 0.05, 0.9, -FD + 0.23, home));
  anchor(root, 'imadRouter', 2.0, FH + 1.0, -FD + 0.3, ANCH);
  // ironing board + iron
  const ib = group(home, -0.5, 0, -2.0);
  box(1.2, 0.03, 0.34, std({ color: 0xc9c2b0 }), 0, 0.85, 0, ib);
  box(0.03, 0.85, 0.03, std({ color: 0x555555, metalness: 0.7 }), -0.3, 0.42, 0, ib).rotation.z = 0.5;
  box(0.03, 0.85, 0.03, std({ color: 0x555555, metalness: 0.7 }), 0.3, 0.42, 0, ib).rotation.z = -0.5;
  const iron = box(0.24, 0.1, 0.12, std({ color: 0x3f7f9a, roughness: 0.4 }), 0.25, 0.92, 0, ib);
  const ironLed = box(0.02, 0.02, 0.02, new THREE.MeshBasicMaterial({ color: 0xff5a2a }), 0.25, 0.98, 0.06, ib);
  ib.rotation.y = 0.3;
  anchor(root, 'imadIron', -0.4, FH + 1.2, -2.0, ANCH);
  // table with the phone (the outage page)
  box(1.0, 0.05, 0.6, wood, 0.4, 0.72, -0.9, home);
  [[-0.05, -0.25], [0.85, -0.25], [-0.05, 0.25], [0.85, 0.25]].forEach(([x, z]) => box(0.04, 0.62, 0.04, wood, x, 0.4, -0.9 + z, home));
  const phone = group(home, 0.4, 0.76, -0.9);
  box(0.16, 0.012, 0.32, std({ color: 0x0c0c0e, roughness: 0.3 }), 0, 0, 0, phone);
  const appC = (() => {
    const [c, g] = T.canvas(400, 800);
    g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, 400, 800);
    g.fillStyle = '#1d1b19'; g.fillRect(0, 0, 400, 110);
    g.fillStyle = '#f0ad45'; g.font = '500 30px "Plex Mono"'; g.fillText('OUTAGE UPDATES', 28, 70);
    g.fillStyle = '#2a2622'; g.font = '600 34px "Source Sans 3"'; g.fillText('Your area', 28, 170);
    g.fillStyle = '#ddd5c4'; for (let i = 0; i < 4; i++) g.fillRect(28, 210 + i * 100, 344, 76);
    g.fillStyle = '#8a7c68'; g.font = '400 30px "Source Sans 3"'; g.fillText('No interruption listed', 52, 258);
    g.font = '500 22px "Plex Mono"'; g.fillStyle = '#a3311f'; g.fillText('ILLUSTRATIVE SCREEN', 28, 760);
    return c;
  })();
  const appMat = new THREE.MeshBasicMaterial({ map: T.toTex(appC) });
  const appScr = plane(0.145, 0.29, appMat, 0, 0.008, 0, phone); appScr.rotation.x = -Math.PI / 2;
  const phoneGlow = glow('255,250,235', 0.6, phone, 0, 0.05, 0, 0.0);
  anchor(root, 'imadPhone', 0.4, FH + 0.85, -0.9, ANCH);
  const flatL = new THREE.PointLight(0xffe8c8, 12, 8, 1.5); flatL.position.set(0, 2.7, -2.2); home.add(flatL);
  const phoneL = new THREE.PointLight(0xdde6ff, 0, 2.4, 2); phoneL.position.set(0.4, 0.95, -0.9); home.add(phoneL);
  contact(1.8, 1.2, home, 0.4, 0.12, -0.9, 0.4);

  // chat bubbles (as he described the responses) — float up from the phone
  const bubble = (txt, seed) => { const [c, g] = T.canvas(900, 220); g.fillStyle = '#efe6d2'; g.beginPath(); g.roundRect(10, 10, 880, 170, 60); g.fill(); g.beginPath(); g.moveTo(110, 175); g.lineTo(80, 215); g.lineTo(170, 175); g.fill(); g.fillStyle = '#2a2622'; g.font = 'italic 400 64px Fraunces'; g.fillText(txt, 60, 118); return c; };
  const b1 = card(bubble('Work is underway.'), 0.85, root); b1.material = new THREE.MeshBasicMaterial({ map: b1.material.map, transparent: true, depthWrite: false });
  const b2 = card(bubble('Your complaint has been forwarded.'), 1.1, root); b2.material = new THREE.MeshBasicMaterial({ map: b2.material.map, transparent: true, depthWrite: false });
  b1.renderOrder = 5; b2.renderOrder = 5;
  ANCH.bub1 = b1; ANCH.bub2 = b2;

  // outside: street light poles, background city
  skyline(root, { seed: 66, r0: 60, r1: 150, n: 110, lit: 0.3 });
  const hemi = new THREE.HemisphereLight(0x7a8aba, 0x24201c, 1.1); root.add(hemi);
  const moonL = new THREE.DirectionalLight(0x8fa6dd, 1.1); moonL.position.set(-20, 30, 40); root.add(moonL);
  const streetL = new THREE.SpotLight(0xff9a48, 50, 30, 0.8, 0.7, 1.4); streetL.position.set(-10, 8, 8); streetL.target.position.set(-2, 0, 0); root.add(streetL, streetL.target);
  const sodium = glow('255,170,90', 2.5, root, -10, 8, 8, 0.9);
  cyl(0.12, 0.16, 8, std({ color: 0x5a564f }), -10, 4, 8.6, root, 8);

  // params
  reg('imPower', 1, v => {
    lightMats.forEach((m, k) => { m.emissiveIntensity = 1.6 * v; });
    flatL.intensity = 12 * v; flameMat.emissiveIntensity = 2.5 * v; stoveGlow.material.opacity = 0.7 * v;
    scrMat.color.setScalar(lerp(0.04, 1, v)); lapGlow.material.opacity = 0.35 * v;
    rLeds.forEach(l => l.material.color.setRGB(0.36 * v + 0.04, v + 0.04, 0.6 * v + 0.04));
    ironLed.material.color.setRGB(v + 0.05, 0.35 * v + 0.03, 0.16 * v + 0.03);
    streetL.intensity = 50 * v; sodium.material.opacity = 0.9 * v;
  });
  reg('imPhone', 0, v => { phoneL.intensity = 1.0 * v; phoneGlow.material.opacity = 0.18 * v; appMat.color.setScalar(lerp(0.15, 0.62, Math.max(v, 0.15))); });
  let chatV = 0;
  reg('imChat', 0, v => { chatV = v; });
  TICK.push((dt, t) => {
    if (!root.visible) return;
    // bubbles drift up and loop, always facing the camera’s general direction
    const a1 = seg(chatV, 0, 0.5), a2 = seg(chatV, 0.35, 0.9);
    b1.visible = a1 > 0.01; b2.visible = a2 > 0.01;
    b1.material.opacity = a1; b2.material.opacity = a2;
    b1.position.set(0.95 + Math.sin(t * 0.6) * 0.02, FH + 1.25 + a1 * 0.25 + Math.sin(t * 0.8) * 0.015, -1.0);
    b2.position.set(0.3 + Math.sin(t * 0.5 + 1) * 0.02, FH + 1.62 + a2 * 0.2 + Math.sin(t * 0.7 + 2) * 0.015, -1.4);
  });

  return { root, offset: OFF, exitPush: 4, p: { fog: 0.01 } };
}
