// Screenshot chosen states after they settle. Usage: node tools/v2/stills.mjs outdir "1.1,1.2,2.1" [w h] [wait]
import { createRequire } from 'module';
import path from 'path'; import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const [out, list, W = '1920', H = '1080', wait = '0'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: +W, height: +H } });
const errs = [];
page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
page.on('requestfailed', r => errs.push('failed ' + r.url()));
await page.goto(pathToFileURL(path.join(root, 'v2', 'index.html')).href + (process.env.LOWMO ? '?lowmo' : ''));
await page.waitForFunction(() => document.body.classList.contains('ready'));
const items = list === 'all' ? await page.evaluate(() => window.__deck.states.map(s => `${s.si + 1}.${s.step + 1}`)) : list.split(',');
for (const it of items) {
  const [a, b] = it.split('.').map(Number);
  const idx = await page.evaluate(([a, b]) => window.__deck.states.findIndex(s => s.si === a - 1 && s.step === b - 1), [a, b]);
  if (idx < 0) continue;
  // arrive the normal way (from the previous state) so choreography completes
  if (idx > 0) { await page.evaluate(i => window.__deck.go(i, { instant: true }), idx - 1); await page.waitForTimeout(500); }
  await page.evaluate(i => window.__deck.go(i), idx);
  const sc = await page.evaluate(i => { const s = window.__deck.states[i]; return window.__deck.scenes[s.si].states[s.step].dur || 1200; }, idx);
  await page.waitForTimeout(+wait || sc + 2600);
  await page.screenshot({ path: path.join(out, `s${String(a).padStart(2, '0')}_${b}.png`) });
}
const broken = await page.evaluate(() => Array.from(document.images).filter(i => i.src && (!i.complete || i.naturalWidth === 0)).map(i => i.src));
console.log(JSON.stringify({ errs, broken }));
await browser.close();
