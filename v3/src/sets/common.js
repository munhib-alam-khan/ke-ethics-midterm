// Shared set pieces: faceless figures, background skylines, glossy floors,
// light shafts, labelled anchors.
import * as THREE from 'three';
import * as T from '../world/tex.js';
import { std, basic, box, plane, cyl, group, glow } from '../world/kit.js';

// a faceless mannequin (no features, no likeness), standing or seated
export function figure(parent, { color = 0x2b2d33, skin = 0x8a7a6a, seated = false, scale = 1 } = {}) {
  const g = group(parent);
  const suit = std({ color, roughness: 0.75 });
  const head = std({ color: skin, roughness: 0.9 });
  const s = scale;
  if (seated) {
    box(0.42 * s, 0.6 * s, 0.26 * s, suit, 0, 0.95 * s, 0, g);
    box(0.4 * s, 0.14 * s, 0.5 * s, suit, 0, 0.6 * s, 0.14 * s, g);
  } else {
    box(0.16 * s, 0.85 * s, 0.18 * s, suit, -0.1 * s, 0.43 * s, 0, g);
    box(0.16 * s, 0.85 * s, 0.18 * s, suit, 0.1 * s, 0.43 * s, 0, g);
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.21 * s, 0.42 * s, 4, 10), suit); torso.position.y = 1.18 * s; torso.scale.z = 0.62; g.add(torso);
  }
  const hy = seated ? 1.45 * s : 1.7 * s;
  const h = new THREE.Mesh(new THREE.SphereGeometry(0.13 * s, 16, 12), head); h.position.y = hy; h.scale.y = 1.15; g.add(h);
  const nk = cyl(0.05 * s, 0.06 * s, 0.1 * s, head, 0, hy - 0.16 * s, 0, g, 8);
  if (!seated) {
    const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.06 * s, 0.5 * s, 3, 6), suit); armL.position.set(-0.27 * s, 1.15 * s, 0); armL.rotation.z = 0.08; g.add(armL);
    const armR = armL.clone(); armR.position.x = 0.27 * s; armR.rotation.z = -0.08; g.add(armR);
    g.userData.legs = [g.children[0], g.children[1]];
    g.userData.arms = [armL, armR];
  }
  return g;
}

// walk cycle on a standing figure, phase in radians
export function walkPose(fig, phase, amt = 1) {
  const L = fig.userData.legs, A = fig.userData.arms; if (!L) return;
  const s = Math.sin(phase) * 0.45 * amt;
  L[0].rotation.x = s; L[1].rotation.x = -s;
  A[0].rotation.x = -s * 0.8; A[1].rotation.x = s * 0.8;
  fig.children.forEach(c => { if (c !== L[0] && c !== L[1]) c.position.y += 0; });
}

// ring of distant lit buildings around a set
const skyMats = {};
export function skyline(parent, { seed = 1, r0 = 70, r1 = 160, n = 120, arc = [0, Math.PI * 2], lit = 0.35, hMin = 8, hMax = 50 } = {}) {
  const key = lit.toFixed(2);
  if (!skyMats[key]) {
    const t = T.toTex(T.cityWindows(seed + 50, lit));
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 3);
    skyMats[key] = new THREE.MeshStandardMaterial({ color: 0x0b0d13, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 1.0, roughness: 0.9 });
  }
  const mat = skyMats[key];
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const inst = new THREE.InstancedMesh(geo, mat, n);
  const r = T.rng(seed);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const a = arc[0] + r() * (arc[1] - arc[0]);
    const rad = r0 + r() * (r1 - r0);
    const h = hMin + Math.pow(r(), 2.2) * (hMax - hMin);
    const w = 8 + r() * 12;
    p.set(Math.cos(a) * rad, h / 2, Math.sin(a) * rad);
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -a);
    sc.set(w, h, w * (0.6 + r() * 0.6));
    m.compose(p, q, sc);
    inst.setMatrixAt(i, m);
  }
  parent.add(inst);
  return { inst, mat };
}

// additive light shaft (fake volumetric cone)
export function shaft(parent, x, y, z, rTop, rBot, h, color = 0xffd9a0, opacity = 0.12) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, 32, 1, true),
    new THREE.ShaderMaterial({
      uniforms: { uC: { value: new THREE.Color(color) }, uO: { value: opacity } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: 'varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }',
      fragmentShader: 'uniform vec3 uC; uniform float uO; varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ float edge = pow(abs(dot(vN, vV)), 1.5); float a = uO * edge * smoothstep(0.0, 0.35, vUv.y) * (0.35 + 0.65 * vUv.y); gl_FragColor = vec4(uC * a, a); }'
    }));
  m.position.set(x, y, z);
  parent.add(m);
  return m;
}

export function glossyFloor(parent, size, color = 0x0f0f12, rough = 0.32) {
  const f = plane(size, size, std({ color, roughness: rough, metalness: 0.15 }), 0, 0, 0, parent);
  f.rotation.x = -Math.PI / 2;
  return f;
}

export function anchor(parent, name, x, y, z, map) { const o = group(parent, x, y, z); map[name] = o; return o; }

// text card drawn on canvas with a dark or paper background
export function labelCanvas(lines, { w = 1024, h = 512, bg = 'rgba(0,0,0,0)', pad = 50 } = {}) {
  return T.paperText(lines, { w, h, bg, pad, torn: false, clean: true });
}
