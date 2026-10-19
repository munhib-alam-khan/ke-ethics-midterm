"""Pack v3 into ONE offline HTML file (code, fonts, thumbnails inlined).
Usage: python3 tools/v3/build_single.py out.html"""
import base64, os, re, sys, json
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
v3 = os.path.join(root, 'v3')
out = sys.argv[1]
read = lambda p: open(p, encoding='utf8').read()
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()

css = read(os.path.join(v3, 'css/style.css'))
def font(m):
    p = os.path.normpath(os.path.join(v3, 'css', m.group(1)))
    return "url('data:font/woff2;base64," + b64(p) + "')"
css = re.sub(r"url\('(\.\./\.\./assets/fonts/[^']+)'\)", font, css)
assert '../../assets' not in css

thumbs = {}
td = os.path.join(v3, 'assets/thumbs')
for f in sorted(os.listdir(td)):
    thumbs[f[:-4]] = 'data:image/jpeg;base64,' + b64(os.path.join(td, f))

def js(p):
    s = read(os.path.join(v3, p))
    return s.replace('</script', '<\\/script')

html = read(os.path.join(v3, 'index.html'))
html = html.replace('<link rel="stylesheet" href="css/style.css">', '<style>\n' + css + '\n</style>')
html = html.replace('<a href="../v2/index.html">v2 image version</a> instead', 'the PowerPoint copy instead')
scripts = ('<script>window.THUMBS = ' + json.dumps(thumbs) + ';</script>\n'
           '<script>\n' + js('js/references.js') + '\n</script>\n'
           '<script>\n' + js('js/content.js') + '\n</script>\n'
           '<script>\n' + js('dist/deck.js') + '\n</script>')
html = re.sub(r'<script src="js/references.js"></script>\s*<script src="js/content.js"></script>\s*<script src="dist/deck.js"></script>', lambda m: scripts, html)
assert 'src="dist/deck.js"' not in html and 'href="css/' not in html
open(out, 'w', encoding='utf8').write(html)
print(out, round(os.path.getsize(out) / 1e6, 2), 'MB')
