"""HOME world: the household room and the neighbourhood it belongs to.

Every element is its own transparent layer so the engine can place it at a
real depth and move it independently (2.5D camera). Pixel sizes are chosen
for the closest framing each layer receives.
"""
from svgkit import (svg, lg, rg, tex, rect, poly, path, circle, ellipse, cat, mix, save, grille, rng)

LAYERS = {}


def out(name, w, h, body, defs='', style='warm', border=0):
    save(name, svg(w, h, body, defs))
    LAYERS[name] = dict(w=w, h=h, style=style, border=border)


# ------------------------------------------------------------------ sky + skylines
def sky():
    W, H = 2400, 1350
    d = lg('s', [(0, '#0f1a33', 1), (0.45, '#24345a', 1), (0.78, '#4a4f70', 1), (1, '#7a6a78', 1)])
    b = [rect(0, 0, W, H, 'url(#s)')]
    r = rng(2)
    for _ in range(14):
        b.append(ellipse(r.uniform(0, W), r.uniform(150, 900), r.uniform(250, 600), r.uniform(30, 90),
                         r.choice(['#5a6488', '#3b4670', '#6f6a86']), 'opacity="0.45" filter="url(#b30)"'))
    b.append(circle(1760, 560, 64, '#f3ecd6', 'opacity="0.95"'))
    b.append(circle(1760, 560, 260, '#9fb4d6', 'opacity="0.25" filter="url(#b60)"'))
    for _ in range(140):
        b.append(circle(r.uniform(0, W), r.uniform(0, 600), r.uniform(0.8, 2.2), '#e9ecf6', f'opacity="{r.uniform(.3, .8):.2f}"'))
    out('h_sky', W, H, ''.join(b), d)


