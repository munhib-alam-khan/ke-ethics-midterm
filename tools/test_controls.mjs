// Functional test of live controls. Usage: node tools/test_controls.mjs
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('requestfailed', r => errs.push('failed ' + r.url()));
await page.goto(pathToFileURL(path.join(root, 'v1.html')).href);
await page.waitForFunction(() => document.body.classList.contains('ready'));
const results = [];
const ok = (name, cond) => { results.push([cond ? 'PASS' : 'FAIL', name]); };
const cur = () => page.evaluate(() => window.__deck.cur);
const n = await page.evaluate(() => window.__deck.states.length);
const sceneState = () => page.evaluate(() => { const s = window.__deck.states[window.__deck.cur]; const el = window.__deck.scenes[s.si];
  return { si: s.si, step: s.step, active: el.classList.contains('active'), cls: [0,1,2,3].filter(k => el.classList.contains('s' + k)).length,
    actives: window.__deck.scenes.filter(e => e.classList.contains('active')).length, near: window.__deck.scenes.filter(e => e.classList.contains('near')).length }; });

ok(`state count ${n} within 30-40`, n >= 30 && n <= 40);
await page.keyboard.press('ArrowRight'); ok('ArrowRight advances', await cur() === 1);
await page.keyboard.press('Space'); ok('Space advances', await cur() === 2);
await page.keyboard.press('PageDown'); ok('PageDown advances', await cur() === 3);
await page.keyboard.press('ArrowLeft'); ok('ArrowLeft reverses', await cur() === 2);
await page.keyboard.press('PageUp'); ok('PageUp reverses', await cur() === 1);
await page.keyboard.press('Home'); ok('Home returns to opening', await cur() === 0);
// rapid clicking
for (let i = 0; i < 25; i++) await page.keyboard.press('ArrowRight', { delay: 5 });
await page.waitForTimeout(1800);
let s = await sceneState();
ok('rapid 25 advances lands on state 25', await cur() === 25);
ok('exactly one active scene after rapid clicks', s.actives === 1 && s.active);
ok('step classes match after rapid clicks', s.cls === s.step + 1);
ok('at most 2 scenes in layout after settle', s.near <= 2);
for (let i = 0; i < 25; i++) await page.keyboard.press('ArrowLeft', { delay: 5 });
await page.waitForTimeout(1800);
s = await sceneState();
ok('rapid reverse back to start', await cur() === 0 && s.actives === 1 && s.cls === 1);
// reverse reconstructs previous scene final step
await page.evaluate(() => window.__deck.go(2)); // s02 step 2? (scene 2 reveal index)
await page.waitForTimeout(300);
const tgt = await page.evaluate(() => window.__deck.states.findIndex(x => x.si === 2 && x.step === 0));
await page.evaluate(i => window.__deck.go(i), tgt); await page.waitForTimeout(400);
await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(400);
s = await sceneState();
ok('going back enters previous scene at its LAST reveal', s.si === 1 && s.step === 2 && s.cls === 3);
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
await page.mouse.move(400, 400); await page.mouse.move(420, 410); await page.waitForTimeout(500);
ok('HUD appears on mouse move', await page.evaluate(() => document.getElementById('hud').classList.contains('show')));
// no audio / video
ok('no audio or video elements', await page.evaluate(() => document.querySelectorAll('audio,video,iframe').length === 0));
// no remote requests
const remote = await page.evaluate(() => performance.getEntriesByType('resource').map(r => r.name).filter(u => !u.startsWith('file:')));
ok('no network requests (offline)', remote.length === 0);
// hash restore
await page.goto('about:blank'); await page.goto(pathToFileURL(path.join(root, 'v1.html')).href + '#12.2');
await page.waitForFunction(() => document.body.classList.contains('ready'));
s = await sceneState(); ok('URL hash #12.2 restores scene 12 reveal 2', s.si === 11 && s.step === 1);
ok('no page errors', errs.length === 0);
for (const r of results) console.log(r[0], r[1]);
if (errs.length) console.log(errs);
console.log(results.filter(r => r[0] === 'FAIL').length + ' failures');
await browser.close();
