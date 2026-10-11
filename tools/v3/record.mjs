// Frame-exact preview recording using the deck's capture mode (virtual clock).
// Usage: node tools/v3/record.mjs out.mp4 "startState" advances [fps] [w h] [holdSec]
//   e.g. node tools/v3/record.mjs previews/v3_opening.mp4 1.1 4
import { createRequire } from 'module';
import path from 'path'; import fs from 'fs'; import { spawn } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const [out, start = '1.1', adv = '3', fps = '24', W = '960', H = '540', hold = '0'] = process.argv.slice(2);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browser = await pw.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: +W, height: +H }, reducedMotion: 'no-preference' });
page.on('pageerror', e => console.log('ERR', e.message));
await page.goto(pathToFileURL(path.join(root, 'v3', 'index.html')).href + '?capture&test#' + start);
await page.waitForFunction(() => window.__deck && window.__step && document.querySelector('#loader.done'), null, { timeout: 180000 });
await page.waitForTimeout(900);   // let the loader fade out
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', fps, '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-preset', 'veryfast', '-movflags', '+faststart', out]);
const dt = 1 / +fps;
let frames = 0;
async function run(sec) { const n = Math.round(sec * +fps); for (let i = 0; i < n; i++) { await page.evaluate(d => window.__step(d), dt); const buf = await page.screenshot({ type: 'jpeg', quality: 88 }); ff.stdin.write(buf); frames++; } }
// how long each state needs: its move plus the last text reveal
const plan = await page.evaluate(n => {
  const d = window.__deck; const out = [];
  for (let k = 0; k <= n; k++) {
    const s = d.states[d.cur + k]; if (!s) break;
    const items = Array.from(s.sc.el.querySelectorAll('[data-in]')).filter(e => +e.dataset.in === s.step).map(e => +(e.dataset.d || 0));
    out.push(Math.max(s.st.dur || 2.4, (items.length ? Math.max(...items) : 0) + 1.8) + 0.8);
  }
  return out;
}, +adv);
await run(plan[0]);
for (let k = 1; k <= +adv && k < plan.length; k++) {
  await page.evaluate(() => window.__deck.go(window.__deck.cur + 1));
  await run(plan[k] + (k === +adv ? +hold : 0));
  process.stdout.write('.');
}
ff.stdin.end();
await new Promise(r => ff.on('close', r));
console.log('\n' + out, frames, 'frames');
await browser.close();
