"""GULSHAN world (scene 7): hazy rooftops in rich heat colour; backup equipment and water
objects as separate layers; two window vignettes for the unequal-burden comparison."""
from svgkit import svg, lg, rg, tex, rect, poly, path, circle, ellipse, cat, mix, save, rng, grille

LAYERS = {}


def out(name, w, h, body, defs='', style='rich', border=0):
    save(name, svg(w, h, body, defs))
    LAYERS[name] = dict(w=w, h=h, style=style, border=border)


def sky():
    W, H = 2400, 1350
    d = lg('s', [(0, '#5a4a7a', 1), (0.45, '#d9707a', 1), (0.75, '#f2a65a', 1), (1, '#f7d08a', 1)])
    b = [rect(0, 0, W, H, 'url(#s)'), circle(1600, 760, 150, '#fff1c8', 'opacity="0.95"'), circle(1600, 760, 520, '#ffd08a', 'opacity="0.35" filter="url(#b60)"')]
    r = rng(5)
    for _ in range(10):
        b.append(ellipse(r.uniform(0, W), r.uniform(200, 700), r.uniform(300, 700), r.uniform(30, 70), '#f7c0a0', 'opacity="0.35" filter="url(#b30)"'))
    out('g_sky', W, H, ''.join(b), d)


def roofs(name, seed, W, H, base, hmin, hmax, col, tanks=True):
    r = rng(seed)
    b = []
    x = -30
    while x < W:
        w = r.uniform(160, 380); h = r.uniform(hmin, hmax)
        c = mix(col, '#000000', r.uniform(0, 0.18))
        b.append(rect(x, base - h, w, H - base + h, c))
        b.append(rect(x, base - h, w, 10, mix(c, '#ffffff', 0.2)))
        for j in range(int(h // 80)):
            for i in range(int(w // 90)):
                if r.random() < 0.6:
                    b.append(rect(x + 20 + i * 90, base - h + 40 + j * 80, 40, 36, mix(c, '#000000', 0.3)))
        if tanks:
            for _ in range(r.randint(1, 3)):
                tx = x + r.uniform(10, max(12, w - 70))
                b.append(rect(tx, base - h - 70, 56, 70, '#17141c', 'rx="12"'))
                b.append(rect(tx + 4, base - h - 80, 48, 14, '#24202a', 'rx="5"'))
            if r.random() < 0.4:
                b.append(ellipse(x + w * 0.7, base - h - 30, 26, 34, '#e8ddd0', f'transform="rotate(-25 {x + w * .7:.0f} {base - h - 30:.0f})"'))
        x += w + r.uniform(4, 30)
    for k in range(4):
        b.append(cat(-20, base - hmax + 40 + k * 30, W + 20, base - hmax + 70 + k * 26, 80, '#2a2028', 3))
    out(name, W, H, ''.join(b))


def roof():
    W, H = 2600, 760
    b = [rect(0, 140, W, 620, '#c98a64'), rect(0, 110, W, 50, '#e0a880'), rect(0, 160, W, 14, '#000', 'opacity="0.25"'), tex(0, 110, W, 650, 'plaster', 0.5), tex(0, 110, W, 650, 'stain', 0.4)]
    b.append(path('M380,0 L380,120', 'none', 'stroke="#e8e0d4" stroke-width="22"'))
    b.append(path('M1900,40 L1900,130 L2600,130', 'none', 'stroke="#e8e0d4" stroke-width="22"'))
    out('g_roof', W, H, ''.join(b))


def tank():
    W, H = 720, 860
    b = [rect(60, 120, 600, 680, '#1b1a20', 'rx="70"'), rect(150, 70, 420, 80, '#2a2830', 'rx="26"')]
    for k in range(6):
        b.append(rect(60, 190 + k * 100, 600, 12, '#000', 'opacity="0.5"'))
    b.append(rect(90, 140, 70, 640, '#ffd08a', 'opacity="0.18"'))
    b.append(ellipse(360, 820, 340, 36, '#000', 'opacity="0.3" filter="url(#b8)"'))
    out('g_tank', W, H, ''.join(b))


def pump():
    W, H = 760, 460
    b = [rect(180, 180, 300, 170, '#2f7fb0', 'rx="30"'), circle(160, 265, 90, '#6fa8c8'), circle(160, 265, 50, '#2a5a78'),
         rect(470, 230, 70, 70, '#888'), path('M330,180 L330,40 L760,40', 'none', 'stroke="#e8e0d4" stroke-width="30"'),
         path('M540,265 L760,265', 'none', 'stroke="#e8e0d4" stroke-width="30"'), rect(200, 350, 260, 40, '#1a1a1a', 'rx="10"')]
    out('g_pump', W, H, ''.join(b))


def ups():
    W, H = 620, 660
    b = [rect(80, 80, 460, 540, '#26262c', 'rx="24"'), rect(120, 130, 380, 120, '#123030', 'rx="10"'), rect(150, 160, 170, 56, '#5dff9a', 'opacity="0.7"')]
    for i in range(5):
        b.append(circle(160 + i * 75, 300, 18, '#55555c'))
    for k in range(9):
        b.append(rect(120, 360 + k * 26, 380, 10, '#18181c'))
    out('g_ups', W, H, ''.join(b))


def battery():
    W, H = 620, 580
    b = [rect(60, 140, 500, 400, '#d94a3a', 'rx="22"'), rect(60, 140, 500, 90, '#a83226', 'rx="22"'), rect(130, 80, 80, 70, '#d9d9d9', 'rx="10"'),
         rect(410, 80, 80, 70, '#d9d9d9', 'rx="10"'), rect(120, 300, 380, 140, '#f7efe0', 'opacity="0.85"'), rect(140, 330, 220, 22, '#a83226', 'opacity="0.6"')]
    out('g_battery', W, H, ''.join(b))


def bucket():
    W, H = 540, 600
    b = [path('M90,150 L450,150 L400,540 Q270,570 140,540 Z', '#2f8fd0'), ellipse(270, 150, 180, 38, '#1f6aa0'),
         ellipse(270, 168, 150, 26, '#9fd6f2', 'opacity="0.8"'), path('M95,150 Q270,-40 445,150', 'none', 'stroke="#2a2a2a" stroke-width="10"'),
         path('M140,190 L168,520', 'none', 'stroke="#fff" stroke-width="18" opacity="0.15"')]
    out('g_bucket', W, H, ''.join(b))


def jerry():
    W, H = 440, 560
    b = [rect(60, 120, 320, 400, '#e8c23a', 'rx="30"'), rect(220, 60, 90, 80, '#e8c23a', 'rx="14"'), rect(110, 70, 90, 60, 'none', 'stroke="#c9a12a" stroke-width="18" rx="20"'),
         path('M110,200 L330,460 M330,200 L110,460', 'none', 'stroke="#c9a12a" stroke-width="16"')]
    out('g_jerry', W, H, ''.join(b))


def window(name, backup):
    W, H = 900, 720
    d = rg('l', [(0, '#ffcf7a', .65), (1, '#ffcf7a', 0)])
    wall = '#c98a64' if backup else '#7a4a5a'
    b = [rect(0, 0, W, H, wall), tex(0, 0, W, H, 'plaster', 0.5)]
    b.append(rect(120, 90, 660, 540, '#120c18'))
    if backup:
        b.append(rect(120, 90, 660, 540, '#3a2a30'))
        b.append(circle(450, 420, 300, 'url(#l)'))
        b.append(poly([(400, 300), (500, 300), (530, 380), (370, 380)], '#ffe7b3'))
        b.append(rect(440, 380, 20, 160, '#5a3a20'))
        b.append(rect(560, 470, 120, 140, '#26262c', 'rx="10"'))
        b.append(rect(580, 490, 60, 24, '#5dff9a', 'opacity="0.6"'))
    else:
        b.append(path('M200,630 L240,520 L300,630 Z', '#2a2a40'))
        b.append(ellipse(600, 600, 90, 24, '#1f3a5a'))
        b.append(path('M520,600 L540,480 L660,480 L680,600 Z', '#2a4a70'))
        b.append(circle(640, 200, 30, '#d9e2f2', 'opacity="0.5"'))
    b.append(grille(120, 90, 660, 540, '#100a0a', 9))
    b.append(f'<rect x="100" y="70" width="700" height="580" fill="none" stroke="#3a2a1a" stroke-width="30"/>')
    out(name, W, H, ''.join(b), d)


def build():
    sky()
    roofs('g_far', 21, 3600, 900, 620, 120, 300, '#b0708a', tanks=True)
    roofs('g_mid', 22, 3600, 1100, 760, 160, 420, '#9a5a6a', tanks=True)
    roof(); tank(); pump(); ups(); battery(); bucket(); jerry()
    window('g_win_backup', True); window('g_win_none', False)
    return LAYERS
