// Boot: fonts → world → shader warm-up → deck. Manual advance only.
import * as THREE from 'three';
import { createRenderer, cameraRig } from './world/render.js';
import { buildStreet, ANCH, TICK } from './world/street.js';
import { buildChamber } from './sets/chamber.js';
import { buildDesk } from './sets/desk.js';
import { buildImad } from './sets/imad.js';
import { buildRoofs } from './sets/roofs.js';
import { buildOps } from './sets/ops.js';
import { buildStudio } from './sets/studio.js';
import { createDeck } from './deck/engine.js';
import { SCENES } from './deck/scenes.js';
import { createShell } from './ui/shell.js';
import { PARAMS } from './world/kit.js';
import gsap from 'gsap';

const $ = s => document.querySelector(s);
const loader = $('#loader');
const bar = $('#loader .bar i');
const status = $('#loader .s');
const step = (f, s) => { bar.style.width = (f * 100).toFixed(0) + '%'; if (s) status.textContent = s; return new Promise(r => requestAnimationFrame(() => setTimeout(r, 0))); };

async function boot() {
  const canvas = $('#gl');
  const test = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
  if (!test) { $('#nogl').style.display = 'block'; loader.classList.add('done'); return; }

  // fonts are drawn into canvas textures, so they must be ready first
  const faces = ['400 40px Anton', '500 40px "Plex Mono"', '400 40px "Plex Mono"', '400 40px "Source Sans 3"', '600 40px "Source Sans 3"', '600 40px Fraunces', 'italic 400 40px Fraunces', 'italic 600 40px Fraunces'];
  await Promise.race([Promise.all(faces.map(f => document.fonts.load(f).catch(() => null))), new Promise(r => setTimeout(r, 4000))]);
  await step(0.08, 'building the street…');

  const q = new URLSearchParams(location.search);
  if (q.has('test')) gsap.ticker.lagSmoothing(0);
  let quality = q.has('q') ? +q.get('q') : 1;
  const R = createRenderer(canvas, quality);
  R.renderer.shadowMap.enabled = true;
  R.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const rig = cameraRig(R.camera);

  const street = buildStreet(R.scene);
  await step(0.3, 'furnishing the room…');
  const sets = { street: { root: street.root, offset: [0, 0, 0], exitPush: 4 } };
  sets.chamber = buildChamber(R.scene, ANCH, TICK); await step(0.4, 'setting up the committee room…');
  sets.desk = buildDesk(R.scene, ANCH, TICK); await step(0.5, 'laying out the evidence…');
  sets.imad = buildImad(R.scene, ANCH, TICK); await step(0.58);
  sets.roofs = buildRoofs(R.scene, ANCH, TICK); await step(0.66);
  sets.ops = buildOps(R.scene, ANCH, TICK); await step(0.72);
  sets.studio = buildStudio(R.scene, ANCH, TICK); await step(0.78, 'warming up the lights…');

  // ------------------------------------------------ viewport: 16:9 letterbox, capped pixel ratio
  let lowmo = false;
  const low = () => lowmo;
  let prCap = quality >= 1 ? 1.5 : 1;
  function fit() {
    const W = innerWidth, H = innerHeight;
    const w = Math.min(W, H * 16 / 9), h = w * 9 / 16;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    canvas.style.left = ((W - w) / 2) + 'px'; canvas.style.top = ((H - h) / 2) + 'px';
    const pr = Math.min(devicePixelRatio || 1, prCap, 2560 / w);
    R.resize(Math.round(w), Math.round(h), pr);
    document.documentElement.style.setProperty('--k', Math.min(W / 1920, H / 1080));
  }
  addEventListener('resize', fit); fit();

  // ------------------------------------------------ shader warm-up: compile every set's light configuration up front
  const uiHost = $('#stage');
  const deck = createDeck({ R, rig, sets, anchors: ANCH, scenes: SCENES, uiHost, low, onState: (...a) => shell && shell.onState(...a) });
  const names = Object.keys(sets);
  for (let i = 0; i < names.length; i++) {
    deck.showSet(names[i]);
    const first = deck.STATES.find(s => (s.st.set || s.sc.set) === names[i]);
    if (first) {
      const c = first.st.cam, o = sets[names[i]].offset || [0, 0, 0];
      Object.assign(rig, { px: c.p[0] + o[0], py: c.p[1] + o[1], pz: c.p[2] + o[2], tx: c.t[0] + o[0], ty: c.t[1] + o[1], tz: c.t[2] + o[2], fov: c.fov || 45 });
      rig.apply();
    }
    try { R.renderer.compile(R.scene, R.camera); } catch (e) { /* older drivers */ }
    R.composer.render();
    await step(0.78 + 0.2 * (i + 1) / names.length);
  }

  // ------------------------------------------------ low motion
  try { const v = localStorage.getItem('ke3-lowmo'); if (v !== null) lowmo = v === '1'; else lowmo = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { /* ignore */ }
  if (q.has('lowmo')) lowmo = true;
  document.body.classList.toggle('lowmo', lowmo);
  function setLow(on) { lowmo = on; document.body.classList.toggle('lowmo', on); try { localStorage.setItem('ke3-lowmo', on ? '1' : '0'); } catch (e) { /* ignore */ } }

  let shell = null;
  shell = createShell({ deck, scenes: SCENES, low, setLow });

  // ------------------------------------------------ loop with automatic quality fallback
  const clock = new THREE.Clock();
  let t = 0, acc = [], checked = 0;
  const capture = q.has('capture');
  function render(dt) {
    t += dt;
    TICK.forEach(f => f(dt, t));
    deck.frame(dt, t);
    R.U.uTime.value = t;
    R.composer.render();
    window.__frames = (window.__frames || 0) + 1;
  }
  function frame() {
    const dt = Math.min(0.05, clock.getDelta());
    render(dt);
    // after warm-up, if frames are slow, lower the pixel ratio once or twice
    if (t > 2 && checked < 2 && !q.has('q')) {
      acc.push(dt);
      if (acc.length >= 90) {
        const avg = acc.reduce((a, b) => a + b, 0) / acc.length;
        acc = [];
        if (avg > 1 / 38) { prCap = Math.max(0.6, (R.size[2] || 1) * 0.75); fit(); checked++; }
        else checked = 2;
      }
    }
    requestAnimationFrame(frame);
  }
  // capture mode: a virtual clock stepped by the recorder (smooth previews on slow renderers)
  let vt = 0;
  if (capture) { const G = gsap.globalTimeline; G.pause(); window.__step = (dt = 1 / 30) => { G.totalTime(G.totalTime() + dt); render(dt); }; }

  const m = location.hash.match(/^#(\d+)(?:\.(\d+))?/);
  let idx = 0;
  if (m) { const f = deck.STATES.findIndex(s => s.si === +m[1] - 1 && s.step === (+m[2] || 1) - 1); if (f >= 0) idx = f; }
  deck.go(idx, { instant: true });
  if (!capture) frame(); else window.__step(0);
  await step(1, 'ready');
  loader.classList.add('done');
  document.body.classList.add('ready', 'cursor-hidden');
  window.__deck = { go: (i, o) => deck.go(i, o), states: deck.STATES, get cur() { return deck.cur; }, scenes: SCENES, params: PARAMS, rig, R, sets };
}

boot().catch(e => { console.error(e); status.textContent = 'error: ' + e.message; });
