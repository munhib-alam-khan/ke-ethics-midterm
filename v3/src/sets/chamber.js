// Illustrative committee room: horseshoe of faceless members, a witness table
// with an empty spotlit chair, representatives who walk out through a lit door.
import * as THREE from 'three';
import * as T from '../world/tex.js';
import { reg, std, basic, box, plane, cyl, group, glow, contact, card, seg, lerp } from '../world/kit.js';
import { figure, walkPose, shaft, anchor, labelCanvas } from './common.js';

export function buildChamber(scene, ANCH, TICK) {
  const OFF = [2000, 0, 0];
  const root = group(scene, ...OFF);
  root.visible = false;
  const wood = std({ map: T.toTex(T.wood(21, '#5a3420'), { repeat: [6, 1] }), roughness: 0.55 });
  const woodD = std({ map: T.toTex(T.wood(22, '#3a2214'), { repeat: [4, 1] }), roughness: 0.5, side: THREE.DoubleSide });
  const carpet = std({ map: T.toTex(T.plaster(23, '#2c4a39'), { repeat: [8, 8] }), roughness: 1 });
  const fl = plane(60, 60, carpet, 0, 0, 0, root); fl.rotation.x = -Math.PI / 2;
  // panelled back wall
  const panelTex = T.toTex((() => { const [c, g] = T.canvas(512, 512); g.drawImage(T.wood(24, '#4a2a18'), 0, 0); g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 6; for (let x = 0; x <= 512; x += 128) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 512); g.stroke(); } g.strokeStyle = 'rgba(255,220,170,.12)'; g.lineWidth = 3; for (let x = 16; x < 512; x += 128) g.strokeRect(x, 40, 96, 432); return c; })(), { repeat: [14, 1] });
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(13, 13, 8, 64, 1, true, 0.2 * Math.PI, 1.6 * Math.PI), std({ map: panelTex, roughness: 0.6, side: THREE.BackSide }));
  wall.position.y = 4; root.add(wall);
  const ceil = plane(60, 60, std({ color: 0x14100d }), 0, 8, 0, root); ceil.rotation.x = Math.PI / 2;
  // emblem: abstract gold roundel (no real insignia)
  const emb = T.toTex((() => { const [c, g] = T.canvas(512, 512); g.translate(256, 256); g.strokeStyle = '#d8b46a'; g.fillStyle = '#d8b46a'; g.lineWidth = 14; g.beginPath(); g.arc(0, 0, 230, 0, 7); g.stroke(); g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 196, 0, 7); g.stroke(); for (let i = 0; i < 24; i++) { g.save(); g.rotate(i / 24 * Math.PI * 2); g.fillRect(-6, -180, 12, 50); g.restore(); } g.beginPath(); g.arc(0, 0, 90, 0, 7); g.fill(); return c; })());
  emb.wrapS = emb.wrapT = THREE.ClampToEdgeWrapping;
  const embM = plane(2.6, 2.6, new THREE.MeshStandardMaterial({ map: emb, transparent: true, metalness: 0.8, roughness: 0.3, emissive: 0x6a4a1a, emissiveMap: emb, emissiveIntensity: 0.4 }), 0, 5.2, -12.8, root);

  // horseshoe desk
  const th0 = 0.38 * Math.PI, thL = 1.24 * Math.PI;
  const front = new THREE.Mesh(new THREE.CylinderGeometry(6.6, 6.6, 0.95, 64, 1, true, th0, thL), woodD); front.position.y = 0.48; root.add(front);
  const back = new THREE.Mesh(new THREE.CylinderGeometry(7.7, 7.7, 0.95, 64, 1, true, th0, thL), woodD); back.position.y = 0.48; root.add(back);
  // RingGeometry angle a maps to direction (cos a, -sin a) after rotation; cylinder θ maps to (sin θ, cos θ)
  const top = new THREE.Mesh(new THREE.RingGeometry(6.5, 7.8, 64, 1, Math.PI / 2 - th0 - thL, thL), std({ color: 0x2a1a10, roughness: 0.35 }));
  top.rotation.x = -Math.PI / 2; top.position.y = 0.96; root.add(top);
  // members (faceless), nameplates, microphones
  const members = [];
  const ledMat = basic({ color: 0xff3b2a });
  const n = 9;
  for (let i = 0; i < n; i++) {
    const th = th0 + 0.08 * thL + (i / (n - 1)) * thL * 0.84;
    const dx = Math.sin(th), dz = Math.cos(th);
    const f = figure(root, { seated: true, color: [0x26282e, 0x2e2a26, 0x1f2a2c][i % 3], skin: [0x8a7564, 0x6f5c4d, 0x9a8470][i % 3] });
    f.position.set(dx * 8.3, 0.0, dz * 8.3); f.lookAt(0, 0, 0);
    const chm = std({ color: 0x5a1f1f, roughness: 0.8 }); box(0.55, 0.45, 0.5, chm, 0, 0.23, 0.1, f); box(0.6, 1.2, 0.1, chm, 0, 0.95, -0.2, f);
    // gooseneck mic
    const mic = group(root, dx * 7.25, 0.97, dz * 7.25);
    const stem = cyl(0.01, 0.01, 0.45, std({ color: 0x222222, metalness: 0.8 }), 0, 0.22, 0, mic, 6); stem.rotation.x = 0.4;
    const led = box(0.03, 0.03, 0.03, ledMat, 0, 0.44, 0.08, mic);
    members.push(f);
    // nameplate
    const np = card(labelCanvas([{ text: i === 4 ? 'CHAIR' : 'MEMBER', font: 'Plex Mono', size: 70, weight: 500, letter: '8px', color: '#efe6d2' }], { w: 512, h: 160, bg: '#1d1611', pad: 30 }), 0.6, root);
    np.position.set(dx * 6.62, 0.75, dz * 6.62); np.lookAt(dx * 3, 0.75, dz * 3);
  }

  // witness table
  const wt = group(root, 0, 0, 4.2);
  box(5.6, 0.07, 1.0, std({ color: 0x3a2214, roughness: 0.4 }), 0, 0.78, 0, wt);
  box(5.6, 0.7, 0.05, woodD, 0, 0.42, -0.48, wt);
  const chairs = [];
  [-2.2, -1.1, 0, 1.1, 2.2].forEach((x, k) => {
    const c = group(wt, x, 0, 0.75);
    const cm = std({ color: k === 2 ? 0x6a2a24 : 0x4a1f1c, roughness: 0.7 });
    box(0.55, 0.1, 0.55, cm, 0, 0.5, 0, c); box(0.55, 0.75, 0.1, cm, 0, 0.92, 0.25, c);
    cyl(0.03, 0.03, 0.45, std({ color: 0x222222, metalness: 0.8 }), 0, 0.25, 0, c, 6);
    chairs.push(c);
    // microphones on the table
    const m = cyl(0.01, 0.01, 0.4, std({ color: 0x222222, metalness: 0.8 }), x, 0.98, -0.25, wt, 6); m.rotation.x = -0.4;
  });
  // nameplate on the empty chair's place (illustrative, readable both sides)
  const plate = labelCanvas([{ text: 'CHIEF EXECUTIVE', font: 'Plex Mono', size: 58, weight: 500, letter: '6px', color: '#efe6d2' }], { w: 640, h: 140, bg: '#1d1611', pad: 30 });
  const np1 = card(plate, 0.9, wt); np1.position.set(0, 0.89, -0.3); np1.rotation.y = Math.PI;
  const np2 = card(plate, 0.9, wt); np2.position.set(0, 0.89, -0.28);
  anchor(root, 'ceoChair', 0, 1.9, 4.95, ANCH);
  anchor(root, 'committee', 0, 2.2, -8.3, ANCH);

  // representatives (faceless, standing), walk out when asked to leave
  const reps = [-2.2, -1.1, 1.1].map((x, k) => {
    const f = figure(root, { color: [0x1f2633, 0x2a2a2a, 0x25303a][k], skin: [0x7d6a58, 0x8b7766, 0x6e5b4b][k] });
    f.position.set(x, 0, 5.3); f.rotation.y = Math.PI;
    return { f, x };
  });
  anchor(root, 'reps', -1.1, 2.3, 5.3, ANCH);
  // door, stage right
  const DX = -9.5, DZ = 8.0;
  const doorG = group(root, DX, 0, DZ); doorG.rotation.y = Math.PI / 2.6;
  box(1.8, 3.0, 0.3, woodD, -1.1, 1.5, 0, doorG); box(1.8, 3.0, 0.3, woodD, 1.1, 1.5, 0, doorG);
  box(4.0, 0.5, 0.3, woodD, 0, 3.25, 0, doorG);
  const doorLight = plane(1.6, 3.0, new THREE.MeshBasicMaterial({ color: 0xffe2b0 }), 0, 1.5, -0.05, doorG);
  const doorGlow = glow('255,220,170', 6, doorG, 0, 1.5, 0.3, 0.5);
  const doorL = new THREE.PointLight(0xffd8a0, 20, 14, 1.6); doorL.position.set(0, 1.8, 1.2); doorG.add(doorL);
  // floor light spill from the door
  const spill = plane(2.0, 6, new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false }), 0, 0.02, 3, doorG); spill.rotation.x = -Math.PI / 2;
  anchor(root, 'door', DX, 3.2, DZ, ANCH);
  const doorWorld = new THREE.Vector3(DX - 0.6, 0, DZ - 0.3);

  // lights
  const hemi = new THREE.HemisphereLight(0x8a7a70, 0x221c18, 0.8); root.add(hemi);
  const key = new THREE.SpotLight(0xffd2a0, 260, 30, 0.8, 0.6, 1.3); key.position.set(0, 12, -2); key.target.position.set(0, 0, -6); root.add(key, key.target);
  const fill = new THREE.SpotLight(0xa8b8ff, 60, 30, 0.9, 0.8, 1.4); fill.position.set(-8, 8, 12); fill.target.position.set(0, 0, 3); root.add(fill, fill.target);
  const cold = new THREE.SpotLight(0xdfe8ff, 0, 12, 0.22, 0.5, 1.2); cold.position.set(0, 7.5, 5.0); cold.target.position.set(0, 0.5, 4.95); root.add(cold, cold.target);
  const coldShaft = shaft(root, 0, 3.8, 4.95, 0.12, 0.9, 7.4, 0xdfe8ff, 0);
  const wallWash = new THREE.SpotLight(0xffb070, 60, 30, 0.6, 0.8, 1.2); wallWash.position.set(0, 1, -4); wallWash.target.position.set(0, 6, -13); root.add(wallWash, wallWash.target);
  // dust in the light
  const dg = new THREE.BufferGeometry(); const dp = []; const r = T.rng(8);
  for (let k = 0; k < 400; k++) dp.push((r() - 0.5) * 3, r() * 7, 4.95 + (r() - 0.5) * 3);
  dg.setAttribute('position', new THREE.Float32BufferAttribute(dp, 3));
  const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xdfe8ff, size: 0.02, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  root.add(dust);

  reg('chEmpty', 0, v => { cold.intensity = 160 * v; coldShaft.material.uniforms.uO.value = 0.1 * v; dust.material.opacity = 0.5 * v; });
  reg('chKey', 1, v => { key.intensity = 260 * v; wallWash.intensity = 60 * v; fill.intensity = 60 * v; hemi.intensity = 0.8 * v + 0.08; });
  reg('chDoor', 0.4, v => { doorL.intensity = 20 * v; doorGlow.material.opacity = 0.5 * v; doorLight.material.color.setRGB(lerp(0.15, 1, v), lerp(0.12, 0.89, v), lerp(0.1, 0.7, v)); spill.material.opacity = 0.18 * v; });
  // leave: 0 = standing at the table, 1 = gone through the door
  const path = reps.map(({ x }, k) => new THREE.CatmullRomCurve3([new THREE.Vector3(x, 0, 5.3), new THREE.Vector3(x - 0.4, 0, 6.6), new THREE.Vector3(-5.5, 0, 7.6 + k * 0.3), new THREE.Vector3(DX + 0.4, 0, DZ + 0.5), new THREE.Vector3(DX - 1.6, 0, DZ + 2.0)]));
  let leaveV = 0;
  reg('chLeave', 0, v => { leaveV = v; });
  reg('chTurn', 0, v => { reps.forEach(({ f }) => { if (leaveV < 0.001) f.rotation.y = Math.PI - v * 0.0; }); });
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  let last = -1;
  TICK.push((dt, t) => {
    if (!root.visible) return;
    reps.forEach(({ f, x }, k) => {
      const u = Math.max(0, Math.min(1, leaveV * 1.25 - k * 0.12));
      path[k].getPointAt(Math.min(0.999, u), tmp);
      path[k].getPointAt(Math.min(1, u + 0.01), tmp2);
      f.position.copy(tmp);
      if (u > 0.001) { f.rotation.y = Math.atan2(tmp2.x - tmp.x, tmp2.z - tmp.z); walkPose(f, u * 60, Math.min(1, u * 8) * (u < 0.995 ? 1 : 0)); }
      else { f.rotation.y = Math.PI; walkPose(f, 0, 0); }
      f.visible = u < 0.995;
    });
  });

  return { root, offset: OFF, exitPush: 5, p: { fog: 0.014, bloom: 0.6, exposure: 1.5 } };
}
