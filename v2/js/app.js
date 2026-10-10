/* ==========================================================================
   Presenter shell: state model (scene + reveal), world/scene transitions,
   overlays, keyboard, HUD. No audio, no auto-advance.
   ========================================================================== */
(function () {
  'use strict';
  const { World, SceneUI, mirrorSpec } = window.Engine;
  const SC = window.SCENES;
  const REFS = window.REFERENCES;
  const stage = document.getElementById('stage');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const isPresenter = /[?&]presenter\b/.test(location.search);
  const POSE = ['x', 'y', 'z', 's', 'r', 'o'];
  const low = () => document.body.classList.contains('lowmo');

  // ------------------------------------------------------------ state model
  const STATES = [];
  SC.forEach((sc, si) => sc.states.forEach((st, k) => STATES.push({ si, step: k })));
  let cur = -1;

  const worldHost = document.createElement('div'); worldHost.id = 'worlds'; stage.appendChild(worldHost);
  const uiHost = document.createElement('div'); uiHost.id = 'uis'; stage.appendChild(uiHost);
  const WORLDS = {};
  const getWorld = id => (WORLDS[id] = WORLDS[id] || new World(window.WORLDS[id], worldHost));
  SC.forEach(sc => { sc.uiObj = new SceneUI(sc, uiHost); sc.uiObj.el.style.display = 'none'; });

  // split per-layer overrides into pose + timing
  function split(over) {
    const pose = {}, timing = {};
    for (const k in over || {}) {
      const o = over[k], p = {}, t = {};
      for (const key in o) (POSE.includes(key) ? p : t)[key] = o[key];
      pose[k] = p; if (Object.keys(t).length) timing[k] = t;
    }
    return { pose, timing };
  }
  const merge = (...ms) => { const r = {}; for (const m of ms) for (const k in m || {}) r[k] = Object.assign({}, r[k] || {}, m[k]); return r; };

  function stateTarget(sc, k) {
    const st = sc.states[k];
    const w = getWorld(sc.world);
    const all = merge(sc.L, st.L);
    const { pose, timing } = split(all);
    const stOnly = split(st.L || {}).timing;
    const spec = Object.assign({}, st.spec || {}, { L: stOnly });
    return { poses: w.target(pose), cam: Object.assign({ roll: 0 }, st.cam), spec, T: st.dur || 1200, timingAll: timing };
  }
  function enterTarget(sc) {      // where this scene's world layers start when arriving from another world
    const w = getWorld(sc.world);
    const s0 = stateTarget(sc, 0);
    const en = sc.enter || {};
    const { pose } = split(en.L || {});
    const dl = sc.enterDelta || {};
    const poses = {};
    for (const k of w.order) {
      const b = s0.poses[k];
      if (dl[k]) {
        const d = dl[k];
        poses[k] = Object.assign({}, b, { x: b.x + (d.x || 0), y: b.y + (d.y || 0), z: (b.z === null || b.z === undefined) ? b.z : b.z + (d.z || 0), r: b.r + (d.r || 0), s: b.s * (d.s || 1) }, d.o !== undefined ? { o: d.o } : {});
      } else if (pose[k]) poses[k] = Object.assign({}, b, pose[k]);
      else poses[k] = Object.assign({}, b, en.keep ? {} : { o: 0 });
    }
    return { poses, cam: Object.assign({}, s0.cam, en.cam || {}) };
  }
  function exitTarget(sc, curPoses) {
    const w = getWorld(sc.world);
    const ex = sc.exit || {};
    const { pose, timing } = split(ex.L || {});
    const poses = {};
    for (const k of w.order) poses[k] = pose[k] ? Object.assign({}, curPoses[k], pose[k]) : Object.assign({}, curPoses[k], ex.keep ? {} : { o: 0 });
    return { poses, cam: Object.assign({}, w.cam, ex.cam || {}), spec: Object.assign({}, ex.spec || {}, { L: timing, Ldef: ex.Ldef || { e: 'in', oT: 0.6 } }) };
  }

  function uiMap(sc, k, poses, cam) {
    const st = sc.states[k];
    const w = getWorld(sc.world);
    const map = {};
    for (const name in st.U || {}) {
      const u = Object.assign({}, st.U[name]);
      if (u.anchor) {
        const q = w.anchor(u.anchor.k, u.anchor.lx || 0, u.anchor.ly || 0, poses, cam);
        if (q) u.at = { x: q.X + (u.anchor.ax || 0), y: q.Y + (u.anchor.ay || 0) };
      }
      map[name] = u;
    }
    return map;
  }

  function preload(si) { for (let k = si; k <= Math.min(SC.length - 1, si + 2); k++) getWorld(SC[k].world).load(); if (si > 0) getWorld(SC[si - 1].world).load(); }

  let hideTimers = {};
  function go(index, opts = {}) {
    index = Math.max(0, Math.min(STATES.length - 1, index));
    if (index === cur && !opts.force) return;
    const prev = cur >= 0 ? STATES[cur] : null;
    const next = STATES[index];
    const rev = prev && index < cur;
    const adjacent = prev && Math.abs(index - cur) === 1 && !opts.instant;
    cur = index;
    const sc = SC[next.si], w = getWorld(sc.world);
    preload(next.si);
    w.show(true);
    clearTimeout(hideTimers[sc.world]);
    const tgt = stateTarget(sc, next.step);
    const motion = adjacent && !low();
    let T = tgt.T;

    if (!prev || SC[prev.si].world === sc.world) {
      if (!prev || !adjacent) {
        if (!prev || low()) w.go(tgt.poses, tgt.cam, null, 0, { instant: true });
        else w.go(tgt.poses, tgt.cam, { Ldef: { e: 'io' } }, 900);
        T = 900;
      } else if (low()) {
        w.go(tgt.poses, tgt.cam, null, 0, { instant: true });
        fadeFlash(w);
      } else if (!rev) {
        w.go(tgt.poses, tgt.cam, tgt.spec, T);
      } else {
        const from = STATES[index + 1];
        const fsc = SC[from.si];
        const ft = stateTarget(fsc, from.step);
        T = Math.round(ft.T * 0.8);
        w.go(tgt.poses, tgt.cam, mirrorSpec(ft.spec), T);
      }
    } else {
      // world change
      const osc = SC[prev.si], ow = getWorld(osc.world);
      const forwardStack = !rev;
      w.el.style.zIndex = forwardStack ? 3 : 2;
      ow.el.style.zIndex = forwardStack ? 2 : 3;
      if (motion) {
        if (!rev) {
          const en = enterTarget(sc);
          w.go(en.poses, en.cam, null, 0, { instant: true });
          w.go(tgt.poses, tgt.cam, tgt.spec, T);
          const ex = exitTarget(osc, ow.current().poses);
          ow.go(ex.poses, ex.cam, ex.spec, Math.round(T * (osc.exit && osc.exit.frac || 0.8)));
        } else {
          // arriving back into the previous scene from its exit pose
          const ex = exitTarget(sc, tgt.poses);
          w.go(ex.poses, ex.cam, null, 0, { instant: true });
          const nsc = SC[STATES[index + 1].si];
          const ft = stateTarget(nsc, 0);
          T = Math.round(ft.T * 0.8);
          w.go(tgt.poses, tgt.cam, mirrorSpec(ex.spec), T);
          const en = enterTarget(nsc);
          ow.go(en.poses, en.cam, mirrorSpec(ft.spec), T);
        }
      } else {
        w.go(tgt.poses, tgt.cam, null, 0, { instant: true });
        T = 450;
        w.el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450 });
        ow.el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, fill: 'none' });
      }
      const oid = osc.world;
      hideTimers[oid] = setTimeout(() => { if (SC[STATES[cur].si].world !== oid) { getWorld(oid).show(false); getWorld(oid).stopDrift(); } }, T + 120);
    }

    // state class hooks for CSS-driven details
    w.el.dataset.state = `${sc.id}-${next.step}`;
    // effects
    const st = sc.states[next.step];
    for (const fx in st.fx || {}) if (w.def.fx && w.def.fx[fx]) w.def.fx[fx](w, st.fx[fx], motion ? T : 0);
    // drift during the hold
    clearTimeout(go._drift);
    if (st.drift) go._drift = setTimeout(() => { if (STATES[cur] === next) w.drift(st.drift); }, (motion ? T : 0) + 200);

    // UI
    const map = uiMap(sc, next.step, tgt.poses, tgt.cam);
    if (prev && prev.si !== next.si) {
      const oui = SC[prev.si].uiObj;
      oui.apply({}, { instant: !motion });
      const oel = oui.el;
      clearTimeout(oel._t); oel._t = setTimeout(() => { if (STATES[cur].si !== prev.si) oel.style.display = 'none'; }, 900);
    }
    sc.uiObj.el.style.display = 'block';
    clearTimeout(sc.uiObj.el._t);
    sc.uiObj.apply(map, { instant: !prev || (!adjacent && !low()) || (rev && prev.si !== next.si && false) });

    if (!isPresenter) history.replaceState(null, '', `#${next.si + 1}.${next.step + 1}`);
    updateHud(); renderNotes(); broadcast();
  }
  function fadeFlash(w) { w.el.animate([{ opacity: 0.6 }, { opacity: 1 }], { duration: 380 }); }
  const nextState = () => go(cur + 1);
  const prevState = () => go(cur - 1);

  // ------------------------------------------------------------ scaling
  function fit() { document.documentElement.style.setProperty('--k', Math.min(innerWidth / 1920, innerHeight / 1080)); }
  addEventListener('resize', fit); fit();

  // ------------------------------------------------------------ overlays
  const overlays = { notes: $('#notes'), overview: $('#overview'), evidence: $('#evidence'), blackout: $('#blackout'), help: $('#help') };
  const isOpen = n => overlays[n].classList.contains('open');
  function toggle(n, force) {
    const open = force === undefined ? !isOpen(n) : force;
    overlays[n].classList.toggle('open', open);
    if (n === 'overview' && open) buildOverview();
    if (n === 'evidence' && open) { overlays.evidence.scrollTop = 0; setTimeout(() => $('#evidence h2').focus(), 30); }
    if (n === 'notes') renderNotes();
    updateHud();
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function renderNotes() {
    const box = overlays.notes;
    if (!box.classList.contains('open') && !isPresenter) return;
    const st = STATES[cur]; if (!st) return;
    const sc = SC[st.si];
    const nx = STATES[cur + 1];
    const nextLabel = nx ? (nx.si === st.si ? `next: reveal ${nx.step + 1} — ${esc(sc.cues[nx.step] || '')}` : `next: scene ${nx.si + 1} — ${esc(SC[nx.si].title)}`) : 'END — hold. Press E for evidence during questions.';
    box.innerHTML = `<span class="pos">scene ${st.si + 1}/${SC.length} · reveal ${st.step + 1}/${sc.states.length} · advance ${cur + 1}/${STATES.length}</span>
      <h3>${esc(sc.chapter)} — ${esc(sc.title)}</h3>
      <div class="grid"><div class="script">${sc.script.map((p, k) => `<p class="${k === st.step ? 'now' : k > st.step ? 'later' : ''}">${esc(p).replace(/\n/g, '<br>')}</p>`).join('')}</div>
      <div>${sc.cues.map((c, k) => `<p class="cue">${k === st.step ? '▶ ' : ''}${esc(c)}</p>`).join('')}<p class="cue" style="color:#f0ad45">${nextLabel}</p>
      <p class="qualnote">${esc(sc.notes || '')}</p>${sc.sources.length ? `<p class="qualnote"><b>Sources:</b> ${sc.sources.map(s => esc(REFS[s].short)).join('; ')}</p>` : ''}</div></div>`;
  }
  function buildOverview() {
    const grid = $('#overview .grid');
    if (!grid.dataset.built) {
      grid.innerHTML = SC.map((sc, i) => `<button type="button" data-si="${i}" style="background-image:url('assets/img/${sc.thumb}.webp')"><span><b>${String(i + 1).padStart(2, '0')}</b>${esc(sc.title)}</span></button>`).join('');
      grid.dataset.built = '1';
      grid.addEventListener('click', e => { const b = e.target.closest('button'); if (b) jumpToScene(+b.dataset.si); });
    }
    const si = STATES[cur].si;
    $$('button', grid).forEach((b, i) => b.classList.toggle('cur', i === si));
    setTimeout(() => $$('button', grid)[si].focus(), 20);
  }
  function jumpToScene(si) { toggle('overview', false); go(STATES.findIndex(s => s.si === si), { instant: true }); }
  function buildEvidence() {
    const refs = Object.entries(REFS).sort((a, b) => a[1].apa.localeCompare(b[1].apa));
    const used = {};
    SC.forEach((sc, i) => sc.sources.forEach(s => { (used[s] = used[s] || []).push(i + 1); }));
    overlays.evidence.innerHTML = `
      <h2 tabindex="-1">References &amp; evidence</h2>
      <p class="hint">Esc or E to close · Tab moves between links · Links open in a new tab (requires internet)</p>
      <h3>Interviews (primary evidence)</h3>
      <table><tr><th>Participant</th><th>Date</th><th>Report</th></tr>${window.INTERVIEWS.map(r => `<tr><td>${esc(r.who)}</td><td>${r.date}</td><td>${r.appx}</td></tr>`).join('')}</table>
      <p>Four semi-structured interviews, October 3–9, 2026, in English and Urdu. Consent obtained; both employees anonymised. An access-based sample — situated perspectives, not a representative survey. Quotations on screen are exact excerpts from the report; translations are the research team's.</p>
      <p class="warn"><b>Interview recordings (instructor access, within participants' consent):</b><br><a href="${window.RECORDINGS_URL}" target="_blank" rel="noopener">OneDrive / SharePoint audio folder</a><br>Do not open or play recordings during the presentation: they contain identifying details.</p>
      <h3>References</h3>
      ${refs.map(([key, r]) => `<p class="ref">${r.apa} <a href="${r.url}" target="_blank" rel="noopener">${esc(decodeURI(r.url))}</a>${used[key] ? ` <span style="color:#777">· scenes ${used[key].join(', ')}</span>` : ''}</p>`).join('')}
      <h3>Labelling conventions used on screen</h3>
      <p><b>Company-reported</b> — figures published by K-Electric, not independently verified (2025 activities predate the September 2026 hearing). <b>Participant-reported</b> — estimates given in interviews, not verified. <b>Paraphrase / our summary</b> — our wording of a document or of published reporting; no document or article text is reproduced. <b>Illustrative</b> — the opening household, the 8-paying / 2-defaulting street and the recommendation diagrams are teaching examples, not data or implemented results. <b>Proposed</b> — recommendations and milestones are our proposals, not existing KE practice or legal deadlines.</p>
      <h3>Images</h3>
      <p>Every image is an original illustration painted for this project as separate layers (see <code>docs/ASSET_REGISTER.md</code>). None is a photograph of a real person, meeting, document or place, and none is evidence. No faces of participants or employees are shown. Fonts: Fraunces, Anton, Source Sans 3 and IBM Plex Mono (SIL Open Font License), bundled locally.</p>
      <p class="hint" style="margin-top:30px">Karachi School of Business and Leadership · Business Ethics &amp; Law · Dr Faryal Razzaq · Munhib Alam Khan, Rabie Sami, Abdullah Khan, Karan Kumar</p>`;
  }

  // ------------------------------------------------------------ HUD
  const hud = $('#hud'), progress = $('#progress');
  let hudTimer;
  function showHud() {
    hud.classList.add('show'); progress.classList.add('show');
    document.body.classList.remove('cursor-hidden');
    clearTimeout(hudTimer);
    hudTimer = setTimeout(() => {
      if (hud.matches(':hover') || hud.contains(document.activeElement)) return showHud();
      hud.classList.remove('show'); progress.classList.remove('show'); document.body.classList.add('cursor-hidden');
    }, 2600);
  }
  function updateHud() {
    const st = STATES[cur]; if (!st) return;
    $('#hud .pos').textContent = `${st.si + 1}/${SC.length} · ${st.step + 1}/${SC[st.si].states.length}`;
    progress.style.width = `${((cur + 1) / STATES.length) * 100}%`;
    $$('#hud [data-act]').forEach(b => {
      const a = b.dataset.act;
      if (['notes', 'overview', 'evidence'].includes(a)) b.setAttribute('aria-pressed', isOpen(a));
      if (a === 'lowmo') b.setAttribute('aria-pressed', low());
    });
  }
  hud.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; act(b.dataset.act); b.blur(); });
  ['mousemove', 'touchstart'].forEach(ev => addEventListener(ev, showHud, { passive: true }));

  function setLowMotion(on) {
    document.body.classList.toggle('lowmo', on);
    try { localStorage.setItem('ke2-lowmo', on ? '1' : '0'); } catch (e) { /* unavailable */ }
    for (const id in WORLDS) { const w = WORLDS[id]; if (w.def.fx && w.def.fx.fan && w._fanAnim) w._fanAnim.playbackRate = on ? 0.0001 : (STATES[cur] && SC[STATES[cur].si].id === 's01' && STATES[cur].step === 0 ? 1 : 0.0001); }
    updateHud();
  }
  function toggleFullscreen() {
    if (!document.fullscreenElement) (document.documentElement.requestFullscreen || function () {}).call(document.documentElement);
    else document.exitFullscreen();
  }
  function act(a) {
    switch (a) {
      case 'next': return nextState();
      case 'prev': return prevState();
      case 'home': return go(0, { instant: true });
      case 'notes': case 'overview': case 'evidence': case 'blackout': case 'help': return toggle(a);
      case 'fullscreen': return toggleFullscreen();
      case 'lowmo': return setLowMotion(!low());
      case 'presenter': return window.open(location.pathname + '?presenter' + location.hash, 'ke-presenter', 'width=1100,height=760');
    }
  }
  addEventListener('keydown', e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key;
    if (k === 'Escape') {
      for (const n of ['help', 'overview', 'evidence', 'blackout', 'notes']) if (isOpen(n)) { toggle(n, false); e.preventDefault(); return; }
      if (document.fullscreenElement) document.exitFullscreen();
      return;
    }
    if (isOpen('overview')) {
      const btns = $$('#overview button');
      const i = btns.indexOf(document.activeElement);
      const cols = Math.max(1, Math.round($('#overview .grid').clientWidth / (btns[0].clientWidth + 16)));
      const mv = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[k];
      if (mv) { e.preventDefault(); btns[Math.max(0, Math.min(btns.length - 1, (i < 0 ? 0 : i) + mv))].focus(); return; }
      if (k === 'o' || k === 'O') toggle('overview', false);
      return;
    }
    if (isOpen('evidence')) { if (k === 'e' || k === 'E') { toggle('evidence', false); e.preventDefault(); } return; }
    if (e.repeat && ['ArrowRight', 'ArrowLeft', ' ', 'PageDown', 'PageUp'].includes(k)) { e.preventDefault(); return; }
    switch (k) {
      case 'ArrowRight': case ' ': case 'PageDown': case 'Enter': e.preventDefault(); if (isOpen('blackout')) toggle('blackout', false); else nextState(); break;
      case 'ArrowLeft': case 'PageUp': e.preventDefault(); prevState(); break;
      case 'Home': e.preventDefault(); act('home'); break;
      case 'End': e.preventDefault(); go(STATES.length - 1, { instant: true }); break;
      case 'f': case 'F': act('fullscreen'); break;
      case 'b': case 'B': case '.': act('blackout'); break;
      case 'n': case 'N': act('notes'); break;
      case 'o': case 'O': act('overview'); break;
      case 'e': case 'E': act('evidence'); break;
      case 'm': case 'M': act('lowmo'); break;
      case 'p': case 'P': act('presenter'); break;
      case '?': case 'h': case 'H': act('help'); break;
    }
  });

  // presenter window sync (http:// only)
  let chan = null;
  try { chan = new BroadcastChannel('ke2-presentation'); } catch (e) { chan = null; }
  function broadcast() { if (chan) try { chan.postMessage({ cur, from: isPresenter ? 'p' : 'm' }); } catch (e) { /* ignore */ } }
  if (chan) chan.onmessage = m => { if (m.data && typeof m.data.cur === 'number' && m.data.cur !== cur) go(m.data.cur, { instant: isPresenter }); };
  if (isPresenter) { document.body.classList.add('presenter', 'lowmo'); overlays.notes.classList.add('open'); }

  // ------------------------------------------------------------ start
  let lm = matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { const v = localStorage.getItem('ke2-lowmo'); if (v !== null) lm = v === '1'; } catch (e) { /* ignore */ }
  if (/[?&]lowmo\b/.test(location.search)) lm = true;
  if (lm) document.body.classList.add('lowmo');
  buildEvidence();
  function start() {
    const m = location.hash.match(/^#(\d+)(?:\.(\d+))?/);
    let idx = 0;
    if (m) { const f = STATES.findIndex(s => s.si === +m[1] - 1 && s.step === (+m[2] || 1) - 1); if (f >= 0) idx = f; }
    go(idx, { instant: true });
    document.body.classList.add('ready', 'cursor-hidden');
  }
  window.__deck = { go: (i, o) => go(i, o), states: STATES, get cur() { return cur; }, worlds: WORLDS, scenes: SC };
  const imgs = () => Array.from(document.querySelectorAll('#worlds img[src]'));
  const ready = () => Promise.all(imgs().map(i => i.decode ? i.decode().catch(() => {}) : Promise.resolve()));
  (document.fonts ? Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]) : Promise.resolve()).then(() => {
    const m = location.hash.match(/^#(\d+)/);
    preload(m ? Math.max(0, +m[1] - 1) : 0);
    Promise.race([ready(), new Promise(r => setTimeout(r, 2500))]).then(start);
  });
})();
