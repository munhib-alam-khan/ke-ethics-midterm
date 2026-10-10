"""Remaining worlds: correspondence (9, 13), evaluation table (11, 14), fieldwork collage (15),
regulatory desk (17) and dusk city (21)."""
from svgkit import svg, lg, rg, tex, rect, poly, path, circle, ellipse, cat, mix, save, rng

LAYERS = {}


def out(name, w, h, body, defs='', style='paper', border=0, tint=None):
    save(name, svg(w, h, body, defs))
    L = dict(w=w, h=h, style=style, border=border)
    if tint: L['tint'] = tint
    LAYERS[name] = L


# ------------------------------------------------------------ correspondence
def c_desk():
    W, H = 2600, 1460
    d = rg('g', [(0, '#2f5552', 1), (0.8, '#1d3634', 1), (1, '#132423', 1)], 0.5, 0.45, 0.8)
    out('c_desk', W, H, rect(0, 0, W, H, 'url(#g)') + tex(0, 0, W, H, 'grain', .35) + tex(0, 0, W, H, 'plaster', .3), d, style='warm')


def c_letter(name, tint):
    W, H = 820, 1060
    b = [rect(30, 30, 760, 1000, tint), tex(30, 30, 760, 1000, 'grain', .12)]
    r = rng(len(name))
    for j in range(20):
        b.append(rect(90, 140 + j * 40, r.choice([520, 600, 640, 460, 560]), 9, '#8a8478', 'opacity="0.45"'))
    out(name, W, H, ''.join(b), border=10, tint='#f3ecdc')


def c_env(name, col):
    W, H = 840, 580
    b = [rect(30, 30, 780, 520, col), poly([(30, 30), (420, 320), (810, 30)], mix(col, '#000000', 0.12)), poly([(30, 550), (330, 300), (30, 60)], mix(col, '#ffffff', 0.08)),
         rect(560, 70, 150, 110, '#c4523a', 'opacity="0.8"'), rect(120, 380, 300, 12, '#6a6458', 'opacity="0.5"'), rect(120, 410, 220, 12, '#6a6458', 'opacity="0.5"')]
    out(name, W, H, ''.join(b), border=8, tint='#efe6d2')


def c_mic():
    W, H = 560, 860
    b = [ellipse(280, 790, 210, 48, '#1e1e22'), rect(160, 720, 240, 74, '#2c2c30', 'rx="22"'),
         path('M280,730 C280,540 130,440 210,260', 'none', 'stroke="#18181c" stroke-width="24"'),
         f'<g transform="rotate(-25 210 210)">{rect(164, 76, 96, 210, "#34343a", "rx=\"48\"")}' + ''.join(rect(170, 100 + k * 17, 84, 6, '#8a8a90') for k in range(9)) + '</g>',
         circle(280, 742, 15, '#e85d4a')]
    out('c_mic', W, H, ''.join(b), style='warm')


def c_paper(name, W, H, tint='#f6f0e2'):
    out(name, W, H, rect(20, 20, W - 40, H - 40, tint) + tex(20, 20, W - 40, H - 40, 'grain', .12), border=12, tint='#f3ecdc')


# ------------------------------------------------------------ evaluation table
def e_table():
    W, H = 2600, 1460
    d = rg('g', [(0, '#f1e9d6', 1), (0.65, '#ddd1b6', 1), (1, '#b9ab8c', 1)], 0.5, 0.35, 0.85)
    out('e_table', W, H, rect(0, 0, W, H, 'url(#g)') + tex(0, 0, W, H, 'grain', .2), d)


def e_book():
    W, H = 2300, 1340
    d = lg('pl', [(0, '#efe6d0', 1), (1, '#fbf6ea', 1)], 0, 0, 1, 0) + lg('pr', [(0, '#fbf6ea', 1), (1, '#ece2ca', 1)], 0, 0, 1, 0)
    b = [ellipse(1150, 1280, 1100, 50, '#6a5a40', 'opacity="0.3" filter="url(#b16)"'),
         path('M60,120 Q600,40 1140,120 L1140,1240 Q600,1170 60,1250 Z', 'url(#pl)'),
         path('M2240,120 Q1700,40 1160,120 L1160,1240 Q1700,1170 2240,1250 Z', 'url(#pr)'),
         rect(1130, 110, 40, 1140, '#000', 'opacity="0.10" filter="url(#b8)"')]
    for i in range(22):
        y = 200 + i * 46
        b.append(path(f'M120,{y} Q600,{y - 40} 1100,{y + 4}', 'none', 'stroke="#a9c3c8" stroke-width="2" opacity="0.6"'))
        b.append(path(f'M1200,{y + 4} Q1700,{y - 40} 2180,{y}', 'none', 'stroke="#a9c3c8" stroke-width="2" opacity="0.6"'))
    out('e_book', W, H, ''.join(b), d)


