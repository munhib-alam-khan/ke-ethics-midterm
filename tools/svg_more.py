"""Further plates and cutouts (imported by build_svgs.py)."""
import math
import random

from build_svgs import (BLUR, LAYOUT, catenary, lg, mix, poly, rect, rg, skyline, svg, grille)


def vignette(d, W, H, k=0.5):
    return rg('vig', [(0.55, '#000', 0), (1, '#000', k)], 0.5, 0.5, 0.75), rect(0, 0, W, H, 'url(#vig)')


# ------------------------------------------------------------ committee room
def committee():
    W, H = 1920, 1080
    rng = random.Random(31)
    d = BLUR + lg('wall', [(0, '#1f3a3a', 1), (1, '#132424', 1)])
    d += rg('spot', [(0, '#ffd48a', 0.85), (0.5, '#e8a33d', 0.25), (1, '#e8a33d', 0)])
    d += lg('desk', [(0, '#6a4128', 1), (1, '#2e1a0e', 1)])
    b = [rect(0, 0, W, H, 'url(#wall)')]
    for i in range(14):  # wood panels
        x = i * 140
        b.append(rect(x + 6, 80, 128, 560, '#2a4a48', 'opacity="0.55"'))
        b.append(rect(x + 6, 80, 4, 560, '#000', 'opacity="0.3"'))
    b.append(rect(0, 640, W, 440, '#1a1512'))
    # curved committee desk (far)
    b.append(f'<path d="M120,620 Q960,420 1800,620 L1800,700 Q960,500 120,700 Z" fill="url(#desk)"/>')
    b.append(f'<path d="M120,620 Q960,420 1800,620" fill="none" stroke="#8a5a36" stroke-width="8"/>')
    # members' chairs (empty silhouettes, no people)
    for i in range(13):
        t = i / 12
        x = 200 + t * 1520
        y = 560 - math.sin(t * math.pi) * 95
        b.append(rect(x - 34, y - 110, 68, 110, '#0f1d1d', 'rx="14"'))
        # gooseneck mics
        b.append(f'<path d="M{x + 26},{y + 6} q-6,-40 -30,-58" stroke="#111" stroke-width="4" fill="none"/>')
        b.append(f'<circle cx="{x - 4}" cy="{y - 52}" r="6" fill="#c0392b" opacity="0.8"/>')
        b.append(rect(x - 30, y + 4, 60, 18, '#efe6d2', 'opacity="0.65"'))  # blank nameplates
    # witness table + empty chair in spotlight
    b.append(f'<circle cx="960" cy="860" r="430" fill="url(#spot)"/>')
    b.append(poly([(640, 840), (1280, 840), (1340, 900), (580, 900)], '#4a2c18'))
    b.append(rect(600, 900, 720, 30, '#2a180c'))
    b.append(rect(640, 930, 16, 150, '#1e120a'))
    b.append(rect(1264, 930, 16, 150, '#1e120a'))
    b.append(f'<path d="M905,840 q-4,-50 -40,-70" stroke="#111" stroke-width="5" fill="none"/>')
    b.append(f'<circle cx="862" cy="768" r="9" fill="#111"/>')
    # high-backed chair (empty)
    b.append(rect(890, 560, 160, 250, '#3a1f17', 'rx="26"'))
    b.append(rect(905, 575, 130, 220, '#5a2e22', 'rx="20"'))
    b.append(rect(880, 790, 180, 50, '#3a1f17', 'rx="12"'))
    b.append(rect(960 - 160, 560, 320, 400, '#ffd48a', 'opacity="0.07" filter="url(#b30)"'))
    # papers on the witness table
    for k in range(3):
        b.append(poly([(1080 + k * 18, 850 - k * 4), (1200 + k * 18, 846 - k * 4), (1210 + k * 18, 880 - k * 4), (1090 + k * 18, 884 - k * 4)], '#efe6d2', 'opacity="0.9"'))
    vd, vr = vignette(d, W, H, 0.6)
    return svg(W, H, ''.join(b) + vr, d + vd)


