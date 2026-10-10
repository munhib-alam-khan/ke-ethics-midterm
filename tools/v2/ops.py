"""OPS / MINI world: cream, teal and amber miniature paper-craft models for operations
(scene 8), where the accounts meet (10) and the recommendations (19-20)."""
from svgkit import svg, lg, rg, tex, rect, poly, path, circle, ellipse, cat, mix, save, rng

LAYERS = {}
TEAL, AMBER, CREAM, INK = '#3f7f7a', '#e8a33d', '#efe6d2', '#2a2622'


def out(name, w, h, body, defs='', style='paper', border=0):
    save(name, svg(w, h, body, defs))
    LAYERS[name] = dict(w=w, h=h, style=style, border=border)


def ground():
    W, H = 2600, 1460
    d = rg('g', [(0, '#f3ead6', 1), (0.7, '#e6dabf', 1), (1, '#cdbf9e', 1)], 0.5, 0.42, 0.75)
    b = [rect(0, 0, W, H, 'url(#g)'), tex(0, 0, W, H, 'grain', 0.15)]
    for k in range(0, W, 120):   # faint cutting-mat grid
        b.append(rect(k, 0, 2, H, TEAL, 'opacity="0.07"'))
    for k in range(0, H, 120):
        b.append(rect(0, k, W, 2, TEAL, 'opacity="0.07"'))
    out('o_ground', W, H, ''.join(b), d)


def shadow(x, y, w, h=40):
    return ellipse(x, y, w, h, '#5a4a30', 'opacity="0.25" filter="url(#b16)"')


def pole():
    W, H = 520, 1400
    b = [shadow(260, 1360, 200, 30), rect(244, 60, 32, 1300, '#6a5a48'), rect(60, 120, 400, 26, '#6a5a48'), rect(110, 300, 300, 22, '#6a5a48')]
    for ix in (90, 260, 430):
        b.append(rect(ix - 10, 74, 20, 50, CREAM))
    b.append(rect(150, 380, 220, 250, TEAL, 'rx="26"'))
    for k in range(5):
        b.append(rect(162 + k * 42, 398, 12, 214, '#2c5a56'))
    b.append(rect(150, 380, 220, 16, '#9fd6cf', 'opacity="0.6"'))
    out('o_pole', W, H, ''.join(b))


def meters():
    W, H = 940, 720
    b = [shadow(470, 690, 420, 30), rect(60, 60, 820, 600, '#d9cdb2', 'rx="18"'), rect(80, 80, 780, 560, '#c4b494', 'rx="12"')]
    for r_ in range(2):
        for c in range(3):
            x, y = 120 + c * 250, 110 + r_ * 260
            b.append(rect(x, y, 200, 230, CREAM, 'rx="14"'))
            b.append(circle(x + 100, y + 90, 60, '#fff9ec'))
            b.append(rect(x + 52, y + 80, 96, 24, INK, 'rx="4"'))
            b.append(rect(x + 50, y + 170, 100, 12, AMBER if (r_ + c) % 3 == 0 else TEAL, 'rx="6"'))
    out('o_meters', W, H, ''.join(b))


def ladder():
    W, H = 420, 1040
    b = [shadow(210, 1010, 150, 24), f'<g transform="rotate(8 210 520)">' + rect(110, 40, 22, 960, '#c9b48a') + rect(290, 40, 22, 960, '#c9b48a') +
         ''.join(rect(110, 100 + k * 90, 202, 16, '#c9b48a') for k in range(10)) + '</g>']
    out('o_ladder', W, H, ''.join(b))


def reel():
    W, H = 620, 520
    b = [shadow(310, 490, 240, 26), circle(310, 260, 220, '#b58a5a'), circle(310, 260, 190, INK), circle(310, 260, 150, '#3a3630'),
         circle(310, 260, 70, '#b58a5a'), circle(310, 260, 26, '#6a5a48')]
    for k in range(6):
        b.append(circle(310, 260, 160 + k * 5, 'none', 'stroke="#55504a" stroke-width="2"'))
    out('o_reel', W, H, ''.join(b))


def toolbox():
    W, H = 620, 420
    b = [shadow(310, 395, 250, 22), rect(70, 140, 480, 230, '#c4523a', 'rx="16"'), rect(70, 140, 480, 60, '#a33e2a', 'rx="16"'),
         path('M210,140 Q310,40 410,140', 'none', 'stroke="#3a2a20" stroke-width="18"'), rect(280, 210, 60, 30, '#e8d9b8', 'rx="6"')]
    out('o_toolbox', W, H, ''.join(b))


def ledger():
    W, H = 960, 640
    b = [shadow(480, 610, 420, 26), path('M70,120 Q270,80 470,130 L470,560 Q270,510 70,560 Z', '#fbf5e6'),
         path('M890,120 Q690,80 490,130 L490,560 Q690,510 890,560 Z', '#f4ecd8')]
    for i in range(12):
        y = 160 + i * 30
        b.append(path(f'M100,{y} Q270,{y - 22} 450,{y + 4}', 'none', 'stroke="#9ab8c4" stroke-width="2"'))
        b.append(path(f'M510,{y + 4} Q690,{y - 22} 860,{y}', 'none', 'stroke="#9ab8c4" stroke-width="2"'))
    for i in range(5):    # coins stack
        b.append(ellipse(760, 520 - i * 18, 70, 22, AMBER, 'stroke="#b07a20" stroke-width="3"'))
    out('o_ledger', W, H, ''.join(b))


