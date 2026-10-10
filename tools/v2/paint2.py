"""Style-aware raster finisher for the v2 layered assets.

Styles (chosen per sequence to give the deck visual range):
  warm     fine brush strokes, soft grain           -> household realism
  rich     bold saturated strokes                   -> human consequences
  paper    almost no strokes, strong paper fibre     -> cream/teal miniature worlds
  halftone monochrome dot screen on newsprint        -> editorial collage fragments
  clean    texture only                              -> documents, readable surfaces
Any input with transparency is treated as a cutout: colour is bled outward,
painted, and the original silhouette is restored (optionally with a torn
paper border via --border).

Usage: python3 tools/v2/paint2.py in.png out.webp --style warm [--border 0]
       [--scale 1.0] [--seed 1] [--quality 82] [--tint #e9dfc8]
"""
import argparse
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from paint import blur, value_noise, orientation, torn_alpha  # noqa: E402

STYLES = {
    'warm':  dict(passes=[12, 7, 4, 2], length=(1.4, 2.8), alpha=(205, 230), sat=1.06, grain=4.5, paper=0.045),
    'rich':  dict(passes=[28, 16, 9, 5, 3], length=(1.8, 4.2), alpha=(220, 240), sat=1.32, grain=5.0, paper=0.05),
    'paper': dict(passes=[5, 3], length=(1.0, 1.8), alpha=(90, 120), sat=0.98, grain=2.5, paper=0.11),
    'clean': dict(passes=[], length=(1, 1), alpha=(0, 0), sat=1.0, grain=2.0, paper=0.06),
}


def strokes(rgb, passes, length, alpha, seed, scale):
    rng = np.random.default_rng(seed)
    h, w = rgb.shape[:2]
    lum = rgb @ np.array([0.299, 0.587, 0.114], np.float32)
    ang, strength = orientation(lum)
    swirl = (value_noise(h, w, 260, rng, 3) - 0.5) * math.pi * 1.1 + 0.2
    flat = np.clip(strength / (np.percentile(strength, 70) + 1e-3), 0, 1)
    ang = ang * flat + swirl * (1 - flat)
    canvas = Image.fromarray(np.clip(blur(rgb, 3 if passes and passes[0] < 8 else 14), 0, 255).astype(np.uint8)) if passes else None
    if not passes:
        return rgb
    if passes[0] < 8:
        canvas = Image.fromarray(np.clip(rgb, 0, 255).astype(np.uint8))
    draw = ImageDraw.Draw(canvas, 'RGBA')
    for idx, r0 in enumerate(passes):
        r = max(1, int(round(r0 * scale)))
        ref = blur(rgb, max(0.6, r * 0.5))
        cur = np.asarray(canvas, np.float32)
        diff = np.abs(cur - ref).sum(-1)
        step = max(1, int(r * 0.9))
        ys, xs = np.mgrid[0:h:step, 0:w:step]
        ys = (ys + rng.integers(0, step, ys.shape)).clip(0, h - 1).ravel()
        xs = (xs + rng.integers(0, step, xs.shape)).clip(0, w - 1).ravel()
        thr = 0 if idx == 0 and passes[0] >= 8 else 14
        keep = diff[ys, xs] > thr
        if r <= 3:
            keep |= rng.random(keep.shape) < 0.2
        ys, xs = ys[keep], xs[keep]
        order = rng.permutation(len(ys))
        ys, xs = ys[order], xs[order]
        cols = np.clip(ref[ys, xs] + rng.normal(0, 4 if r > 4 else 2.5, (len(ys), 1)) + rng.normal(0, 2, (len(ys), 3)), 0, 255).astype(np.uint8)
        a = ang[ys, xs] + rng.normal(0, 0.16, len(ys))
        L = r * rng.uniform(length[0], length[1], len(ys))
        dx, dy = np.cos(a) * L, np.sin(a) * L
        al = alpha[0] if r > 4 else alpha[1]
        for i in range(len(ys)):
            x, y = xs[i], ys[i]
            draw.line((x - dx[i], y - dy[i], x + dx[i], y + dy[i]), fill=(int(cols[i][0]), int(cols[i][1]), int(cols[i][2]), al), width=max(1, r))
    return np.asarray(canvas, np.float32)