# ------------------------------------------------------------ investigation desk
def desk():
    W, H = 1920, 1080
    rng = random.Random(41)
    d = BLUR + lg('wood', [(0, '#5c3a22', 1), (0.5, '#6e4428', 1), (1, '#4a2c18', 1)], 0, 0, 1, 1)
    d += rg('pool', [(0, '#ffd890', 0.35), (1, '#ffd890', 0)])
    b = [rect(0, 0, W, H, 'url(#wood)')]
    for i in range(60):
        y = i * 18 + rng.uniform(-4, 4)
        b.append(f'<path d="M0,{y:.0f} C500,{y + rng.uniform(-14, 14):.0f} 1300,{y + rng.uniform(-14, 14):.0f} 1920,{y:.0f}" stroke="#2a160a" stroke-opacity="{rng.uniform(0.08, 0.22):.2f}" stroke-width="{rng.uniform(1, 4):.1f}" fill="none"/>')
    b.append(f'<circle cx="900" cy="500" r="900" fill="url(#pool)"/>')
    folders = []
    spots = [(150, 150, -6), (1000, 120, 4), (170, 610, 3), (1010, 600, -4)]
    cols = ['#c9a46a', '#b9b08a', '#d0a27a', '#a9b9a6']
    for (x, y, a), c in zip(spots, cols):
        g = f'<g transform="rotate({a} {x + 380} {y + 190})">'
        g += rect(x + 14, y + 18, 760, 400, '#000', 'opacity="0.35" filter="url(#b8)"')
        g += rect(x, y - 30, 220, 40, mix(c, '#000000', 0.1), 'rx="8"')
        g += rect(x, y, 760, 400, c, 'rx="6"')
        # paper peeking out
        g += rect(x + 30, y - 16, 680, 60, '#f3ecdc')
        g += '</g>'
        b.append(g)
        folders.append({'x': x, 'y': y, 'w': 760, 'h': 400, 'rot': a})
    LAYOUT['desk'] = {'folders': folders}
    # pen, cup ring, paperclips
    b.append(f'<g transform="rotate(-28 1700 900)">{rect(1500, 890, 360, 18, "#1c1c1c", "rx=\"9\"")}{rect(1840, 892, 40, 14, "#c9a43a", "rx=\"6\"")}</g>')
    b.append(f'<circle cx="1790" cy="200" r="70" fill="none" stroke="#3a1c0c" stroke-width="10" opacity="0.35"/>')
    for k in range(4):
        b.append(f'<rect x="{900 + k * 30}" y="1010" width="18" height="44" rx="9" fill="none" stroke="#aaa" stroke-width="3" transform="rotate({k * 20} 910 1030)"/>')
    vd, vr = vignette(d, W, H, 0.55)
    return svg(W, H, ''.join(b) + vr, d + vd)


# ------------------------------------------------------------ gulshan rooftops
def rooftops():
    W, H = 1920, 1080
    rng = random.Random(51)
    d = BLUR + lg('sky', [(0, '#7f8fa0', 1), (0.5, '#c9a58a', 1), (1, '#e8b27a', 1)])
    b = [rect(0, 0, W, H, 'url(#sky)')]
    b.append(f'<circle cx="1450" cy="300" r="90" fill="#fff1d0" opacity="0.9" filter="url(#b8)"/>')
    b.append(f'<circle cx="1450" cy="300" r="320" fill="#ffd9a0" opacity="0.35" filter="url(#b60)"/>')
    # receding rows of rooftops with tanks
    for row, (base, sc, col) in enumerate([(520, 0.45, '#b39a86'), (600, 0.6, '#9c806c'), (700, 0.8, '#7e6352')]):
        x = -40
        while x < W:
            w = rng.uniform(140, 260) * sc * 1.6
            h = rng.uniform(40, 120) * sc
            b.append(rect(x, base - h, w, H - base + h, col))
            b.append(rect(x, base - h, w, 6 * sc, mix(col, '#ffffff', 0.25)))
            for t in range(rng.randint(1, 3)):
                tx = x + rng.uniform(4, max(6, w - 40 * sc))
                tw, th = 36 * sc, 44 * sc
                b.append(rect(tx, base - h - th, tw, th, '#1d1d1f', f'rx="{8 * sc:.0f}"'))
            if rng.random() < 0.3:
                b.append(f'<ellipse cx="{x + w * 0.7:.0f}" cy="{base - h - 20 * sc:.0f}" rx="{18 * sc:.0f}" ry="{24 * sc:.0f}" fill="#d8d2c6" transform="rotate(-25 {x + w * 0.7:.0f} {base - h - 20 * sc:.0f})"/>')
            x += w + rng.uniform(2, 20)
        b.append(rect(0, base - 160, W, 200, '#e8c09a', f'opacity="{0.25 - row * 0.07:.2f}" filter="url(#b30)"'))
    # wires across
    for k in range(4):
        b.append(catenary(-20, 260 + k * 40, W + 20, 300 + k * 30, 90, '#2a2420', 2.2))
    # foreground roof with parapet, big tank, motor pump and pipes
    b.append(rect(0, 820, W, 260, '#bfa58c'))
    b.append(rect(0, 800, W, 30, '#d6c0a6'))
    b.append(rect(0, 830, W, 8, '#000', 'opacity="0.2"'))
    b.append(rect(160, 520, 300, 300, '#1b1b1d', 'rx="40"'))
    for k in range(5):
        b.append(rect(160, 560 + k * 52, 300, 6, '#000', 'opacity="0.45"'))
    b.append(rect(220, 490, 180, 40, '#2a2a2c', 'rx="10"'))
    b.append(rect(170, 530, 40, 280, '#ffffff', 'opacity="0.07"'))
    # pump
    b.append(rect(620, 740, 170, 80, '#3f6f8a', 'rx="16"'))
    b.append(f'<circle cx="610" cy="780" r="36" fill="#6f8f9f"/>')
    b.append(rect(560, 770, 40, 20, '#888'))
    b.append(f'<path d="M705,740 L705,640 L330,640 L330,520" stroke="#d9d4ca" stroke-width="16" fill="none"/>')
    b.append(f'<path d="M790,780 L1000,780 L1000,1080" stroke="#d9d4ca" stroke-width="16" fill="none"/>')
    b.append(rect(1180, 760, 380, 60, '#1a1a1a', 'opacity="0.2" filter="url(#b8)"'))
    vd, vr = vignette(d, W, H, 0.45)
    return svg(W, H, ''.join(b) + vr, d + vd)


