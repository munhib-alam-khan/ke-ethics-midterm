"""Generate the SVG source compositions for every painted plate and cutout.

Each composition is drawn procedurally here (no third-party imagery), then
rasterised by tools/render_svg.mjs and painted by tools/paint.py.
Run:  python3 tools/build_svgs.py   ->  writes tools/svg/*.svg and
      tools/svg/layout.json (positions the HTML uses for overlays).
"""
import json
import math
import os
import random

OUT = os.path.join(os.path.dirname(__file__), 'svg')
os.makedirs(OUT, exist_ok=True)
LAYOUT = {}

CREAM = '#efe6d2'
CHAR = '#23211f'
AMBER = '#e8a33d'
TEAL = '#3f7f7a'


def svg(w, h, body, defs=''):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" '
            f'viewBox="0 0 {w} {h}"><defs>{defs}</defs>{body}</svg>')


def lg(id_, stops, x1=0, y1=0, x2=0, y2=1):
    s = ''.join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>' for o, c, a in stops)
    return f'<linearGradient id="{id_}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{s}</linearGradient>'


def rg(id_, stops, cx=0.5, cy=0.5, r=0.5):
    s = ''.join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>' for o, c, a in stops)
    return f'<radialGradient id="{id_}" cx="{cx}" cy="{cy}" r="{r}">{s}</radialGradient>'


BLUR = ''.join(f'<filter id="b{n}" x="-50%" y="-50%" width="200%" height="200%">'
               f'<feGaussianBlur stdDeviation="{n}"/></filter>' for n in (2, 4, 8, 16, 30, 60))


def rect(x, y, w, h, fill, extra=''):
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{fill}" {extra}/>'


def poly(pts, fill, extra=''):
    p = ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)
    return f'<polygon points="{p}" fill="{fill}" {extra}/>'


def catenary(x1, y1, x2, y2, sag, stroke, width=2.0, op=1.0):
    mx, my = (x1 + x2) / 2, max(y1, y2) + sag
    return (f'<path d="M{x1:.1f},{y1:.1f} Q{mx:.1f},{my:.1f} {x2:.1f},{y2:.1f}" fill="none" '
            f'stroke="{stroke}" stroke-width="{width}" stroke-opacity="{op}"/>')


