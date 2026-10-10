// Procedural canvas textures (no external images): plaster, asphalt, grilles,
// window glows, paper with live-drawn text, newsprint halftone, etc.
import * as THREE from 'three';

export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; };
}

export function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

export function toTex(c, { repeat = [1, 1], srgb = true, aniso = 4 } = {}) {
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = aniso;
  t.needsUpdate = true;
  return t;
}

// soft value noise painted with blurred blobs
function blotches(g, w, h, r, n, colors, alpha, sizeMin, sizeMax) {
  for (let i = 0; i < n; i++) {
    const x = r() * w, y = r() * h, s = sizeMin + r() * (sizeMax - sizeMin);
    const grd = g.createRadialGradient(x, y, 0, x, y, s);
    const c = colors[Math.floor(r() * colors.length)];
    grd.addColorStop(0, `rgba(${c},${alpha})`);
    grd.addColorStop(1, `rgba(${c},0)`);
    g.fillStyle = grd;
    g.fillRect(x - s, y - s, s * 2, s * 2);
  }
}

export function plaster(seed = 1, base = '#d8cdb4', size = 512) {
  const [c, g] = canvas(size, size);
  const r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, size, size);
  blotches(g, size, size, r, 160, ['0,0,0', '255,255,255', '90,60,30'], 0.06, 10, 90);
  // water streaks
  for (let i = 0; i < 26; i++) {
    const x = r() * size, len = 60 + r() * 260;
    const grd = g.createLinearGradient(x, 0, x, len);
    grd.addColorStop(0, 'rgba(40,30,20,0.16)'); grd.addColorStop(1, 'rgba(40,30,20,0)');
    g.fillStyle = grd; g.fillRect(x, r() * size * 0.2, 2 + r() * 6, len);
  }
  // grain
  const id = g.getImageData(0, 0, size, size);
  for (let i = 0; i < id.data.length; i += 4) { const n = (r() - 0.5) * 18; id.data[i] += n; id.data[i + 1] += n; id.data[i + 2] += n; }
  g.putImageData(id, 0, 0);
  return c;
}

export function asphalt(seed = 3, size = 512) {
  const [c, g] = canvas(size, size);
  const r = rng(seed);
  g.fillStyle = '#3a3a3e'; g.fillRect(0, 0, size, size);
  blotches(g, size, size, r, 120, ['0,0,0', '120,120,120'], 0.08, 10, 70);
  const id = g.getImageData(0, 0, size, size);
  for (let i = 0; i < id.data.length; i += 4) { const n = (r() - 0.5) * 30; id.data[i] += n; id.data[i + 1] += n; id.data[i + 2] += n; }
  g.putImageData(id, 0, 0);
  return c;
}

export function tiles(seed = 5, a = '#c9b89a', b = '#b8a586', size = 512, n = 8) {
  const [c, g] = canvas(size, size);
  const r = rng(seed);
  const s = size / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? a : b; g.fillRect(i * s, j * s, s, s); }
  g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2;
  for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * s, 0); g.lineTo(i * s, size); g.stroke(); g.beginPath(); g.moveTo(0, i * s); g.lineTo(size, i * s); g.stroke(); }
  blotches(g, size, size, r, 60, ['0,0,0', '255,255,255'], 0.05, 20, 80);
  return c;
}

export function wood(seed = 7, base = '#6a4128', size = 512) {
  const [c, g] = canvas(size, size);
  const r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, size, size);
  for (let i = 0; i < 90; i++) {
    const y = r() * size;
    g.strokeStyle = `rgba(${r() < 0.5 ? '30,15,5' : '160,110,70'},${0.08 + r() * 0.12})`;
    g.lineWidth = 1 + r() * 3;
    g.beginPath(); g.moveTo(0, y);
    for (let x = 0; x <= size; x += 32) g.lineTo(x, y + Math.sin(x * 0.02 + i) * 4 + (r() - 0.5) * 3);
    g.stroke();
  }
  return c;
}

// Karachi-style decorative grille, transparent background
export function grille(size = 512, color = '#141010', bars = 6) {
  const [c, g] = canvas(size, size);
  g.strokeStyle = color; g.lineCap = 'round';
  g.lineWidth = size / 80;
  for (let i = 0; i <= bars; i++) { const x = (i / bars) * size; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, size); g.stroke(); }
  for (const f of [1 / 3, 2 / 3]) { g.beginPath(); g.moveTo(0, f * size); g.lineTo(size, f * size); g.stroke(); }
  g.lineWidth = size / 130;
  for (let i = 0; i < bars; i++) for (const f of [1 / 6, 0.5, 5 / 6]) {
    const cx = (i + 0.5) / bars * size, cy = f * size, rr = size / bars * 0.3;
    g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.stroke();
    g.beginPath(); g.moveTo(cx, cy - rr * 1.5); g.lineTo(cx + rr * 1.5, cy); g.lineTo(cx, cy + rr * 1.5); g.lineTo(cx - rr * 1.5, cy); g.closePath(); g.stroke();
  }
  return c;
}