# ------------------------------------------------------------ distribution
def distribution():
    W, H = 1920, 1080
    rng = random.Random(61)
    d = BLUR + lg('sky', [(0, '#0f1f26', 1), (0.6, '#1d3a40', 1), (1, '#2c5555', 1)])
    d += rg('work', [(0, '#ffd890', 0.75), (0.4, '#e8a33d', 0.25), (1, '#e8a33d', 0)])
    b = [rect(0, 0, W, H, 'url(#sky)')]
    b.append(skyline(random.Random(9), -20, W + 20, 760, 140, 360, '#14262b', '#e8a33d', '#1b3036', 0.08))
    # wall with meter bank (right)
    b.append(rect(1040, 260, 880, 820, '#4c5a55'))
    b.append(rect(1040, 260, 880, 820, '#000', 'opacity="0.25"'))
    for r in range(3):
        for c in range(5):
            x, y = 1110 + c * 156, 330 + r * 190
            b.append(rect(x, y, 130, 160, '#d8d4c6', 'rx="8"'))
            b.append(rect(x + 10, y + 10, 110, 140, '#2f3a36', 'rx="6"'))
            b.append(f'<circle cx="{x + 65}" cy="{y + 62}" r="34" fill="#e8e2d0"/>')
            b.append(rect(x + 38, y + 56, 54, 12, '#1d1d1d'))
            b.append(rect(x + 30, y + 112, 70, 8, '#c0392b' if rng.random() < 0.3 else '#3a3a3a'))
            b.append(f'<path d="M{x + 65},{y + 160} L{x + 65 + rng.uniform(-30, 30):.0f},1080" stroke="#111" stroke-width="5"/>')
    # cable bundles along the wall top
    for k in range(7):
        b.append(catenary(1040, 280 + k * 6, 1920, 300 + k * 7, 40 + k * 6, '#0d0d0d', 4))
    # pole and transformer (left, close)
    b.append(rect(330, 0, 44, 1080, '#2b2723'))
    b.append(rect(120, 120, 480, 22, '#2b2723'))
    b.append(rect(210, 300, 290, 230, '#4f5f5a', 'rx="22"'))
    for k in range(7):
        b.append(rect(220 + k * 40, 318, 14, 196, '#000', 'opacity="0.25"'))
    for ix in (260, 352, 444):
        b.append(rect(ix - 9, 250, 18, 50, '#cfc6b4'))
    for x0 in (150, 352, 560):
        b.append(catenary(x0, 130, 1100, 270, 80, '#0d0d0d', 3))
        b.append(catenary(-20, 90, x0, 130, 40, '#0d0d0d', 3))
    # ladder leaning
    b.append(f'<g transform="rotate(14 600 1080)">{rect(560, 380, 14, 700, "#a8a29a")}{rect(680, 380, 14, 700, "#a8a29a")}' +
             ''.join(rect(560, 420 + k * 70, 134, 10, '#a8a29a') for k in range(10)) + '</g>')
    # work lamp pool
    b.append(f'<circle cx="700" cy="760" r="560" fill="url(#work)"/>')
    b.append(rect(0, 940, W, 140, '#1a1916'))
    b.append(rect(0, 930, W, 14, '#3a3834'))
    # toolbag on the ground
    b.append(rect(780, 880, 220, 90, '#6a3a22', 'rx="20"'))
    b.append(f'<path d="M820,880 q70,-70 140,0" stroke="#3a1f12" stroke-width="12" fill="none"/>')
    vd, vr = vignette(d, W, H, 0.55)
    return svg(W, H, ''.join(b) + vr, d + vd)


