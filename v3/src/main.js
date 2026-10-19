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
  let gpu = '';
  try { const gl = document.createElement('canvas').getContext('webgl'); const ext = gl && gl.getExtension('WEBGL_debug_renderer_info'); gpu = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : ''; } catch (e) { /* ignore */ }
  const lite = q.has('lite');   // opt-in lighter renderer; the automatic frame-rate fallback below still protects slow machines
  let quality = q.has('q') ? +q.get('q') : lite ? 0 : 1;
  const R = createRenderer(canvas, quality);
  R.renderer.shadowMap.enabled = !lite;
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
  const small = Math.min(screen.width, screen.height) < 820;
  let prCap = quality >= 1 && !small ? 1.5 : 1;
  const maxW = lite ? 1280 : 2560;          // render width cap in device pixels
  if (small) R.bloom.setSize(480, 270);
  function fit() {
    const W = innerWidth, H = innerHeight;
    const w = Math.min(W, H * 16 / 9), h = w * 9 / 16;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    canvas.style.left = ((W - w) / 2) + 'px'; canvas.style.top = ((H - h) / 2) + 'px';
    const pr = Math.min(devicePixelRatio || 1, prCap, maxW / w);
    R.resize(Math.round(w), Math.round(h), pr);
    document.documentElement.style.setProperty('--k', Math.min(W / 1920, H / 1080));
  }
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(fit, 120); }); fit();

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
    // compile shaders and upload textures for EVERYTHING in the set, including objects that start hidden
    const hidden = [];
    sets[names[i]].root.traverse(o => { if (!o.visible && o !== sets[names[i]].root) { hidden.push(o); o.visible = true; } });
    try { R.renderer.compile(R.scene, R.camera); } catch (e) { /* older drivers */ }
    sets[names[i]].root.traverse(o => { const m = o.material; if (!m) return; (Array.isArray(m) ? m : [m]).forEach(mm => ['map', 'emissiveMap'].forEach(k => { if (mm[k] && mm[k].isTexture) R.renderer.initTexture(mm[k]); })); });
    R.composer.render();
    hidden.forEach(o => { o.visible = false; });
    await step(0.78 + 0.2 * (i + 1) / names.length);
  }

  // ------------------------------------------------ low motion
  // low motion only when asked for (M key or ?lowmo): many laptops report 'reduce motion' by default,
  // which silently turned every camera move into a jump-cut
  try { lowmo = localStorage.getItem('ke3-lowmo-v2') === '1'; } catch (e) { /* ignore */ }
  if (q.has('lowmo')) lowmo = true;
  document.body.classList.toggle('lowmo', lowmo);
  function setLow(on) { lowmo = on; document.body.classList.toggle('lowmo', on); try { localStorage.setItem('ke3-lowmo-v2', on ? '1' : '0'); } catch (e) { /* ignore */ } }

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
    // after warm-up, if frames are genuinely slow, shed cost while keeping the picture sharp:
    // step 1 drops shadows and multisampling, step 2 trims resolution slightly (never below 85%)
    if (t > 4 && checked < 2 && !q.has('q') && !q.has('sharp')) {
      acc.push(dt);
      if (acc.length >= 120) {
        const med = acc.slice().sort((a, b) => a - b)[acc.length >> 1];
        acc = [];
        if (med > 1 / 28) {
          if (checked === 0) { R.renderer.shadowMap.enabled = false; R.setSamples(0); }
          else { prCap = Math.max(0.85, Math.min(prCap, devicePixelRatio || 1) * 0.85); fit(); }
          checked++;
        } else checked = 2;
      }
    }
    requestAnimationFrame(frame);
  }
  // capture mode: a virtual clock stepped by the recorder (smooth previews on slow renderers)
  let vt = 0;
  if (capture) R.U.uGrain.value = 0.012;   // grain is noise to a video encoder: keep exported clips compact
  if (capture) { const G = gsap.globalTimeline; G.pause(); window.__step = (dt = 1 / 30) => { G.totalTime(G.totalTime() + dt); render(dt); }; }

  const m = location.hash.match(/^#(\d+)(?:\.(\d+))?/);
  let idx = 0;
  if (m) { const f = deck.STATES.findIndex(s => s.si === +m[1] - 1 && s.step === (+m[2] || 1) - 1); if (f >= 0) idx = f; }
  deck.go(idx, { instant: true });
  if (!capture) frame(); else window.__step(0);
  await step(1, 'ready');
  loader.classList.add('done');
  document.body.classList.add('ready', 'cursor-hidden');
  window.__gpu = { gpu, lite };
  window.__deck = { go: (i, o) => deck.go(i, o), states: deck.STATES, get cur() { return deck.cur; }, scenes: SCENES, params: PARAMS, rig, R, sets };
}

boot().catch(e => { console.error(e); status.textContent = 'error: ' + e.message; });
