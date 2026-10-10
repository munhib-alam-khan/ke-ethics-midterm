// Small geometry/material kit + the animatable-parameter registry that every
// set uses. A "param" is a named number; each state lists target values and
// the deck tweens them, so every look is reversible and interruption-safe.
import * as THREE from 'three';
import * as T from './tex.js';

export const PARAMS = {};          // name -> { v, def, fn }
export function reg(name, def, fn) {
  PARAMS[name] = { v: def, def, fn };
  fn(def);
  return name;
}
export function setParam(name, v) { const p = PARAMS[name]; if (!p) return; p.v = v; p.fn(v); }

const texCache = {};
export function tex(key, make, opts) { return texCache[key] || (texCache[key] = T.toTex(make(), opts)); }

export function std(o = {}) {
  return new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.85, metalness: 0 }, o));
}
export function basic(o = {}) { return new THREE.MeshBasicMaterial(o); }

export function box(w, h, d, mat, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  if (parent) parent.add(m);
  return m;
}
export function plane(w, h, mat, x = 0, y = 0, z = 0, parent) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z);
  if (parent) parent.add(m);
  return m;
}
export function cyl(rt, rb, h, mat, x = 0, y = 0, z = 0, parent, seg = 20) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z);
  if (parent) parent.add(m);
  return m;
}
export function group(parent, x = 0, y = 0, z = 0) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  if (parent) parent.add(g);
  return g;
}

// additive glow sprite (bloom does the rest)
const glowTex = {};
export function glow(color = '255,210,140', size = 1, parent, x = 0, y = 0, z = 0, opacity = 1) {
  glowTex[color] = glowTex[color] || T.toTex(T.radial(color));
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex[color], blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity }));
  s.scale.set(size, size, 1);
  s.position.set(x, y, z);
  if (parent) parent.add(s);
  return s;
}

// soft contact shadow under objects
let shadowTex;
export function contact(w, d, parent, x = 0, y = 0.01, z = 0, o = 0.55) {
  shadowTex = shadowTex || T.toTex(T.radial('0,0,0'));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: o, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, y, z);
  if (parent) parent.add(m);
  return m;
}

// canvas-text card as a mesh (for in-world paper: bills, notices, cards)
export function card(canvas, w, parent, opts = {}) {
  const t = T.toTex(canvas, { aniso: 8 });
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  const h = w * canvas.height / canvas.width;
  const mat = new THREE.MeshStandardMaterial({ map: t, roughness: 0.9, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide, emissive: opts.emissive || 0x000000, emissiveMap: opts.emissive ? t : null, emissiveIntensity: opts.ei || 0 });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  if (parent) parent.add(m);
  return m;
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp01 = t => Math.max(0, Math.min(1, t));
export const smooth = t => { t = clamp01(t); return t * t * (3 - 2 * t); };
// sub-range of a 0..1 param, smoothed: seg(v, .2, .6)
export const seg = (v, a, b) => smooth((v - a) / (b - a));