# ------------------------------------------------------------ correspondence desk
def correspondence():
    W, H = 1920, 1080
    rng = random.Random(71)
    d = BLUR + lg('felt', [(0, '#2e4a4a', 1), (1, '#1d3030', 1)], 0, 0, 1, 1)
    b = [rect(0, 0, W, H, 'url(#felt)')]
    for i in range(400):
        b.append(f'<circle cx="{rng.uniform(0, W):.0f}" cy="{rng.uniform(0, H):.0f}" r="{rng.uniform(20, 90):.0f}" fill="{rng.choice(["#000", "#fff"])}" opacity="0.025" filter="url(#b16)"/>')
    for i in range(26):
        x, y = rng.uniform(-100, W - 200), rng.uniform(-100, H - 150)
        a = rng.uniform(-35, 35)
        w, h = rng.choice([(300, 400), (360, 240), (260, 170)])
        env = w > h
        col = rng.choice(['#efe6d2', '#e6dcc4', '#ded2b8', '#f2ecdd'])
        g = f'<g transform="rotate({a:.0f} {x + w / 2:.0f} {y + h / 2:.0f})" opacity="0.92">'
        g += rect(x + 10, y + 12, w, h, '#000', 'opacity="0.35" filter="url(#b8)"')
        g += rect(x, y, w, h, col)
        if env:
            g += poly([(x, y), (x + w / 2, y + h * 0.55), (x + w, y)], mix(col, '#000000', 0.12))
        else:
            for k in range(9):
                g += rect(x + 26, y + 40 + k * 36, (w - 52) * rng.uniform(0.5, 1), 6, '#6a6458', 'opacity="0.35"')
        g += '</g>'
        b.append(g)
    b.append(rect(0, 0, W, H, '#0e1a1a', 'opacity="0.35"'))
    vd, vr = vignette(d, W, H, 0.6)
    return svg(W, H, ''.join(b) + vr, d + vd)


# ------------------------------------------------------------ amber table for the weighing scene
def table_amber():
    W, H = 1920, 1080
    d = BLUR + lg('bg', [(0, '#1d1a17', 1), (1, '#3a2a1c', 1)])
    d += lg('top', [(0, '#8a5a34', 1), (1, '#4a2c16', 1)])
    d += rg('glow', [(0, '#ffcf80', 0.55), (1, '#ffcf80', 0)])
    b = [rect(0, 0, W, H, 'url(#bg)')]
    b.append(f'<circle cx="960" cy="380" r="760" fill="url(#glow)"/>')
    b.append(poly([(0, 760), (W, 760), (W, H), (0, H)], 'url(#top)'))
    rng = random.Random(81)
    for i in range(20):
        y = 770 + i * 16
        b.append(f'<path d="M0,{y} C700,{y + rng.uniform(-8, 8):.0f} 1200,{y + rng.uniform(-8, 8):.0f} 1920,{y}" stroke="#2a160a" stroke-opacity="0.18" stroke-width="2" fill="none"/>')
    b.append(rect(0, 752, W, 14, '#a8744a'))
    vd, vr = vignette(d, W, H, 0.55)
    return svg(W, H, ''.join(b) + vr, d + vd)


# ------------------------------------------------------------ dusk sky with wires
def dusk_sky():
    W, H = 1920, 1080
    d = BLUR + lg('sky', [(0, '#1f2846', 1), (0.4, '#3d4766', 1), (0.7, '#8a5a62', 1), (0.9, '#d2875a', 1), (1, '#eaa865', 1)])
    b = [rect(0, 0, W, H, 'url(#sky)')]
    rng = random.Random(91)
    for i in range(12):
        b.append(f'<ellipse cx="{rng.uniform(0, W):.0f}" cy="{rng.uniform(150, 700):.0f}" rx="{rng.uniform(200, 500):.0f}" ry="{rng.uniform(30, 80):.0f}" fill="{rng.choice(["#e8a07a", "#6a6a8a", "#c47a6a"])}" opacity="0.35" filter="url(#b30)"/>')
    b.append(skyline(random.Random(13), -20, W + 20, 1080, 120, 330, '#1c1826', '#ffcf7a', '#2a2433', 0.18))
    # pole + wires with birds
    for px in (260, 1660):
        b.append(rect(px - 9, 300, 18, 780, '#141218'))
        b.append(rect(px - 120, 330, 240, 12, '#141218'))
    for k, y in enumerate((336, 360, 384)):
        b.append(catenary(-30, y - 30, 260 - 100 + k * 100, y, 30, '#0f0e12', 2.4))
        b.append(catenary(260 - 100 + k * 100, y, 1660 - 100 + k * 100, y, 120, '#0f0e12', 2.4))
        b.append(catenary(1660 - 100 + k * 100, y, W + 30, y - 40, 30, '#0f0e12', 2.4))
    for i in range(9):
        x = 520 + i * rng.uniform(60, 130)
        t = (x - 260) / 1400
        y = 360 + 4 * 120 * t * (1 - t) * 1.0 - 14
        b.append(f'<ellipse cx="{x:.0f}" cy="{y:.0f}" rx="9" ry="12" fill="#0f0e12"/><circle cx="{x + 4:.0f}" cy="{y - 12:.0f}" r="6" fill="#0f0e12"/>')
    vd, vr = vignette(d, W, H, 0.5)
    return svg(W, H, ''.join(b) + vr, d + vd)


