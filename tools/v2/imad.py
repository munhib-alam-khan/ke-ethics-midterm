"""IMAD world (scenes 5-6, 10): a richly coloured cut-away household whose objects lift out
and travel through depth. Style 'rich' (bold painterly colour, after the reference films)."""
from svgkit import svg, lg, rg, tex, rect, poly, path, circle, ellipse, cat, mix, save, rng, grille

LAYERS = {}


def out(name, w, h, body, defs='', style='rich', border=0):
    save(name, svg(w, h, body, defs))
    LAYERS[name] = dict(w=w, h=h, style=style, border=border)


def bg(lit):
    W, H = 2400, 1350
    k = 0 if lit else 0.55
    d = lg('wa', [(0, mix('#1f6f73', '#071a22', k), 1), (1, mix('#124a52', '#04111a', k), 1)])
    d += lg('wb', [(0, mix('#c2507a', '#1a1030', k), 1), (1, mix('#8a2f5a', '#120a24', k), 1)])
    d += lg('sky', [(0, '#1a1f4a', 1), (1, '#5a3a6a', 1)])
    d += rg('lamp', [(0, '#ffcf7a', .8 if lit else 0), (1, '#ffcf7a', 0)])
    b = [rect(0, 0, 1000, H, 'url(#wa)'), rect(1000, 0, 1400, H, 'url(#wb)')]
    for ty in range(0, 900, 70):      # kitchen tiles
        b.append(rect(0, ty, 1000, 4, '#000', 'opacity="0.25"'))
    for tx in range(0, 1000, 70):
        b.append(rect(tx, 0, 4, 900, '#000', 'opacity="0.18"'))
    b.append(tex(0, 0, W, H, 'plaster', 0.35))
    b.append(rect(985, 0, 30, H, mix('#2a1a2a', '#000000', k)))     # dividing wall edge
    # window with night city
    wx, wy, ww, wh = 1520, 170, 560, 480
    b.append(rect(wx, wy, ww, wh, 'url(#sky)'))
    r = rng(12)
    x = wx
    while x < wx + ww:
        w = r.uniform(50, 110); h = r.uniform(120, 330)
        b.append(rect(x, wy + wh - h, w, h, '#14122a'))
        for j in range(int(h // 30)):
            if r.random() < (0.5 if lit else 0.06):
                b.append(rect(x + 10, wy + wh - h + 12 + j * 30, w * 0.4, 10, '#ffcf6a'))
        x += w + 4
    b.append(grille(wx, wy, ww, wh, '#140a14', 8))
    b.append(f'<rect x="{wx - 22}" y="{wy - 22}" width="{ww + 44}" height="{wh + 44}" fill="none" stroke="{mix("#e8a33d", "#2a1a10", .4)}" stroke-width="26"/>')
    b.append(circle(wx + 420, wy + 110, 40, '#f6eed8', 'opacity="0.9"'))
    # floor
    b.append(poly([(0, 900), (W, 900), (W, H), (0, H)], mix('#d08a3a', '#1a120c', k)))
    for i in range(14):
        b.append(f'<line x1="{i * 180}" y1="900" x2="{i * 230 - 300}" y2="{H}" stroke="#000" stroke-opacity="0.18" stroke-width="4"/>')
    b.append(rect(0, 890, W, 14, '#000', 'opacity="0.3"'))
    # shelves / frames
    b.append(rect(120, 300, 620, 18, mix('#e8a33d', '#000000', k)))
    for i, c in enumerate(['#f2c94c', '#e85d75', '#5ad1c4', '#f7efe0', '#9b6bd6']):
        b.append(rect(150 + i * 110, 210, 70, 92, mix(c, '#000000', k), 'rx="10"'))
    b.append(rect(1150, 260, 240, 300, mix('#f2c94c', '#000000', k)))
    b.append(rect(1170, 280, 200, 260, mix('#3a8a8a', '#000000', k)))
    b.append(poly([(1170, 540), (1250, 420), (1310, 480), (1370, 400), (1370, 540)], mix('#e85d75', '#000000', k)))
    if lit:
        b.append(circle(1300, 120, 520, 'url(#lamp)'))
        b.append(ellipse(1300, 60, 120, 40, '#ffe7a8'))
        b.append(rect(1296, 0, 8, 60, '#2a1a10'))
    else:
        b.append(ellipse(1300, 60, 120, 40, '#4a4250'))
        b.append(rect(1296, 0, 8, 60, '#2a1a10'))
        b.append(poly([(wx, wy + wh), (wx + ww, wy + wh), (wx + ww + 300, 1350), (wx - 200, 1350)], '#9fb4ff', 'opacity="0.10" filter="url(#b16)"'))
    out('im_bg_' + ('lit' if lit else 'dark'), W, H, ''.join(b), d)


def counter():
    W, H = 1150, 520
    d = lg('c', [(0, '#f2e6d0', 1), (1, '#d8c6a6', 1)])
    b = [rect(0, 60, W, 70, 'url(#c)'), rect(0, 130, W, 390, '#7a3a5a'), tex(0, 130, W, 390, 'wood', 0.5)]
    for i in range(3):
        b.append(rect(40 + i * 370, 170, 330, 320, '#8a4a6a', 'rx="10"'))
        b.append(rect(190 + i * 370, 300, 30, 70, '#f2c94c', 'rx="10"'))
    b.append(rect(0, 120, W, 12, '#000', 'opacity="0.25"'))
    out('im_counter', W, H, ''.join(b), d)


def desk():
    W, H = 1100, 560
    b = [rect(30, 120, 1040, 40, '#3a2a5a'), rect(60, 160, 40, 400, '#2a1a40'), rect(1000, 160, 40, 400, '#2a1a40'),
         rect(640, 160, 360, 220, '#4a3a70'), rect(670, 190, 300, 70, '#5a4a80'), rect(670, 280, 300, 70, '#5a4a80'),
         circle(820, 225, 10, '#f2c94c'), circle(820, 315, 10, '#f2c94c')]
    b.append(tex(30, 120, 1040, 40, 'wood', 0.5))
    out('im_desk', W, H, ''.join(b))


def phone():
    W, H = 520, 960
    d = lg('scr', [(0, '#2a8a8a', 1), (1, '#16404a', 1)])
    b = [rect(40, 30, 440, 900, '#1a1a22', 'rx="60"'), rect(48, 38, 424, 884, '#2c2c36', 'rx="54"'),
         rect(66, 66, 388, 828, 'url(#scr)', 'rx="38"'), rect(220, 80, 80, 20, '#0a0a0a', 'rx="10"')]
    b.append(rect(96, 140, 328, 80, '#f2c94c', 'rx="14" opacity="0.9"'))
    for i in range(5):
        b.append(rect(96, 250 + i * 118, 328, 92, '#1f5a62', 'rx="14"'))
        b.append(circle(140, 296 + i * 118, 22, ['#e85d75', '#f2c94c', '#5ad1c4', '#f2c94c', '#e85d75'][i], 'opacity="0.85"'))
        b.append(rect(180, 278 + i * 118, 200, 14, '#bfe7e2', 'opacity="0.7"'))
        b.append(rect(180, 304 + i * 118, 140, 10, '#bfe7e2', 'opacity="0.4"'))
    b.append(path('M80,80 L200,80 L120,880 L80,880 Z', '#fff', 'opacity="0.06"'))
    out('im_phone', W, H, ''.join(b), d)


def laptop():
    W, H = 920, 640
    d = lg('ls', [(0, '#3a7a9a', 1), (1, '#1a3a52', 1)])
    b = [poly([(160, 50), (760, 50), (760, 450), (160, 450)], '#1e1e26'), rect(180, 70, 560, 360, 'url(#ls)')]
    for i in range(7):
        b.append(rect(210, 100 + i * 44, [320, 440, 380, 220, 400, 280, 340][i], 14, ['#bfe7e2', '#f2c94c', '#bfe7e2', '#e85d75', '#bfe7e2', '#bfe7e2', '#f2c94c'][i], 'opacity="0.7"'))
    b.append(poly([(100, 460), (820, 460), (900, 560), (20, 560)], '#c9c4bc'))
    b.append(poly([(100, 460), (820, 460), (830, 474), (90, 474)], '#8a857c'))
    for r_ in range(4):
        for c in range(15):
            b.append(rect(140 + c * 44 + r_ * 6, 482 + r_ * 17, 36, 11, '#7a756c'))
    b.append(ellipse(460, 590, 420, 26, '#000', 'opacity="0.3" filter="url(#b8)"'))
    out('im_laptop', W, H, ''.join(b), d)


def router():
    W, H = 540, 400
    b = [rect(40, 210, 460, 130, '#f2ede2', 'rx="22"'), rect(40, 300, 460, 40, '#000', 'opacity="0.1" rx="16"'),
         rect(80, 30, 18, 190, '#e6e0d2', 'rx="8"'), rect(440, 30, 18, 190, '#e6e0d2', 'rx="8"'),
         rect(70, 228, 400, 12, '#fff', 'opacity="0.5" rx="6"')]
    for i in range(5):
        b.append(circle(140 + i * 64, 276, 11, '#2a3a30'))
    b.append(ellipse(270, 360, 240, 20, '#000', 'opacity="0.3" filter="url(#b8)"'))
    out('im_router', W, H, ''.join(b))


def stove():
    W, H = 720, 600
    b = [rect(80, 380, 560, 120, '#26262c', 'rx="18"'), ellipse(360, 382, 210, 28, '#ff6a2a'), ellipse(360, 382, 160, 18, '#3a2a26'),
         ellipse(360, 370, 300, 60, '#ff8a3a', 'opacity="0.35" filter="url(#b16)"'),
         path('M190,180 L530,180 L508,370 Q360,404 212,370 Z', '#b9b9c0'), path('M210,190 L256,190 L246,356 L226,356 Z', '#fff', 'opacity="0.4"'),
         rect(170, 160, 380, 32, '#d9d9de', 'rx="10"'), rect(330, 126, 60, 36, '#55555c', 'rx="10"'),
         rect(110, 200, 74, 20, '#3a3a40', 'rx="8"'), rect(536, 200, 74, 20, '#3a3a40', 'rx="8"'), rect(580, 420, 28, 28, '#e85d75', 'rx="14"')]
    for i in range(3):
        b.append(path(f'M{300 + i * 50},120 q-26,-50 0,-100', 'none', 'stroke="#fff" stroke-width="14" opacity="0.18" filter="url(#b4)"'))
    out('im_stove', W, H, ''.join(b))


def iron():
    W, H = 660, 460
    b = [path('M60,370 Q80,230 310,200 L580,200 L580,370 Z', '#d6dde0'), path('M60,370 L580,370 L580,404 L70,404 Z', '#7d868a'),
         path('M226,200 Q266,74 410,74 L530,74 Q580,74 580,128 L580,200 L480,200 L480,140 L336,140 Q306,160 306,200 Z', '#5ad1c4'),
         rect(390, 240, 66, 66, '#f2c94c', 'rx="33"'), path('M580,150 q66,0 66,90', 'none', 'stroke="#222" stroke-width="12"')]
    out('im_iron', W, H, ''.join(b))


def clock():
    import math
    W = 580
    b = [circle(290, 290, 250, '#e85d75'), circle(290, 290, 218, '#f7efe0')]
    for i in range(12):
        a = i * math.pi / 6
        b.append(f'<line x1="{290 + 186 * math.sin(a):.0f}" y1="{290 - 186 * math.cos(a):.0f}" x2="{290 + 204 * math.sin(a):.0f}" y2="{290 - 204 * math.cos(a):.0f}" stroke="#23211f" stroke-width="{11 if i % 3 == 0 else 5}"/>')
    ha, ma = (2 + 40 / 60) * math.pi / 6, 40 * math.pi / 30
    b.append(f'<line x1="290" y1="290" x2="{290 + 115 * math.sin(ha):.0f}" y2="{290 - 115 * math.cos(ha):.0f}" stroke="#23211f" stroke-width="15" stroke-linecap="round"/>')
    b.append(f'<line x1="290" y1="290" x2="{290 + 170 * math.sin(ma):.0f}" y2="{290 - 170 * math.cos(ma):.0f}" stroke="#23211f" stroke-width="8" stroke-linecap="round"/>')
    b.append(circle(290, 290, 15, '#1f6f73'))
    out('im_clock', W, W, ''.join(b))


def plug():
    W, H = 900, 520
    b = [rect(60, 120, 280, 200, '#f2ede2', 'rx="16"'), rect(90, 150, 100, 140, '#d9d2c2', 'rx="10"'), rect(210, 150, 100, 140, '#d9d2c2', 'rx="10"'),
         rect(116, 190, 14, 40, '#333'), rect(150, 190, 14, 40, '#333'), rect(236, 190, 14, 40, '#333'), rect(270, 190, 14, 40, '#333')]
    b.append(rect(400, 180, 160, 100, '#2a2a30', 'rx="20"'))   # plug
    b.append(rect(360, 200, 44, 14, '#c9a43a')); b.append(rect(360, 246, 44, 14, '#c9a43a'))
    b.append(path('M560,230 C680,230 700,420 880,440', 'none', 'stroke="#2a2a30" stroke-width="30" stroke-linecap="round"'))
    out('im_plug', W, H, ''.join(b))


def build():
    bg(True); bg(False); counter(); desk(); phone(); laptop(); router(); stove(); iron(); clock(); plug()
    return LAYERS