def kunda():
    W, H = 640, 960
    b = [shadow(320, 930, 160, 22), rect(304, 80, 26, 860, '#6a5a48'), rect(140, 130, 360, 20, '#6a5a48'),
         cat(-20, 120, 160, 140, 20, INK, 6), cat(480, 140, 660, 120, 20, INK, 6),
         path('M420,150 q-26,-46 10,-56 q36,-6 26,36', 'none', f'stroke="{AMBER}" stroke-width="8"'),
         path('M446,140 C520,300 360,420 300,600', 'none', 'stroke="#c4523a" stroke-width="8"'),
         path('M200,150 q-26,-46 10,-56 q36,-6 26,36', 'none', f'stroke="{AMBER}" stroke-width="8"'),
         path('M226,140 C260,320 120,440 90,640', 'none', f'stroke="{TEAL}" stroke-width="8"')]
    out('o_kunda', W, H, ''.join(b))


def board():
    W, H = 1180, 820
    b = [shadow(590, 790, 520, 28), rect(60, 60, 1060, 700, '#2f4a46', 'rx="16"'), rect(80, 80, 1020, 660, '#3a5a55', 'rx="10"')]
    for k in range(3):
        b.append(circle(250 + k * 340, 170, 18, '#c9b48a'))
    b.append(rect(560, 20, 60, 60, '#c9b48a', 'rx="10"'))
    out('o_board', W, H, ''.join(b))


def mini_house(i, glow=False):
    r = rng(300 + i)
    cols = ['#9fc3bf', '#e8c48a', '#efe6d2', '#d9a68a', '#b9c4a8', '#e3d2b0', '#a9c6d6', '#d8b98a', '#c9b0c4', '#e6dcc4']
    W, H = 380, 520
    hgt = r.choice([380, 420, 460])
    top = H - hgt
    c = cols[i]
    b = [shadow(190, H - 10, 170, 18), rect(30, top, 320, hgt - 20, c), rect(350, top + 14, 22, hgt - 34, mix(c, '#000000', 0.25)),
         rect(20, top - 16, 340, 22, mix(c, '#000000', 0.18)), rect(r.uniform(50, 230), top - 70, 70, 60, '#3a3630', 'rx="10"')]
    for f in range(3 if hgt > 400 else 2):
        for cc in range(2):
            x, y = 60 + cc * 150, top + 40 + f * 120
            b.append(rect(x, y, 110, 80, '#4a5a66'))
            b.append(rect(x - 8, y - 14, 126, 10, mix(c, '#000000', 0.25)))
    b.append(rect(160, H - 120, 60, 100, mix(c, '#000000', 0.4)))
    if glow:
        g = []
        for f in range(3 if hgt > 400 else 2):
            for cc in range(2):
                x, y = 60 + cc * 150, top + 40 + f * 120
                g.append(rect(x - 14, y - 14, 138, 108, '#ffb84a', 'opacity="0.45" filter="url(#b8)"'))
                g.append(rect(x, y, 110, 80, '#ffd27a'))
        out(f'o_mh{i}_glow', W, H, ''.join(g))
        return
    out(f'o_mh{i}', W, H, ''.join(b))


def desk(name, plate_text=False):
    W, H = 860, 600
    b = [shadow(430, 570, 380, 26), rect(80, 260, 700, 40, '#c9a46a'), rect(110, 300, 30, 260, '#a8844a'), rect(720, 300, 30, 260, '#a8844a'),
         rect(500, 140, 200, 120, '#26262c', 'rx="10"'), rect(515, 155, 170, 90, '#3f7f7a'), rect(160, 200, 260, 64, CREAM, 'rx="6"')]
    if plate_text:
        b.append(poly([(240, 260), (420, 260), (410, 210), (250, 210)], '#e8d9b8'))
    out(name, W, H, ''.join(b))


def hearing():
    W, H = 1100, 640
    b = [shadow(550, 610, 500, 26), rect(80, 300, 940, 50, '#8a6a4a'), rect(110, 350, 880, 240, '#6a4e34'),
         path('M300,300 q-14,-90 -70,-130', 'none', 'stroke="#2a2a2a" stroke-width="10"'), circle(226, 166, 14, '#2a2a2a'),
         path('M800,300 q-14,-90 -70,-130', 'none', 'stroke="#2a2a2a" stroke-width="10"'), circle(726, 166, 14, '#2a2a2a'),
         rect(420, 250, 260, 52, '#efe6d2')]
    out('o_hearing', W, H, ''.join(b))


def phone_mini():
    W, H = 360, 640
    b = [shadow(180, 620, 120, 16), rect(40, 20, 280, 580, '#1e1e24', 'rx="40"'), rect(56, 46, 248, 528, '#2f6a6a', 'rx="26"')]
    out('o_phone', W, H, ''.join(b))


def calendar():
    W, H = 520, 560
    b = [shadow(260, 540, 200, 18), rect(60, 80, 400, 440, CREAM, 'rx="12"'), rect(60, 80, 400, 100, '#c4523a', 'rx="12"'),
         rect(130, 50, 24, 70, '#555', 'rx="10"'), rect(366, 50, 24, 70, '#555', 'rx="10"')]
    for r_ in range(4):
        for c in range(5):
            b.append(rect(90 + c * 72, 210 + r_ * 70, 56, 48, '#e6dcc4', 'rx="6"'))
    out('o_calendar', W, H, ''.join(b))


def build():
    ground(); pole(); meters(); ladder(); reel(); toolbox(); ledger(); kunda(); board()
    for i in range(10):
        mini_house(i)
        mini_house(i, glow=True)
    desk('o_desk'); desk('o_owner', True); hearing(); phone_mini(); calendar()
    return LAYERS