// interior glow seen through a window: curtain colour + lamp hotspot
export function windowGlow(seed, size = 256) {
  const [c, g] = canvas(size, size);
  const r = rng(seed);
  const warm = ['255,206,128', '255,226,170', '255,190,110', '170,225,215'][Math.floor(r() * 4)];
  const grd = g.createRadialGradient(size * (0.3 + r() * 0.4), size * 0.35, 4, size / 2, size / 2, size * 0.8);
  grd.addColorStop(0, `rgba(${warm},1)`); grd.addColorStop(1, `rgba(${warm},0.35)`);
  g.fillStyle = grd; g.fillRect(0, 0, size, size);
  // curtain folds
  const cc = ['181,88,58', '63,127,122', '232,163,61', '120,80,140'][Math.floor(r() * 4)];
  for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(${cc},${0.18 + r() * 0.2})`; g.fillRect(i < 3 ? i * 18 : size - (6 - i) * 18, 0, 16, size); }
  return c;
}

// paper with text drawn in (fonts must already be loaded)
export function paperText(lines, { w = 1024, h = 640, bg = '#f4eedf', ink = '#2a2622', pad = 70, torn = true, seed = 9, clean = false, align = 'left' } = {}) {
  const [c, g] = canvas(w, h);
  const r = rng(seed);
  g.fillStyle = bg;
  if (torn) {
    g.beginPath();
    const jag = (x0, y0, x1, y1) => { const n = 40; for (let i = 0; i <= n; i++) { const t = i / n; g.lineTo(x0 + (x1 - x0) * t + (r() - 0.5) * 6, y0 + (y1 - y0) * t + (r() - 0.5) * 6); } };
    g.moveTo(10, 10); jag(10, 10, w - 10, 10); jag(w - 10, 10, w - 10, h - 10); jag(w - 10, h - 10, 10, h - 10); jag(10, h - 10, 10, 10);
    g.fill();
  } else g.fillRect(0, 0, w, h);
  if (!clean) blotches(g, w, h, r, 40, ['120,90,40', '255,255,255'], 0.05, 30, 140);
  let y = pad;
  for (const L of lines) {
    if (L.gap) { y += L.gap; continue; }
    g.fillStyle = L.color || ink;
    g.font = `${L.style || ''} ${L.weight || 400} ${L.size || 40}px "${L.font || 'Source Sans 3'}"`;
    if (L.letter) g.letterSpacing = L.letter;
    const words = L.text.split(' ');
    let line = '';
    const maxW = w - pad * 2;
    for (const wd of words) {
      const test = line ? line + ' ' + wd : wd;
      if (g.measureText(test).width > maxW && line) { g.fillText(line, pad, y + (L.size || 40)); y += (L.size || 40) * (L.lh || 1.25); line = wd; } else line = test;
    }
    if (line) { g.fillText(line, pad, y + (L.size || 40)); y += (L.size || 40) * (L.lh || 1.25); }
    g.letterSpacing = '0px';
    y += L.after || 8;
  }
  return c;
}

export function skyCanvas(top = '#0e1730', mid = '#2a3558', low = '#7a5a6a', glow = '#e6915a') {
  const [c, g] = canvas(16, 512);
  const grd = g.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0, top); grd.addColorStop(0.55, mid); grd.addColorStop(0.82, low); grd.addColorStop(1, glow);
  g.fillStyle = grd; g.fillRect(0, 0, 16, 512);
  return c;
}

// distant-building window texture: random lit/unlit cells
export function cityWindows(seed = 11, litP = 0.4, size = 256) {
  const [c, g] = canvas(size, size);
  const r = rng(seed);
  g.fillStyle = '#000'; g.fillRect(0, 0, size, size);
  const cols = 8, rows = 16;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    if (r() < litP) { const t = r(); g.fillStyle = t < 0.7 ? '#ffc874' : t < 0.9 ? '#ffe7b8' : '#9fe0d6'; g.fillRect(i * size / cols + 6, j * size / rows + 4, size / cols - 12, size / rows - 8); }
  }
  return c;
}

export function radial(color = '255,210,140', size = 256) {
  const [c, g] = canvas(size, size);
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grd.addColorStop(0, `rgba(${color},1)`); grd.addColorStop(0.35, `rgba(${color},0.35)`); grd.addColorStop(1, `rgba(${color},0)`);
  g.fillStyle = grd; g.fillRect(0, 0, size, size);
  return c;
}

// halftone newsprint illustration from a draw callback (monochrome dots)
export function halftone(w, h, draw, cell = 7, paper = '#ece4d2') {
  const [src, sg] = canvas(w, h);
  sg.fillStyle = '#fff'; sg.fillRect(0, 0, w, h);
  draw(sg, w, h);
  const d = sg.getImageData(0, 0, w, h).data;
  const [c, g] = canvas(w, h);
  g.fillStyle = paper; g.fillRect(0, 0, w, h);
  g.fillStyle = '#1d1b19';
  for (let y = 0; y < h; y += cell) for (let x = (Math.floor(y / cell) % 2) * cell / 2; x < w; x += cell) {
    const i = (Math.floor(y) * w + Math.floor(x)) * 4;
    const lum = (d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11) / 255;
    const rr = Math.sqrt(1 - lum) * cell * 0.62;
    if (rr > 0.3) { g.beginPath(); g.arc(x, y, rr, 0, Math.PI * 2); g.fill(); }
  }
  return c;
}
