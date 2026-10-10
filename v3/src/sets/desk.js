// The evidence desk (noir): documents, interview cards, company-reported
// slips and the regulator's order (paraphrase) arrive as physical paper.
import * as THREE from 'three';
import * as T from '../world/tex.js';
import { reg, std, basic, box, plane, cyl, group, glow, contact, card, seg, lerp, smooth } from '../world/kit.js';
import { anchor, shaft } from './common.js';

export function buildDesk(scene, ANCH, TICK) {
  const OFF = [4000, 0, 0];
  const root = group(scene, ...OFF);
  root.visible = false;
  const Y = 0.9;
  const fl = plane(40, 40, std({ map: T.toTex(T.wood(31, '#2a1a12'), { repeat: [10, 10] }), roughness: 0.7 }), 0, 0, 0, root); fl.rotation.x = -Math.PI / 2;
  const deskMat = std({ map: T.toTex(T.wood(32, '#5b3a24'), { repeat: [2, 1] }), roughness: 0.45 });
  box(4.6, 0.08, 2.8, deskMat, 0, Y - 0.04, 0, root);
  box(4.4, 0.8, 2.6, std({ color: 0x2a1a10 }), 0, (Y - 0.08) / 2, 0, root);
  // leather blotter
  const blot = plane(2.2, 1.4, std({ color: 0x24382e, roughness: 0.85 }), 0, Y + 0.002, 0.15, root); blot.rotation.x = -Math.PI / 2;
  // walls
  const wallMat = std({ map: T.toTex(T.plaster(33, '#3b3f44'), { repeat: [4, 2] }), roughness: 1 });
  plane(30, 10, wallMat, 0, 5, -5, root);
  const side = plane(30, 10, wallMat, -9, 5, 0, root); side.rotation.y = Math.PI / 2;

  // banker's lamp
  const lamp = group(root, -1.7, Y, -0.9);
  cyl(0.16, 0.18, 0.04, std({ color: 0x8a6a2a, metalness: 0.9, roughness: 0.3 }), 0, 0.02, 0, lamp, 20);
  cyl(0.015, 0.015, 0.42, std({ color: 0x8a6a2a, metalness: 0.9, roughness: 0.3 }), 0, 0.23, 0, lamp, 8);
  const shadeMat = new THREE.MeshStandardMaterial({ color: 0x0f5a3a, emissive: 0x0f6a40, emissiveIntensity: 0.4, metalness: 0.2, roughness: 0.3, side: THREE.DoubleSide });
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.24, 0.14, 24, 1, true, 0, Math.PI), shadeMat); shade.position.set(0, 0.46, 0.05); shade.rotation.x = Math.PI / 2; shade.rotation.z = 0; lamp.add(shade);
  const bulbGlow = glow('255,214,150', 0.6, lamp, 0, 0.42, 0.1, 0.8);
  const lampL = new THREE.SpotLight(0xffd29a, 5, 6, 1.0, 0.7, 1.4); lampL.position.set(-1.7, Y + 0.44, -0.8); lampL.target.position.set(-0.4, Y, 0.2);
  root.add(lampL, lampL.target);
  // blinds light from a window (projected cookie)
  const blindsTex = T.toTex((() => { const [c, g] = T.canvas(256, 256); g.fillStyle = '#000'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#fff'; for (let y = 10; y < 256; y += 26) g.fillRect(0, y, 256, 14); return c; })(), { srgb: false });
  const blinds = new THREE.SpotLight(0x9fb5e6, 16, 20, 0.5, 0.3, 1.2);
  blinds.position.set(4.5, 6.5, 3.5); blinds.target.position.set(0, Y, 0); blinds.map = blindsTex; blinds.castShadow = true;
  blinds.shadow.mapSize.set(512, 512);
  root.add(blinds, blinds.target);
  const hemi = new THREE.HemisphereLight(0x6a7488, 0x1e1a18, 0.55); root.add(hemi);
  const sh = shaft(root, 2.2, 3.7, 1.7, 0.4, 1.6, 6, 0x9fb5e6, 0.05); sh.rotation.z = 0.6; sh.rotation.x = -0.35;

  // props
  const cup = cyl(0.06, 0.05, 0.11, std({ color: 0xeee8dc, roughness: 0.3 }), 1.75, Y + 0.055, -0.95, root, 18);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.004, 4, 24), std({ color: 0x5a3a20 })); ring.rotation.x = Math.PI / 2; ring.position.set(1.55, Y + 0.002, -0.7); root.add(ring);
  const pen = cyl(0.008, 0.008, 0.17, std({ color: 0x111111, metalness: 0.6 }), 1.2, Y + 0.01, 0.95, root, 8); pen.rotation.z = Math.PI / 2; pen.rotation.y = 0.9;
  const mag = group(root, 1.5, Y + 0.012, 0.6);
  const lens = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.012, 8, 32), std({ color: 0x1a1a1a, metalness: 0.7 })); lens.rotation.x = Math.PI / 2; mag.add(lens);
  const handle = box(0.2, 0.02, 0.03, std({ color: 0x3a2214 }), 0.18, 0, 0, mag); mag.rotation.y = 0.5;

  // ---------------------------------------------------------- paper helpers
  const papers = [];
  function paper(canvas, w, rest, from, name) {
    const g = group(root);
    const m = card(canvas, w, g);
    m.rotation.x = -Math.PI / 2;
    const sh = contact(w * 1.3, w * canvas.height / canvas.width * 1.3, g, 0.03, -0.002, 0.04, 0.45);
    g.userData = { rest, from };
    papers.push(g);
    if (name) ANCH[name] = g;
    return g;
  }
  function place(g, v) {
    const { rest, from } = g.userData;
    const e = smooth(v);
    g.visible = v > 0.001;
    const arc = Math.sin(e * Math.PI) * 0.6;
    g.position.set(lerp(from[0], rest[0], e), lerp(from[1], rest[1], e) + arc * (1 - e) + 0.004 * rest[3], lerp(from[2], rest[2], e));
    g.rotation.set(lerp(from[4] || 0.6, 0, e), lerp(from[3], rest[4] || 0, e), lerp(from[5] || 0.4, 0, e));
  }
  const D = (title, sub, kind, seed) => T.paperText([
    { text: kind, font: 'Plex Mono', size: 30, weight: 500, letter: '4px', color: '#8a4a22', after: 20 },
    { text: title, font: 'Fraunces', size: 66, weight: 600, lh: 1.08, after: 18 },
    { text: sub, font: 'Source Sans 3', size: 38, color: '#5a5248', after: 30 },
    { text: 'ILLUSTRATIVE COVER — NOT THE DOCUMENT', font: 'Plex Mono', size: 22, color: '#8a7c68' }
  ], { w: 800, h: 1000, pad: 66, seed });

  // s04: three source documents
  const docs = [
    paper(D('Regulatory documents', 'NEPRA decisions and orders, 2025–2026', 'SOURCE 1', 41), 0.62, [-1.05, Y + 0.01, 0.1, 1, 0.12], [-3.5, Y + 2.4, 1.6, 0.9, 0.8, 0.6], 'docA'),
    paper(D('KE’s published position', 'Company FAQs and its review of 2025', 'SOURCE 2', 42), 0.62, [0.0, Y + 0.01, -0.05, 2, -0.06], [0.5, Y + 3.0, -2.5, -0.6, 0.9, -0.4], 'docB'),
    paper(D('Published reporting', 'Business Recorder, September 24, 2026', 'SOURCE 3', 43), 0.62, [1.05, Y + 0.01, 0.12, 3, 0.09], [3.6, Y + 2.2, 1.4, -1.0, 0.7, -0.5], 'docC')
  ];
  // s04 b: four interview cards (no faces: a neutral silhouette mark)
  const C = (who, where, date, seed, emp) => {
    const c = T.paperText([{ gap: 250 }, { text: who, font: 'Fraunces', size: 50, weight: 600, after: 6 }, { text: where, font: 'Source Sans 3', size: 32, color: '#5a5248', after: 8 }, { text: date, font: 'Plex Mono', size: 26, color: '#8a4a22' }], { w: 640, h: 640, pad: 52, seed, bg: '#efe6d2' });
    const g = c.getContext('2d');
    g.fillStyle = emp ? '#3f7f7a' : '#c9822a';
    g.beginPath(); g.arc(320, 120, 58, 0, 7); g.fill();
    g.beginPath(); g.ellipse(320, 262, 110, 74, 0, Math.PI, 0); g.fill();
    if (emp) { g.fillStyle = '#efe6d2'; g.font = '500 24px "Plex Mono"'; g.textAlign = 'center'; g.fillText('ANONYMISED', 320, 128); }
    return c;
  };
  const cards = [
    paper(C('Imad', 'Resident · Gulistan-e-Jauhar', 'Interview · Oct 3, 2026', 51), 0.46, [-1.55, Y + 0.02, 0.85, 4, -0.1], [-2.8, Y + 2, 2.6, 0.5, 1, 0.3], 'cardA'),
    paper(C('Resident 2', 'Gulshan', 'Interview · Oct 5, 2026', 52), 0.46, [-0.52, Y + 0.02, 0.95, 5, 0.06], [-1.0, Y + 2.4, 2.9, -0.4, 0.9, -0.3], 'cardB'),
    paper(C('Employee 1', 'Distribution · personal views', 'Interview · Oct 4, 2026', 53, true), 0.46, [0.52, Y + 0.02, 0.92, 6, -0.04], [1.2, Y + 2.3, 2.8, 0.4, 1, 0.3], 'cardC'),
    paper(C('Employee 2', 'Communication · personal views', 'Interview · Oct 9, 2026', 54, true), 0.46, [1.55, Y + 0.02, 0.86, 7, 0.1], [2.9, Y + 2, 2.5, -0.5, 1, -0.3], 'cardD')
  ];
  // red string between pins (docs → cards), drawn progressively
  const pins = [];
  const pinMat = std({ color: 0xb23a2a, roughness: 0.4 });
  const pts = [[-1.05, 0.25], [-1.55, 0.7], [0, 0.0], [-0.52, 0.8], [0.52, 0.78], [1.05, 0.25], [1.55, 0.7], [0, 0.0]];
  const strPts = pts.map(([x, z]) => new THREE.Vector3(x, Y + 0.05, z - 0.3));
  const strCurve = new THREE.CatmullRomCurve3(strPts, false, 'catmullrom', 0.1);
  const strGeo = new THREE.TubeGeometry(strCurve, 200, 0.004, 4, false);
  const str = new THREE.Mesh(strGeo, basic({ color: 0xc23a2a }));
  root.add(str);
  const strCount = strGeo.index.count;
  pts.forEach(([x, z]) => { const p = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), pinMat); p.position.set(x, Y + 0.05, z - 0.3); root.add(p); pins.push(p); });

  // s15: company-reported slips
  const slip = (big, small, seed, w = 760) => T.paperText([{ text: big, font: 'Anton', size: 150, lh: 1, after: 10 }, { text: small, font: 'Source Sans 3', size: 44, color: '#3a342e' }], { w, h: 420, pad: 54, seed });
  const ke = [
    paper(slip('25,000+', 'anti-theft drives', 61), 0.9, [-1.2, Y + 0.012, -0.35, 8, -0.05], [-3.5, Y + 2.5, -1, 1.2, 1, 0.5], 'keA'),
    paper(slip('310', 'customer facilitation camps', 62), 0.9, [-0.9, Y + 0.014, 0.6, 9, 0.04], [-2.5, Y + 2.5, 3.0, -0.8, 1, -0.5], 'keB'),
    paper(slip('PKR 409 million', 'in recoveries associated with the initiatives', 63, 980), 1.15, [0.95, Y + 0.016, -0.05, 10, 0.06], [3.6, Y + 2.8, 0.5, -1.1, 1, -0.4], 'keC')
  ];
  const stampC = (() => { const [c, g] = T.canvas(900, 230); g.strokeStyle = '#2c6e68'; g.lineWidth = 12; g.strokeRect(10, 10, 880, 210); g.fillStyle = '#2c6e68'; g.font = '400 84px Anton'; g.textAlign = 'center'; g.fillText('COMPANY-REPORTED', 450, 108); g.font = '500 44px "Plex Mono"'; g.fillText('2025 ACTIVITIES', 450, 180); g.globalCompositeOperation = 'destination-out'; const r = T.rng(3); for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.6})`; g.fillRect(r() * 900, r() * 230, 2 + r() * 4, 2 + r() * 4); } return c; })();
  const stamp = paper(stampC, 0.95, [0.45, Y + 0.03, 0.72, 11, -0.12], [0.45, Y + 1.0, 0.72, -0.12, 0, 0], 'keStamp');

  // s17: the regulator's order (paraphrase) and prior history
  const order = paper(T.paperText([
    { text: 'PARAPHRASE — NOT THE DOCUMENT TEXT', font: 'Plex Mono', size: 30, weight: 500, letter: '3px', color: '#a3311f', after: 22 },
    { text: 'NEPRA · Order under Section 27C — K-Electric', font: 'Fraunces', size: 58, weight: 600, lh: 1.08, after: 8 },
    { text: 'August 31, 2026', font: 'Plex Mono', size: 36, color: '#7a3a1c', after: 30 },
    { text: 'Directed KE to cease:', font: 'Source Sans 3', size: 50, weight: 600, after: 10 },
    { text: '•  unannounced, unscheduled or excessive load-shedding; and', font: 'Source Sans 3', size: 48, lh: 1.2, after: 12 },
    { text: '•  feeder-level load-shedding based on aggregate technical and commercial losses.', font: 'Source Sans 3', size: 48, lh: 1.2, after: 26 },
    { text: 'It challenged imposing interruptions on compliant customers because of others’ defaults or theft.', font: 'Source Sans 3', size: 46, lh: 1.22, after: 26 },
    { text: 'Our paraphrase of NEPRA (2026), as summarised in our report.', font: 'Plex Mono', size: 26, color: '#6a5d4c' }
  ], { w: 1200, h: 1560, pad: 84, seed: 71 }), 1.2, [-0.55, Y + 0.02, 0.05, 12, -0.03], [-3.8, Y + 1.8, 0.4, 0.5, 0.7, 0.3], 'order');
  const order2 = paper(T.paperText([
    { text: 'PRIOR REGULATORY HISTORY', font: 'Plex Mono', size: 30, weight: 500, letter: '3px', color: '#a3311f', after: 16 },
    { text: 'The August order refers to a prior PKR 50 million fine for related violations — not a new penalty arising from the September hearing.', font: 'Source Sans 3', size: 46, lh: 1.22, after: 34 },
    { text: 'ALTERNATIVE EXPLANATIONS', font: 'Plex Mono', size: 30, weight: 500, letter: '3px', color: '#a3311f', after: 16 },
    { text: 'In a July 11, 2025 complaint decision, KE’s account linked outages to losses and noted that damaged equipment and anti-theft disconnections could affect how interruptions are understood. Faults and maintenance also interrupt supply.', font: 'Source Sans 3', size: 42, lh: 1.22, after: 20 },
    { text: 'KE appealed NEPRA’s earlier decision; we have not established that appeal’s current disposition. Our interviews cannot establish the cause of any particular outage.', font: 'Source Sans 3', size: 42, lh: 1.22, after: 22 },
    { text: 'NEPRA (2026); NEPRA (2025, July 11)', font: 'Plex Mono', size: 26, color: '#6a5d4c' }
  ], { w: 1200, h: 1560, pad: 84, seed: 72 }), 1.2, [0.62, Y + 0.03, 0.0, 13, 0.035], [4.0, Y + 1.6, 0.2, -0.5, 0.7, -0.3], 'order2');

  reg('dkDocs', 0, v => docs.forEach((g, k) => place(g, seg(v, k * 0.15, 0.55 + k * 0.15))));
  reg('dkCards', 0, v => cards.forEach((g, k) => place(g, seg(v, k * 0.12, 0.55 + k * 0.12))));
  reg('dkString', 0, v => { str.geometry.setDrawRange(0, Math.floor(strCount * v / 3) * 3); str.visible = v > 0.001; pins.forEach((p, k) => { p.visible = v > k / pins.length; }); });
  reg('dkKE', 0, v => ke.forEach((g, k) => place(g, seg(v, k * 0.16, 0.5 + k * 0.16))));
  reg('dkStamp', 0, v => { place(stamp, v); stamp.scale.setScalar(lerp(1.5, 1, smooth(v))); });
  reg('dkOrder', 0, v => place(order, v));
  reg('dkOrder2', 0, v => place(order2, v));
  reg('dkLamp', 1, v => { lampL.intensity = 5 * v; bulbGlow.material.opacity = 0.8 * v; shadeMat.emissiveIntensity = 0.4 * v; });
  reg('dkBlinds', 1, v => { blinds.intensity = 16 * v; sh.material.uniforms.uO.value = 0.05 * v; });

  return { root, offset: OFF, exitPush: 2, p: { fog: 0.01, bloom: 0.22, vig: 1.0, exposure: 0.95 }, shadows: true };
}