# ------------------------------------------------------------ fieldwork collage (halftone + paper)
def f_tent():
    W, H = 1200, 900
    b = [rect(0, 0, W, H, '#b0b0b0'), poly([(120, 300), (600, 90), (1080, 300)], '#3a3a3a'),
         ''.join(poly([(120 + k * 192, 300), (216 + k * 192, 350), (312 + k * 192, 300)], ['#1a1a1a', '#e0e0e0'][k % 2]) for k in range(5)),
         rect(130, 300, 16, 560, '#222'), rect(1054, 300, 16, 560, '#222'), rect(300, 560, 600, 40, '#e8e8e8'), rect(320, 600, 16, 260, '#444'), rect(864, 600, 16, 260, '#444')]
    for k in range(4):
        b.append(rect(340 + k * 140, 520, 100, 40, '#f4f4f4'))
    for x in (380, 560, 740):
        b.append(rect(x, 650, 70, 16, '#555')); b.append(rect(x, 590, 12, 76, '#555'))
    b.append(rect(0, 860, W, 40, '#6a6a6a'))
    out('f_tent', W, H, ''.join(b), style='halftone', border=14)


def f_hooks():
    W, H = 1100, 800
    b = [rect(0, 0, W, H, '#c8c8c8'), cat(-20, 160, 1120, 190, 60, '#111', 12)]
    for k, x in enumerate([300, 460, 640]):
        b.append(path(f'M{x},{200} q-30,-56 10,-66 q40,-6 30,40', 'none', 'stroke="#222" stroke-width="10"'))
        b.append(path(f'M{x + 26},{190} C{x + 90},{360} {x - 80},{460} {x - 120},{800}', 'none', 'stroke="#333" stroke-width="10"'))
    b.append(f'<g transform="rotate(-30 760 520)">{rect(640, 500, 320, 40, "#222", "rx=\"14\"")}{rect(640, 560, 320, 40, "#222", "rx=\"14\"")}{poly([(520, 520), (640, 500), (640, 600), (520, 580)], "#555")}</g>')
    out('f_hooks', W, H, ''.join(b), style='halftone', border=14)


def f_headset():
    W, H = 900, 760
    b = [rect(0, 0, W, H, '#9a9a9a'), path('M220,420 C220,140 680,140 680,420', 'none', 'stroke="#1a1a1a" stroke-width="36"'),
         rect(150, 380, 130, 200, '#222', 'rx="50"'), rect(620, 380, 130, 200, '#222', 'rx="50"'),
         path('M210,560 C260,680 380,700 460,690', 'none', 'stroke="#1a1a1a" stroke-width="16"'), circle(470, 690, 26, '#222'),
         rect(520, 600, 300, 140, '#e6e6e6', 'rx="10"')]
    out('f_headset', W, H, ''.join(b), style='halftone', border=14)


def f_forms():
    W, H = 900, 1000
    b = [rect(0, 0, W, H, '#8a8a8a')]
    for k, (dx, a) in enumerate([(0, -5), (40, 4), (80, -1)]):
        b.append(f'<g transform="rotate({a} 450 500)">{rect(160 + dx, 120 + k * 12, 560, 760, "#f2f2f2")}' +
                 ''.join(rect(210 + dx, 200 + k * 12 + j * 44, 440 - (j % 4) * 70, 12, '#9a9a9a') + rect(210 + dx, 222 + k * 12 + j * 44, 18, 18, 'none', 'stroke="#777" stroke-width="3"') for j in range(13)) + '</g>')
    out('f_forms', W, H, ''.join(b), style='halftone', border=14)


def f_meter():
    W, H = 700, 900
    b = [rect(0, 0, W, H, '#aaaaaa'), rect(140, 120, 420, 660, '#e6e6e6', 'rx="30"'), rect(170, 150, 360, 600, '#3a3a3a', 'rx="20"'),
         circle(350, 360, 130, '#f2f2f2'), rect(250, 330, 200, 50, '#111', 'rx="6"'), rect(240, 560, 220, 110, '#222', 'rx="10"')]
    out('f_meter', W, H, ''.join(b), style='halftone', border=14)


def f_ladder():
    W, H = 800, 1100
    b = [rect(0, 0, W, H, '#d0d0d0'), rect(520, 0, 40, H, '#1a1a1a'), rect(380, 120, 320, 20, '#1a1a1a')]
    b.append(f'<g transform="rotate(16 300 1100)">{rect(220, 200, 26, 900, "#3a3a3a")}{rect(380, 200, 26, 900, "#3a3a3a")}' + ''.join(rect(220, 260 + k * 90, 186, 16, '#3a3a3a') for k in range(10)) + '</g>')
    out('f_ladder', W, H, ''.join(b), style='halftone', border=14)