# ------------------------------------------------------------ cutouts
def cut(w, h, body, defs=''):
    return svg(w, h, body, BLUR + defs)


def c_bill():
    w, h = 760, 1000
    b = rect(40, 40, 680, 920, '#f4eedf')
    b += rect(40, 40, 680, 120, '#d8e2dc')
    b += rect(80, 80, 200, 40, '#3f7f7a', 'opacity="0.6"')
    for i in range(6):
        b += rect(80, 220 + i * 50, [380, 300, 420, 260, 340, 280][i], 14, '#8a8478', 'opacity="0.55"')
        b += rect(560, 220 + i * 50, 120, 14, '#8a8478', 'opacity="0.55"')
    b += rect(80, 560, 600, 3, '#8a8478')
    for i in range(8):  # usage bars
        bh = [60, 90, 120, 100, 140, 110, 80, 130][i]
        b += rect(100 + i * 70, 760 - bh, 40, bh, '#c9a46a', 'opacity="0.8"')
    b += rect(80, 800, 600, 3, '#8a8478')
    for i in range(3):
        b += rect(80, 840 + i * 34, 300 - i * 60, 12, '#8a8478', 'opacity="0.5"')
    b += ''.join(rect(480 + k * 8, 840, 4 if k % 3 else 6, 90, '#333') for k in range(24))
    return cut(w, h, b)


def c_phone():
    w, h = 520, 960
    d = lg('scr', [(0, '#1f3a40', 1), (1, '#10232a', 1)])
    b = rect(40, 30, 440, 900, '#1a1a1c', 'rx="56"')
    b += rect(62, 60, 396, 840, 'url(#scr)', 'rx="36"')
    b += rect(220, 74, 80, 18, '#0a0a0a', 'rx="9"')
    b += rect(92, 130, 336, 70, '#3f7f7a', 'rx="12" opacity="0.8"')
    for i in range(5):
        b += rect(92, 240 + i * 110, 336, 86, '#284a50', 'rx="12" opacity="0.9"')
        b += f'<circle cx="132" cy="{283 + i * 110}" r="20" fill="#e8a33d" opacity="0.7"/>'
        b += rect(170, 266 + i * 110, 200, 12, '#9fc7c4', 'opacity="0.6"')
        b += rect(170, 290 + i * 110, 140, 10, '#9fc7c4', 'opacity="0.35"')
    return cut(w, h, b, d)


def c_pot():
    w, h = 700, 560
    b = rect(80, 360, 540, 110, '#2a2a2a', 'rx="16"')
    b += f'<ellipse cx="350" cy="362" rx="200" ry="26" fill="#ff6a2a"/>'
    b += f'<ellipse cx="350" cy="362" rx="150" ry="16" fill="#3a2a26"/>'
    b += f'<path d="M190,170 L510,170 L490,350 Q350,384 210,350 Z" fill="#a8a8a8"/>'
    b += f'<path d="M210,180 L250,180 L240,340 L222,340 Z" fill="#fff" opacity="0.35"/>'
    b += rect(170, 150, 360, 30, '#cfcfcf', 'rx="10"')
    b += rect(320, 118, 60, 34, '#555', 'rx="10"')
    b += rect(120, 190, 70, 18, '#3a3a3a', 'rx="8"') + rect(510, 190, 70, 18, '#3a3a3a', 'rx="8"')
    b += rect(560, 400, 26, 26, '#c0392b', 'rx="13"')
    return cut(w, h, b)


