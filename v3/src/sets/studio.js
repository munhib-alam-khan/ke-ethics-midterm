// The studio: an abstract dark gallery used for analysis and evaluation.
// Zone A: three theory slabs (s14). Zone B: three plinths — channel,
// information, resolution (s16). Zone C: three pillars of consequence (s18).
// Zone D: a miniature night city with four small lights (s21).
import * as THREE from 'three';
import * as T from '../world/tex.js';
import { PARAMS, reg, std, basic, box, plane, cyl, group, glow, contact, card, seg, lerp, smooth } from '../world/kit.js';
import { anchor, glossyFloor, shaft, labelCanvas } from './common.js';

export function buildStudio(scene, ANCH, TICK) {
  const OFF = [12000, 0, 0];
  const root = group(scene, ...OFF);
  root.visible = false;
  const floor = glossyFloor(root, 400, 0x0d0d10, 0.28);
  floor.position.x = 40;
  const hemi = new THREE.HemisphereLight(0x50586a, 0x08080a, 0.35); root.add(hemi);

  // ------------------------------------------------ zone A: theory slabs
  const A = group(root, 0, 0, 0);
  const slabDefs = [
    ['DEONTOLOGY', 'sets the boundary', 'Duties constrain unfair treatment of compliant customers.', 0x8fc3bc, '143,195,188'],
    ['UTILITARIANISM', 'chooses the remedy', 'Consequences help choose workable alternatives.', 0xf0c27a, '240,194,122'],
    ['VIRTUE ETHICS', 'guides implementation', 'Character and practical judgement — candour, follow-through.', 0xefe6d2, '239,230,210']
  ];
  const slabs = slabDefs.map(([t, s, d, col, rgb], k) => {
    const g = group(A);
    const glass = new THREE.MeshStandardMaterial({ color: col, transparent: true, opacity: 0.16, roughness: 0.1, metalness: 0.1, emissive: col, emissiveIntensity: 0.12, side: THREE.DoubleSide, depthWrite: false });
    box(2.8, 3.6, 0.06, glass, 0, 1.8, 0, g);
    const frame = basic({ color: col });
    [[0, 3.6, 2.8, 0.03], [0, 0, 2.8, 0.03], [-1.4, 1.8, 0.03, 3.6], [1.4, 1.8, 0.03, 3.6]].forEach(([x, y, w, h]) => box(w, h, 0.07, frame, x, y, 0, g));
    const txt = card(labelCanvas([{ text: t, font: 'Anton', size: 120, letter: '2px', color: `rgb(${rgb})`, after: 10 }, { text: s, font: 'Fraunces', style: 'italic', size: 76, color: '#efe6d2', after: 30 }, { text: d, font: 'Source Sans 3', size: 50, color: 'rgba(239,230,210,.85)', lh: 1.25 }], { w: 1100, h: 1300, pad: 70 }), 2.5, g);
    txt.material = new THREE.MeshBasicMaterial({ map: txt.material.map, transparent: true, depthWrite: false });
    txt.position.set(0, 1.85, 0.05);
    const L = new THREE.PointLight(col, 4, 6, 1.6); L.position.set(0, 2, 1.2); g.add(L);
    const fg = glow(rgb, 3.2, g, 0, 0.05, 0.4, 0.25);
    g.userData = { L, glass };
    return g;
  });
  anchor(root, 'slabs', 0, 4.2, 0, ANCH);
  const tension = box(9, 0.02, 0.02, basic({ color: 0xf0ad45 }), 0, 0.02, 1.4, A);

  // ------------------------------------------------ zone B: three plinths
  const B = group(root, 24, 0, 0);
  const pl = [-4.2, 0, 4.2].map((x, k) => {
    const g = group(B, x, 0, 0);
    box(1.6, 1.1, 1.6, std({ color: 0x1c1c20, roughness: 0.4 }), 0, 0.55, 0, g);
    const ring = box(1.62, 0.02, 1.62, basic({ color: 0x3a3a40 }), 0, 1.11, 0, g);
    const sp = new THREE.SpotLight(0xffe8c8, 0, 9, 0.38, 0.5, 1.3); sp.position.set(0, 6, 1.2); sp.target.position.set(0, 1.1, 0); g.add(sp, sp.target);
    const sh = shaft(g, 0, 3.6, 0.6, 0.1, 0.9, 5, 0xffe8c8, 0);
    sh.rotation.x = 0.2;
    return { g, sp, sh, ring };
  });
  // object 1: a phone with many users (a cloud of dots above it)
  const ph = group(pl[0].g, 0, 1.1, 0);
  box(0.36, 0.7, 0.04, std({ color: 0x0c0c0e, roughness: 0.25 }), 0, 0.42, 0, ph).rotation.x = -0.2;
  const phScr = plane(0.32, 0.62, new THREE.MeshBasicMaterial({ color: 0x9fd6cf }), 0, 0.42, 0.025, ph); phScr.rotation.x = -0.2;
  const dg = new THREE.BufferGeometry(); const dp = []; const dr = T.rng(4);
  for (let i = 0; i < 260; i++) { const a = dr() * Math.PI * 2, rr = 0.2 + dr() * 0.7; dp.push(Math.cos(a) * rr, 1.2 + dr() * 0.9, Math.sin(a) * rr * 0.6); }
  dg.setAttribute('position', new THREE.Float32BufferAttribute(dp, 3));
  const users = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0x9fd6cf, size: 0.035, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  ph.add(users);
  // object 2: an outage notice card (accurate information)
  const notice = card(T.paperText([{ text: 'OUTAGE UPDATE', font: 'Plex Mono', size: 34, weight: 500, letter: '3px', color: '#8a4a22', after: 16 }, { text: 'Cause: ?', font: 'Fraunces', size: 64, weight: 600, after: 6 }, { text: 'Restoration: ?', font: 'Fraunces', size: 64, weight: 600, after: 6 }, { text: 'Next update: ?', font: 'Fraunces', size: 64, weight: 600, after: 26 }, { text: 'ILLUSTRATIVE', font: 'Plex Mono', size: 24, color: '#8a7c68' }], { w: 700, h: 640, pad: 50, seed: 8 }), 0.9, pl[1].g);
  notice.position.set(0, 1.6, 0); notice.rotation.x = -0.15;
  // object 3: a small house, its window dark (the underlying problem)
  const hs = group(pl[2].g, 0, 1.1, 0);
  box(0.7, 0.6, 0.6, std({ color: 0xe7b3a1, roughness: 0.9 }), 0, 0.3, 0, hs);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(0.56, 0.35, 4), std({ color: 0x8a3b2c })); roof.position.y = 0.78; roof.rotation.y = Math.PI / 4; hs.add(roof);
  const hwin = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, emissive: 0xffc878, emissiveIntensity: 0 });
  plane(0.22, 0.2, hwin, 0, 0.32, 0.305, hs);
  const hwGlow = glow('255,200,120', 0.6, hs, 0, 0.32, 0.4, 0);
  ['pl1', 'pl2', 'pl3'].forEach((n, k) => anchor(root, n, 24 + (k - 1) * 4.2, [3.5, 4.3, 3.5][k], 0, ANCH));
  // the gaps between plinths: little bridges that light in turn
  const bridges = [0, 1].map(k => box(2.6, 0.04, 0.12, new THREE.MeshBasicMaterial({ color: 0xf0ad45, transparent: true, opacity: 0 }), (k - 0.5) * 4.2, 1.0, 0, B));

  // ------------------------------------------------ zone C: three pillars of consequence
  const C = group(root, 48, 0, 0);
  const pillarDefs = [[0xf0ad45, '240,173,69'], [0xefe6d2, '239,230,210'], [0x8fc3bc, '143,195,188']];
  const pillars = pillarDefs.map(([col, rgb], k) => {
    const g = group(C, (k - 1) * 3.6, 0, 0);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 8, 32, 1, true), new THREE.ShaderMaterial({
      uniforms: { uC: { value: new THREE.Color(col) }, uO: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: 'varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform vec3 uC; uniform float uO; varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ float e = pow(1.0 - abs(dot(vN, vV)), 2.0); float a = uO * (0.25 + e) * (1.0 - vUv.y * 0.85); gl_FragColor = vec4(uC * a, a); }'
    }));
    beam.position.y = 4; g.add(beam);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.9, 40), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    disc.rotation.x = -Math.PI / 2; disc.position.y = 0.01; g.add(disc);
    const L = new THREE.PointLight(col, 0, 6, 1.5); L.position.set(0, 1.2, 0.8); g.add(L);
    return { g, beam, disc, L };
  });
  // objects in the pillars
  const coin = std({ color: 0xc9a14a, metalness: 0.8, roughness: 0.3 });
  for (let i = 0; i < 7; i++) cyl(0.18, 0.18, 0.04, coin, (i % 2) * 0.02, 0.6 + i * 0.045, 0, pillars[0].g, 20);
  box(0.5, 0.36, 0.3, std({ color: 0x3a3f8a }), -0.15, 0.78, 0, pillars[1].g);
  cyl(0.16, 0.13, 0.3, std({ color: 0x3f7f9a }), 0.28, 0.75, 0.1, pillars[1].g, 16);
  const bub = card(labelCanvas([{ text: '?', font: 'Fraunces', size: 300, weight: 600, color: '#8fc3bc' }], { w: 300, h: 360, pad: 40 }), 0.6, pillars[2].g); bub.position.set(0, 1.0, 0);
  pillars.forEach((p, k) => box(0.9, 0.6, 0.9, std({ color: 0x18181c }), 0, 0.3, 0, p.g));
  ['pilF', 'pilH', 'pilR'].forEach((n, k) => anchor(root, n, 48 + (k - 1) * 3.6, 2.2, 0, ANCH));

  // ------------------------------------------------ zone D: miniature night city + four lights
  const D = group(root, 100, 0, 0);
  const cityT = T.toTex(T.cityWindows(91, 0.3)); cityT.wrapS = cityT.wrapT = THREE.RepeatWrapping; cityT.repeat.set(1, 2);
  const cityM = new THREE.MeshStandardMaterial({ color: 0x14161c, emissive: 0xffffff, emissiveMap: cityT, emissiveIntensity: 0.8, roughness: 0.9 });
  const N = 2600;
  const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), cityM, N);
  const r = T.rng(92);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3();
  let i = 0;
  for (let gx = -40; gx < 40 && i < N; gx++) for (let gz = -22; gz < 22 && i < N; gz++) {
    if (r() < 0.25) continue;
    // a coastline: nothing south-west of a curve
    if (gz > 14 + Math.sin(gx * 0.12) * 5 - gx * 0.1) continue;
    const h = 0.25 + Math.pow(r(), 3) * (Math.abs(gx) < 8 && Math.abs(gz) < 6 ? 4.5 : 1.6);
    p.set(gx * 0.9 + (r() - 0.5) * 0.2, h / 2, gz * 0.9 + (r() - 0.5) * 0.2);
    s.set(0.55 + r() * 0.25, h, 0.55 + r() * 0.25);
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), (r() - 0.5) * 0.2);
    m4.compose(p, q, s); inst.setMatrixAt(i++, m4);
  }
  inst.count = i;
  D.add(inst);
  const sea = plane(200, 60, std({ color: 0x0a1424, roughness: 0.15, metalness: 0.3 }), 0, 0.005, 42, D); sea.rotation.x = -Math.PI / 2;
  // four beacons (four interviews) — tiny, honest, scattered
  const beacons = [[-6, -3], [4.5, 2.5], [9, -6], [-1.5, 6]].map(([x, z], k) => {
    const g = glow('255,210,140', 2.4, D, x, 0.8, z, 0);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.08, 6, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd28a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    beam.position.set(x, 3, z); D.add(beam);
    const L = new THREE.PointLight(0xffc878, 0, 5, 1.5); L.position.set(x, 1, z); D.add(L);
    return { g, beam, L };
  });
  anchor(root, 'cityCentre', 100, 1, 0, ANCH);
  const key = new THREE.DirectionalLight(0xa8b8e8, 0.4); key.position.set(30, 40, 30); root.add(key);

  // ------------------------------------------------ params
  let stackV = 0;
  reg('stSlabs', 0, v => slabs.forEach((g, k) => {
    const e = seg(v, k * 0.15, 0.6 + k * 0.15);
    g.visible = e > 0.001;
    g.position.set(lerp([-3.6, 0, 3.6][k], [-3.2, 0, 3.2][k], stackV), lerp(-4, 0, e), lerp([0, -2.2, -4.4][k], 0, stackV));
    g.rotation.y = lerp([0.5, -0.2, -0.6][k], 0, e) * (1 - stackV);
    g.userData.L.intensity = 4 * e;
  }));
  reg('stStack', 0, v => { stackV = smooth(v); PARAMS.stSlabs.fn(PARAMS.stSlabs.v); });
  reg('stB', 0, v => {
    pl.forEach((pp, k) => {
      const lvl = k === 0 ? seg(v, 0, 0.3) : k === 1 ? seg(v, 0.35, 0.65) * 0.55 : seg(v, 0.7, 1) * 0.12;
      pp.sp.intensity = 30 * lvl; pp.sh.material.uniforms.uO.value = 0.12 * lvl;
      pp.ring.material.color.setRGB(lerp(0.22, 0.94, lvl), lerp(0.22, 0.68, lvl), lerp(0.25, 0.27, lvl));
    });
    users.material.opacity = seg(v, 0, 0.3); phScr.material.color.setRGB(0.62 * seg(v, 0, 0.3) + 0.05, 0.84 * seg(v, 0, 0.3) + 0.05, 0.81 * seg(v, 0, 0.3) + 0.05);
    hwin.emissiveIntensity = 0; hwGlow.material.opacity = 0;
    bridges.forEach((b, k) => { b.material.opacity = seg(v, 0.3 + k * 0.35, 0.4 + k * 0.35) * (k ? 0.25 : 0.6); });
  });
  reg('stPillars', 0, v => pillars.forEach((pp, k) => { const e = seg(v, k * 0.2, 0.5 + k * 0.2); pp.beam.material.uniforms.uO.value = 0.5 * e; pp.disc.material.opacity = 0.35 * e; pp.L.intensity = 6 * e; }));
  reg('stCity', 0.6, v => { cityM.emissiveIntensity = 0.8 * v; });
  reg('stBeacons', 0, v => beacons.forEach((b, k) => { const e = seg(v, k * 0.15, 0.5 + k * 0.15); b.g.material.opacity = e; b.beam.material.opacity = 0.35 * e; b.L.intensity = 3 * e; }));

  TICK.push((dt, t) => {
    if (!root.visible) return;
    users.rotation.y = t * 0.15;
    slabs.forEach((g, k) => { g.position.y += Math.sin(t * 0.6 + k) * 0.0015; });
  });

  return { root, offset: OFF, exitPush: 3, p: { fog: 0.006, bloom: 0.85 } };
}