# ------------------------------------------------------------ regulatory desk
def d_desk():
    W, H = 2600, 1460
    d = lg('w', [(0, '#3e2818', 1), (0.5, '#4e3220', 1), (1, '#2e1c10', 1)], 0, 0, 1, 1) + rg('l', [(0, '#ffd890', .3), (1, '#ffd890', 0)])
    out('d_desk', W, H, rect(0, 0, W, H, 'url(#w)') + tex(0, 0, W, H, 'wood', .7) + circle(1100, 600, 1100, 'url(#l)'), d, style='warm')


def d_glasses():
    W, H = 700, 300
    b = [circle(200, 160, 110, 'none', 'stroke="#1a1a1a" stroke-width="16"'), circle(500, 160, 110, 'none', 'stroke="#1a1a1a" stroke-width="16"'),
         path('M310,150 Q350,120 390,150', 'none', 'stroke="#1a1a1a" stroke-width="14"'), circle(200, 160, 100, '#bcd', 'opacity="0.15"'), circle(500, 160, 100, '#bcd', 'opacity="0.15"')]
    out('d_glasses', W, H, ''.join(b), style='warm')


# ------------------------------------------------------------ dusk city
def u_sky():
    W, H = 2400, 1350
    d = lg('s', [(0, '#1c2448', 1), (0.4, '#4a3a6a', 1), (0.7, '#c4607a', 1), (0.9, '#f0a060', 1), (1, '#f7c87a', 1)])
    b = [rect(0, 0, W, H, 'url(#s)')]
    r = rng(9)
    for _ in range(12):
        b.append(ellipse(r.uniform(0, W), r.uniform(150, 800), r.uniform(250, 600), r.uniform(25, 70), r.choice(['#e8907a', '#6a5a8a', '#c47a8a']), 'opacity="0.4" filter="url(#b30)"'))
    out('u_sky', W, H, ''.join(b), d, style='rich')


def u_city(name, seed, W, H, base, hmin, hmax, col, lit):
    r = rng(seed)
    b = []
    x = -20
    while x < W:
        w = r.uniform(90, 240); h = r.uniform(hmin, hmax)
        c = mix(col, '#000000', r.uniform(0, .25))
        b.append(rect(x, base - h, w, H - base + h, c))
        for j in range(int(h // 34)):
            for i in range(max(1, int(w // 28))):
                if r.random() < lit:
                    b.append(rect(x + 8 + i * 28, base - h + 14 + j * 34, 12, 12, '#ffcf7a'))
        if r.random() < 0.6:
            b.append(rect(x + r.uniform(5, w - 40), base - h - 24, 30, 24, c, 'rx="6"'))
        x += w + r.uniform(-10, 14)
    out(name, W, H, ''.join(b), style='rich')


def u_poles():
    W, H = 3600, 1200
    b = []
    for px in (500, 2100, 3300):
        b.append(rect(px - 12, 200, 24, 1000, '#120e18')); b.append(rect(px - 150, 240, 300, 14, '#120e18'))
    for k in range(3):
        b.append(cat(-20, 230 + k * 24, 500, 250 + k * 24, 40, '#0e0a14', 3)); b.append(cat(500, 250 + k * 24, 2100, 250 + k * 24, 160, '#0e0a14', 3)); b.append(cat(2100, 250 + k * 24, 3300, 250 + k * 24, 120, '#0e0a14', 3)); b.append(cat(3300, 250 + k * 24, 3620, 230 + k * 24, 30, '#0e0a14', 3))
    r = rng(4)
    for i in range(11):
        x = 700 + i * r.uniform(90, 140)
        t = (x - 500) / 1600
        y = 250 + 4 * 160 * t * (1 - t) - 14
        b.append(ellipse(x, y, 10, 13, '#0e0a14') + circle(x + 4, y - 13, 7, '#0e0a14'))
    out('u_poles', W, H, ''.join(b), style='rich')


def build():
    c_desk(); c_letter('c_letter1', '#f6f0e2'); c_letter('c_letter2', '#efe6d0'); c_env('c_env1', '#e6dcc4'); c_env('c_env2', '#d9cfb0'); c_mic()
    c_paper('c_note', 1000, 640); c_paper('c_doc', 1000, 1300)
    e_table(); e_book()
    f_tent(); f_hooks(); f_headset(); f_forms(); f_meter(); f_ladder()
    d_desk(); d_glasses(); c_paper('d_sheet', 1000, 1300, '#f7f1e3')
    u_sky(); u_city('u_far', 31, 3600, 1000, 900, 220, 560, '#2a2246', 0.05); u_city('u_mid', 32, 3600, 1100, 1000, 260, 640, '#1c1630', 0.12); u_poles()
    return LAYERS
