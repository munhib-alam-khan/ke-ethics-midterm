// Rasterise the hand-built SVG source plates to PNG (transparent where the SVG is).
// Usage: node tools/render_svg.mjs <out-dir> file1.svg [file2.svg ...]
// Uses the locally installed Playwright Chromium; no network access needed.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }

const [outDir, ...files] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const browser = await pw.chromium.launch();
const page = await browser.newPage({ deviceScaleFactor: 1 });
for (const f of files) {
  const svg = fs.readFileSync(f, 'utf8');
  const w = +(svg.match(/width="(\d+)"/) || [0, 1920])[1];
  const h = +(svg.match(/height="(\d+)"/) || [0, 1080])[1];
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
  const out = path.join(outDir, path.basename(f).replace(/\.svg$/, '.png'));
  await page.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
  console.log('rendered', out, w + 'x' + h);
}
await browser.close();