def skyline(name, seed, W, H, base, hmin, hmax, body, lit_p, win='#f2c26a'):
    r = rng(seed)
    b = []
    x = -20
    while x < W:
        w = r.uniform(90, 230)
        h = r.uniform(hmin, hmax)
        col = mix(body, '#000000', r.uniform(0, 0.25))
        b.append(rect(x, base - h, w, H - base + h, col))
        b.append(rect(x, base - h, 6, h, '#9fb4d6', 'opacity="0.12"'))
        if r.random() < 0.7:
            for _ in range(r.randint(1, 3)):
                b.append(rect(x + r.uniform(6, w - 30), base - h - 22, 24, 22, col, 'rx="5"'))
        cols, rows = max(2, int(w // 26)), max(2, int(h // 34))
        for rr in range(rows):
            for c in range(cols):
                if r.random() < 0.85:
                    lit = r.random() < lit_p
                    b.append(rect(x + 8 + c * (w - 16) / cols, base - h + 14 + rr * (h - 20) / rows, (w - 16) / cols * 0.55, 13,
                                  win if lit else mix(body, '#9fb4d6', 0.12), f'opacity="{0.9 if lit else 0.7}"'))
        x += w + r.uniform(-12, 16)
    out(name, W, H, ''.join(b), style='warm')


# ------------------------------------------------------------------ room back wall (with window hole)
def room_wall(lit):
    W, H = 2600, 1460
    hx, hy, hw, hh = 640, 330, 460, 420   # back-window hole
    d = ''
    if lit:
        d += lg('w', [(0, '#c08a55', 1), (0.55, '#a8723f', 1), (1, '#6e4528', 1)])
        d += rg('lg', [(0, '#ffd99a', 0.85), (0.4, '#f0ad55', 0.35), (1, '#f0ad55', 0)], 0.5, 0.5, 0.5)
    else:
        d += lg('w', [(0, '#36465a', 1), (0.55, '#2b3848', 1), (1, '#1a222c', 1)])
        d += rg('lg', [(0, '#a9c9d6', 0.5), (1, '#a9c9d6', 0)])
    d += f'<mask id="hole"><rect width="{W}" height="{H}" fill="white"/><rect x="{hx}" y="{hy}" width="{hw}" height="{hh}" fill="black"/></mask>'
    b = [f'<g mask="url(#hole)">', rect(0, 0, W, H, 'url(#w)'), tex(0, 0, W, H, 'plaster', 0.5), tex(0, 0, W, H, 'stain', 0.25)]
    if lit:
        b.append(circle(1840, 800, 900, 'url(#lg)'))
        b.append(circle(870, 1120, 500, '#ffcf8a', 'opacity="0.10" filter="url(#b120)"'))
    else:
        # moonlight thrown through the window onto the wall and floor
        b.append(poly([(hx - 40, hy + hh + 40), (hx + hw + 80, hy + hh + 40), (hx + hw + 520, H), (hx + 160, H)], '#b8d3df', 'opacity="0.16" filter="url(#b16)"'))
        b.append(circle(hx + hw / 2, hy + hh / 2, 420, 'url(#lg)'))
    # dado and skirting
    b.append(rect(0, 958, W, 12, '#000', 'opacity="0.28"'))
    b.append(rect(0, 970, W, 490, '#000', 'opacity="0.10"'))
    # window reveal (wall thickness) and sill
    b.append(rect(hx - 34, hy - 34, hw + 68, hh + 68, '#000', 'opacity="0.35" filter="url(#b16)"'))
    b.append(rect(hx - 60, hy + hh + 16, hw + 120, 26, mix('#d9c7a6', '#1a222c', 0 if lit else 0.6)))
    b.append(rect(hx - 60, hy + hh + 42, hw + 120, 10, '#000', 'opacity="0.35"'))
    # framed picture
    pc = 0 if lit else 0.62
    b.append(rect(1370, 400, 220, 160, '#2a1a10'))
    b.append(rect(1384, 414, 192, 132, mix('#6f7a4a', '#000000', pc)))
    b.append(poly([(1384, 546), (1450, 470), (1500, 510), (1540, 462), (1576, 546)], mix('#3f5a4a', '#000000', pc)))
    b.append(circle(1540, 448, 15, mix('#f2c26a', '#000000', pc)))
    b.append(rect(1370, 560, 220, 10, '#000', 'opacity="0.3" filter="url(#b4)"'))
    # wall calendar (blank, no text)
    b.append(rect(1180, 470, 120, 170, mix('#efe6d2', '#1a222c', pc)))
    b.append(rect(1180, 470, 120, 46, mix('#b5583a', '#1a222c', pc)))
    for i in range(5):
        for j in range(4):
            b.append(rect(1190 + j * 27, 530 + i * 20, 18, 10, mix('#8a8478', '#1a222c', pc), 'opacity="0.6"'))
    # switchboard + conduit
    b.append(rect(1610, 790, 130, 90, mix('#efe9dc', '#1a222c', pc), 'rx="6"'))
    for i in range(4):
        b.append(rect(1624 + i * 28, 808, 18, 28, mix('#d6cfbf', '#1a222c', pc), 'rx="3"'))
    b.append(rect(1668, 0, 14, 790, mix('#e9e1cf', '#1a222c', pc), 'opacity="0.8"'))
    b.append('</g>')
    out('room_wall_' + ('lit' if lit else 'dark'), W, H, ''.join(b), d)


def room_box(lit):
    """Side walls, ceiling and floor drawn as a perspective frame with a hole (seen from outside)."""
    W, H = 1500, 1000          # 0.5 px per world unit -> world 3000 x 2000
    ix0, iy0, ix1, iy1 = 380, 285, 1120, 715   # inner hole
    wall = '#a8723f' if lit else '#2b3848'
    d = f'<mask id="m"><rect width="{W}" height="{H}" fill="white"/><rect x="{ix0}" y="{iy0}" width="{ix1 - ix0}" height="{iy1 - iy0}" fill="black"/></mask>'
    b = ['<g mask="url(#m)">']
    b.append(poly([(0, 0), (W, 0), (ix1, iy0), (ix0, iy0)], mix(wall, '#ffffff', 0.12)))          # ceiling
    b.append(poly([(0, H), (W, H), (ix1, iy1), (ix0, iy1)], mix('#7a5a40' if lit else '#252a30', '#000000', 0.1)))  # floor
    b.append(poly([(0, 0), (ix0, iy0), (ix0, iy1), (0, H)], mix(wall, '#000000', 0.18)))            # left wall
    b.append(poly([(W, 0), (ix1, iy0), (ix1, iy1), (W, H)], mix(wall, '#000000', 0.08)))            # right wall
    for k in range(1, 9):   # floor tiles
        t = k / 9
        b.append(f'<line x1="{ix0 + (ix1 - ix0) * t:.0f}" y1="{iy1}" x2="{W * t:.0f}" y2="{H}" stroke="#000" stroke-opacity="0.2" stroke-width="3"/>')
    b.append(tex(0, 0, W, H, 'plaster', 0.4))
    if lit:
        b.append(circle(ix1, iy1 - 80, 420, '#ffcf8a', 'opacity="0.25" filter="url(#b60)"'))
    b.append('</g>')
    out('room_box_' + ('lit' if lit else 'dark'), W, H, ''.join(b))


def room_window():
    W, H = 1016, 936      # 2 px per world unit; window 460x420 world + frame
    fx, fy = 48, 48
    iw, ih = 920, 840
    b = []
    fr = '#5a3a24'
    b.append(rect(0, 0, W, H, fr))
    b.append(tex(0, 0, W, H, 'wood', 0.6))
    b.append(rect(fx, fy, iw, ih, '#000'))          # will be cut out below
    b.append(rect(fx + 8, fy + 8, iw - 16, ih - 16, '#000'))
    body = ''.join(b)
    mask = f'<mask id="m"><rect width="{W}" height="{H}" fill="white"/><rect x="{fx}" y="{fy}" width="{iw}" height="{ih}" fill="black"/></mask>'
    g = f'<g mask="url(#m)">{rect(0, 0, W, H, fr)}{tex(0, 0, W, H, "wood", 0.6)}{rect(0, 0, W, 10, "#ffffff", "opacity=\'0.12\'")}</g>'
    # mid mullion and grille
    g += rect(fx + iw / 2 - 10, fy, 20, ih, fr)
    g += grille(fx, fy, iw, ih, '#15110e', 9)
    out('room_window', W, H, g, mask)


def room_curtain():
    W, H = 420, 1320
    d = lg('c', [(0, '#6f2c23', 1), (0.18, '#b5583a', 1), (0.35, '#7d3328', 1), (0.55, '#c0663f', 1), (0.75, '#86372b', 1), (1, '#5f241d', 1)], 0, 0, 1, 0)
    b = [path(f'M40,0 C110,300 20,700 120,1320 L400,1320 C330,800 400,400 380,0 Z', 'url(#c)')]
    r = rng(5)
    for k in range(40):   # block-print motif
        x, y = r.uniform(80, 360), r.uniform(40, 1280)
        b.append(circle(x, y, 10, '#e8a33d', 'opacity="0.35"'))
    b.append(rect(0, 0, W, 24, '#2a1a10', 'rx="8"'))
    out('room_curtain', W, H, ''.join(b), d)


def room_kitchen(lit):
    W, H = 720, 1500
    k = 0 if lit else 0.62
    b = [rect(0, 0, W, H, '#13110f')]
    b.append(rect(40, 40, W - 40, H - 40, mix('#3f7f7a', '#0d1a1c', k)))
    for ty in range(40, H, 60):
        b.append(rect(40, ty, W, 3, '#000', 'opacity="0.25"'))
    for tx in range(40, W, 60):
        b.append(rect(tx, 40, 3, H, '#000', 'opacity="0.2"'))
    b.append(tex(40, 40, W, H, 'plaster', 0.3))
    b.append(rect(40, 820, W, 70, mix('#cfc3aa', '#14181c', k)))       # counter
    b.append(rect(40, 890, W, 610, mix('#5a4030', '#0e0f12', k)))
    b.append(rect(140, 760, 300, 64, '#222'))                          # electric hotplate
    b.append(ellipse(290, 764, 100, 14, '#ff6a2a' if lit else '#33251f'))
    if lit:
        b.append(ellipse(290, 756, 170, 46, '#ff8a3a', 'opacity="0.45" filter="url(#b16)"'))
    b.append(path('M190,640 L390,640 L374,756 L206,756 Z', mix('#a7a7a7', '#1a1d22', k)))
    b.append(rect(176, 624, 228, 22, mix('#cfcfcf', '#1a1d22', k), 'rx="6"'))
    b.append(rect(270, 600, 40, 26, '#444', 'rx="6"'))
    if lit:
        for i in range(3):
            b.append(path(f'M{240 + i * 45},600 q-30,-60 0,-120 q30,-60 0,-120', 'none', 'stroke="#fff" stroke-width="16" opacity="0.15" filter="url(#b8)"'))
    # shelf with jars
    b.append(rect(80, 420, 520, 16, mix('#5a3a24', '#000000', k)))
    for i, c in enumerate(['#b5583a', '#e8a33d', '#efe6d2', '#6b8a5a']):
        b.append(rect(110 + i * 120, 330, 80, 92, mix(c, '#0d1a1c', k), 'rx="10"'))
    b.append(rect(0, 0, 44, H, '#2a1a10'))
    b.append(rect(0, 0, W, 44, '#2a1a10'))
    out('room_kitchen_' + ('lit' if lit else 'dark'), W, H, ''.join(b))


def room_shelf():
    W, H = 820, 540
    b = [rect(40, 380, 740, 30, '#3a2414'), rect(40, 410, 740, 18, '#000', 'opacity="0.3" filter="url(#b4)"')]
    b.append(tex(40, 380, 740, 30, 'wood', 0.7))
    # router body (LEDs are live elements in the page)
    b.append(rect(170, 270, 330, 110, '#ece6d8', 'rx="18"'))
    b.append(rect(170, 350, 330, 30, '#000', 'opacity="0.10" rx="12"'))
    for ax in (196, 470):
        b.append(rect(ax, 40, 16, 236, '#ddd6c8', 'rx="7"'))
    b.append(rect(190, 290, 290, 10, '#fff', 'opacity="0.4" rx="5"'))
    for i in range(5):
        b.append(circle(225 + i * 52, 322, 9, '#2a3a30'))
    # books + plant pot
    for i, (c, hgt) in enumerate([('#4d6b5d', 200), ('#a8573b', 170), ('#c9a46a', 186), ('#2f4a5a', 210)]):
        b.append(rect(560 + i * 40, 380 - hgt, 34, hgt, c, 'rx="3"'))
    out('room_shelf', W, H, ''.join(b))


def room_lamp(lit):
    W, H = 620, 920
    b = []
    tb = '#4a2c18' if lit else '#25252a'
    b.append(poly([(40, 560), (580, 560), (610, 600), (10, 600)], tb))
    b.append(rect(30, 600, 24, 320, mix(tb, '#000000', 0.2)))
    b.append(rect(566, 600, 24, 320, mix(tb, '#000000', 0.2)))
    b.append(rect(60, 600, 500, 18, '#000', 'opacity="0.3"'))
    b.append(rect(290, 300, 40, 262, '#7a5530' if lit else '#3a3c42'))
    b.append(ellipse(310, 558, 96, 16, '#5a3a20' if lit else '#2a2b30'))
    shade = '#ffe7b3' if lit else '#757a80'
    b.append(poly([(150, 320), (470, 320), (410, 90), (210, 90)], shade))
    b.append(poly([(150, 320), (470, 320), (465, 304), (155, 304)], '#000', 'opacity="0.15"'))
    if lit:
        b.append(ellipse(310, 330, 170, 26, '#fff4cc', 'opacity="0.8" filter="url(#b8)"'))
    # small objects on the table
    b.append(rect(420, 520, 110, 40, '#2c2c2e' if lit else '#1d1d20', 'rx="6"'))   # phone charger block
    out('room_lamp_' + ('lit' if lit else 'dark'), W, H, ''.join(b))


def room_fan():
    # hub + rod (static) and blades seen from above (rotated & squashed in the page)
    out('room_fan_hub', 240, 520, rect(110, 0, 20, 420, '#1a1410') + ellipse(120, 440, 110, 52, '#2a2018') + ellipse(120, 430, 90, 30, '#3a2c20'))
    W = 1400
    b = []
    for a in (0, 120, 240):
        b.append(f'<g transform="rotate({a} 700 700)">' + path('M700,660 L1330,600 Q1390,700 1330,800 L700,740 Z', '#2c231b') +
                 path('M760,680 L1300,640', 'none', 'stroke="#4a3a2a" stroke-width="8"') + '</g>')
    b.append(circle(700, 700, 120, '#2a2018'))
    b.append(circle(700, 700, 60, '#4a3a2a'))
    out('room_fan_blades', W, W, ''.join(b))


def room_table(lit):
    W, H = 2600, 620
    d = lg('t', [(0, '#8a5530', 1), (1, '#3e2414', 1)] if lit else [(0, '#3a3a42', 1), (1, '#15151a', 1)])
    b = [rect(0, 30, W, H - 30, 'url(#t)'), tex(0, 30, W, H, 'wood', 0.75)]
    b.append(rect(0, 0, W, 34, '#2a180c' if lit else '#101014'))
    b.append(rect(0, 34, W, 14, '#000', 'opacity="0.3" filter="url(#b4)"'))
    if lit:
        b.append(ellipse(700, 200, 900, 220, '#ffd08a', 'opacity="0.12" filter="url(#b60)"'))
        b.append(ellipse(2200, 120, 500, 120, '#ffd08a', 'opacity="0.18" filter="url(#b60)"'))
    else:
        b.append(poly([(260, 34), (1000, 34), (1500, 620), (500, 620)], '#b8d3df', 'opacity="0.10" filter="url(#b30)"'))
    out('room_table_' + ('lit' if lit else 'dark'), W, H, ''.join(b), d)


def room_cup():
    b = ellipse(200, 330, 170, 34, '#000', 'opacity="0.35" filter="url(#b8)"')
    b += path('M90,120 L310,120 L290,300 Q200,336 110,300 Z', '#f1ebe0')
    b += path('M100,130 L130,130 L128,290 L114,290 Z', '#fff', 'opacity="0.5"')
    b += ellipse(200, 120, 110, 24, '#a8673a') + ellipse(200, 120, 110, 24, 'none', 'stroke="#d9d0c0" stroke-width="8"')
    b += path('M306,150 q66,10 44,66 q-14,30 -50,24', 'none', 'stroke="#f1ebe0" stroke-width="18"')
    out('room_cup', 400, 380, b)


def bill():
    W, H = 1200, 1560
    b = [rect(30, 30, 1140, 1500, '#f5efe1')]
    b.append(tex(30, 30, 1140, 1500, 'grain', 0.18))
    b.append(rect(30, 30, 1140, 200, '#d6e1dc'))
    b.append(rect(90, 80, 330, 64, '#3f7f7a', 'opacity="0.75"'))
    b.append(rect(90, 160, 220, 22, '#3f7f7a', 'opacity="0.45"'))
    b.append(rect(820, 80, 290, 110, '#ffffff', 'opacity="0.6"'))
    r = rng(9)
    for i in range(9):
        b.append(rect(90, 300 + i * 52, r.choice([560, 480, 620, 420, 520]), 16, '#7d776b', 'opacity="0.5"'))
        b.append(rect(900, 300 + i * 52, 200, 16, '#7d776b', 'opacity="0.5"'))
    b.append(rect(90, 790, 1020, 4, '#7d776b'))
    for i in range(12):   # monthly usage bars
        hgt = [90, 120, 160, 140, 200, 230, 250, 220, 180, 150, 120, 110][i]
        b.append(rect(120 + i * 82, 1080 - hgt, 50, hgt, '#c9a46a', 'opacity="0.85"'))
    b.append(rect(90, 1110, 1020, 4, '#7d776b'))
    b.append(rect(90, 1160, 520, 90, '#e9dfc6'))
    for i in range(3):
        b.append(rect(110, 1180 + i * 22, 380 - i * 80, 12, '#7d776b', 'opacity="0.5"'))
    b.append(''.join(rect(700 + k * 12, 1170, 5 if k % 3 else 8, 150, '#2a2a2a') for k in range(32)))
    for i in range(4):
        b.append(rect(90, 1330 + i * 40, 900 - i * 140, 12, '#7d776b', 'opacity="0.4"'))
    # fold crease and soft shading
    b.append(rect(30, 770, 1140, 30, '#000', 'opacity="0.05" filter="url(#b8)"'))
    b.append(rect(30, 30, 1140, 1500, 'none', 'stroke="#c9bfa6" stroke-width="4"'))
    out('bill', W, H, ''.join(b), style='clean')


# ------------------------------------------------------------------ neighbourhood
FACADE_COLS = ['#d9cdb4', '#b9cbc2', '#d8b07c', '#cfa69a', '#b3b2a8', '#ddc9a0', '#a6c0bd', '#d0bc98', '#c79a7c', '#d6c7b0']
MOON = '#1b2740'


def house(i, ours=False):
    """One house facade at night (moonlit), with its own transparent outline."""
    r = rng(100 + i)
    heights = [4400, 4800, 4300, 5200, 4600, 4500, 5600, 4700, 5000, 4400]
    ppw = 0.75 if ours else 0.3                 # pixels per world unit
    Wd, Hd = 2000, heights[i] + 400             # world size incl. roof tank space
    W, H = int(Wd * ppw), int(Hd * ppw)
    s = ppw
    fac = mix(FACADE_COLS[i], MOON, 0.58)
    top = 400 * s
    d = lg(f'f{i}', [(0, mix(fac, '#ffffff', 0.08), 1), (1, mix(fac, '#000000', 0.25), 1)])
    hole = ''
    if ours:   # front window opening looking into the room: world 1300x800, centred at house centre x, y = -40
        # house top is at world y = 1760 - heights[i]; window centre y=-40 -> local y
        wy = (-40 - (1760 - heights[i]) + 400) * s
        wx = 1000 * s
        hole = (wx - 650 * s, wy - 400 * s, 1300 * s, 800 * s)
        d += (f'<mask id="hm"><rect width="{W}" height="{H}" fill="white"/>'
              f'<rect x="{hole[0]:.0f}" y="{hole[1]:.0f}" width="{hole[2]:.0f}" height="{hole[3]:.0f}" fill="black"/></mask>')
    b = [f'<g {"mask=\"url(#hm)\"" if ours else ""}>']
    b.append(rect(0, top, W, H - top, f'url(#f{i})'))
    b.append(tex(0, top, W, H - top, 'plaster', 0.45))
    b.append(tex(0, top, W, H - top, 'stain', 0.35))
    b.append(rect(W - 20 * s, top, 20 * s, H - top, '#000', 'opacity="0.35"'))
    b.append(rect(0, top, 24 * s, H - top, '#c9d8ec', 'opacity="0.10"'))     # moon rim
    # parapet + tanks
    b.append(rect(-10, top - 60 * s, W + 20, 70 * s, mix(fac, '#000000', 0.3)))
    for t in range(r.randint(1, 2)):
        tx = r.uniform(150, 1600) * s
        b.append(rect(tx, top - 360 * s, 300 * s, 300 * s, '#121216', f'rx="{50 * s:.0f}"'))
        b.append(rect(tx + 20 * s, top - 395 * s, 260 * s, 50 * s, '#1c1c22', f'rx="{20 * s:.0f}"'))
        for k in range(4):
            b.append(rect(tx, top - (330 - k * 70) * s, 300 * s, 8 * s, '#000', 'opacity="0.5"'))
    if r.random() < 0.6:
        b.append(ellipse(r.uniform(300, 1700) * s, top - 140 * s, 110 * s, 140 * s, '#9aa2ae', f'transform="rotate(-25 {900 * s} {top - 140 * s})" opacity="0.8"'))
    floors = max(2, int((heights[i] - 1400) // 1300) + 1)
    # windows per floor (dark: blackout); our window is the real opening
    for f in range(floors):
        fy = top + (300 + f * 1300) * s
        for c in range(2):
            wx0 = (230 + c * 900) * s
            ww, wh = 640 * s, 680 * s
            if hole and not (wx0 + ww < hole[0] - 60 * s or wx0 > hole[0] + hole[2] + 60 * s or fy + wh < hole[1] - 200 * s or fy > hole[1] + hole[3] + 60 * s):
                continue
            b.append(rect(wx0, fy, ww, wh, '#0d1322'))
            b.append(rect(wx0 + 30 * s, fy + 30 * s, ww - 60 * s, wh - 60 * s, '#1a2438', 'opacity="0.8"'))
            b.append(poly([(wx0, fy + wh), (wx0 + ww * 0.6, fy), (wx0 + ww, fy), (wx0 + ww * 0.4, fy + wh)], '#8fb0d6', 'opacity="0.10"'))
            for kb in range(1, 5):
                b.append(rect(wx0 + kb * ww / 5 - 5 * s, fy, 10 * s, wh, '#06080e'))
            b.append(rect(wx0, fy + wh / 2 - 5 * s, ww, 10 * s, '#06080e'))
            b.append(rect(wx0 - 40 * s, fy - 70 * s, ww + 80 * s, 60 * s, mix(fac, '#000000', 0.35)))   # chajja sunshade
            b.append(rect(wx0 - 40 * s, fy - 10 * s, ww + 80 * s, 30 * s, '#000', 'opacity="0.35"'))
        # balcony rail + AC unit
        by = fy + 760 * s
        b.append(rect(80 * s, by, W - 160 * s, 14 * s, '#151517'))
        for k in range(int((W - 160 * s) // (40 * s))):
            b.append(rect(90 * s + k * 40 * s, by, 7 * s, 120 * s, '#151517'))
        if r.random() < 0.6:
            ax = r.uniform(100, 1600) * s
            b.append(rect(ax, by - 300 * s, 260 * s, 180 * s, mix('#d8d4cb', MOON, 0.55)))
            b.append(rect(ax + 20 * s, by - 280 * s, 220 * s, 8 * s, '#000', 'opacity="0.4"'))
        if r.random() < 0.5:   # laundry
            b.append(cat(90 * s, by - 6 * s, W - 90 * s, by - 6 * s, 30 * s, '#151517', 3 * s))
            for k in range(r.randint(2, 5)):
                cx = (200 + k * 300) * s
                b.append(rect(cx, by, 110 * s, 170 * s, mix(r.choice(['#b5583a', '#3f7f7a', '#e8a33d', '#efe6d2', '#6b5a8a']), MOON, 0.5)))
    # ground floor: shutter / door
    gy = H - 1200 * s
    if r.random() < 0.5 and not ours:
        b.append(rect(120 * s, gy + 300 * s, W - 240 * s, 900 * s, mix('#7d8a86', MOON, 0.5)))
        for k in range(30):
            b.append(rect(120 * s, gy + 300 * s + k * 30 * s, W - 240 * s, 5 * s, '#000', 'opacity="0.3"'))
    else:
        b.append(rect(W / 2 - 220 * s, gy + 260 * s, 440 * s, 940 * s, mix('#5a3a24', MOON, 0.5)))
        b.append(rect(W / 2 - 220 * s, gy + 200 * s, 440 * s, 60 * s, mix(fac, '#000000', 0.35)))
    b.append(rect(0, H - 40 * s, W, 40 * s, '#000', 'opacity="0.4"'))
    b.append('</g>')
    if ours:   # exterior frame + grille + sunshade around the opening
        x0, y0, ww, wh = hole
        fr = mix('#5a3a24', MOON, 0.35)
        b.append(f'<rect x="{x0 - 30 * s:.1f}" y="{y0 - 30 * s:.1f}" width="{ww + 60 * s:.1f}" height="{wh + 60 * s:.1f}" fill="none" stroke="{fr}" stroke-width="{60 * s:.1f}"/>')
        b.append(rect(x0 - 120 * s, y0 - 180 * s, ww + 240 * s, 110 * s, mix(fac, '#000000', 0.35)))
        b.append(rect(x0 - 120 * s, y0 - 70 * s, ww + 240 * s, 40 * s, '#000', 'opacity="0.35"'))
        b.append(grille(x0, y0, ww, wh, '#0b0907', 12 * s))
        b.append(rect(x0 - 60 * s, y0 + wh + 20 * s, ww + 120 * s, 50 * s, mix('#d9c7a6', MOON, 0.5)))
    name = 'house_ours' if ours else f'house_{i}'
    out(name, W, H, ''.join(b), d)
    return dict(w=Wd, h=Hd)


def pole():
    W, H = 640, 2600
    b = [rect(300, 0, 40, H, '#1e1b18'), rect(306, 0, 8, H, '#3a3630', 'opacity="0.7"')]
    b.append(rect(40, 120, 560, 28, '#1e1b18'))
    b.append(rect(100, 330, 440, 24, '#1e1b18'))
    for ix in (110, 320, 530):
        b.append(rect(ix - 12, 70, 24, 54, '#cfc6b4'))
    b.append(rect(170, 420, 300, 330, '#3f4c4a', 'rx="30"'))
    for k in range(7):
        b.append(rect(180 + k * 41, 440, 14, 290, '#000', 'opacity="0.3"'))
    for ix in (230, 320, 410):
        b.append(rect(ix - 9, 370, 18, 54, '#cfc6b4'))
    b.append(rect(170, 420, 300, 12, '#9fb4d6', 'opacity="0.2"'))
    # tangle of service cables
    for k in range(8):
        b.append(cat(320, 760 + k * 6, 640 if k % 2 else 0, 820 + k * 20, 60 + k * 8, '#0d0d0d', 5))
    b.append(rect(280, 1400, 80, 120, '#2a2a2a', 'rx="6"'))      # junction box
    out('h_pole', W, H, ''.join(b))


def road():
    W, H = 3000, 600
    d = lg('r', [(0, '#3a3a40', 1), (1, '#16161a', 1)])
    b = [rect(0, 0, W, 50, '#5a5a60'), rect(0, 50, W, 14, '#22222a'), rect(0, 64, W, H - 64, 'url(#r)'), tex(0, 0, W, H, 'grain', 0.5)]
    r = rng(4)
    for _ in range(20):
        b.append(ellipse(r.uniform(0, W), r.uniform(120, 560), r.uniform(80, 260), 10, '#000', 'opacity="0.25" filter="url(#b8)"'))
    for k in range(12):
        b.append(rect(k * 260 + 40, 380, 140, 10, '#cfc6b4', 'opacity="0.25"'))
    b.append(poly([(0, 64), (W, 64), (W, 200), (0, 200)], '#8fb0d6', 'opacity="0.06"'))
    out('h_road', W, H, ''.join(b), d)


def build():
    sky()
    skyline('h_skyline_far', 3, 3600, 1300, 700, 220, 560, '#1d2740', 0.03)
    skyline('h_skyline_mid', 4, 3600, 1600, 900, 260, 640, '#151d30', 0.02)
    for lit in (True, False):
        room_wall(lit)
        room_box(lit)
        room_kitchen(lit)
        room_lamp(lit)
        room_table(lit)
    room_window()
    room_curtain()
    room_shelf()
    room_fan()
    room_cup()
    bill()
    for i in range(10):
        house(i, ours=(i == 2))
    pole()
    road()
    return LAYERS


if __name__ == '__main__':
    import json
    print(json.dumps(build(), indent=0)[:200])