def mix(c1, c2, t):
    a = [int(c1[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(c2[i:i + 2], 16) for i in (1, 3, 5)]
    return '#' + ''.join(f'{int(a[i] + (b[i] - a[i]) * t):02x}' for i in range(3))


def save(name, content):
    with open(os.path.join(OUT, name + '.svg'), 'w') as f:
        f.write(content)


# ---------------------------------------------------------------- city bits
def skyline(rng, x0, x1, base, hmin, hmax, body, win_lit, win_dark, lit_p, haze=0.0, tank=True):
    out = []
    x = x0
    while x < x1:
        w = rng.uniform(70, 180)
        h = rng.uniform(hmin, hmax)
        col = mix(body, '#000000', rng.uniform(0, 0.25))
        out.append(rect(x, base - h, w, h + 4, col))
        if tank and rng.random() < 0.7:
            for _ in range(rng.randint(1, 3)):
                tx = x + rng.uniform(6, w - 26)
                out.append(rect(tx, base - h - 16, 18, 16, col, 'rx="4"'))
        # windows
        cols = max(2, int(w // 22))
        rows = max(2, int(h // 30))
        for r in range(rows):
            for c in range(cols):
                if rng.random() < 0.85:
                    wx = x + 8 + c * (w - 16) / cols
                    wy = base - h + 14 + r * (h - 20) / rows
                    lit = rng.random() < lit_p
                    out.append(rect(wx, wy, (w - 16) / cols * 0.55, 12,
                                    win_lit if lit else win_dark,
                                    f'opacity="{0.95 if lit else 0.8}"'))
        x += w + rng.uniform(-10, 14)
    if haze:
        out.append(rect(x0, base - hmax - 40, x1 - x0, hmax + 40, '#c98a6a', f'opacity="{haze}"'))
    return ''.join(out)


def grille(x, y, w, h, color, wbar=5):
    """Karachi-style decorative window grille."""
    out = []
    n = max(3, int(w // 60))
    for i in range(n + 1):
        gx = x + i * w / n
        out.append(rect(gx - wbar / 2, y, wbar, h, color))
    out.append(rect(x, y + h * 0.5 - wbar / 2, w, wbar, color))
    for i in range(n):
        cx = x + (i + 0.5) * w / n
        for cy in (y + h * 0.25, y + h * 0.75):
            r = min(w / n, h / 2) * 0.32
            out.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="none" stroke="{color}" stroke-width="{wbar * 0.8}"/>')
            out.append(poly([(cx, cy - r * 1.4), (cx + r * 1.4, cy), (cx, cy + r * 1.4), (cx - r * 1.4, cy)], 'none',
                            f'stroke="{color}" stroke-width="{wbar * 0.6}"'))
    return ''.join(out)


# ---------------------------------------------------------------- ROOM
def room(lit):
    rng = random.Random(11)
    W, H = 1920, 1080
    d = BLUR
    if lit:
        d += lg('wall', [(0, '#b9844f', 1), (0.6, '#9c6a3f', 1), (1, '#6e4529', 1)])
        d += lg('sky', [(0, '#29304f', 1), (0.45, '#6b4a62', 1), (0.8, '#c4694a', 1), (1, '#efa45a', 1)])
        d += rg('lamp', [(0, '#ffe2a0', 0.95), (0.35, '#f2b552', 0.45), (1, '#f2b552', 0)])
        d += lg('table', [(0, '#7a4a2a', 1), (1, '#3e2414', 1)])
    else:
        d += lg('wall', [(0, '#3a4652', 1), (0.6, '#2c3640', 1), (1, '#1c2229', 1)])
        d += lg('sky', [(0, '#1f2843', 1), (0.5, '#384565', 1), (0.85, '#5d5a72', 1), (1, '#7e6a6f', 1)])
        d += rg('lamp', [(0, '#9fc7c4', 0.0), (1, '#9fc7c4', 0)])
        d += lg('table', [(0, '#3a3a40', 1), (1, '#18181c', 1)])
    d += lg('curtain', [(0, '#7d3328', 1), (0.25, '#b5583a', 1), (0.5, '#86372b', 1), (0.75, '#b5583a', 1), (1, '#6f2c23', 1)], 0, 0, 1, 0)
    b = [rect(0, 0, W, H, 'url(#wall)')]
    # plaster mottling
    for _ in range(90):
        x, y, r = rng.uniform(0, W), rng.uniform(0, 820), rng.uniform(30, 140)
        c = '#ffffff' if rng.random() < 0.5 else '#000000'
        b.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r:.0f}" fill="{c}" opacity="0.035" filter="url(#b16)"/>')
    # skirting / dado line
    b.append(rect(0, 770, W, 10, '#000', 'opacity="0.25"'))
    # WINDOW
    wx, wy, ww, wh = 230, 140, 600, 520
    b.append(rect(wx - 30, wy - 30, ww + 60, wh + 60, '#000', 'opacity="0.35" filter="url(#b16)"'))
    b.append(rect(wx, wy, ww, wh, 'url(#sky)'))
    r2 = random.Random(5)
    b.append(skyline(r2, wx, wx + ww, wy + wh - 90, 90, 260, '#2a2230' if lit else '#1b2130',
                     '#ffc56a', '#3a3242' if lit else '#252a38', 0.55 if lit else 0.04, haze=0))
    b.append(skyline(r2, wx - 20, wx + ww, wy + wh, 60, 200, '#1d1820' if lit else '#141821',
                     '#ffcf7a', '#2b2530' if lit else '#1d2230', 0.6 if lit else 0.03))
    for i in range(5):
        y1 = wy + 120 + i * 40
        b.append(catenary(wx, y1, wx + ww, y1 + rng.uniform(-30, 30), 40 + i * 8, '#111', 2.2))
    b.append(grille(wx, wy, ww, wh, '#1b1512' if lit else '#0d0f12', 6))
    fr = '#5a3a24' if lit else '#262a30'
    b += [rect(wx - 22, wy - 22, ww + 44, 24, fr), rect(wx - 22, wy + wh, ww + 44, 30, fr),
          rect(wx - 22, wy - 22, 24, wh + 50, fr), rect(wx + ww - 2, wy - 22, 24, wh + 50, fr)]
    # curtain
    b.append(f'<path d="M{wx + ww - 60},{wy - 60} C{wx + ww + 40},{wy + 200} {wx + ww - 20},{wy + 420} {wx + ww + 70},{wy + wh + 120} L{wx + ww + 230},{wy + wh + 120} C{wx + ww + 170},{wy + 300} {wx + ww + 210},{wy + 100} {wx + ww + 190},{wy - 60} Z" fill="url(#curtain)" opacity="{1 if lit else 0.55}"/>')
    b.append(rect(wx - 80, wy - 70, ww + 330, 14, '#2a1a10', 'rx="6"'))
    # moonlight / evening light patch through window
    if not lit:
        b.append(poly([(wx + 40, 790), (wx + ww + 120, 790), (wx + ww + 420, 1080), (wx + 260, 1080)], '#9fc7c4', 'opacity="0.10" filter="url(#b16)"'))
        b.append(rect(wx, wy, ww, wh, '#9fc7c4', 'opacity="0.06"'))
    # framed picture
    b.append(rect(1030, 210, 230, 170, '#2a1a10'))
    b.append(rect(1044, 224, 202, 142, mix('#6f7a4a', '#000000', 0 if lit else 0.6)))
    b.append(poly([(1044, 366), (1110, 290), (1160, 330), (1200, 280), (1246, 366)], mix('#3f5a4a', '#000000', 0 if lit else 0.6)))
    b.append(f'<circle cx="1200" cy="260" r="16" fill="{mix("#f2c26a", "#000000", 0 if lit else 0.6)}"/>')
    # ceiling fan
    b.append(rect(1056, 0, 10, 70, '#1a1410'))
    b.append(f'<ellipse cx="1061" cy="80" rx="34" ry="14" fill="#2a2018"/>')
    for sx in (-1, 1):
        b.append(f'<path d="M1061,80 L{1061 + sx * 330},{60} Q{1061 + sx * 360},{82} {1061 + sx * 330},{100} Z" fill="#2c231b"/>')
    b.append(f'<path d="M1061,82 L1101,128 L1070,140 Z" fill="#2c231b"/>')
    # shelf with router
    b.append(rect(1300, 470, 300, 16, '#3a2414'))
    b.append(rect(1300, 486, 300, 10, '#000', 'opacity="0.3" filter="url(#b4)"'))
    b.append(rect(1340, 420, 150, 50, '#e9e3d6' if lit else '#6f747a', 'rx="8"'))
    for ax in (1352, 1478):
        b.append(rect(ax, 330, 7, 92, '#d9d3c6' if lit else '#5c6066', 'rx="3"'))
    led = '#5dff9a' if lit else '#1d2a24'
    for i in range(4):
        b.append(f'<circle cx="{1370 + i * 26}" cy="452" r="5" fill="{led}"/>')
        if lit:
            b.append(f'<circle cx="{1370 + i * 26}" cy="452" r="14" fill="{led}" opacity="0.35" filter="url(#b4)"/>')
    b.append(rect(1520, 400, 50, 70, '#4d6b5d' if lit else '#2a3330', 'rx="4"'))  # books
    b.append(rect(1574, 410, 22, 60, '#a8573b' if lit else '#3a2a28', 'rx="3"'))
    # switchboard
    b.append(rect(1250, 600, 130, 90, '#efe9dc' if lit else '#7a7f86', 'rx="6"'))
    for i in range(4):
        b.append(rect(1264 + i * 28, 618, 18, 28, '#d6cfbf' if lit else '#62666c', 'rx="3"'))
    # kitchen doorway (right)
    kx = 1660
    b.append(rect(kx, 150, 260, 930, '#13110f'))
    b.append(rect(kx + 18, 168, 242, 912, '#3f7f7a' if lit else '#1e3332'))
    for ty in range(168, 1080, 46):
        b.append(rect(kx + 18, ty, 242, 2, '#000', 'opacity="0.25"'))
    for tx in range(kx + 18, 1920, 46):
        b.append(rect(tx, 168, 2, 912, '#000', 'opacity="0.2"'))
    b.append(rect(kx + 18, 640, 242, 40, '#c9bfa8' if lit else '#4b4d50'))  # counter
    b.append(rect(kx + 60, 600, 150, 40, '#2a2a2a'))  # hotplate
    coil = '#ff6a2a' if lit else '#3a2a26'
    b.append(f'<ellipse cx="{kx + 135}" cy="604" rx="50" ry="8" fill="{coil}"/>')
    if lit:
        b.append(f'<ellipse cx="{kx + 135}" cy="600" rx="80" ry="22" fill="#ff7a3a" opacity="0.45" filter="url(#b8)"/>')
    b.append(f'<path d="M{kx + 85},540 L{kx + 185},540 L{kx + 175},598 L{kx + 95},598 Z" fill="#9a9a9a" />')
    b.append(rect(kx + 78, 532, 114, 12, '#bdbdbd', 'rx="4"'))
    if lit:
        for i in range(3):
            b.append(f'<path d="M{kx + 110 + i * 25},520 q-20,-40 0,-80 q20,-40 0,-80" stroke="#fff" stroke-width="10" fill="none" opacity="0.18" filter="url(#b8)"/>')
    b.append(rect(kx, 150, 26, 930, '#2a1a10'))
    b.append(rect(kx, 150, 260, 22, '#2a1a10'))
    # side table + lamp
    b.append(poly([(1380, 760), (1640, 760), (1660, 790), (1360, 790)], '#4a2c18' if lit else '#25252a'))
    b.append(rect(1390, 790, 16, 120, '#3a2212' if lit else '#1d1d22'))
    b.append(rect(1614, 790, 16, 120, '#3a2212' if lit else '#1d1d22'))
    b.append(rect(1495, 630, 26, 130, '#7a5530' if lit else '#33353a'))
    b.append(f'<ellipse cx="1508" cy="758" rx="60" ry="10" fill="{"#5a3a20" if lit else "#2a2b30"}"/>')
    shade = '#ffe3a8' if lit else '#6a6e72'
    b.append(poly([(1430, 640), (1586, 640), (1550, 520), (1466, 520)], shade))
    if lit:
        b.append(f'<circle cx="1508" cy="600" r="420" fill="url(#lamp)"/>')
        b.append(poly([(1430, 640), (1586, 640), (1700, 790), (1320, 790)], '#ffd98a', 'opacity="0.25" filter="url(#b8)"'))
    # TABLE (foreground)
    b.append(poly([(0, 860), (W, 860), (W, H), (0, H)], 'url(#table)'))
    b.append(rect(0, 850, W, 18, '#2a180c' if lit else '#121216'))
    for i in range(14):
        y = 880 + i * 15
        b.append(f'<path d="M0,{y} C600,{y + rng.uniform(-6, 6)} 1300,{y + rng.uniform(-6, 6)} 1920,{y}" stroke="#000" stroke-opacity="0.12" stroke-width="2" fill="none"/>')
    # cup of chai
    b.append(f'<ellipse cx="1240" cy="975" rx="90" ry="20" fill="#000" opacity="0.35" filter="url(#b4)"/>')
    b.append(f'<path d="M1180,900 L1300,900 L1288,968 Q1240,986 1192,968 Z" fill="{"#f1ebe0" if lit else "#7d838a"}"/>')
    b.append(f'<ellipse cx="1240" cy="900" rx="60" ry="12" fill="{"#a8673a" if lit else "#3b3330"}"/>')
    b.append(f'<path d="M1298,915 q34,6 22,34 q-8,14 -26,12" stroke="{"#f1ebe0" if lit else "#7d838a"}" stroke-width="9" fill="none"/>')
    if lit:
        b.append(rect(0, 0, W, H, '#ffb54a', 'opacity="0.06"'))
        b.append(f'<circle cx="700" cy="980" r="420" fill="#ffd27a" opacity="0.12" filter="url(#b60)"/>')
    else:
        b.append(rect(0, 0, W, H, '#0c1a24', 'opacity="0.18"'))
    # vignette
    d += rg('vig', [(0.55, '#000', 0), (1, '#000', 0.55)], 0.5, 0.5, 0.75)
    b.append(rect(0, 0, W, H, 'url(#vig)'))
    return svg(W, H, ''.join(b), d)


# ---------------------------------------------------------------- STREET
FACADES = ['#e7d9bd', '#c9d6cc', '#d9b27a', '#d8a99a', '#b9b7ad', '#e2cfa6', '#a9c3c0', '#d7c3a0', '#c99a7a', '#dccdb8']


def street(lit):
    rng = random.Random(23)
    W, H = 1920, 1080
    d = BLUR
    if lit:
        d += lg('sky', [(0, '#273052', 1), (0.45, '#5d4766', 1), (0.75, '#b8624c', 1), (1, '#eea35c', 1)])
    else:
        d += lg('sky', [(0, '#1c2440', 1), (0.5, '#33405e', 1), (0.8, '#5a566e', 1), (1, '#7a6670', 1)])
    d += lg('road', [(0, '#4a4440', 1), (1, '#211e1c', 1)])
    b = [rect(0, 0, W, H, 'url(#sky)')]
    if lit:
        b.append(f'<circle cx="1500" cy="560" r="300" fill="#ffb460" opacity="0.35" filter="url(#b60)"/>')
    b.append(skyline(random.Random(3), -20, W + 20, 640, 160, 380, '#3b3046' if lit else '#252b3c',
                     '#ffc56a', '#4a3e52' if lit else '#2c3242', 0.45 if lit else 0.02, haze=0.10 if lit else 0))
    b.append(skyline(random.Random(4), -20, W + 20, 700, 120, 300, '#2e2638' if lit else '#1e2332',
                     '#ffcf7a', '#3a3044' if lit else '#252a38', 0.5 if lit else 0.02))
    houses = []
    n = 10
    margin = 40
    hw = (W - margin * 2) / n
    base = 905
    for i in range(n):
        x = margin + i * hw + 4
        w = hw - 8
        h = rng.uniform(330, 480)
        # side wall for depth
        b.append(poly([(x + w, base - h + 6), (x + w + 10, base - h + 18), (x + w + 10, base), (x + w, base)], '#000', 'opacity="0.35"'))
        top = base - h
        fac = FACADES[i]
        if not lit:
            fac = mix(fac, '#1a2232', 0.62)
        b.append(rect(x, top, w, h, fac))
        b.append(rect(x, top, w, h, 'url(#shade)'))
        b.append(rect(x - 6, top - 14, w + 12, 16, mix(fac, '#000000', 0.35)))
        # water tank
        tx = x + rng.uniform(16, w - 70)
        b.append(rect(tx, top - 64, 52, 52, '#1c1c1e', 'rx="10"'))
        b.append(rect(tx + 4, top - 70, 44, 10, '#2a2a2c', 'rx="4"'))
        # floors windows
        floors = 2 if h < 400 else 3
        fh = (h - 120) / floors
        win_pos = []
        for f in range(floors):
            for c in range(2):
                wx = x + 18 + c * (w - 36) / 2 + 6
                wy = top + 30 + f * fh
                ww, wh2 = (w - 36) / 2 - 12, fh * 0.55
                glow = '#ffc768' if lit else '#1b2130'
                b.append(rect(wx, wy, ww, wh2, glow))
                if lit:
                    b.append(rect(wx - 10, wy - 10, ww + 20, wh2 + 20, '#ffb44a', 'opacity="0.35" filter="url(#b8)"'))
                if lit:
                    tint = rng.choice(['#ffd27a', '#ffe9b8', '#ffc768', '#9fd6cf'])
                    b.append(rect(wx + 4, wy + 4, ww - 8, wh2 - 8, tint, 'opacity="0.55"'))
                bar = '#2a2420' if lit else '#10131a'
                for kb in range(1, 4):
                    b.append(rect(wx + kb * ww / 4 - 1.5, wy, 3, wh2, bar))
                b.append(rect(wx, wy + wh2 / 2 - 1.5, ww, 3, bar))
                b.append(rect(wx - 3, wy - 3, ww + 6, wh2 + 6, 'none', f'stroke="{bar}" stroke-width="5"'))
                win_pos.append((wx, wy, ww, wh2))
            # balcony rail
            by = top + 30 + f * fh + fh * 0.62
            b.append(rect(x + 10, by, w - 20, 5, '#2a2622'))
            for k in range(int((w - 20) // 14)):
                b.append(rect(x + 12 + k * 14, by, 2.5, 26, '#2a2622'))
        # AC unit
        if rng.random() < 0.6:
            ay = top + rng.uniform(40, h - 200)
            b.append(rect(x + w - 54, ay, 48, 34, mix('#dcd8cf', '#1a2232', 0 if lit else 0.6)))
        # laundry line on some balconies
        if rng.random() < 0.45:
            ly = top + 30 + fh * 0.62 - 4
            b.append(catenary(x + 14, ly, x + w - 14, ly, 6, '#2a2622', 1.5))
            for k in range(rng.randint(2, 4)):
                cx2 = x + 24 + k * (w - 48) / 4
                b.append(rect(cx2, ly + 3, 18, 26, mix(rng.choice(['#b5583a', '#3f7f7a', '#e8a33d', '#efe6d2', '#6b5a8a']), '#1a2232', 0 if lit else 0.6)))
        # ground-floor shutter or door
        if rng.random() < 0.35:
            b.append(rect(x + 10, base - 90, w - 20, 90, mix('#7d8a86', '#1a2232', 0 if lit else 0.55)))
            for k in range(12):
                b.append(rect(x + 10, base - 90 + k * 7.5, w - 20, 1.5, '#000', 'opacity="0.3"'))
        # door
        b.append(rect(x + w / 2 - 26, base - 96, 52, 96, mix('#5a3a24', '#000000', 0 if lit else 0.5)))
        houses.append({'x': round(x + w / 2), 'top': round(top), 'roof': round(top - 14), 'w': round(w)})
    d += lg('shade', [(0, '#000', 0.0), (0.7, '#000', 0.08), (1, '#000', 0.28)], 0, 0, 1, 0)
    # road
    b.append(rect(0, base, W, H - base, 'url(#road)'))
    b.append(rect(0, base, W, 14, '#8a8178' if lit else '#3d3a3a'))
    for i in range(10):
        b.append(f'<ellipse cx="{rng.uniform(0, W):.0f}" cy="{rng.uniform(950, 1060):.0f}" rx="{rng.uniform(80, 220):.0f}" ry="8" fill="#000" opacity="0.18" filter="url(#b8)"/>')
    # pole & transformer
    px = 965
    b.append(rect(px - 12, 180, 24, 900, '#2b2723'))
    b.append(rect(px - 160, 220, 320, 14, '#2b2723'))
    b.append(rect(px - 110, 300, 220, 12, '#2b2723'))
    b.append(rect(px - 70, 360, 140, 150, '#5e6a66' if lit else '#2e3634', 'rx="14"'))
    for k in range(5):
        b.append(rect(px - 66 + k * 30, 372, 10, 126, '#000', 'opacity="0.22"'))
    for ix in (-40, 0, 40):
        b.append(rect(px + ix - 6, 330, 12, 30, '#cfc6b4'))
    LAYOUT['street'] = {'houses': houses, 'transformer': [px, 430]}
    wire = '#111'
    for hs in houses:
        for k, ax in enumerate((-150, 150)):
            pass
        b.append(catenary(px + (-150 if hs['x'] < px else 150), 226, hs['x'], hs['roof'] + 6,
                          30 + abs(hs['x'] - px) * 0.04, wire, 2.4))
    for yline, sg in ((226, 60), (306, 50)):
        b.append(catenary(-20, yline - 40, px - 150, yline, sg, wire, 3))
        b.append(catenary(px + 150, yline, W + 20, yline - 30, sg, wire, 3))
    if lit:
        b.append(f'<circle cx="{px}" cy="420" r="140" fill="#ffd27a" opacity="0.10" filter="url(#b30)"/>')
    d += rg('vig', [(0.6, '#000', 0), (1, '#000', 0.5)], 0.5, 0.5, 0.75)
    b.append(rect(0, 0, W, H, 'url(#vig)'))
    return svg(W, H, ''.join(b), d)


PLATES = {
    'room_lit': lambda: room(True),
    'room_dark': lambda: room(False),
    'street_lit': lambda: street(True),
    'street_dark': lambda: street(False),
}

if __name__ == '__main__':
    import sys
    sys.path.insert(0, os.path.dirname(__file__))
    import svg_more
    only = set(sys.argv[1:])
    allp = dict(PLATES)
    allp.update(svg_more.PLATES)
    for k, fn in allp.items():
        if not only or k in only:
            save(k, fn())
            print('svg plate', k)
    for k, fn in svg_more.CUTOUTS.items():
        if not only or k in only:
            save('cut_' + k, fn())
            print('svg cutout', k)
    import build_svgs as again
    LAYOUT.update(again.LAYOUT)
    with open(os.path.join(OUT, 'layout.json'), 'w') as f:
        json.dump(LAYOUT, f, indent=1)