def c_laptop():
    w, h = 900, 620
    d = lg('ls', [(0, '#3d6f78', 1), (1, '#1e3a40', 1)])
    b = poly([(160, 60), (740, 60), (740, 440), (160, 440)], '#222')
    b += rect(180, 80, 540, 340, 'url(#ls)')
    for i in range(6):
        b += rect(210, 110 + i * 46, [300, 420, 360, 200, 380, 260][i], 14, '#cfe6e2', 'opacity="0.55"')
    b += poly([(110, 450), (790, 450), (860, 540), (40, 540)], '#bdbab3')
    b += poly([(110, 450), (790, 450), (800, 462), (100, 462)], '#8a8780')
    for r in range(4):
        for c in range(14):
            b += rect(150 + c * 44 + r * 6, 470 + r * 16, 36, 10, '#7a776f')
    # router beside
    b += rect(700, 480, 0, 0, 'none')
    return cut(w, h, b, d)


def c_router():
    w, h = 460, 340
    b = rect(40, 170, 380, 110, '#ece6d8', 'rx="18"')
    b += rect(70, 30, 14, 150, '#ddd6c8', 'rx="6"') + rect(376, 30, 14, 150, '#ddd6c8', 'rx="6"')
    b += ''.join(f'<circle cx="{120 + i * 50}" cy="230" r="9" fill="#5dff9a"/>' for i in range(5))
    b += rect(40, 260, 380, 20, '#000', 'opacity="0.1" rx="10"')
    return cut(w, h, b)


def c_iron():
    w, h = 640, 440
    b = f'<path d="M60,360 Q80,230 300,200 L560,200 L560,360 Z" fill="#c9cfd2"/>'
    b += f'<path d="M60,360 L560,360 L560,390 L70,390 Z" fill="#7d868a"/>'
    b += f'<path d="M220,200 Q260,80 400,80 L520,80 Q560,80 560,130 L560,200 L470,200 L470,140 L330,140 Q300,160 300,200 Z" fill="#3f7f7a"/>'
    b += rect(380, 240, 60, 60, '#e8a33d', 'rx="30"')
    b += f'<path d="M560,150 q60,0 60,80" stroke="#222" stroke-width="10" fill="none"/>'
    return cut(w, h, b)


def c_clock():
    w, h = 560, 560
    b = f'<circle cx="280" cy="280" r="240" fill="#2a1a10"/><circle cx="280" cy="280" r="212" fill="#f2ecdc"/>'
    for i in range(12):
        a = i * math.pi / 6
        b += f'<line x1="{280 + 180 * math.sin(a):.0f}" y1="{280 - 180 * math.cos(a):.0f}" x2="{280 + 198 * math.sin(a):.0f}" y2="{280 - 198 * math.cos(a):.0f}" stroke="#23211f" stroke-width="{10 if i % 3 == 0 else 5}"/>'
    ha, ma = (2 + 40 / 60) * math.pi / 6, 40 * math.pi / 30
    b += f'<line x1="280" y1="280" x2="{280 + 110 * math.sin(ha):.0f}" y2="{280 - 110 * math.cos(ha):.0f}" stroke="#23211f" stroke-width="14" stroke-linecap="round"/>'
    b += f'<line x1="280" y1="280" x2="{280 + 165 * math.sin(ma):.0f}" y2="{280 - 165 * math.cos(ma):.0f}" stroke="#23211f" stroke-width="8" stroke-linecap="round"/>'
    b += f'<circle cx="280" cy="280" r="14" fill="#b5583a"/>'
    return cut(w, h, b)


def c_ups():
    w, h = 820, 620
    b = rect(60, 140, 360, 420, '#2c2c2e', 'rx="18"')
    b += rect(90, 180, 300, 90, '#16302f', 'rx="8"')
    b += rect(110, 205, 120, 40, '#5dff9a', 'opacity="0.6"')
    b += ''.join(f'<circle cx="{120 + i * 60}" cy="330" r="14" fill="#555"/>' for i in range(5))
    b += ''.join(rect(90, 380 + k * 22, 300, 8, '#1a1a1a') for k in range(7))
    # battery
    b += rect(470, 220, 300, 340, '#c0392b', 'rx="16"')
    b += rect(470, 220, 300, 70, '#8f2a20', 'rx="16"')
    b += rect(510, 180, 50, 44, '#cfcfcf', 'rx="6"') + rect(680, 180, 50, 44, '#cfcfcf', 'rx="6"')
    b += rect(500, 360, 240, 90, '#efe6d2', 'opacity="0.8"')
    b += f'<path d="M535,200 C520,100 380,120 300,140" stroke="#111" stroke-width="10" fill="none"/>'
    b += f'<path d="M705,200 C720,90 420,80 360,140" stroke="#b5583a" stroke-width="10" fill="none"/>'
    return cut(w, h, b)


