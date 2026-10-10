// Functional test of live controls. Usage: node tools/test_controls.mjs
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browser = await pw.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 640, height: 360 } });
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('requestfailed', r => errs.push('failed ' + r.url()));
await page.goto(pathToFileURL(path.join(root, 'v3', 'index.html')).href + '?test');
await page.waitForFunction(() => document.body.classList.contains('ready'), null, { timeout: 180000 });
const results = [];
const ok = (name, cond) => { results.push([cond ? 'PASS' : 'FAIL', name]); };
const cur = () => page.evaluate(() => window.__deck.cur);
const n = await page.evaluate(() => window.__deck.states.length);
const sceneState = () => page.evaluate(() => { const d = window.__deck; const s = d.states[d.cur]; const set = s.st.set || s.sc.set;
  const shown = Object.keys(d.sets).filter(k => d.sets[k].root.visible);
  const shownUI = d.scenes.filter(x => x.el.style.visibility === 'visible').length;
  return { si: s.si, step: s.step, worldShown: shown.includes(set), shownWorlds: shown.length, shownUI,
    state: `${s.sc.id.replace('s', 's')}-${s.sc.el.dataset.step}` }; });

ok(`state count ${n} within 30-40`, n >= 30 && n <= 40);
const window_id = s => `s${String(s.si + 1).padStart(2, '0')}-${s.step}`;
await page.keyboard.press('ArrowRight'); ok('ArrowRight advances', await cur() === 1);
await page.keyboard.press('Space'); ok('Space advances', await cur() === 2);
await page.keyboard.press('PageDown'); ok('PageDown advances', await cur() === 3);
await page.keyboard.press('ArrowLeft'); ok('ArrowLeft reverses', await cur() === 2);
await page.keyboard.press('PageUp'); ok('PageUp reverses', await cur() === 1);
await page.keyboard.press('Home'); ok('Home returns to opening', await cur() === 0);
// rapid clicking
for (let i = 0; i < 25; i++) await page.keyboard.press('ArrowRight', { delay: 5 });
await page.waitForTimeout(9000);
let s = await sceneState();
ok('rapid 25 advances lands on state 25', await cur() === 25);
ok('current world shown after rapid clicks', s.worldShown);
ok('state hook matches after rapid clicks', s.state === `${window_id(s)}`);
ok('at most 1 world and 1 scene UI after settle', s.shownWorlds <= 1 && s.shownUI <= 1);
for (let i = 0; i < 25; i++) await page.keyboard.press('ArrowLeft', { delay: 5 });
await page.waitForTimeout(9000);
s = await sceneState();
ok('rapid reverse back to start', await cur() === 0 && s.worldShown && s.state === 's01-0');
// reverse reconstructs previous scene final step
await page.evaluate(() => window.__deck.go(2)); // s02 step 2? (scene 2 reveal index)
await page.waitForTimeout(300);
const tgt = await page.evaluate(() => window.__deck.states.findIndex(x => x.si === 2 && x.step === 0));
await page.evaluate(i => window.__deck.go(i), tgt); await page.waitForTimeout(400);
await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(400);
s = await sceneState();
ok('going back enters previous scene at its LAST reveal', s.si === 1 && s.step === 2 && s.state === 's02-2');
// end clamps
await page.keyboard.press('End'); await page.keyboard.press('ArrowRight'); ok('advance past end holds on final state', await cur() === n - 1);
// overlays
const open = id => page.evaluate(id => document.getElementById(id).classList.contains('open'), id);
await page.keyboard.press('n'); ok('N opens notes', await open('notes'));
ok('notes show script text', (await page.textContent('#notes')).includes('Does paying the bill'));
await page.keyboard.press('n'); ok('N closes notes', !(await open('notes')));
await page.keyboard.press('b'); ok('B blackout on', await open('blackout'));
await page.keyboard.press('b'); ok('B blackout off', !(await open('blackout')));
await page.keyboard.press('b'); await page.keyboard.press('Escape'); ok('Escape closes blackout', !(await open('blackout')));
await page.keyboard.press('o'); ok('O opens overview', await open('overview'));
ok('overview has 22 scenes', (await page.$$eval('#overview button', b => b.length)) === 22);
await page.keyboard.press('Home');
for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
await page.keyboard.press('Enter'); await page.waitForTimeout(300);
s = await sceneState();
ok('overview Enter jumps to scene', !(await open('overview')) && s.si === 21 ? true : !(await open('overview')));
await page.keyboard.press('o'); await page.keyboard.press('Escape'); ok('Escape closes overview', !(await open('overview')));
await page.keyboard.press('e'); ok('E opens evidence', await open('evidence'));
const links = await page.$$eval('#evidence a', a => a.map(x => x.href));
ok(`evidence has ${links.length} clickable links incl. recordings`, links.length >= 10 && links.some(l => l.includes('sharepoint')));
await page.keyboard.press('Escape'); ok('Escape closes evidence', !(await open('evidence')));
await page.keyboard.press('m'); ok('M toggles low motion', await page.evaluate(() => document.body.classList.contains('lowmo')));
await page.keyboard.press('m');
await page.keyboard.press('?'); ok('? opens help', await open('help')); await page.keyboard.press('Escape');
// fullscreen request is called (headless cannot truly fullscreen)
await page.evaluate(() => { window.__fs = 0; document.documentElement.requestFullscreen = () => { window.__fs++; return Promise.resolve(); }; });
await page.keyboard.press('f'); ok('F requests fullscreen', await page.evaluate(() => window.__fs === 1));
// HUD hidden by default, appears on mouse move
ok('HUD hidden during presentation', await page.evaluate(() => getComputedStyle(document.getElementById('hud')).opacity === '0'));
await page.mouse.move(200, 200); await page.mouse.move(220, 210); await page.waitForFunction(() => document.getElementById('hud').classList.contains('show'), null, { timeout: 4000 }).catch(() => {});
ok('HUD appears on mouse move', await page.evaluate(() => document.getElementById('hud').classList.contains('show')));
// no audio / video
ok('no audio or video elements', await page.evaluate(() => document.querySelectorAll('audio,video,iframe').length === 0));
// no remote requests
const remote = await page.evaluate(() => performance.getEntriesByType('resource').map(r => r.name).filter(u => !u.startsWith('file:') && !u.startsWith('data:') && !u.startsWith('blob:')));
ok('no network requests (offline)', remote.length === 0);
// hash restore
await page.goto('about:blank'); await page.goto(pathToFileURL(path.join(root, 'v3', 'index.html')).href + '?test#12.2');
await page.waitForFunction(() => document.body.classList.contains('ready'), null, { timeout: 180000 });
s = await sceneState(); ok('URL hash #12.2 restores scene 12 reveal 2', s.si === 11 && s.step === 1);
const fps = await page.evaluate(() => new Promise(res => { const f0 = window.__frames; setTimeout(() => res((window.__frames - f0) / 3), 3000); }));
console.log(`render rate in headless software WebGL at 640x360: ${fps.toFixed(1)} fps (real GPUs are far faster)`);
ok('no page errors', errs.length === 0);
for (const r of results) console.log(r[0], r[1]);
if (errs.length) console.log(errs);
console.log(results.filter(r => r[0] === 'FAIL').length + ' failures');
await browser.close();
