// Record a browser video of a navigation sequence (for motion review).
// Usage: node tools/v2/record.mjs <out.webm> "<startHash>" "<seq>" [w h]
//   seq: comma list of steps: "R" = right arrow, "L" = left, "W1500" = wait ms, "LOW" = toggle low motion
import { createRequire } from 'module';
import path from 'path'; import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const [out, hash = '#1.1', seq = 'W2000,R,W4000', W = '1280', H = '720'] = process.argv.slice(2);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const dir = fs.mkdtempSync('/tmp/kerec-');
const browser = await pw.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: +W, height: +H }, recordVideo: { dir, size: { width: +W, height: +H } } });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', e => errs.push(e.message));
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto(pathToFileURL(path.join(root, 'v2', 'index.html')).href + hash);
await page.waitForFunction(() => document.body.classList.contains('ready'));
for (const s of seq.split(',')) {
  if (s === 'R') await page.keyboard.press('ArrowRight');
  else if (s === 'L') await page.keyboard.press('ArrowLeft');
  else if (s === 'LOW') await page.keyboard.press('m');
  else if (s.startsWith('W')) await page.waitForTimeout(+s.slice(1));
}
const v = page.video();
await ctx.close();
fs.copyFileSync(await v.path(), out);
await browser.close();
console.log(JSON.stringify({ out, errs }));
