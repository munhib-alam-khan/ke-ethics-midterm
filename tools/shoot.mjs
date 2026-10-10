// Visual QA: open the deck, step through every state and screenshot it.
// Usage: node tools/shoot.mjs <outdir> [width height] [--lowmo] [--only=3,4]
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const args = process.argv.slice(2);
const out = args[0]; const W = +(args[1] || 1920), H = +(args[2] || 1080);
const lowmo = args.includes('--lowmo');
const only = (args.find(a => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean).map(Number);
fs.mkdirSync(out, { recursive: true });
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const url = pathToFileURL(path.join(root, 'index.html')).href + (lowmo ? '?lowmo' : '');
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
const errors = [];
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text()); });
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('requestfailed', r => errors.push('requestfailed: ' + r.url()));
await page.goto(url);
await page.waitForFunction(() => document.body.classList.contains('ready'));
const n = await page.evaluate(() => window.__deck.states.length);
for (let i = 0; i < n; i++) {
  const st = await page.evaluate(i => window.__deck.states[i], i);
  if (only.length && !only.includes(st.si + 1)) continue;
  await page.evaluate(i => window.__deck.go(i), i);
  await page.waitForTimeout(lowmo ? 900 : 4200);
  const f = path.join(out, `s${String(st.si + 1).padStart(2, '0')}_${st.step + 1}.png`);
  await page.screenshot({ path: f });
}
// broken image check
const broken = await page.evaluate(() => Array.from(document.images).filter(i => i.src && (!i.complete || i.naturalWidth === 0)).map(i => i.src));
console.log(JSON.stringify({ states: n, errors, broken }, null, 1));
await browser.close();