def c_bucket():
    w, h = 560, 600
    b = f'<path d="M90,150 L470,150 L420,540 Q280,570 140,540 Z" fill="#3f6f9a"/>'
    b += f'<ellipse cx="280" cy="150" rx="190" ry="40" fill="#2c4f72"/>'
    b += f'<ellipse cx="280" cy="166" rx="160" ry="28" fill="#7fb2c9" opacity="0.8"/>'
    b += f'<path d="M95,150 Q280,-40 465,150" stroke="#2a2a2a" stroke-width="10" fill="none"/>'
    b += f'<path d="M140,190 L170,520" stroke="#fff" stroke-width="18" opacity="0.15"/>'
    b += rect(250, 40, 60, 40, '#e8a33d', 'rx="8" opacity="0"')
    return cut(w, h, b)


def c_meter():
    w, h = 520, 720
    b = rect(40, 40, 440, 640, '#d8d4c6', 'rx="28"')
    b += rect(70, 70, 380, 580, '#2f3a36', 'rx="20"')
    b += f'<circle cx="260" cy="270" r="150" fill="#ece6d4"/>'
    b += rect(150, 230, 220, 52, '#1d1d1d', 'rx="6"')
    b += ''.join(rect(160 + i * 42, 238, 34, 36, '#f2ecdc', 'rx="3"') for i in range(5))
    b += rect(140, 320, 240, 18, '#9a9a9a', 'rx="9"')
    b += rect(220, 322, 30, 14, '#c0392b')
    b += rect(140, 470, 240, 120, '#1a2220', 'rx="10"')
    b += ''.join(f'<circle cx="{180 + i * 80}" cy="530" r="20" fill="#7d7a70"/>' for i in range(3))
    return cut(w, h, b)


def c_ledger():
    w, h = 900, 620
    b = f'<path d="M60,120 Q250,80 450,130 L450,560 Q250,510 60,560 Z" fill="#f2ecdc"/>'
    b += f'<path d="M840,120 Q650,80 450,130 L450,560 Q650,510 840,560 Z" fill="#ece4d0"/>'
    for i in range(14):
        y = 160 + i * 27
        b += f'<path d="M90,{y} Q250,{y - 22} 430,{y + 4}" stroke="#7aa0a0" stroke-width="2" fill="none"/>'
        b += f'<path d="M470,{y + 4} Q650,{y - 22} 810,{y}" stroke="#7aa0a0" stroke-width="2" fill="none"/>'
    b += f'<path d="M300,110 L300,540" stroke="#c0392b" stroke-width="2"/><path d="M700,110 L700,540" stroke="#c0392b" stroke-width="2"/>'
    b += rect(440, 120, 20, 450, '#000', 'opacity="0.15" filter="url(#b8)"')
    return cut(w, h, b)


def c_scale():
    w, h = 1400, 1000
    br = '#b8862e'
    d = lg('brass', [(0, '#e6b85a', 1), (0.5, '#b8862e', 1), (1, '#7a5418', 1)], 0, 0, 1, 0)
    b = rect(640, 160, 120, 760, 'url(#brass)', 'rx="20"')
    b += f'<ellipse cx="700" cy="930" rx="300" ry="50" fill="url(#brass)"/>'
    b += rect(130, 170, 1140, 34, 'url(#brass)', 'rx="17"')
    b += f'<circle cx="700" cy="150" r="46" fill="#e6b85a"/>'
    for cx in (200, 1200):
        b += f'<line x1="{cx}" y1="200" x2="{cx - 160}" y2="560" stroke="#6a4a16" stroke-width="4"/>'
        b += f'<line x1="{cx}" y1="200" x2="{cx + 160}" y2="560" stroke="#6a4a16" stroke-width="4"/>'
        b += f'<path d="M{cx - 200},560 Q{cx},680 {cx + 200},560 Z" fill="url(#brass)"/>'
    return cut(w, h, b, d)


def c_coil():
    w, h = 600, 500
    b = ''
    for k in range(9):
        b += f'<ellipse cx="300" cy="260" rx="{220 - k * 6}" ry="{150 - k * 5}" fill="none" stroke="{["#1d1d1d", "#2c2c2c"][k % 2]}" stroke-width="22"/>'
    b += f'<path d="M500,280 C580,330 560,430 470,470" stroke="#1d1d1d" stroke-width="22" fill="none"/>'
    b += rect(450, 455, 40, 30, '#c9a43a', 'rx="5"')
    return cut(w, h, b)


