// Gulshan rooftops at dusk (illustrative): tanks, a pump, a UPS battery, a
// flickering bulb — then two neighbouring windows: one with backup, one without.
import * as THREE from 'three';
import * as T from '../world/tex.js';
import { reg, std, basic, box, plane, cyl, group, glow, contact, card, seg, lerp } from '../world/kit.js';
import { anchor, skyline } from './common.js';

export function buildRoofs(scene, ANCH, TICK) {
  const OFF = [8000, 0, 0];
  const root = group(scene, ...OFF);
  root.visible = false;
  const pal = ['#e8c39a', '#bcd6c8', '#e7b3a1', '#e2d39a', '#b3c8de', '#efe0bf', '#d8b4c8', '#c9d79f'];
  const r = T.rng(81);
  const tank = std({ color: 0x1b1d22, roughness: 0.5 });
  const ground = plane(400, 400, std({ color: 0x15120e }), 0, 0, 0, root); ground.rotation.x = -Math.PI / 2;
  const blocks = [];
  // a 7 x 7 grid of houses with lanes
  for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) {
    if (i === 0 && j === 1) continue;          // reserved: the two feature houses
    const w = 7 + r() * 1.5, d = 9 + r() * 2, h = 6.8 + Math.floor(r() * 3) * 3.4;
    const x = i * 10 + (r() - 0.5), z = j * 12 + (r() - 0.5);
    const col = pal[Math.floor(r() * pal.length)];
    const m = std({ map: T.toTex(T.plaster(90 + i * 7 + j, col), { repeat: [1, 1] }), roughness: 0.95 });
    box(w, h, d, m, x, h / 2, z, root);
    box(w, 0.8, 0.15, m, x, h + 0.4, z + d / 2, root); box(w, 0.8, 0.15, m, x, h + 0.4, z - d / 2, root);
    box(0.15, 0.8, d, m, x - w / 2, h + 0.4, z, root); box(0.15, 0.8, d, m, x + w / 2, h + 0.4, z, root);
    const nt = 1 + Math.floor(r() * 3);
    for (let k = 0; k < nt; k++) { const s = 0.5 + r() * 0.3; cyl(s, s, s * 2.2, tank, x - w / 2 + 1.2 + r() * (w - 2.4), h + s * 1.1, z - d / 2 + 1.2 + r() * (d - 2.4), root, 14); }
    // a lit window or two on the facades facing the camera
    if (r() < 0.6) { const wm = new THREE.MeshStandardMaterial({ color: 0x080808, emissive: r() < 0.5 ? 0xffc078 : 0xd8f0ff, emissiveIntensity: 0.9 }); plane(1.6, 1.1, wm, x + (r() - 0.5) * 3, h - 1.8, z + d / 2 + 0.02, root); blocks.push(wm); }
  }
  // feature roof (near camera): tanks, motor pump, UPS + battery, a bulb
  const FX = 0, FZ = 12, FH = 6.8;
  const fm = std({ map: T.toTex(T.plaster(99, '#e7b3a1'), { repeat: [1, 1] }), roughness: 0.95 });
  // two neighbouring houses side by side, front facades toward +z
  const hA = group(root, -4.1, 0, FZ), hB = group(root, 4.1, 0, FZ);
  [[hA, '#e2d39a'], [hB, '#b3c8de']].forEach(([g, col], k) => {
    const m = std({ map: T.toTex(T.plaster(97 + k, col), { repeat: [1, 1] }), roughness: 0.95 });
    box(8, FH, 10, m, 0, FH / 2, 0, g);
    box(8, 0.8, 0.15, m, 0, FH + 0.4, 5, g);
    box(0.15, 0.8, 10, m, -4, FH + 0.4, 0, g); box(0.15, 0.8, 10, m, 4, FH + 0.4, 0, g);
    box(8.1, 0.2, 0.3, std({ color: new THREE.Color(col).multiplyScalar(0.8) }), 0, 3.4, 5.1, g);
  });
  // windows: A has a dim UPS-powered bulb; B is dark with a candle
  const winA = new THREE.MeshStandardMaterial({ color: 0x0a0806, emissive: 0xffc27a, emissiveIntensity: 0.0 });
  const winB = new THREE.MeshStandardMaterial({ color: 0x0a0806, emissive: 0xff9a40, emissiveIntensity: 0.0 });
  const wA = plane(2.4, 1.6, winA, 0, 4.9, 5.03, hA), wB = plane(2.4, 1.6, winB, 0, 4.9, 5.03, hB);
  const grille = T.toTex(T.grille(512, '#0f0c0b', 5)); grille.wrapS = grille.wrapT = THREE.ClampToEdgeWrapping;
  const gm = new THREE.MeshStandardMaterial({ map: grille, transparent: true, alphaTest: 0.4 });
  plane(2.4, 1.6, gm, 0, 4.9, 5.09, hA); plane(2.4, 1.6, gm, 0, 4.9, 5.09, hB);
  box(2.7, 0.12, 0.2, std({ color: 0x2a211b }), 0, 4.02, 5.05, hA); box(2.7, 0.12, 0.2, std({ color: 0x2a211b }), 0, 4.02, 5.05, hB);
  const bulbA = glow('255,200,130', 1.4, hA, 0.4, 5.2, 5.2, 0);
  const candleB = glow('255,150,60', 0.5, hB, -0.5, 4.4, 5.2, 0);
  const lA = new THREE.PointLight(0xffc27a, 0, 7, 1.6); lA.position.set(0, 4.9, 6.2); hA.add(lA);
  const lB = new THREE.PointLight(0xff9a40, 0, 3, 1.8); lB.position.set(-0.5, 4.4, 5.8); hB.add(lB);
  anchor(root, 'withUPS', -4.1, 6.3, FZ + 5.2, ANCH);
  anchor(root, 'withoutUPS', 4.1, 6.3, FZ + 5.2, ANCH);
  // roof props on house A (UPS + battery) and B (tank + pump)
  const ups = group(hA, 1.6, FH, 2.5);
  box(0.5, 0.7, 0.4, std({ color: 0x24262b, roughness: 0.5 }), 0, 0.35, 0, ups);
  const upsLed = box(0.05, 0.05, 0.02, new THREE.MeshBasicMaterial({ color: 0x5dff9b }), 0.1, 0.58, 0.21, ups);
  const bat = box(0.7, 0.45, 0.35, std({ color: 0x3a3f8a, roughness: 0.5 }), -0.7, 0.23, 0, ups);
  box(0.06, 0.06, 0.06, std({ color: 0xb23a2a }), -0.95, 0.48, 0, ups); box(0.06, 0.06, 0.06, std({ color: 0x222222 }), -0.45, 0.48, 0, ups);
  anchor(root, 'ups', -4.1 + 1.2, FH + 1.0, FZ + 2.5, ANCH);
  [[-2, 0.8], [0.2, -2]].forEach(([x, z]) => cyl(0.7, 0.72, 1.6, tank, x, FH + 0.8, z, hB, 18));
  const pump = group(hB, 2.0, FH, 2.0);
  cyl(0.18, 0.18, 0.5, std({ color: 0x2f6a8a, metalness: 0.4, roughness: 0.5 }), 0, 0.25, 0, pump, 14).rotation.z = Math.PI / 2;
  box(0.3, 0.12, 0.5, std({ color: 0x333333 }), 0, 0.06, 0, pump);
  const pipe = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(2, FH + 0.3, 2), new THREE.Vector3(1, FH + 0.3, 1.5), new THREE.Vector3(-1.4, FH + 1.6, 0.9)]), 20, 0.04, 6), std({ color: 0xd8d4c8 }));
  hB.add(pipe);
  anchor(root, 'pump', 4.1 + 2.0, FH + 0.9, FZ + 2.0, ANCH);
  // a bare bulb on a wire between the roofs that flickers (voltage)
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0xffd79a, emissiveIntensity: 2 }));
  bulb.position.set(0, FH + 2.1, FZ + 3.8); root.add(bulb);
  const bulbG = glow('255,215,150', 1.4, root, 0, FH + 2.1, FZ + 3.8, 0.8);
  const bulbL = new THREE.PointLight(0xffd79a, 4, 9, 1.6); bulbL.position.copy(bulb.position); root.add(bulbL);
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-3.5, FH + 2.8, FZ + 3.8), new THREE.Vector3(0, FH + 2.3, FZ + 3.8), new THREE.Vector3(3.5, FH + 2.9, FZ + 3.8)]), 20, 0.012, 5), basic({ color: 0x111111 }));
  root.add(cable);
  anchor(root, 'bulb', 0, FH + 2.4, FZ + 3.8, ANCH);

  skyline(root, { seed: 88, r0: 90, r1: 200, n: 120, lit: 0.25, hMax: 40 });
  const hemi = new THREE.HemisphereLight(0xffb48a, 0x2a2440, 0.7); root.add(hemi);
  const sun = new THREE.DirectionalLight(0xff9a6a, 1.2); sun.position.set(-40, 12, -30); root.add(sun);
  const rim = new THREE.DirectionalLight(0x8090ff, 0.4); rim.position.set(30, 30, 40); root.add(rim);

  let flick = 1, comp = 0;
  reg('rfVolt', 0, v => { flick = v; });
  reg('rfComp', 0, v => {
    comp = v;
    winA.emissiveIntensity = 0.55 * v; lA.intensity = 6 * v; bulbA.material.opacity = 0.7 * v;
    winB.emissiveIntensity = 0.06 * v; lB.intensity = 0.8 * v; candleB.material.opacity = 0.9 * v;
  });
  reg('rfSun', 1, v => { sun.intensity = 1.2 * v; hemi.intensity = 0.25 + 0.45 * v; blocks.forEach(m => { m.emissiveIntensity = 0.9 * (1.2 - v * 0.6); }); });
  TICK.push((dt, t) => {
    if (!root.visible) return;
    const n = Math.sin(t * 13) * Math.sin(t * 7.3 + 1) * Math.sin(t * 2.1);
    const k = 1 - flick * (n > 0.3 ? 0.85 : n > 0 ? 0.3 : 0);
    bulb.material.emissiveIntensity = 2 * k; bulbG.material.opacity = 0.8 * k; bulbL.intensity = 4 * k;
    candleB.scale.setScalar(0.5 + Math.sin(t * 17) * 0.04 + Math.sin(t * 5) * 0.03);
    upsLed.material.color.setRGB(0.3, 1, 0.5).multiplyScalar(0.6 + 0.4 * Math.sin(t * 3));
  });

  return { root, offset: OFF, exitPush: 4, p: { dusk: 1, fog: 0.008, night: 0.4 } };
}
