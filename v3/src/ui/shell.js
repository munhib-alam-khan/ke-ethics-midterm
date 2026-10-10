// Presenter shell: overlays (notes, overview, evidence, blackout, help), HUD,
// keyboard, low-motion, presenter-window sync. Ported from v2, same keys.
export function createShell({ deck, scenes, low, setLow }) {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const REFS = window.REFERENCES;
  const isPresenter = /[?&]presenter\b/.test(location.search);
  const STATES = deck.STATES;

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
    const st = STATES[deck.cur]; if (!st) return;
    const sc = st.sc;
    const nx = STATES[deck.cur + 1];
    const nextLabel = nx ? (nx.sc === sc ? `next: reveal ${nx.step + 1} — ${esc(sc.cues[nx.step] || '')}` : `next: scene ${nx.si + 1} — ${esc(nx.sc.title)}`) : 'END — hold. Press E for evidence during questions.';
    box.innerHTML = `<span class="pos">scene ${st.si + 1}/${scenes.length} · reveal ${st.step + 1}/${sc.states.length} · advance ${deck.cur + 1}/${STATES.length}</span>
      <h3>${esc(sc.chapter)} — ${esc(sc.title)}</h3>
      <div class="grid"><div class="script">${sc.script.map((p, k) => `<p class="${k === st.step ? 'now' : k > st.step ? 'later' : ''}">${esc(p).replace(/\n/g, '<br>')}</p>`).join('')}</div>
      <div>${sc.cues.map((c, k) => `<p class="cue">${k === st.step ? '▶ ' : ''}${esc(c)}</p>`).join('')}<p class="cue" style="color:#f0ad45">${nextLabel}</p>
      <p class="qualnote">${esc(sc.notes || '')}</p>${sc.sources.length ? `<p class="qualnote"><b>Sources:</b> ${sc.sources.map(s => esc(REFS[s].short)).join('; ')}</p>` : ''}</div></div>`;
  }
  function buildOverview() {
    const grid = $('#overview .grid');
    if (!grid.dataset.built) {
      grid.innerHTML = scenes.map((sc, i) => `<button type="button" data-si="${i}" style="background-image:url('assets/thumbs/${sc.id}.jpg')"><span><b>${String(i + 1).padStart(2, '0')}</b>${esc(sc.title)}</span></button>`).join('');
      grid.dataset.built = '1';
      grid.addEventListener('click', e => { const b = e.target.closest('button'); if (b) jumpToScene(+b.dataset.si); });
    }
    const si = STATES[deck.cur].si;
    $$('button', grid).forEach((b, i) => b.classList.toggle('cur', i === si));
    setTimeout(() => $$('button', grid)[si].focus(), 20);
  }
  function jumpToScene(si) { toggle('overview', false); deck.go(STATES.findIndex(s => s.si === si), { instant: true }); }
  function buildEvidence() {
    const refs = Object.entries(REFS).sort((a, b) => a[1].apa.localeCompare(b[1].apa));
    const used = {};
    scenes.forEach((sc, i) => sc.sources.forEach(s => { (used[s] = used[s] || []).push(i + 1); }));
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
      <p><b>Company-reported</b> — figures published by K-Electric, not independently verified (2025 activities predate the September 2026 hearing). <b>Participant-reported</b> — estimates given in interviews, not verified. <b>Paraphrase / our summary</b> — our wording of a document or of published reporting; no document or article text is reproduced. <b>Illustrative</b> — the opening household, the street, the 8-paying / 2-defaulting example, the committee room, the network model and the recommendation diagrams are teaching illustrations, not data, records or implemented results. <b>Proposed</b> — recommendations and milestones are our proposals, not existing KE practice or legal deadlines.</p>
      <h3>Images</h3>
      <p>Every scene is rendered live in the browser from procedural 3D geometry and canvas-drawn textures made for this project (see <code>docs/ASSET_REGISTER.md</code>). None is a photograph or likeness of a real person, meeting, document or place, and none is evidence. Figures in the committee room are faceless mannequins. No participant or employee is depicted. Fonts: Fraunces, Anton, Source Sans 3 and IBM Plex Mono (SIL Open Font License), bundled locally. Libraries: three.js and GSAP, bundled locally.</p>
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
    const st = STATES[deck.cur]; if (!st) return;
    $('#hud .pos').textContent = `${st.si + 1}/${scenes.length} · ${st.step + 1}/${st.sc.states.length}`;
    progress.style.width = `${((deck.cur + 1) / STATES.length) * 100}%`;
    $$('#hud [data-act]').forEach(b => {
      const a = b.dataset.act;
      if (['notes', 'overview', 'evidence'].includes(a)) b.setAttribute('aria-pressed', isOpen(a));
      if (a === 'lowmo') b.setAttribute('aria-pressed', low());
    });
  }
  hud.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (!b) return; act(b.dataset.act); b.blur(); });
  ['mousemove', 'touchstart'].forEach(ev => addEventListener(ev, showHud, { passive: true }));

  function toggleFullscreen() {
    if (!document.fullscreenElement) (document.documentElement.requestFullscreen || function () {}).call(document.documentElement);
    else document.exitFullscreen();
  }
  const next = () => deck.go(deck.cur + 1), prev = () => deck.go(deck.cur - 1);
  function act(a) {
    switch (a) {
      case 'next': return next();
      case 'prev': return prev();
      case 'home': return deck.go(0, { instant: true });
      case 'notes': case 'overview': case 'evidence': case 'blackout': case 'help': return toggle(a);
      case 'fullscreen': return toggleFullscreen();
      case 'lowmo': setLow(!low()); return updateHud();
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
      case 'ArrowRight': case ' ': case 'PageDown': case 'Enter': e.preventDefault(); if (isOpen('blackout')) toggle('blackout', false); else next(); break;
      case 'ArrowLeft': case 'PageUp': e.preventDefault(); prev(); break;
      case 'Home': e.preventDefault(); act('home'); break;
      case 'End': e.preventDefault(); deck.go(STATES.length - 1, { instant: true }); break;
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
  try { chan = new BroadcastChannel('ke3-presentation'); } catch (e) { chan = null; }
  let remote = false;
  function broadcast() { if (chan && !remote) try { chan.postMessage({ cur: deck.cur }); } catch (e) { /* ignore */ } }
  if (chan) chan.onmessage = m => { if (m.data && typeof m.data.cur === 'number' && m.data.cur !== deck.cur) { remote = true; deck.go(m.data.cur, { instant: isPresenter }); remote = false; } };
  if (isPresenter) { document.body.classList.add('presenter'); overlays.notes.classList.add('open'); }

  buildEvidence();
  function onState() {
    if (!isPresenter) history.replaceState(null, '', `#${STATES[deck.cur].si + 1}.${STATES[deck.cur].step + 1}`);
    updateHud(); renderNotes(); broadcast();
  }
  return { onState, isPresenter };
}
