"""PRESS world: editorial collage (halftone fragments) that becomes the research board.
Fragments are illustrations (labelled on screen), never facsimiles of real articles."""
from svgkit import svg, lg, rg, tex, rect, poly, path, circle, ellipse, cat, mix, save, rng

LAYERS = {}


def out(name, w, h, body, defs='', style='halftone', border=0, tint=None, cell=None):
    save(name, svg(w, h, body, defs))
    L = dict(w=w, h=h, style=style, border=border)
    if tint: L['tint'] = tint
    LAYERS[name] = L


def board():
    W, H = 2400, 1350
    d = lg('g', [(0, '#e9e1cf', 1), (1, '#d9cfb8', 1)])
    b = [rect(0, 0, W, H, 'url(#g)'), tex(0, 0, W, H, 'plaster', 0.18), tex(0, 0, W, H, 'grain', 0.2)]
    r = rng(3)
    for _ in range(60):   # faint ghost print from old pages
        b.append(rect(r.uniform(0, W), r.uniform(0, H), r.uniform(200, 600), 10, '#8a8270', f'opacity="{r.uniform(.04, .1):.2f}"'))
    out('p_board', W, H, ''.join(b), d, style='paper')


def chamber():
    W, H = 1500, 920
    d = lg('wall', [(0, '#6a6a6a', 1), (1, '#2a2a2a', 1)]) + rg('spot', [(0, '#ffffff', .8), (1, '#ffffff', 0)])
    b = [rect(0, 0, W, H, 'url(#wall)')]
    for i in range(11):
        b.append(rect(i * 140 + 10, 40, 120, 420, '#7a7a7a', 'opacity="0.55"'))
    for tier, (y0, sc) in enumerate([(420, .7), (520, .85), (640, 1.0)]):
        b.append(path(f'M{40},{y0} Q{W / 2},{y0 - 170 * sc} {W - 40},{y0} L{W - 40},{y0 + 60 * sc} Q{W / 2},{y0 - 110 * sc} {40},{y0 + 60 * sc} Z', '#3a3a3a'))
        b.append(path(f'M{40},{y0} Q{W / 2},{y0 - 170 * sc} {W - 40},{y0}', 'none', 'stroke="#b0b0b0" stroke-width="5"'))
        for k in range(9 + tier * 2):
            t = (k + .5) / (9 + tier * 2)
            x = 40 + t * (W - 80)
            y = y0 - 170 * sc * 4 * t * (1 - t) / 1.0 * 0.5 - 4
            b.append(rect(x - 28 * sc, y - 110 * sc, 56 * sc, 100 * sc, '#151515', f'rx="{12 * sc:.0f}"'))   # empty chairs
            b.append(path(f'M{x + 18 * sc},{y} q-6,-40 -26,-54', 'none', f'stroke="#101010" stroke-width="{4 * sc:.1f}"'))
            b.append(rect(x - 24 * sc, y + 2, 48 * sc, 14 * sc, '#d8d8d8', 'opacity="0.8"'))
    b.append(circle(W / 2, 860, 380, 'url(#spot)'))
    b.append(rect(W / 2 - 230, 760, 460, 40, '#4a4a4a'))
    b.append(rect(W / 2 - 60, 600, 120, 170, '#1a1a1a', 'rx="18"'))      # empty witness chair
    out('p_chamber', W, H, ''.join(b), d, border=14)


def chair():
    W, H = 720, 920
    d = rg('s', [(0, '#ffffff', .9), (1, '#ffffff', 0)])
    b = [rect(0, 0, W, H, '#3a3a3a'), circle(360, 420, 420, 'url(#s)')]
    b.append(rect(210, 120, 300, 520, '#1a1a1a', 'rx="60"'))
    b.append(rect(236, 150, 248, 460, '#444', 'rx="46"'))
    b.append(rect(170, 600, 380, 110, '#1a1a1a', 'rx="26"'))
    b.append(rect(200, 700, 30, 200, '#111')); b.append(rect(490, 700, 30, 200, '#111'))
    b.append(rect(0, 820, W, 100, '#222'))
    out('p_chair', W, H, ''.join(b), d, border=12)


def mic():
    W, H = 620, 820
    b = [rect(0, 0, W, H, '#8a8a8a'), tex(0, 0, W, H, 'grain', .3)]
    b.append(ellipse(310, 740, 200, 46, '#1a1a1a'))
    b.append(rect(190, 680, 240, 70, '#2a2a2a', 'rx="20"'))
    b.append(path('M310,690 C310,520 160,420 240,250', 'none', 'stroke="#111" stroke-width="22"'))
    b.append(f'<g transform="rotate(-25 240 200)">{rect(196, 70, 90, 200, "#2a2a2a", "rx=\"44\"")}' + ''.join(rect(202, 92 + k * 16, 78, 5, '#9a9a9a') for k in range(9)) + '</g>')
    b.append(circle(310, 700, 14, '#eee'))
    out('p_mic', W, H, ''.join(b), border=12)


