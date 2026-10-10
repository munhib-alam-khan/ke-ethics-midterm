"""Painterly stroke renderer for the presentation's illustration plates.

Turns a flat rasterised SVG composition into a tactile, brush-painted raster:
oriented strokes follow the image structure, several passes go from broad
to fine brushes, then a paper/canvas texture and film grain are applied.
Cutouts (RGBA) keep their silhouette and can receive a torn paper border.

Usage:
  python3 tools/paint.py in.png out.webp [--cutout] [--border 10] [--fine 2]
                         [--seed 1] [--quality 82] [--max 1920]
Only numpy + Pillow are required.
"""
import argparse
import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


def blur(arr, r):
    """Gaussian blur a float HxW or HxWxC array via Pillow."""
    if arr.ndim == 2:
        im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
        return np.asarray(im.filter(ImageFilter.GaussianBlur(r))).astype(np.float32)
    return np.stack([blur(arr[..., c], r) for c in range(arr.shape[2])], -1)


def fblur(arr, r):
    """Float-precision blur for signed fields (scaled to 8 bit around 128)."""
    lo, hi = float(arr.min()), float(arr.max())
    if hi - lo < 1e-6:
        return arr.copy()
    n = (arr - lo) / (hi - lo) * 255.0
    return blur(n, r) / 255.0 * (hi - lo) + lo


def value_noise(h, w, scale, rng, octaves=4):
    out = np.zeros((h, w), np.float32)
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        s = max(2, int(scale / (2 ** o)))
        gh, gw = h // s + 2, w // s + 2
        g = rng.random((gh, gw)).astype(np.float32)
        im = Image.fromarray((g * 255).astype(np.uint8)).resize((gw * s, gh * s), Image.BICUBIC)
        out += np.asarray(im, np.float32)[:h, :w] / 255.0 * amp
        tot += amp
        amp *= 0.5
    return out / tot


def orientation(lum):
    """Smoothed stroke angle (along edges) from the structure tensor."""
    gy, gx = np.gradient(blur(lum, 2.0))
    jxx, jyy, jxy = fblur(gx * gx, 6), fblur(gy * gy, 6), fblur(gx * gy, 6)
    ang = 0.5 * np.arctan2(2 * jxy, jxx - jyy)  # gradient direction
    strength = np.sqrt((jxx - jyy) ** 2 + 4 * jxy ** 2)
    return ang + math.pi / 2, strength


def paint(src, fine=2, seed=1, passes=None):
    rng = np.random.default_rng(seed)
    h, w = src.shape[:2]
    rgb = src[..., :3].astype(np.float32)
    lum = rgb @ np.array([0.299, 0.587, 0.114], np.float32)
    ang, strength = orientation(lum)
    # in flat areas use a gentle swirling field instead of noisy angles
    swirl = (value_noise(h, w, 260, rng, 3) - 0.5) * math.pi * 1.2 + 0.25
    flat = np.clip(strength / (np.percentile(strength, 70) + 1e-3), 0, 1)
    ang = ang * flat + swirl * (1 - flat)

    canvas = Image.fromarray(blur(rgb, 18).astype(np.uint8)).convert('RGB')
    draw = ImageDraw.Draw(canvas, 'RGBA')
    passes = passes or [22, 12, 6, fine * 2, fine]
    scale = w / 1920.0
    for r in passes:
        r = max(1, int(round(r * scale)))
        ref = blur(rgb, max(0.6, r * 0.5))
        cur = np.asarray(canvas, np.float32)
        diff = np.abs(cur - ref).sum(-1)
        step = max(1, int(r * 0.9))
        ys, xs = np.mgrid[0:h:step, 0:w:step]
        ys = (ys + rng.integers(0, step, ys.shape)).clip(0, h - 1).ravel()
        xs = (xs + rng.integers(0, step, xs.shape)).clip(0, w - 1).ravel()
        thr = 0 if r == passes[0] else 18
        keep = diff[ys, xs] > thr
        if r <= 3:
            keep |= rng.random(keep.shape) < 0.25
        ys, xs = ys[keep], xs[keep]
        order = rng.permutation(len(ys))
        ys, xs = ys[order], xs[order]
        cols = ref[ys, xs]
        jit = rng.normal(0, 5 if r > 4 else 3, (len(ys), 1))
        cols = np.clip(cols + jit + rng.normal(0, 2.5, cols.shape), 0, 255).astype(np.uint8)
        a = ang[ys, xs] + rng.normal(0, 0.18, len(ys))
        L = r * rng.uniform(1.6, 3.4, len(ys))
        dx, dy = np.cos(a) * L, np.sin(a) * L
        alpha = 215 if r > 4 else 235
        for i in range(len(ys)):
            x, y = xs[i], ys[i]
            c = tuple(int(v) for v in cols[i]) + (alpha,)
            draw.line((x - dx[i], y - dy[i], x + dx[i], y + dy[i]), fill=c, width=max(1, r))
    out = np.asarray(canvas, np.float32)
    # gentle contrast / saturation lift so plates hold up on projectors
    m = out.mean(-1, keepdims=True)
    out = m + (out - m) * 1.12
    out = (out - 128) * 1.08 + 128
    soft = blur(out, 1.2)
    out = out + (out - soft) * 0.6
    return np.clip(out, 0, 255)


