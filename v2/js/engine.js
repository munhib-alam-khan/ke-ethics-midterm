/* ==========================================================================
   2.5D layered motion engine
   - Each WORLD is a set of raster/HTML layers placed at real depths (x, y, z).
   - A pinhole CAMERA (x, y, z, roll) projects them: scale = F / (z - camZ).
     Parallax, dolly-through, pull-back and occlusion fall out of the maths.
   - Transitions are sampled into per-layer WAAPI keyframes (transform +
     opacity only: compositor friendly). Every layer has its own delay,
     duration, easing, curved path (via) and rotation, so objects never move
     in lock-step.
   - Interrupting a transition reads the exact current pose from the sampler,
     so rapid clicks or reversals never jump or stack.
   ========================================================================== */
(function () {
  'use strict';
  const F = 1000, CX = 960, CY = 540, NEAR = 36;

  const EASE = {
    lin: t => t,
    in: t => t * t * t,
    out: t => 1 - Math.pow(1 - t, 3),
    out2: t => 1 - (1 - t) * (1 - t),
    io: t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    io2: t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    sine: t => -(Math.cos(Math.PI * t) - 1) / 2,
    expo: t => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    back: t => { const c1 = 1.3, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); },
    soft: t => { const c1 = 0.7, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); }
  };
  const ev = (name, t, rev) => { const f = EASE[name] || EASE.io; return rev ? 1 - f(1 - t) : f(t); };
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const POSE_KEYS = ['x', 'y', 'z', 's', 'r', 'o'];

  // ------------------------------------------------------------ projection
  function project(p, cam, w, h) {
    let X, Y, S, R, O = p.o;
    if (p.z === null || p.z === undefined) {           // screen-locked layer
      X = p.x; Y = p.y; S = p.s; R = p.r;
    } else {
      let dz = p.z - cam.z;
      if (dz < NEAR * 3) O *= clamp((dz - NEAR) / (NEAR * 2));
      dz = Math.max(dz, NEAR * 0.5);
      const k = F / dz;
      const dx = p.x - cam.x, dy = p.y - cam.y;
      const a = -(cam.roll || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
      X = CX + (dx * c - dy * s) * k;
      Y = CY + (dx * s + dy * c) * k;
      S = p.s * k;
      R = p.r - (cam.roll || 0);
      if (S > 60) O = 0;
      // cull far off-screen layers (cheap) — they still get correct transforms
      const half = Math.max(w, h) * S * 0.75;
      if (X + half < -400 || X - half > 2320 || Y + half < -400 || Y - half > 1480) O = 0;
    }
    return { X, Y, S, R, O: clamp(O) };
  }
  const tf = (q, w, h) => `translate(${(q.X - w / 2).toFixed(2)}px,${(q.Y - h / 2).toFixed(2)}px) rotate(${q.R.toFixed(3)}deg) scale(${q.S.toFixed(5)})`;

  // ------------------------------------------------------------ interpolation
  function interpLayer(A, B, sp, t, rev) {
    sp = sp || {};
    const d = sp.d || 0, du = sp.t === undefined ? 1 - d : sp.t;
    const u = clamp((t - d) / Math.max(du, 1e-4));
    const e = ev(sp.e || 'io', u, rev);
    const p = {};
    if (sp.via && A.z !== null && A.z !== undefined) {
      const V = sp.via, m = 1 - e;
      for (const k of ['x', 'y', 'z']) p[k] = m * m * A[k] + 2 * m * e * (V[k] === undefined ? (A[k] + B[k]) / 2 : V[k]) + e * e * B[k];
    } else if (sp.via) {
      const V = sp.via, m = 1 - e;
      for (const k of ['x', 'y']) p[k] = m * m * A[k] + 2 * m * e * (V[k] === undefined ? (A[k] + B[k]) / 2 : V[k]) + e * e * B[k];
      p.z = A.z;
    } else {
      p.x = lerp(A.x, B.x, e); p.y = lerp(A.y, B.y, e);
      p.z = (A.z === null || A.z === undefined) ? A.z : lerp(A.z, B.z, e);
    }
    p.s = lerp(A.s, B.s, e) * (1 + (sp.sPeak || 0) * Math.sin(Math.PI * e));
    p.r = lerp(A.r, B.r, e) + (sp.spin || 0) * Math.sin(Math.PI * e);
    const od = sp.oD === undefined ? d : sp.oD, ot = sp.oT === undefined ? Math.min(du, 0.5) : sp.oT;
    const uo = clamp((t - od) / Math.max(ot, 1e-4));
    p.o = lerp(A.o, B.o, EASE.sine(uo)) + (sp.oPeak || 0) * Math.sin(Math.PI * clamp((t - (sp.pD || 0)) / (sp.pT || 1)));
    return p;
  }

  function camAt(C0, C1, path, t, rev) {
    // path: [{t, x, y, z, roll, e, logz}] intermediate waypoints (absolute);
    // a point's e/logz describe the segment that ENDS at it. C1 may carry e/logz too.
    const pts = [Object.assign({ t: 0 }, C0)].concat(path || [], [Object.assign({ t: 1 }, C1)]);
    let i = 0;
    while (i < pts.length - 2 && t > pts[i + 1].t) i++;
    const a = pts[i], b = pts[i + 1];
    const u = clamp((t - a.t) / Math.max(b.t - a.t, 1e-4));
    const e = ev(b.e || 'io', u, rev);
    const c = {};
    if (b.logz !== undefined) {            // perceptually even dolly
      const D0 = b.logz - a.z, D1 = b.logz - b.z;
      if (D0 > 0 && D1 > 0) {
        const D = D0 * Math.pow(D1 / D0, e);
        const p = (D - D0) / (D1 - D0 || 1);
        c.z = b.logz - D; c.x = lerp(a.x, b.x, p); c.y = lerp(a.y, b.y, p); c.roll = lerp(a.roll || 0, b.roll || 0, p);
        return c;
      }
    }
    c.x = lerp(a.x, b.x, e); c.y = lerp(a.y, b.y, e); c.z = lerp(a.z, b.z, e); c.roll = lerp(a.roll || 0, b.roll || 0, e);
    return c;
  }

  // mirror a forward spec so it can be played backwards from any pose
  function mirrorSpec(spec) {
    if (!spec) return spec;
    const L = {};
    for (const k in (spec.L || {})) {
      const s = Object.assign({}, spec.L[k]);
      const d = s.d || 0, du = s.t === undefined ? 1 - d : s.t;
      s.d = clamp(1 - (d + du)); s.t = du;
      if (s.oD !== undefined || s.oT !== undefined) { const od = s.oD === undefined ? d : s.oD, ot = s.oT === undefined ? Math.min(du, 0.5) : s.oT; s.oD = clamp(1 - (od + ot)); s.oT = ot; }
      s.rev = true;
      L[k] = s;
    }
    const W = spec.cam || [], E = spec.camEnd || {};
    const seg = W.map(p => ({ e: p.e, logz: p.logz })).concat([{ e: E.e, logz: E.logz }]);
    const n = W.length;
    const path = W.slice().reverse().map((p, j) => Object.assign({}, p, { t: 1 - p.t }, seg[n - j] ? { e: seg[n - j].e, logz: seg[n - j].logz } : {}));
    return { L, cam: path, camEnd: seg[0], rev: true };
  }

  // ------------------------------------------------------------ World
  class World {
    constructor(def, host) {
      this.def = def;
      this.el = document.createElement('div');
      this.el.className = 'world';
      this.el.id = 'w-' + def.id;
      this.layers = {};
      this.order = [];
      for (const L of def.layers) {
        const el = document.createElement('div');
        el.className = 'L ' + (L.cls || '');
        el.dataset.k = L.k;
        const size = L.img ? (window.ASSETS[L.img] || [100, 100]) : [L.w, L.h];
        el.style.width = size[0] + 'px';
        el.style.height = size[1] + 'px';
        if (L.img) el.innerHTML = `<img alt="" draggable="false" data-src="assets/img/${L.img}.webp">` + (L.html || '');
        else el.innerHTML = L.html || '';
        el.style.opacity = 0;
        this.el.appendChild(el);
        this.layers[L.k] = { def: L, el, w: size[0], h: size[1], anim: null };
        this.order.push(L.k);
      }
      host.appendChild(this.el);
      this.cam = Object.assign({ x: 0, y: 0, z: 0, roll: 0 }, def.cam || {});
      this.poses = {};
      for (const k of this.order) this.poses[k] = this.base(k);
      this.run = null;
      this.loaded = false;
      this.fxState = {};
    }
    base(k) {
      const d = this.layers[k].def;
      return { x: d.x || 0, y: d.y || 0, z: d.z === undefined ? null : d.z, s: d.s === undefined ? 1 : d.s, r: d.r || 0, o: d.o === undefined ? 1 : d.o };
    }
    load() {
      if (this.loaded) return;
      this.el.querySelectorAll('img[data-src]').forEach(i => { i.decoding = 'async'; i.src = i.dataset.src; });
      this.loaded = true;
    }
    // compose a full target pose map from overrides
    target(over, fallback) {
      const out = {};
      for (const k of this.order) {
        const b = this.base(k);
        const o = over && over[k];
        if (o) out[k] = Object.assign(b, pick(o));
        else if (fallback) out[k] = Object.assign({}, fallback[k] || b, { o: 0 });
        else out[k] = b;
      }
      return out;
    }
    current() {
      if (!this.run) return { poses: clone(this.poses), cam: Object.assign({}, this.cam) };
      const u = clamp((performance.now() - this.run.t0) / this.run.T);
      return this.run.sample(u);
    }
    anchor(k, lx, ly, poses, cam) {
      const L = this.layers[k]; if (!L) return null;
      const p = (poses || this.poses)[k];
      const a = (p.r || 0) * Math.PI / 180;
      const wx = p.x + (lx * Math.cos(a) - ly * Math.sin(a)) * p.s;
      const wy = p.y + (lx * Math.sin(a) + ly * Math.cos(a)) * p.s;
      const q = project({ x: wx, y: wy, z: p.z, s: 1, r: 0, o: 1 }, cam || this.cam, 0, 0);
      return q;
    }
    // animate from current pose to target poses with spec; T in ms
    go(toPoses, toCam, spec, T, opts = {}) {
      const cur = opts.from || this.current();
      this.stopDrift();
      const P0 = cur.poses, C0 = cur.cam, P1 = toPoses, C1 = Object.assign({ roll: 0 }, toCam);
      spec = spec || {};
      const rev = !!spec.rev;
      const camPath = spec.cam || null;
      const C1p = Object.assign({}, C1, spec.camEnd || {});
      const sample = (u) => {
        const cam = camAt(C0, C1p, camPath, u, rev);
        const poses = {};
        for (const k of this.order) poses[k] = interpLayer(P0[k], P1[k], spec.L && spec.L[k] || spec.Ldef, u, (spec.L && spec.L[k] && spec.L[k].rev) || false);
        return { poses, cam };
      };
      if (T <= 0 || opts.instant) {
        this.applyStatic(P1, C1);
        this.poses = clone(P1); this.cam = Object.assign({}, C1); this.run = null;
        return;
      }
      const N = Math.max(18, Math.min(72, Math.round(T / 55)));
      const frames = {};
      const vis = {};
      for (const k of this.order) { frames[k] = []; vis[k] = false; }
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const s = sample(u);
        for (const k of this.order) {
          const L = this.layers[k];
          const q = project(s.poses[k], s.cam, L.w, L.h);
          if (q.O > 0.001) vis[k] = true;
          frames[k].push({ transform: tf(q, L.w, L.h), opacity: q.O });
        }
      }
      for (const k of this.order) {
        const L = this.layers[k];
        if (L.anim) L.anim.cancel();
        if (!vis[k]) { L.el.style.visibility = 'hidden'; L.el.style.opacity = 0; L.anim = null; continue; }
        L.el.style.visibility = 'visible';
        L.anim = L.el.animate(frames[k], { duration: T, easing: 'linear', fill: 'forwards' });
      }
      const t0 = performance.now();
      this.run = { t0, T, sample };
      clearTimeout(this._done);
      this._done = setTimeout(() => {
        this.applyStatic(P1, C1);
        this.poses = clone(P1); this.cam = { x: C1.x, y: C1.y, z: C1.z, roll: C1.roll || 0 }; this.run = null;
        if (opts.onDone) opts.onDone();
      }, T + 30);
    }
    applyStatic(P, C) {
      for (const k of this.order) {
        const L = this.layers[k];
        if (L.anim) { L.anim.cancel(); L.anim = null; }
        const q = project(P[k], C, L.w, L.h);
        L.el.style.transform = tf(q, L.w, L.h);
        L.el.style.opacity = q.O;
        L.el.style.visibility = q.O > 0.001 ? 'visible' : 'hidden';
      }
    }
    drift(d) {
      // slow, gentle depth drift during speaking holds (camera only; text is not in the world)
      if (!d || document.body.classList.contains('lowmo')) return;
      const C1 = Object.assign({}, this.cam);
      for (const k of ['x', 'y', 'z', 'roll']) if (d[k]) C1[k] = (C1[k] || 0) + d[k];
      const base = { poses: clone(this.poses), cam: Object.assign({}, this.cam) };
      this._driftTimer = setTimeout(() => this.go(this.poses, C1, { Ldef: { e: 'lin' }, cam: null }, d.dur || 16000, { from: base }), 60);
      this._drifting = true;
    }
    stopDrift() { clearTimeout(this._driftTimer); this._drifting = false; }
    show(on) { this.el.style.display = on ? 'block' : 'none'; }
  }

  function pick(o) { const r = {}; for (const k of POSE_KEYS) if (o[k] !== undefined) r[k] = o[k]; return r; }
  function clone(P) { const r = {}; for (const k in P) r[k] = Object.assign({}, P[k]); return r; }

  // ------------------------------------------------------------ UI choreography (screen space, text)
  // Elements with [data-u]. Pose: {x, y, r, s, o}. Visible elements settle at x=y=r=0, s=1.
  class SceneUI {
    constructor(scene, host) {
      this.el = document.createElement('div');
      this.el.className = 'sui';
      this.el.id = 'ui-' + scene.id;
      this.el.innerHTML = scene.ui || '';
      host.appendChild(this.el);
      this.items = {};
      this.el.querySelectorAll('[data-u]').forEach(el => {
        this.items[el.dataset.u] = { el, pose: { x: 0, y: 0, r: 0, s: 1, o: 0 }, anim: null, t0: 0, T: 0, from: null, to: null };
        el.style.opacity = 0;
      });
    }
    poseNow(it) {
      if (!it.anim) return Object.assign({}, it.pose);
      const u = clamp((performance.now() - it.t0) / it.T);
      const e = ev(it.e, clamp((u * it.T - it.d) / Math.max(it.dur, 1)), false);
      const p = {};
      for (const k of ['x', 'y', 'r', 's', 'o']) p[k] = lerp(it.from[k], it.to[k], k === 'o' ? EASE.sine(clamp((u * it.T - it.d) / Math.max(it.dur * 0.7, 1))) : e);
      if (it.via) { const m = 1 - e; p.x = m * m * it.from.x + 2 * m * e * it.via.x + e * e * it.to.x; p.y = m * m * it.from.y + 2 * m * e * it.via.y + e * e * it.to.y; }
      return p;
    }
    // map: {name: {d, t, e, from:{...}, via:{x,y}, anchor:{x,y}, r, s}}
    apply(map, opts = {}) {
      const low = document.body.classList.contains('lowmo');
      for (const name in this.items) {
        const it = this.items[name];
        const spec = map && map[name];
        const cur = this.poseNow(it);
        if (it.anim) { it.anim.cancel(); it.anim = null; }
        let to, from = cur, d = 0, dur = 450, e = 'out', via = null;
        if (spec) {
          to = { x: 0, y: 0, r: spec.r || 0, s: spec.s || 1, o: spec.o === undefined ? 1 : spec.o };
          if (spec.at) { to.x = spec.at.x; to.y = spec.at.y; }
          if (cur.o < 0.02) {           // entering: start from its entry offset
            const f = spec.from || { y: 30 };
            from = { x: to.x + (f.x || 0), y: to.y + (f.y || 0), r: to.r + (f.r || 0), s: to.s * (f.s || 1), o: 0 };
            via = spec.via ? { x: to.x + spec.via.x, y: to.y + spec.via.y } : null;
            d = opts.instant ? 0 : (spec.d || 0); dur = spec.t || 900; e = spec.e || 'out';
          } else { d = 0; dur = opts.instant ? 0 : 700; e = 'io'; }
        } else {
          if (cur.o < 0.02) { it.pose = Object.assign(cur, { o: 0 }); it.el.style.opacity = 0; it.el.style.visibility = 'hidden'; continue; }
          to = Object.assign({}, cur, { o: 0, y: cur.y - 18 });
          if (opts.exit) Object.assign(to, opts.exit(name, cur));
          dur = opts.instant ? 0 : 420; e = 'in';
        }
        if (low) { from = Object.assign({}, to, { o: from.o }); via = null; d = opts.instant ? 0 : Math.min(d, 250); dur = opts.instant ? 0 : 380; }
        it.el.style.visibility = 'visible';
        const css = p => ({ transform: `translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px) rotate(${p.r.toFixed(2)}deg) scale(${p.s.toFixed(4)})`, opacity: clamp(p.o) });
        if (dur <= 0) { Object.assign(it.el.style, css(to)); it.pose = to; if (to.o < 0.02) it.el.style.visibility = 'hidden'; continue; }
        const N = 16, frames = [];
        for (let i = 0; i <= N; i++) {
          const u = i / N, ee = ev(e, u, false);
          const p = {};
          for (const k of ['x', 'y', 'r', 's']) p[k] = lerp(from[k], to[k], ee);
          if (via) { const m = 1 - ee; p.x = m * m * from.x + 2 * m * ee * via.x + ee * ee * to.x; p.y = m * m * from.y + 2 * m * ee * via.y + ee * ee * to.y; }
          p.o = lerp(from.o, to.o, EASE.sine(clamp(u / 0.7)));
          frames.push(css(p));
        }
        it.anim = it.el.animate(frames, { duration: dur, delay: d, easing: 'linear', fill: 'both' });
        Object.assign(it, { t0: performance.now(), T: d + dur, d, dur, from, to, via, e });
        it.pose = to;
        const a = it.anim;
        a.onfinish = () => { if (it.anim === a) { Object.assign(it.el.style, css(to)); a.cancel(); it.anim = null; if (to.o < 0.02) it.el.style.visibility = 'hidden'; } };
      }
    }
  }

  window.Engine = { World, SceneUI, project, mirrorSpec, EASE, F, CX, CY };
})();