def c_tools():
    w, h = 760, 520
    b = f'<g transform="rotate(-20 380 260)">{rect(120, 230, 460, 46, "#9aa2a6", "rx=\"20\"")}'
    b += f'<circle cx="120" cy="252" r="70" fill="#9aa2a6"/><rect x="40" y="226" width="90" height="52" fill="#000" opacity="0"/>'
    b += poly([(60, 230), (120, 252), (60, 276)], '#2a2622') + '</g>'
    b += f'<g transform="rotate(25 380 300)">{rect(300, 280, 340, 32, "#c0392b", "rx=\"14\"")}{rect(300, 330, 340, 32, "#c0392b", "rx=\"14\"")}'
    b += poly([(160, 300), (300, 280), (300, 362), (160, 340)], '#7d868a') + '</g>'
    return cut(w, h, b)


def c_mic():
    w, h = 520, 820
    b = f'<ellipse cx="260" cy="740" rx="170" ry="40" fill="#2a2a2a"/>'
    b += rect(150, 680, 220, 60, '#333', 'rx="20"')
    b += f'<path d="M260,690 C260,520 120,420 200,250" stroke="#1a1a1a" stroke-width="18" fill="none"/>'
    b += f'<g transform="rotate(-25 210 200)">{rect(170, 80, 80, 180, "#3a3a3a", "rx=\"40\"")}' + ''.join(rect(176, 100 + k * 14, 68, 4, '#777') for k in range(8)) + '</g>'
    b += f'<circle cx="260" cy="700" r="12" fill="#c0392b"/>'
    return cut(w, h, b)


def c_tent():
    w, h = 1000, 760
    b = poly([(100, 260), (500, 80), (900, 260)], '#3f7f7a')
    b += ''.join(poly([(100 + k * 160, 260), (180 + k * 160, 300), (260 + k * 160, 260)], ['#e8a33d', '#efe6d2'][k % 2]) for k in range(5))
    b += rect(112, 260, 14, 440, '#555') + rect(874, 260, 14, 440, '#555')
    b += rect(260, 480, 480, 30, '#efe6d2') + rect(280, 510, 14, 190, '#777') + rect(706, 510, 14, 190, '#777')
    for x in (300, 470, 640):
        b += rect(x, 560, 60, 14, '#3a6aa0') + rect(x, 500, 10, 74, '#3a6aa0') + rect(x + 4, 574, 6, 120, '#3a6aa0') + rect(x + 50, 574, 6, 120, '#3a6aa0')
    b += ''.join(rect(330 + k * 120, 456, 80, 24, '#f4eedf') for k in range(3))
    return cut(w, h, b)


def c_kunda():
    """An illegal hook ('kunda') connection over a line - the target of anti-theft drives."""
    w, h = 900, 500
    b = catenary(0, 120, 900, 140, 40, '#1a1a1a', 10)
    b += f'<path d="M520,150 q-30,-50 10,-60 q40,-6 30,40" stroke="#c98a3a" stroke-width="9" fill="none"/>'
    b += f'<path d="M545,140 C600,260 420,320 360,470" stroke="#b5583a" stroke-width="9" fill="none"/>'
    b += f'<path d="M420,150 q-30,-50 10,-60 q40,-6 30,40" stroke="#c98a3a" stroke-width="9" fill="none"/>'
    b += f'<path d="M445,140 C500,280 300,330 250,480" stroke="#3f7f7a" stroke-width="9" fill="none"/>'
    return cut(w, h, b)


def c_paper(w, h, col='#f2ecdc'):
    return cut(w, h, rect(30, 30, w - 60, h - 60, col))


def c_envelope():
    w, h = 700, 480
    b = rect(40, 40, 620, 400, '#e6dcc4') + poly([(40, 40), (350, 270), (660, 40)], '#d4c8ac')
    b += poly([(40, 440), (300, 240), (40, 60)], '#ddd2b8', 'opacity="0.6"')
    return cut(w, h, b)


PLATES = {
    'committee': committee, 'desk': desk, 'rooftops': rooftops, 'distribution': distribution,
    'correspondence': correspondence, 'table_amber': table_amber, 'dusk_sky': dusk_sky,
}
CUTOUTS = {
    'bill': c_bill, 'phone': c_phone, 'pot': c_pot, 'laptop': c_laptop, 'router': c_router,
    'iron': c_iron, 'clock': c_clock, 'ups': c_ups, 'bucket': c_bucket, 'meter': c_meter,
    'ledger': c_ledger, 'scale': c_scale, 'coil': c_coil, 'tools': c_tools, 'mic': c_mic,
    'tent': c_tent, 'kunda': c_kunda, 'envelope': c_envelope,
    'paper_slip': lambda: c_paper(1100, 340), 'paper_sheet': lambda: c_paper(1000, 1300, '#f3eddf'),
}
