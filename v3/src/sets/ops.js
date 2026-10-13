// The operational perspective (illustrative network model): a dark room, a
// glass table with a glowing feeder schematic. Interruption kinds light up in
// different colours; recovery flows back; two accounts converge (scene 10).
import * as THREE from 'three';
import * as T from '../world/tex.js';
import { reg, std, basic, box, plane, cyl, group, glow, seg, lerp, smooth } from '../world/kit.js';
import { anchor, glossyFloor, shaft } from './common.js';

export function buildOps(scene, ANCH, TICK) {
  const OFF = [10000, 0, 0];
  const root = group(scene, ...OFF);
  root.visible = false;
  const Y = 1.0;
  glossyFloor(root, 60, 0x0b0c10, 0.25);
  const top = box(7.6, 0.06, 4.6, std({ color: 0x07080b, roughness: 0.12, metalness: 0.4 }), 0, Y, 0, root);
  box(7.0, 0.94, 4.0, std({ color: 0x101217, roughness: 0.6 }), 0, Y / 2 - 0.02, 0, root);
  const edge = box(7.64, 0.02, 4.64, basic({ color: 0x1d3a44 }), 0, Y + 0.035, 0, root);
  // fine grid on the table
  const gridC = (() => { const [c, g] = T.canvas(1024, 620); g.fillStyle = '#000'; g.fillRect(0, 0, 1024, 620); g.strokeStyle = 'rgba(80,160,170,.22)'; g.lineWidth = 1; for (let x = 0; x <= 1024; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 620); g.stroke(); } for (let y = 0; y <= 620; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(1024, y); g.stroke(); } return c; })();
  const grid = plane(7.4, 4.4, new THREE.MeshBasicMaterial({ map: T.toTex(gridC), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), 0, Y + 0.032, 0, root);
  grid.rotation.x = -Math.PI / 2;

  const H = Y + 0.05;
  const SUB = new THREE.Vector3(-3.0, H, 0);
  const subMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, emissive: 0x8fd8ff, emissiveIntensity: 1.4 });
  box(0.36, 0.22, 0.36, subMat, SUB.x, H + 0.1, SUB.z, root);
  anchor(root, 'opSub', SUB.x, H + 0.5, SUB.z, ANCH);
  // feeder polylines
  const feeders = [
    [[-3.0, 0], [-1.8, -1.4], [0.2, -1.5], [2.8, -1.5]],
    [[-3.0, 0], [-1.6, 0.05], [0.6, 0.0], [2.9, 0.1]],
    [[-3.0, 0], [-1.8, 1.4], [0.2, 1.5], [2.8, 1.4]]
  ].map(p => p.map(([x, z]) => new THREE.Vector3(x, H, z)));
  const lineMats = [];
  const curves = feeders.map((pts, k) => {
    const c = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.2);
    const m = new THREE.MeshBasicMaterial({ color: 0x3a8fa0, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
    lineMats.push(m);
    root.add(new THREE.Mesh(new THREE.TubeGeometry(c, 80, 0.018, 5), m));
    return c;
  });
  // houses along each feeder (small blocks with glowing roofs)
  const houses = [];
  const roofOn = new THREE.Color(0xffc878), roofOff = new THREE.Color(0x1a1a1a);
  curves.forEach((c, k) => {
    for (let i = 0; i < 9; i++) {
      const u = 0.32 + i * 0.075;
      const p = c.getPointAt(u);
      const side = i % 2 ? 1 : -1;
      const hm = new THREE.MeshStandardMaterial({ color: 0x14161a, emissive: roofOn.clone(), emissiveIntensity: 0.9 });
      const hh = 0.08 + ((i * 7 + k * 3) % 5) * 0.02;
      const b = box(0.18, hh, 0.16, hm, p.x, H + hh / 2, p.z + side * 0.28, root);
      const theft = (k === 1 && i === 6) || (k === 2 && i === 2);
      houses.push({ b, hm, k, i, theft, p: new THREE.Vector3(p.x, H, p.z + side * 0.28), u });
      // service drop
      const d = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(p.x, H, p.z), new THREE.Vector3(p.x, H, p.z + side * 0.2)), 2, 0.006, 4), theft ? basic({ color: 0xc4623f }) : lineMats[k]);
      root.add(d);
      if (theft) { const hook = glow('230,90,60', 0.28, root, p.x, H + 0.1, p.z + side * 0.12, 0.9); houses[houses.length - 1].hook = hook; }
    }
  });
  const paying = houses.find(h => h.k === 0 && h.i === 4);
  anchor(root, 'opPaying', paying.p.x, H + 0.4, paying.p.z, ANCH);
  anchor(root, 'opTheft', houses.find(h => h.theft).p.x, H + 0.35, houses.find(h => h.theft).p.z, ANCH);
  // interruption-kind markers: scheduled (amber, whole feeder A), fault (red spark on B), maintenance (teal on C)
  const KIND = [new THREE.Color(0xf0ad45), new THREE.Color(0xff4a3a), new THREE.Color(0x6fe0d0)];
  const faultP = curves[1].getPointAt(0.55);
  const spark = glow('255,80,60', 0.7, root, faultP.x, H + 0.06, faultP.z, 0);
  const maintP = curves[2].getPointAt(0.5);
  const wrench = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.02, 6, 16, Math.PI * 1.6), new THREE.MeshBasicMaterial({ color: 0x6fe0d0 }));
  wrench.position.set(maintP.x, H + 0.12, maintP.z); wrench.rotation.x = -Math.PI / 2; root.add(wrench);
  anchor(root, 'opSched', curves[0].getPointAt(0.8).x, H + 0.3, curves[0].getPointAt(0.8).z, ANCH);
  anchor(root, 'opFault', faultP.x, H + 0.3, faultP.z, ANCH);
  anchor(root, 'opMaint', maintP.x, H + 0.3, maintP.z, ANCH);

  // recovery particles (revenue back to the substation); theft houses send none
  const NP = 140;
  const pg = new THREE.BufferGeometry();
  const ppos = new Float32Array(NP * 3);
  pg.setAttribute('position', new THREE.BufferAttribute(ppos, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xffd27a, size: 0.05, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const parts = new THREE.Points(pg, pMat); root.add(parts);
  const pr = T.rng(5);
  const pData = Array.from({ length: NP }, () => { let h; do { h = houses[Math.floor(pr() * houses.length)]; } while (h.theft); return { h, o: pr() }; });

  // two accounts converge (scene 10): warm from the left edge, teal from the right
  const meetPts = [new THREE.Vector3(-3.6, H + 0.6, 2.4), new THREE.Vector3(-1.5, H + 0.7, 1.0), new THREE.Vector3(0, H + 0.9, 0)];
  const meetPts2 = [new THREE.Vector3(3.6, H + 0.6, 2.4), new THREE.Vector3(1.5, H + 0.7, 1.0), new THREE.Vector3(0, H + 0.9, 0)];
  const warm = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(meetPts), 100, 0.03, 6), new THREE.MeshBasicMaterial({ color: 0xf0ad45 }));
  const teal = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(meetPts2), 100, 0.03, 6), new THREE.MeshBasicMaterial({ color: 0x6fe0d0 }));
  root.add(warm, teal);
  const wCount = warm.geometry.index.count;
  const meetGlow = glow('255,240,210', 1.2, root, 0, H + 0.9, 0, 0);
  const nodes = [-0.7, 0, 0.7].map((x, k) => { const n = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), new THREE.MeshBasicMaterial({ color: 0xefe6d2 })); n.position.set(x, H + 1.3, -0.4); root.add(n); return n; });

  // room lights
  const hemi = new THREE.HemisphereLight(0x2a3a4a, 0x050506, 0.4); root.add(hemi);
  const over = new THREE.SpotLight(0x9fd8ff, 30, 12, 0.7, 0.8, 1.3); over.position.set(0, 6, 0); over.target.position.set(0, 0, 0); root.add(over, over.target);
  const tableGlow = new THREE.PointLight(0x4ab0c0, 3, 6, 1.5); tableGlow.position.set(0, H + 0.6, 0); root.add(tableGlow);
  shaft(root, 0, 3.6, 0, 0.3, 2.4, 5, 0x6fb8d0, 0.05);
  // screens on the back wall (abstract graphs)
  const scrC = (() => { const [c, g] = T.canvas(1024, 400); g.fillStyle = '#05080c'; g.fillRect(0, 0, 1024, 400); g.strokeStyle = '#3a8fa0'; g.lineWidth = 4; g.beginPath(); for (let x = 0; x <= 1024; x += 16) g.lineTo(x, 220 + Math.sin(x * 0.02) * 60 + Math.sin(x * 0.07) * 20); g.stroke(); g.fillStyle = 'rgba(240,173,69,.6)'; for (let x = 30; x < 1000; x += 60) g.fillRect(x, 340 - (x * 7 % 90), 30, x * 7 % 90); return c; })();
  for (let k = -1; k <= 1; k++) { const s = plane(3.2, 1.25, new THREE.MeshBasicMaterial({ map: T.toTex(scrC), color: 0x7a8a9a }), k * 3.4, 3.2, -6, root); }

  let kinds = 0, flow = 0, dim = 0, meet = 0;
  reg('opKinds', 0, v => { kinds = v; });
  reg('opFlow', 0, v => { flow = v; pMat.opacity = 0.9 * v; });
  reg('opDim', 0, v => { dim = v; });
  reg('opMeet', 0, v => { meet = v; warm.geometry.setDrawRange(0, Math.floor(wCount * seg(v, 0, 0.6) / 3) * 3); teal.geometry.setDrawRange(0, Math.floor(wCount * seg(v, 0, 0.6) / 3) * 3); warm.visible = teal.visible = v > 0.001; meetGlow.material.opacity = seg(v, 0.5, 0.7); nodes.forEach((n, k) => { n.visible = v > 0.6 + k * 0.12; n.scale.setScalar(seg(v, 0.6 + k * 0.12, 0.75 + k * 0.12) + 0.001); }); });
  const tmpC = new THREE.Color();
  TICK.push((dt, t) => {
    if (!root.visible) return;
    // feeder colours
    lineMats.forEach((m, k) => {
      tmpC.set(0x3a8fa0).lerp(KIND[k], seg(kinds, k * 0.25, k * 0.25 + 0.3));
      const pulse = k === 0 ? 0.6 + 0.4 * Math.sin(t * 2.2) : k === 1 ? 0.7 + 0.3 * (Math.sin(t * 19) > 0.2 ? 1 : 0.2) : 0.8;
      m.color.copy(tmpC).multiplyScalar(lerp(1, pulse, seg(kinds, k * 0.25, k * 0.25 + 0.3)) * (1 - dim * 0.8));
    });
    spark.material.opacity = seg(kinds, 0.25, 0.55) * (0.5 + 0.5 * Math.abs(Math.sin(t * 23))) * (1 - dim);
    wrench.visible = kinds > 0.55 && dim < 0.4; wrench.rotation.z = t * 0.8; wrench.material.opacity = 1 - dim;
    // houses: scheduled feeder A goes dark in turn when kinds shows; dim dims all but the paying house
    houses.forEach(h => {
      let on = 1;
      if (h.k === 0) on = 1 - seg(kinds, 0.05, 0.3) * (0.5 + 0.5 * Math.sin(t * 1.4 + h.i));
      if (h.k === 1 && h.u > 0.55) on = 1 - seg(kinds, 0.3, 0.55);
      if (h === paying) on = Math.max(on, dim);
      else on *= 1 - dim * 0.85;
      h.hm.emissive.copy(roofOff).lerp(roofOn, on);
      h.hm.emissiveIntensity = h === paying ? 0.9 + dim * 1.6 : 0.9;
      if (h.hook) h.hook.material.opacity = (0.5 + 0.5 * Math.sin(t * 6 + h.i)) * flow * (1 - dim);
    });
    // revenue flow
    for (let i = 0; i < NP; i++) {
      const d = pData[i];
      const u = ((t * 0.12 + d.o) % 1);
      const c = curves[d.h.k];
      const uu = d.h.u * (1 - u);
      const p = u < 0.08 ? d.h.p.clone().lerp(c.getPointAt(d.h.u), u / 0.08) : c.getPointAt(Math.max(0, uu));
      ppos[i * 3] = p.x; ppos[i * 3 + 1] = p.y + 0.03; ppos[i * 3 + 2] = p.z;
    }
    pg.attributes.position.needsUpdate = true;
    over.intensity = 30 * (1 - dim * 0.6);
  });

  return { root, offset: OFF, exitPush: 3, p: { fog: 0.01, bloom: 0.9 } };
}