def finish(img, rng, sat, grain, paper):
    m = img.mean(-1, keepdims=True)
    img = m + (img - m) * sat
    h, w = img.shape[:2]
    fib = value_noise(h, w, 9, rng, 2)
    mott = value_noise(h, w, 340, rng, 3)
    tex = 1.0 + (fib - 0.5) * paper + (mott - 0.5) * paper * 1.1
    n = value_noise(h, w, 3, rng, 1)
    emb = np.roll(n, 1, 0) - n
    img = img * tex[..., None] + emb[..., None] * 14
    img += rng.normal(0, grain, img.shape[:2])[..., None]
    soft = blur(img, 1.1)
    img = img + (img - soft) * 0.45
    return np.clip(img, 0, 255)


def halftone(rgb, rng, cell=7, tint=(236, 228, 210), ink=(28, 26, 24)):
    h, w = rgb.shape[:2]
    lum = (rgb @ np.array([0.299, 0.587, 0.114], np.float32)) / 255.0
    lum = np.clip(lum * 1.12 + 0.14, 0, 1)
    big = 3
    im = Image.new('L', (w * big, h * big), 255)
    d = ImageDraw.Draw(im)
    ang = math.radians(45)
    ca, sa = math.cos(ang), math.sin(ang)
    diag = int(math.hypot(w, h)) + cell
    for v in range(-diag, diag, cell):
        for u in range(-diag, diag, cell):
            x = u * ca - v * sa + w / 2
            y = u * sa + v * ca + h / 2
            if 0 <= x < w and 0 <= y < h:
                dark = 1 - lum[int(y), int(x)]
                r = math.sqrt(dark) * cell * 0.72
                if r > 0.35:
                    d.ellipse(((x - r) * big, (y - r) * big, (x + r) * big, (y + r) * big), fill=0)
    dots = np.asarray(im.resize((w, h), Image.LANCZOS), np.float32) / 255.0
    paper = np.array(tint, np.float32)
    inkc = np.array(ink, np.float32)
    out = paper * dots[..., None] + inkc * (1 - dots[..., None])
    return finish(out, rng, 1.0, 3.0, 0.12)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('inp')
    ap.add_argument('out')
    ap.add_argument('--style', default='warm')
    ap.add_argument('--border', type=int, default=0)
    ap.add_argument('--scale', type=float, default=1.0, help='brush scale relative to 1920 px width')
    ap.add_argument('--seed', type=int, default=1)
    ap.add_argument('--quality', type=int, default=82)
    ap.add_argument('--cell', type=int, default=7)
    ap.add_argument('--tint', default='#ece4d2')
    a = ap.parse_args()
    rng = np.random.default_rng(a.seed + 11)
    im = Image.open(a.inp).convert('RGBA')
    if a.border and np.asarray(im)[..., 3].min() >= 250:
        # opaque fragment that should get a torn paper edge: pad with transparency
        pad = a.border * 2
        canvas = Image.new('RGBA', (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
        canvas.paste(im, (pad, pad))
        im = canvas
    src = np.asarray(im, np.float32)
    alpha = src[..., 3]
    is_cut = alpha.min() < 250
    rgb = src[..., :3].copy()
    if is_cut:
        m = alpha[..., None] / 255.0
        bled = blur(rgb * m, 6) / np.maximum(blur(alpha, 6)[..., None] / 255.0, 1e-3)
        rgb = np.where(m > 0.5, rgb, np.clip(bled, 0, 255))
    if a.style == 'halftone':
        tint = tuple(int(a.tint[i:i + 2], 16) for i in (1, 3, 5))
        out = halftone(rgb, rng, a.cell, tint)
    else:
        st = STYLES[a.style]
        out = strokes(rgb, st['passes'], st['length'], st['alpha'], a.seed, a.scale)
        out = finish(out, rng, st['sat'], st['grain'], st['paper'])
    if is_cut:
        inner, outer = torn_alpha(alpha, rng, a.border)
        if a.border:
            tint = np.array([int(a.tint[i:i + 2], 16) for i in (1, 3, 5)], np.float32)
            pap = finish(np.ones_like(out) * tint, rng, 1.0, 3, 0.12)
            k = (inner / 255.0)[..., None]
            out = out * k + pap * (1 - k)
            al = outer
        else:
            al = inner
        Image.fromarray(np.dstack([np.clip(out, 0, 255), al]).astype(np.uint8), 'RGBA').save(a.out, quality=a.quality, method=5)
    else:
        Image.fromarray(out.astype(np.uint8), 'RGB').save(a.out, quality=a.quality, method=5)
    print('painted', a.style, a.out, im.size)


if __name__ == '__main__':
    main()