def nameplates():
    W, H = 1300, 520
    b = [rect(0, 0, W, H, '#5a5a5a'), rect(0, 300, W, 220, '#2a2a2a')]
    for k in range(5):
        x = 60 + k * 250
        b.append(poly([(x, 300), (x + 200, 300), (x + 190, 230), (x + 10, 230)], '#e6e6e6'))
        b.append(poly([(x, 300), (x + 200, 300), (x + 200, 316), (x, 316)], '#9a9a9a'))
        b.append(path(f'M{x + 170},{230} q-10,-80 -50,-110', 'none', 'stroke="#111" stroke-width="7"'))
        b.append(circle(x + 118, 118, 10, '#111'))
    out('p_nameplates', W, H, ''.join(b), border=12)


def lines():
    W, H = 1400, 720
    d = lg('s', [(0, '#e0e0e0', 1), (1, '#9a9a9a', 1)])
    b = [rect(0, 0, W, H, 'url(#s)')]
    r = rng(8)
    x = 0
    while x < W:
        w = r.uniform(70, 160); h = r.uniform(120, 380)
        b.append(rect(x, H - h, w, h, mix('#3a3a3a', '#000000', r.uniform(0, .3))))
        x += w + r.uniform(-8, 10)
    b.append(rect(300, 100, 22, 620, '#111'))
    b.append(rect(200, 140, 220, 14, '#111'))
    b.append(rect(1050, 160, 18, 560, '#111'))
    b.append(rect(970, 190, 180, 12, '#111'))
    for k in range(5):
        b.append(cat(-20, 120 + k * 22, 311, 147 + k * 4, 30, '#111', 4))
        b.append(cat(311, 147 + k * 4, 1059, 196 + k * 4, 90, '#111', 4))
        b.append(cat(1059, 196 + k * 4, 1420, 160 + k * 20, 40, '#111', 4))
    b.append(rect(250, 260, 120, 140, '#333', 'rx="14"'))
    out('p_lines', W, H, ''.join(b), d, border=12)


def docs():
    W, H = 920, 720
    b = [rect(0, 0, W, H, '#7a7a7a')]
    for k, (dx, a) in enumerate([(0, -6), (40, 3), (90, -2)]):
        b.append(f'<g transform="rotate({a} 460 360)">{rect(170 + dx, 90 + k * 10, 520, 560, "#f0f0f0")}' +
                 ''.join(rect(220 + dx, 160 + k * 10 + j * 34, 400 - (j % 3) * 60, 10, '#9a9a9a') for j in range(13)) + '</g>')
    b.append(rect(560, 70, 30, 110, '#cfcfcf', 'rx="15"'))
    out('p_docs', W, H, ''.join(b), border=12)


def folder(name, col):
    W, H = 940, 660
    b = [rect(30, 40, 300, 70, mix(col, '#000000', 0.12), 'rx="14"'), rect(30, 90, 880, 540, col, 'rx="10"'),
         tex(30, 90, 880, 540, 'grain', 0.2), rect(60, 60, 820, 70, '#f6f0e2'),
         rect(30, 600, 880, 30, '#000', 'opacity="0.08"')]
    out(name, W, H, ''.join(b), style='paper', border=0)


def card():
    W, H = 860, 520
    b = [rect(20, 20, 820, 480, '#f8f3e6'), rect(20, 20, 820, 90, '#e8dcc0')]
    for j in range(8):
        b.append(rect(20, 150 + j * 44, 820, 2, '#9ab8c4', 'opacity="0.6"'))
    b.append(rect(110, 20, 3, 480, '#c47a6a', 'opacity="0.6"'))
    out('p_card', W, H, ''.join(b), style='paper', border=10, tint='#f3ecdc')


def slip():
    W, H = 1100, 300
    out('p_slip', W, H, rect(20, 20, 1060, 260, '#f2ecdc') + tex(20, 20, 1060, 260, 'grain', .15), style='paper', border=14, tint='#f3ecdc')


def notebook():
    W, H = 900, 640
    b = [rect(40, 40, 820, 560, '#2f4a5a', 'rx="16"'), rect(60, 60, 780, 520, '#f4efe2'), rect(440, 60, 20, 520, '#d9cfb8')]
    for j in range(11):
        b.append(rect(80, 110 + j * 40, 340, 3, '#9ab8c4')); b.append(rect(480, 110 + j * 40, 340, 3, '#9ab8c4'))
    for k in range(12):
        b.append(circle(450, 90 + k * 42, 9, '#555'))
    out('p_notebook', W, H, ''.join(b), style='paper')


def build():
    board(); chamber(); chair(); mic(); nameplates(); lines(); docs()
    folder('p_folder_a', '#d4b27a'); folder('p_folder_b', '#b9c4a8'); folder('p_folder_c', '#d9a68a'); folder('p_folder_d', '#9fc3bf')
    card(); slip(); notebook()
    return LAYERS
