// One frame-exact clip per advance, for the PowerPoint export.
// Usage: node tools/v3/clips.mjs outdir firstIndex lastIndex [fps] [w h]
// Clip N (0-based state index) shows the move INTO state N and holds on its settled frame.
import { createRequire } from 'module';
import path from 'path'; import fs from 'fs'; import { spawn } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require('/opt/node22/lib/node_modules/playwright'); }
const [out, a = '0', b = '36', fps = '24', W = '1280', H = '720'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const browser = await pw.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: +W, height: +H }, reducedMotion: 'no-preference' });
page.setDefaultTimeout(180000);
page.on('pageerror', e => console.log('ERR', e.message));
const first = +a, last = +b;
const url = pathToFileURL(path.join(root, 'v3', 'index.html')).href + '?capture&test';
await page.goto(url);
await page.waitForFunction(() => window.__deck && window.__step && document.querySelector('#loader.done'), null, { timeout: 180000 });
await page.waitForTimeout(900);
const states = await page.evaluate(() => window.__deck.states.length);
const plan = i => page.evaluate(i => {
  const s = window.__deck.states[i];
  const items = Array.from(s.sc.el.querySelectorAll('[data-in]')).filter(e => +e.dataset.in === s.step).map(e => +(e.dataset.d || 0));
  const prev = window.__deck.states[i - 1];
  const cut = prev && (prev.st.set || prev.sc.set) !== (s.st.set || s.sc.set) ? 0.6 : 0;
  const ui = prev && prev.sc !== s.sc ? 0.9 : 0.15;
  return Math.max((s.st.dur || 2.4) + cut, (items.length ? Math.max(...items) : 0) + ui + cut + 1.2) + 0.9;
}, i);
const dt = 1 / +fps;
async function capture(file, sec) {
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', fps, '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '24', '-preset', 'slow', '-profile:v', 'high', '-movflags', '+faststart', file]);
  const n = Math.round(sec * +fps);
  let lastBuf;
  for (let i = 0; i < n; i++) { await page.evaluate(d => window.__step(d), dt); lastBuf = await page.screenshot({ type: 'jpeg', quality: 92, timeout: 180000 }); ff.stdin.write(lastBuf); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
  fs.writeFileSync(file.replace('.mp4', '.jpg'), lastBuf);
}
// position on the state before the first clip, fully settled
if (first > 0) {
  await page.evaluate(i => window.__deck.go(i, { instant: true }), first - 1);
  for (let k = 0; k < 6; k++) await page.evaluate(() => window.__step(2));
}
for (let i = first; i <= last && i < states; i++) {
  if (i > 0) await page.evaluate(i => window.__deck.go(i), i);
  const sec = await plan(i);
  await capture(path.join(out, `clip${String(i + 1).padStart(2, '0')}.mp4`), sec);
  console.log('clip', i + 1, sec.toFixed(1) + 's');
}
await browser.close();
