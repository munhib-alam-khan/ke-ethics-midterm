// Settled stills of chosen states. Usage: node tools/v3/stills.mjs outdir [all|"1.1,2.3"] [wait ms]
import { createRequire } from 'module';
import path from 'path'; import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const [out, list = 'all', wait = '1800', W = '1920', H = '1080'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browser = await pw.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: +W, height: +H } });
const errs = [];
page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
page.on('requestfailed', r => errs.push('failed ' + r.url()));
await page.goto(pathToFileURL(path.join(root, 'v3', 'index.html')).href + '?test' + (process.env.Q ? '&' + process.env.Q : ''));
await page.waitForFunction(() => window.__deck && document.querySelector('#loader.done'), null, { timeout: 180000 });
const states = await page.evaluate(() => window.__deck.states.map(s => `${s.si + 1}.${s.step + 1}`));
if (process.env.NOUI) await page.addStyleTag({ content: '#stage{display:none!important}' });
const want = list === 'all' ? states : list.split(',');
for (const id of want) {
  const idx = states.indexOf(id);
  if (idx < 0) { console.log('skip', id); continue; }
  await page.evaluate(i => window.__deck.go(i, { instant: true }), idx);
  await page.waitForTimeout(+wait);
  await page.screenshot({ path: path.join(out, `s${id.replace('.', '_')}.jpg`), type: 'jpeg', quality: 90, timeout: 240000 });
  process.stdout.write(id + ' ');
}
console.log('\nerrors:', errs.length ? errs.slice(0, 10) : 'none');
await browser.close();
