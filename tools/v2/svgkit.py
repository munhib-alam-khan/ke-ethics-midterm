"""Small SVG authoring kit shared by the v2 layer builders."""
import math
import os
import random

OUT = os.path.join(os.path.dirname(__file__), 'svg')
os.makedirs(OUT, exist_ok=True)


def svg(w, h, body, defs=''):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
            f'<defs>{STD}{defs}</defs>{body}</svg>')


def lg(id_, stops, x1=0, y1=0, x2=0, y2=1):
    s = ''.join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>' for o, c, a in stops)
    return f'<linearGradient id="{id_}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{s}</linearGradient>'


def rg(id_, stops, cx=0.5, cy=0.5, r=0.5, fx=None, fy=None):
    f = f' fx="{fx}" fy="{fy}"' if fx is not None else ''
    s = ''.join(f'<stop offset="{o}" stop-color="{c}" stop-opacity="{a}"/>' for o, c, a in stops)
    return f'<radialGradient id="{id_}" cx="{cx}" cy="{cy}" r="{r}"{f}>{s}</radialGradient>'


# blur filters b2..b60, plus procedural textures
STD = ''.join(f'<filter id="b{n}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="{n}"/></filter>'
              for n in (1, 2, 4, 8, 16, 30, 60, 120))
STD += ('<filter id="plaster" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.008" numOctaves="5" seed="3"/>'
        '<feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.6 -0.55"/></filter>')
STD += ('<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5"/>'
        '<feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.2 -0.4"/></filter>')
STD += ('<filter id="wood" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.0015 0.06" numOctaves="4" seed="7"/>'
        '<feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.5 -0.5"/></filter>')
STD += ('<filter id="stain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.003 0.02" numOctaves="4" seed="11"/>'
        '<feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.2 -1.1"/></filter>')


def tex(x, y, w, h, kind='plaster', op=0.35, extra=''):
    """Overlay a procedural texture (dark speckle) inside a rect."""
    return f'<rect x="{x:.0f}" y="{y:.0f}" width="{w:.0f}" height="{h:.0f}" filter="url(#{kind})" opacity="{op}" {extra}/>'


def rect(x, y, w, h, fill, extra=''):
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" fill="{fill}" {extra}/>'


def poly(pts, fill, extra=''):
    return f'<polygon points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" fill="{fill}" {extra}/>'


def path(d, fill='none', extra=''):
    return f'<path d="{d}" fill="{fill}" {extra}/>'


def circle(cx, cy, r, fill, extra=''):
    return f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}" {extra}/>'


def ellipse(cx, cy, rx, ry, fill, extra=''):
    return f'<ellipse cx="{cx:.1f}" cy="{cy:.1f}" rx="{rx:.1f}" ry="{ry:.1f}" fill="{fill}" {extra}/>'


def cat(x1, y1, x2, y2, sag, stroke, width=2.0, op=1.0):
    mx, my = (x1 + x2) / 2, max(y1, y2) + sag
    return f'<path d="M{x1:.1f},{y1:.1f} Q{mx:.1f},{my:.1f} {x2:.1f},{y2:.1f}" fill="none" stroke="{stroke}" stroke-width="{width}" stroke-opacity="{op}" stroke-linecap="round"/>'


def mix(c1, c2, t):
    a = [int(c1[i:i + 2], 16) for i in (1, 3, 5)]
    b = [int(c2[i:i + 2], 16) for i in (1, 3, 5)]
    return '#' + ''.join(f'{max(0, min(255, int(a[i] + (b[i] - a[i]) * t))):02x}' for i in range(3))


def save(name, content):
    with open(os.path.join(OUT, name + '.svg'), 'w') as f:
        f.write(content)


def grille(x, y, w, h, color, bar=6):
    """Karachi-style decorative iron window grille."""
    o = []
    n = max(3, int(w // 70))
    for i in range(n + 1):
        gx = x + i * w / n
        o.append(rect(gx - bar / 2, y, bar, h, color))
    for fy in (0.33, 0.66):
        o.append(rect(x, y + h * fy - bar / 2, w, bar, color))
    for i in range(n):
        cx = x + (i + 0.5) * w / n
        for cy in (y + h * 0.165, y + h * 0.5, y + h * 0.835):
            r = min(w / n, h / 3) * 0.3
            o.append(circle(cx, cy, r, 'none', f'stroke="{color}" stroke-width="{bar * .7}"'))
            o.append(poly([(cx, cy - r * 1.5), (cx + r * 1.5, cy), (cx, cy + r * 1.5), (cx - r * 1.5, cy)], 'none', f'stroke="{color}" stroke-width="{bar * .5}"'))
    return ''.join(o)


def rng(seed):
    return random.Random(seed)