def texture(img, rng, grain=7.0, paper=0.07):
    h, w = img.shape[:2]
    # paper fibres: stretched noise + low-frequency mottling
    fib = value_noise(h, w, 9, rng, 2)
    mott = value_noise(h, w, 340, rng, 3)
    tex = 1.0 + (fib - 0.5) * paper + (mott - 0.5) * paper * 1.2
    # canvas emboss from fine noise
    n = value_noise(h, w, 3, rng, 1)
    emb = np.roll(n, 1, 0) - n
    img = img * tex[..., None] + emb[..., None] * 18
    img += rng.normal(0, grain, img.shape[:2])[..., None]
    return np.clip(img, 0, 255)


def torn_alpha(alpha, rng, border):
    a = alpha.astype(np.float32)
    if border <= 0:
        return a, a
    h, w = a.shape
    grown = blur(a, border * 0.55)
    edge_noise = value_noise(h, w, 14, rng, 3)
    g = grown / 255.0
    outer = (((g + (edge_noise - 0.5) * 0.35) > 0.12) & (g > 0.05)).astype(np.float32) * 255
    outer = blur(outer, 0.8)
    return a, outer


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('inp')
    ap.add_argument('out')
    ap.add_argument('--cutout', action='store_true')
    ap.add_argument('--border', type=int, default=0)
    ap.add_argument('--fine', type=int, default=2)
    ap.add_argument('--seed', type=int, default=1)
    ap.add_argument('--quality', type=int, default=82)
    ap.add_argument('--max', type=int, default=0, help='downscale longest side')
    ap.add_argument('--grain', type=float, default=7.0)
    ap.add_argument('--paper', default='#efe6d2')
    args = ap.parse_args()
    rng = np.random.default_rng(args.seed + 7)

    im = Image.open(args.inp).convert('RGBA')
    if args.max and max(im.size) > args.max:
        im.thumbnail((args.max, args.max), Image.LANCZOS)
    src = np.asarray(im, np.float32)
    alpha = src[..., 3]
    if args.cutout:
        # bleed colour outward so strokes near the silhouette are not grey
        m = alpha[..., None] / 255.0
        rgb = src[..., :3] * m
        bled = blur(rgb, 6) / np.maximum(blur(alpha, 6)[..., None] / 255.0, 1e-3)
        src = src.copy()
        src[..., :3] = np.where(m > 0.5, src[..., :3], np.clip(bled, 0, 255))
    painted = paint(src, fine=args.fine, seed=args.seed)
    painted = texture(painted, rng, grain=args.grain if not args.cutout else args.grain * 0.7)
    if args.cutout:
        inner, outer = torn_alpha(alpha, rng, args.border)
        paper = np.array([int(args.paper[i:i + 2], 16) for i in (1, 3, 5)], np.float32)
        paper_tex = texture(np.ones_like(painted) * paper, rng, grain=4, paper=0.12)
        k = (inner / 255.0)[..., None]
        rgb = painted * k + paper_tex * (1 - k)
        out = np.dstack([rgb, outer if args.border else inner])
        Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), 'RGBA').save(
            args.out, quality=args.quality, method=5)
    else:
        Image.fromarray(np.clip(painted, 0, 255).astype(np.uint8), 'RGB').save(
            args.out, quality=args.quality, method=5)
    print('painted', args.out)


if __name__ == '__main__':
    main()
