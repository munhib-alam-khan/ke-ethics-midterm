/* ==========================================================================
   Presentation engine: scene/reveal state model, controls, overlays.
   No audio, no autoplay, no auto-advance. Works from file:// or a local server.
   ========================================================================== */
(function () {
  'use strict';
  const M = window.MANIFEST;
  const REFS = window.REFERENCES;
  const stage = document.getElementById('stage');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const isPresenter = /[?&]presenter\b/.test(location.search);

  // ------------------------------------------------------------ state model
  // A flat list of states; each is { si: sceneIndex, step: revealStep }.
  const STATES = [];
  M.scenes.forEach((sc, si) => { for (let k = 0; k < sc.steps; k++) STATES.push({ si, step: k }); });
  let cur = -1;
  let lastActiveScene = -1;

  // ------------------------------------------------------------ build scenes
  const sceneEls = M.scenes.map((sc, i) => {
    const el = document.createElement('section');
    el.className = 'scene';
    el.id = sc.id;
    el.setAttribute('aria-label', `Scene ${i + 1}: ${sc.title}`);
    el.innerHTML = sc.html;
    stage.appendChild(el);
    return el;
  });

  function loadImages(si) {
    const el = sceneEls[si];
    if (!el || el.dataset.loaded) return;
    $$('img[data-src]', el).forEach(img => { img.decoding = 'async'; img.src = img.dataset.src; });
    el.dataset.loaded = '1';
  }

  // ------------------------------------------------------------ scaling
  function fit() {
    const k = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    document.documentElement.style.setProperty('--k', k);
  }
  window.addEventListener('resize', fit);
  fit();

  // ------------------------------------------------------------ navigation
  function setStepClasses(el, step) {
    for (let k = 0; k < 4; k++) el.classList.toggle('s' + k, k <= step);
  }

  function go(index, opts = {}) {
    index = Math.max(0, Math.min(STATES.length - 1, index));
    if (index === cur && !opts.force) return;
    const prev = cur >= 0 ? STATES[cur] : null;
    const next = STATES[index];
    cur = index;
    const si = next.si;

    // load current, neighbours and the next two scenes ahead
    for (let k = si - 1; k <= si + 2; k++) if (k >= 0 && k < sceneEls.length) loadImages(k);

    const changingScene = !prev || prev.si !== si;
    sceneEls.forEach((el, i) => {
      const keep = i === si || (changingScene && prev && i === prev.si);
      const wasNear = el.classList.contains('near');
      el.classList.toggle('near', keep);
      if (keep && !wasNear) void el.offsetWidth; // allow entry transitions from display:none
      el.classList.toggle('past', i < si);
    });
    // when jumping into a scene from elsewhere, show its prior steps immediately
    const el = sceneEls[si];
    if (changingScene) {
      const goingBack = prev && prev.si > si;
      if (opts.instant || goingBack || (prev && Math.abs(prev.si - si) > 1)) el.classList.add('no-delay');
      setStepClasses(el, next.step);
      requestAnimationFrame(() => {
        sceneEls.forEach((e, i) => e.classList.toggle('active', i === si));
        setTimeout(() => el.classList.remove('no-delay'), 50);
      });
      // remove the outgoing scene from layout once its fade has finished
      const out = prev ? prev.si : -1;
      clearTimeout(go._t);
      go._t = setTimeout(() => {
        if (out >= 0 && out !== STATES[cur].si) sceneEls[out].classList.remove('near');
      }, 1500);
    } else {
      setStepClasses(el, next.step);
    }
    lastActiveScene = si;
    if (!isPresenter) history.replaceState(null, '', `#${si + 1}.${next.step + 1}`);
    updateHud();
    renderNotes();
    broadcast();
  }

  const nextState = () => go(cur + 1);
  const prevState = () => go(cur - 1);

  // ------------------------------------------------------------ overlays
  const overlays = { notes: $('#notes'), overview: $('#overview'), evidence: $('#evidence'), blackout: $('#blackout'), help: $('#help') };
  const isOpen = (n) => overlays[n].classList.contains('open');
  function toggle(n, force) {
    const open = force === undefined ? !isOpen(n) : force;
    overlays[n].classList.toggle('open', open);
    if (n === 'overview' && open) buildOverview();
    if (n === 'evidence' && open) { overlays.evidence.scrollTop = 0; setTimeout(() => $('#evidence a') && $('#evidence h2').focus(), 30); }
    if (n === 'notes') renderNotes();
    updateHud();
  }
  function anyBlocking() { return isOpen('overview') || isOpen('evidence'); }

  // ------------------------------------------------------------ notes
  function renderNotes() {
    const box = overlays.notes;
    if (!box.classList.contains('open') && !isPresenter) return;
    const st = STATES[cur]; if (!st) return;
    const sc = M.scenes[st.si];
    const n = STATES.length;
    const nextSt = STATES[cur + 1];
    const nextLabel = nextSt ? (nextSt.si === st.si ? `next: reveal ${nextSt.step + 1} — ${esc(sc.cues[nextSt.step] || '')}` : `next: scene ${nextSt.si + 1} — ${esc(M.scenes[nextSt.si].title)}`) : 'END — hold. Press E for evidence during questions.';
    box.innerHTML = `
      <span class="pos">scene ${st.si + 1}/${M.scenes.length} · reveal ${st.step + 1}/${sc.steps} · advance ${cur + 1}/${n}</span>
      <h3>${esc(sc.chapter)} — ${esc(sc.title)}</h3>
      <div class="grid">
        <div class="script">${sc.script.map((p, k) => `<p class="${k === st.step ? 'now' : k > st.step ? 'later' : ''}">${esc(p).replace(/\n/g, '<br>')}</p>`).join('')}</div>
        <div>
          ${sc.cues.map((c, k) => `<p class="cue">${k === st.step ? '▶ ' : ''}${esc(c)}</p>`).join('')}
          <p class="cue" style="color:#f0ad45">${nextLabel}</p>
          <p class="qualnote">${esc(sc.notes || '')}</p>
          ${sc.sources.length ? `<p class="qualnote"><b>Sources:</b> ${sc.sources.map(s => esc(REFS[s].short)).join('; ')}</p>` : ''}
        </div>
      </div>`;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

  // ------------------------------------------------------------ overview
  function buildOverview() {
    const grid = $('#overview .grid');
    if (!grid.dataset.built) {
      grid.innerHTML = M.scenes.map((sc, i) => `<button type="button" data-si="${i}" style="background-image:url('assets/img/${sc.thumb}.webp')"><span><b>${String(i + 1).padStart(2, '0')}</b>${esc(sc.title)}</span></button>`).join('');
      grid.dataset.built = '1';
      grid.addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        jumpToScene(+b.dataset.si);
      });
    }
    const si = STATES[cur].si;
    $$('button', grid).forEach((b, i) => b.classList.toggle('cur', i === si));
    setTimeout(() => $$('button', grid)[si].focus(), 20);
  }
  function jumpToScene(si) {
    toggle('overview', false);
    go(STATES.findIndex(s => s.si === si), { instant: true });
  }

  // ------------------------------------------------------------ evidence
  function buildEvidence() {
    const refs = Object.values(REFS).sort((a, b) => a.apa.localeCompare(b.apa));
    const used = {};
    M.scenes.forEach((sc, i) => sc.sources.forEach(s => { (used[s] = used[s] || []).push(i + 1); }));
    overlays.evidence.innerHTML = `
      <h2 tabindex="-1">References &amp; evidence</h2>
      <p class="hint">Esc or E to close · Tab moves between links · Links open in a new tab (requires internet)</p>
      <h3>Interviews (primary evidence)</h3>
      <table><tr><th>Participant</th><th>Date</th><th>Report</th></tr>
        ${window.INTERVIEWS.map(r => `<tr><td>${esc(r.who)}</td><td>${r.date}</td><td>${r.appx}</td></tr>`).join('')}</table>
      <p>Four semi-structured interviews, October 3–9, 2026, in English and Urdu. Consent obtained; both employees anonymised. An access-based sample — situated perspectives, not a representative survey. Quotations on screen are exact excerpts from the report; translations are the research team's.</p>
      <p class="warn"><b>Interview recordings (instructor access, within participants' consent):</b><br>
        <a href="${window.RECORDINGS_URL}" target="_blank" rel="noopener">OneDrive / SharePoint audio folder</a><br>
        Do not open or play recordings during the presentation: they contain identifying details.</p>
      <h3>References</h3>
      ${refs.map(r => {
        const key = Object.keys(REFS).find(k => REFS[k] === r);
        return `<p class="ref">${r.apa} <a href="${r.url}" target="_blank" rel="noopener">${esc(decodeURI(r.url))}</a>${used[key] ? ` <span style="color:#777">· scenes ${used[key].join(', ')}</span>` : ''}</p>`;
      }).join('')}
      <h3>Labelling conventions used on screen</h3>
      <p><b>Company-reported</b> — figures published by K-Electric, not independently verified (2025 activities predate the September 2026 hearing). <b>Participant-reported</b> — estimates given in interviews, not verified. <b>Paraphrase</b> — our wording of a document; no document text is reproduced. <b>Illustrative</b> — the opening household and the 8-paying / 2-defaulting street are teaching examples, not data.</p>
      <h3>Images</h3>
      <p>Every image in this presentation is an original illustration painted procedurally for this project (see <code>docs/ASSET_REGISTER.md</code>). None is a photograph of a real person, meeting, document or place, and none is evidence. No faces of participants or employees are shown. Fonts: Fraunces, Anton, Source Sans 3 and IBM Plex Mono (SIL Open Font License), bundled locally.</p>
      <h3>Build notes</h3>
      <p>Discrepancies between script and report, and how they were resolved, are listed in <code>docs/BUILD_NOTES.md</code>.</p>
      <p class="hint" style="margin-top:30px">Karachi School of Business and Leadership · Business Ethics &amp; Law · Dr Faryal Razzaq · Munhib Alam Khan, Rabie Sami, Abdullah Khan, Karan Kumar</p>`;
  }

  // ------------------------------------------------------------ HUD
  const hud = $('#hud');
  const progress = $('#progress');
  let hudTimer;
  function showHud() {
    hud.classList.add('show'); progress.classList.add('show');
    document.body.classList.remove('cursor-hidden');
    clearTimeout(hudTimer);
    hudTimer = setTimeout(() => {
      if (hud.matches(':hover') || hud.contains(document.activeElement)) return showHud();
      hud.classList.remove('show'); progress.classList.remove('show');
      document.body.classList.add('cursor-hidden');
    }, 2600);
  }
  function updateHud() {
    const st = STATES[cur]; if (!st) return;
    $('#hud .pos').textContent = `${st.si + 1}/${M.scenes.length} · ${st.step + 1}/${M.scenes[st.si].steps}`;
    progress.style.width = `${((cur + 1) / STATES.length) * 100}%`;
    $$('#hud [data-act]').forEach(b => {
      const a = b.dataset.act;
      if (['notes', 'overview', 'evidence'].includes(a)) b.setAttribute('aria-pressed', isOpen(a));
      if (a === 'lowmo') b.setAttribute('aria-pressed', document.body.classList.contains('lowmo'));
    });
  }
  hud.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    act(b.dataset.act);
    b.blur();
  });
  ['mousemove', 'touchstart'].forEach(ev => window.addEventListener(ev, showHud, { passive: true }));

  // ------------------------------------------------------------ actions
  function setLowMotion(on) {
    document.body.classList.toggle('lowmo', on);
    try { localStorage.setItem('ke-lowmo', on ? '1' : '0'); } catch (e) { /* storage unavailable */ }
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
      case 'notes': return toggle('notes');
      case 'overview': return toggle('overview');
      case 'evidence': return toggle('evidence');
      case 'blackout': return toggle('blackout');
      case 'help': return toggle('help');
      case 'fullscreen': return toggleFullscreen();
      case 'lowmo': return setLowMotion(!document.body.classList.contains('lowmo'));
      case 'presenter': return window.open(location.pathname + '?presenter' + location.hash, 'ke-presenter', 'width=1100,height=760');
    }
  }

  // ------------------------------------------------------------ keyboard
  window.addEventListener('keydown', e => {
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
      if (k === 'o' || k === 'O') { toggle('overview', false); return; }
      return; // Enter/Space activate the focused button natively
    }
    if (isOpen('evidence')) {
      if (k === 'e' || k === 'E') { toggle('evidence', false); e.preventDefault(); }
      return; // let Tab/arrows/space scroll and focus links
    }
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

  // ------------------------------------------------------------ presenter sync (needs http://)
  let chan = null;
  try { chan = new BroadcastChannel('ke-presentation'); } catch (e) { chan = null; }
  function broadcast() { if (chan && !isPresenter) try { chan.postMessage({ cur }); } catch (e) { /* ignore */ } }
  if (chan) chan.onmessage = (m) => { if (m.data && typeof m.data.cur === 'number' && m.data.cur !== cur) go(m.data.cur, { instant: !isPresenter }); };
  if (isPresenter) {
    document.body.classList.add('presenter', 'lowmo');
    overlays.notes.classList.add('open');
    // in the presenter window, keys drive the main window too
    const origGo = go;
    go = function (i, o) { origGo(i, o); if (chan) try { chan.postMessage({ cur }); } catch (e) { /* ignore */ } };
  }

  // ------------------------------------------------------------ start
  let low = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { const v = localStorage.getItem('ke-lowmo'); if (v !== null) low = v === '1'; } catch (e) { /* ignore */ }
  if (/[?&]lowmo\b/.test(location.search)) low = true;
  if (low) document.body.classList.add('lowmo');
  buildEvidence();

  function start() {
    const m = location.hash.match(/^#(\d+)(?:\.(\d+))?/);
    let idx = 0;
    if (m) {
      const si = +m[1] - 1, step = (+m[2] || 1) - 1;
      const f = STATES.findIndex(s => s.si === si && s.step === step);
      if (f >= 0) idx = f;
    }
    go(idx, { instant: idx > 0 });
    document.body.classList.add('ready', 'cursor-hidden');
  }
  window.__deck = { go: (i, o) => go(i, o), states: STATES, get cur() { return cur; }, scenes: sceneEls };
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]).then(start);
  } else start();
})();
