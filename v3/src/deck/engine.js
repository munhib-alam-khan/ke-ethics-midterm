// Deck engine: states → camera move + param tweens + text reveals.
// Every state is a complete target, so any jump (forward, back, overview) is
// just "tween from wherever we are to that target" — nothing accumulates.
import * as THREE from 'three';
import gsap from 'gsap';
import { PARAMS, setParam } from '../world/kit.js';

export function createDeck({ R, rig, sets, anchors, scenes, uiHost, low, onState }) {
  const STATES = [];
  scenes.forEach((sc, si) => sc.states.forEach((st, k) => STATES.push({ si, step: k, sc, st })));
  let cur = -1;
  let activeSet = null;
  const P = {};                                 // tween proxy
  for (const k in PARAMS) P[k] = PARAMS[k].v;

  // ------------------------------------------------------------ sets
  function showSet(name) {
    if (activeSet === name) return;
    for (const k in sets) sets[k].root.visible = k === name;
    activeSet = name;
    if (sets[name].onShow) sets[name].onShow();
  }

  // ------------------------------------------------------------ targets
  function targetParams(sc, st, base = false) {
    const t = {};
    for (const k in PARAMS) t[k] = PARAMS[k].def;
    Object.assign(t, sets[setOf(sc, st)].p || {}, sc.p || {}, base ? {} : st.p || {}, base ? st.enterP || {} : {});
    return t;
  }
  const setOf = (sc, st) => (st && st.set) || sc.set;
  const off = (sc, st) => (sets[setOf(sc, st)].offset || [0, 0, 0]);
  function camOf(st, sc) { const c = st.cam, o = off(sc, st); return { px: c.p[0] + o[0], py: c.p[1] + o[1], pz: c.p[2] + o[2], tx: c.t[0] + o[0], ty: c.t[1] + o[1], tz: c.t[2] + o[2], fov: c.fov || 45, roll: c.roll || 0 }; }
  const viaOf = (list, sc, st) => list ? list.map(v => [v[0] + off(sc, st)[0], v[1] + off(sc, st)[1], v[2] + off(sc, st)[2]]) : null;

  // ------------------------------------------------------------ camera tween along an optional path
  let camTw = null;
  function camTo(to, dur, ease, via, tvia) {
    if (camTw) camTw.kill();
    const from = { px: rig.px, py: rig.py, pz: rig.pz, tx: rig.tx, ty: rig.ty, tz: rig.tz, fov: rig.fov, roll: rig.roll };
    if (dur <= 0) { Object.assign(rig, to); return; }
    let curve = null, tcurve = null;
    if (via && via.length) curve = new THREE.CatmullRomCurve3([new THREE.Vector3(from.px, from.py, from.pz), ...via.map(v => new THREE.Vector3(...v)), new THREE.Vector3(to.px, to.py, to.pz)], false, 'centripetal');
    if (tvia && tvia.length) tcurve = new THREE.CatmullRomCurve3([new THREE.Vector3(from.tx, from.ty, from.tz), ...tvia.map(v => new THREE.Vector3(...v)), new THREE.Vector3(to.tx, to.ty, to.tz)], false, 'centripetal');
    const o = { u: 0 };
    const v = new THREE.Vector3();
    camTw = gsap.to(o, {
      u: 1, duration: dur, ease: ease || 'power2.inOut',
      onUpdate() {
        const u = o.u;
        if (curve) { curve.getPoint(u, v); rig.px = v.x; rig.py = v.y; rig.pz = v.z; }
        else { rig.px = from.px + (to.px - from.px) * u; rig.py = from.py + (to.py - from.py) * u; rig.pz = from.pz + (to.pz - from.pz) * u; }
        if (tcurve) { tcurve.getPoint(u, v); rig.tx = v.x; rig.ty = v.y; rig.tz = v.z; }
        else { rig.tx = from.tx + (to.tx - from.tx) * u; rig.ty = from.ty + (to.ty - from.ty) * u; rig.tz = from.tz + (to.tz - from.tz) * u; }
        rig.fov = from.fov + (to.fov - from.fov) * u;
        rig.roll = from.roll + (to.roll - from.roll) * u;
      }
    });
    return camTw;
  }

  // ------------------------------------------------------------ param tweens
  let paramTws = [];
  function paramsTo(target, dur, timing = {}, instant = false, skip = {}) {
    paramTws.forEach(t => t.kill()); paramTws = [];
    for (const k in target) {
      if (skip[k]) continue;
      const to = target[k];
      if (instant || dur <= 0) { P[k] = to; continue; }
      if (Math.abs(P[k] - to) < 1e-4 && !(timing[k] && timing[k].keys)) continue;
      const tm = timing[k] || {};
      const d = tm.d !== undefined ? tm.d * dur : 0;
      const t = tm.t !== undefined ? tm.t * dur : dur * 0.85;
      if (tm.keys) {
        const ks = tm.keys.concat([to]);
        paramTws.push(gsap.to(P, { keyframes: ks.map(v => ({ [k]: v, duration: t / ks.length, ease: 'none' })), delay: d }));
      } else paramTws.push(gsap.to(P, { [k]: to, duration: t, delay: d, ease: tm.e || 'sine.inOut' }));
    }
  }
  function syncParams() { for (const k in P) if (PARAMS[k] && PARAMS[k].v !== P[k]) setParam(k, P[k]); }

  // ------------------------------------------------------------ UI reveal
  const vis = (el, k) => { const i = +(el.dataset.in || 0); const o = el.dataset.out !== undefined ? +el.dataset.out : 99; return k >= i && k < o; };
  const FROM = {
    up: { y: 34, autoAlpha: 0 }, down: { y: -34, autoAlpha: 0 }, left: { x: -50, autoAlpha: 0 }, right: { x: 50, autoAlpha: 0 },
    fade: { autoAlpha: 0 }, pop: { scale: 0.86, autoAlpha: 0 }, stamp: { scale: 1.7, rotation: -14, autoAlpha: 0 },
    line: { scaleX: 0, autoAlpha: 1 }, mask: { clipPath: 'inset(0 100% 0 0)', autoAlpha: 1 }, blur: { autoAlpha: 0, filter: 'blur(16px)', scale: 1.04 }
  };
  const TO_EASE = { up: 'power3.out', down: 'power3.out', left: 'power3.out', right: 'power3.out', fade: 'sine.out', pop: 'back.out(1.6)', stamp: 'power4.in', line: 'power3.inOut', mask: 'power3.inOut', blur: 'power2.out' };
  function splitWords(el) {
    if (el.dataset.split) return;
    const walk = node => {
      for (const ch of Array.from(node.childNodes)) {
        if (ch.nodeType === 3) {
          const frag = document.createDocumentFragment();
          ch.textContent.split(/(\s+)/).forEach(w => {
            if (!w) return;
            if (/^\s+$/.test(w)) frag.appendChild(document.createTextNode(w));
            else { const s = document.createElement('span'); s.className = 'w'; s.textContent = w; frag.appendChild(s); }
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1 && !ch.classList.contains('w')) walk(ch);
      }
    };
    walk(el); el.dataset.split = '1';
  }
  function revealIn(el, delay, instant) {
    const a = el.dataset.a || 'up';
    gsap.killTweensOf(el); el._words && gsap.killTweensOf(el._words);
    if (instant) { gsap.set(el, { autoAlpha: 1, x: 0, y: 0, scale: 1, scaleX: 1, rotation: 0, clipPath: 'inset(0 0% 0 0)', filter: 'none' }); if (el._words) gsap.set(el._words, { autoAlpha: 1, y: 0, filter: 'none' }); return; }
    if (a === 'words') {
      splitWords(el);
      el._words = el._words || el.querySelectorAll('.w');
      gsap.set(el, { autoAlpha: 1, x: 0, y: 0 });
      gsap.fromTo(el._words, { autoAlpha: 0, y: 18, filter: 'blur(6px)' }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out', stagger: +(el.dataset.st || 0.045), delay });
      return;
    }
    const from = Object.assign({}, FROM[a] || FROM.up);
    const to = { autoAlpha: 1, x: 0, y: 0, scale: 1, scaleX: 1, rotation: +(el.dataset.rot || 0), clipPath: 'inset(0 0% 0 0)', filter: 'blur(0px)', duration: +(el.dataset.t || (a === 'stamp' ? 0.32 : 0.9)), ease: TO_EASE[a] || 'power3.out', delay };
    if (a === 'stamp') to.onComplete = () => gsap.fromTo(el, { x: -3 }, { x: 0, duration: 0.25, ease: 'elastic.out(1,.3)' });
    gsap.fromTo(el, from, to);
  }
  function revealOut(el, instant) {
    gsap.killTweensOf(el); el._words && gsap.killTweensOf(el._words);
    if (instant) { gsap.set(el, { autoAlpha: 0 }); return; }
    gsap.to(el, { autoAlpha: 0, y: '-=10', duration: 0.35, ease: 'power1.in' });
  }

  scenes.forEach(sc => {
    const el = document.createElement('section');
    el.className = 'sui'; el.id = sc.id; el.innerHTML = sc.ui || '';
    el.style.visibility = 'hidden';
    uiHost.appendChild(el);
    sc.el = el;
    sc.items = Array.from(el.querySelectorAll('[data-in],[data-out]'));
    sc.items.forEach(i => gsap.set(i, { autoAlpha: 0 }));
    el.querySelectorAll('.pin').forEach(p => gsap.set(p, { xPercent: -50, yPercent: p.classList.contains('low') ? 0 : -100 }));
    sc.anch = Array.from(el.querySelectorAll('[data-anchor]'));
  });

  function applyUI(prevState, next, instant, lowmo) {
    const sc = next.sc;
    if (prevState && prevState.sc !== sc) {
      const osc = prevState.sc;
      osc.items.forEach(i => revealOut(i, instant || lowmo));
      clearTimeout(osc._hide);
      osc._hide = setTimeout(() => { if (STATES[cur].sc !== osc) osc.el.style.visibility = 'hidden'; }, instant ? 0 : 450);
    }
    clearTimeout(sc._hide);
    sc.el.style.visibility = 'visible';
    sc.el.dataset.step = next.step;
    const kPrev = prevState && prevState.sc === sc ? prevState.step : -1;
    const base = (next.st.uiDelay !== undefined ? next.st.uiDelay : !prevState ? 1.2 : (prevState.sc !== sc ? (sc.uiDelay || 0.9) : 0.15));
    sc.items.forEach(el => {
      const was = kPrev >= 0 && vis(el, kPrev), now = vis(el, next.step);
      if (now && !was) revealIn(el, lowmo ? 0.05 : base + +(el.dataset.d || 0), instant);
      else if (!now && was) revealOut(el, instant || lowmo);
      else if (!now) gsap.set(el, { autoAlpha: 0 });
      else if (now && was && instant) revealIn(el, 0, true);
    });
  }

  // ------------------------------------------------------------ anchors (HTML labels pinned to 3D points)
  const v = new THREE.Vector3();
  function updateAnchors() {
    const st = STATES[cur]; if (!st) return;
    const list = st.sc.anch;
    for (const el of list) {
      const a = anchors[el.dataset.anchor];
      if (!a) continue;
      if (a.isObject3D) a.getWorldPosition(v); else v.copy(a);
      v.project(R.camera);
      const behind = v.z > 1;
      const x = (v.x * 0.5 + 0.5) * 1920 + +(el.dataset.ox || 0), y = (-v.y * 0.5 + 0.5) * 1080 + +(el.dataset.oy || 0);
      el.style.left = x.toFixed(1) + 'px'; el.style.top = y.toFixed(1) + 'px';
      el.classList.toggle('behind', behind);
    }
  }

  // ------------------------------------------------------------ go
  let swapTimer = null, flow = null;
  function go(index, opts = {}) {
    index = Math.max(0, Math.min(STATES.length - 1, index));
    if (index === cur && !opts.force) return;
    const prev = cur >= 0 ? STATES[cur] : null;
    const next = STATES[index];
    const rev = prev && index < cur;
    const adjacent = prev && Math.abs(index - cur) === 1 && !opts.instant;
    const lm = low();
    cur = index;
    const sc = next.sc, st = next.st;
    // the state whose move we play: forward → this state; backward → the state we leave (played toward here)
    const mover = rev && adjacent ? prev.st : st;
    const dur = (mover.dur || 2.4) * (rev ? 0.75 : 1);
    const tp = targetParams(sc, st);
    const to = camOf(st, sc);
    clearTimeout(swapTimer); if (flow) { flow.kill(); flow = null; }
    const newSet = setOf(sc, st), oldSet = prev ? setOf(prev.sc, prev.st) : null;
    const setChange = !prev || newSet !== oldSet;
    const enter = st.enter || (next.step === 0 ? sc.enter : null) || 'whip';

    if (!prev) {
      showSet(newSet); paramsTo(tp, 0, {}, true); syncParams(); camTo(to, 0);
      P.fade = 1; gsap.to(P, { fade: 0, duration: 1.6, ease: 'sine.inOut', delay: 0.2 });
    } else if (lm || !adjacent) {
      // quick dip to black and cut — low motion and jumps
      const half = lm ? 0.22 : 0.28;
      paramTws.forEach(t => t.kill()); paramTws = [];
      if (camTw) camTw.kill();
      flow = gsap.timeline();
      flow.to(P, { fade: 1, duration: half, ease: 'sine.in' });
      flow.add(() => { showSet(newSet); paramsTo(tp, 0, {}, true); P.fade = 1; camTo(to, 0); });
      flow.to(P, { fade: tp.fade || 0, duration: half * 1.4, ease: 'sine.out' });
    } else if (setChange && enter !== 'fly') {
      // two-phase cinematic cut between sets: push out of the old set, arrive into the new one
      const outT = 0.55;
      const fadeCol = sc.fadeCol || (rev ? prev.sc.fadeCol : null) || 'black';
      R.U.uFadeCol.value.set(fadeCol === 'white' ? 0xf3ecdc : 0x000000);
      const push = sets[oldSet].exitPush || 4;
      // push forward along the current view direction
      const dir = new THREE.Vector3(rig.tx - rig.px, rig.ty - rig.py, rig.tz - rig.pz).normalize();
      paramTws.forEach(t => t.kill()); paramTws = [];
      camTo({ px: rig.px + dir.x * push, py: rig.py + dir.y * push, pz: rig.pz + dir.z * push, tx: rig.tx + dir.x * push, ty: rig.ty + dir.y * push, tz: rig.tz + dir.z * push, fov: rig.fov + 6, roll: rig.roll }, outT, 'power2.in');
      flow = gsap.timeline();
      flow.to(P, { fade: 1, whip: enter === 'whip' ? 1 : 0, duration: outT, ease: 'power2.in' });
      flow.add(() => {
        showSet(newSet);
        paramsTo(rev ? tp : targetParams(sc, st, true), 0, {}, true); P.fade = 1; P.whip = enter === 'whip' ? 1 : 0;
        if (!rev) paramsTo(Object.assign({}, tp, { fade: P.fade, whip: P.whip }), dur, st.pt || {}, false, { fade: 1, whip: 1 });
        const from = st.from || null;
        // arrival: from an explicit pose, else from slightly behind the target
        if (from && !rev) camTo(camOf({ cam: from, set: st.set }, sc), 0);
        else {
          const d2 = new THREE.Vector3(to.tx - to.px, to.ty - to.py, to.tz - to.pz).normalize();
          const back = rev ? -3 : 5;
          camTo({ px: to.px - d2.x * back, py: to.py - d2.y * back + (rev ? 0 : 0.8), pz: to.pz - d2.z * back, tx: to.tx, ty: to.ty, tz: to.tz, fov: to.fov + 4, roll: to.roll + (rev ? 0 : 3) }, 0);
        }
        camTo(to, Math.max(1.4, dur * 0.9), st.arriveEase || 'power3.out', rev ? null : viaOf(st.via, sc, st), rev ? null : viaOf(st.tvia, sc, st));
      });
      flow.to(P, { fade: tp.fade || 0, whip: 0, duration: 0.7, ease: 'power2.out' });
    } else {
      // same set (or a fly-through between linked sets): one continuous move
      showSet(newSet);
      let via = viaOf(st.via, sc, st), tvia = viaOf(st.tvia, sc, st);
      if (rev) { via = prev.st.via ? viaOf(prev.st.via, prev.sc, prev.st).reverse() : null; tvia = prev.st.tvia ? viaOf(prev.st.tvia, prev.sc, prev.st).reverse() : null; }
      camTo(to, dur, mover.ease || 'power2.inOut', via, tvia);
      paramsTo(tp, dur, rev ? (st.ptBack || {}) : (st.pt || {}));
    }

    applyUI(prev, next, prev ? opts.instant : false, lm);
    if (onState) onState(next, cur, prev);
  }

  function frame(dt, t) {
    syncParams();
    const st = STATES[cur];
    rig.apply(low() ? 0 : (st && st.st.sway !== undefined ? st.st.sway : 1), t);
    updateAnchors();
  }

  return { go, frame, STATES, get cur() { return cur; }, showSet, P };
}
