// node tools/v3/shot.mjs out.png "query" [page=proto.html] [waitFrames=20]
import { createRequire } from 'module';
import path from 'path'; import { fileURLToPath, pathToFileURL } from 'url';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const [out, q = '', pg = 'proto.html', wf = '20'] = process.argv.slice(2);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browser = await pw.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', e => console.log('ERR', e.message)); page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.log(m.type(), m.text().slice(0, 300)); });
await page.goto(pathToFileURL(path.join(root, 'v3', pg)).href + (q ? '?' + q : ''));
const t0 = Date.now();
await page.waitForFunction(n => (window.__frames || 0) >= n, +wf, { timeout: 120000 });
console.log('frames', await page.evaluate(() => window.__frames), 'ms', Date.now() - t0);
await page.screenshot({ path: out });
await browser.close();
