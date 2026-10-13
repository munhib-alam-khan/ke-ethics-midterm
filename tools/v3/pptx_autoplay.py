"""Post-process the submission deck: every video starts automatically when its slide
opens (and holds on its last frame), and every slide gets a smooth fade transition.
Usage: python3 tools/v3/pptx_autoplay.py deck.pptx
"""
import re
import sys
import zipfile
import shutil
import os

src = sys.argv[1]
tmp = src + '.tmp'

TIMING = ('<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
          '<p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst>'
          '<p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst><p:childTnLst>'
          '<p:par><p:cTn id="4" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
          '<p:par><p:cTn id="5" presetID="1" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="afterEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
          '<p:cmd type="call" cmd="playFrom(0.0)"><p:cBhvr><p:cTn id="6" dur="{dur}" fill="hold"/><p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cBhvr></p:cmd>'
          '</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par>'
          '</p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst>'
          '<p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq>'
          '<p:video><p:cMediaNode vol="80000"><p:cTn id="7" fill="hold" display="0"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst></p:cTn>'
          '<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cMediaNode></p:video>'
          '</p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>')
TRANS = '<p:transition spd="med"><p:fade/></p:transition>'


def video_dur_ms(zf, slide_name, xml):
    # duration from the mp4 header (mvhd) of the slide's video
    rels = zf.read(slide_name.replace('slides/', 'slides/_rels/') + '.rels').decode('utf8')
    m = re.search(r'Target="\.\./media/([^"]+\.mp4)"', rels)
    if not m:
        return 8000
    data = zf.read('ppt/media/' + m.group(1))
    i = data.find(b'mvhd')
    if i < 0:
        return 8000
    ver = data[i + 4]
    if ver == 1:
        ts = int.from_bytes(data[i + 24:i + 28], 'big'); du = int.from_bytes(data[i + 28:i + 36], 'big')
    else:
        ts = int.from_bytes(data[i + 16:i + 20], 'big'); du = int.from_bytes(data[i + 20:i + 24], 'big')
    return int(du * 1000 / ts) if ts else 8000


with zipfile.ZipFile(src) as zin, zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zout:
    done = 0
    # JPEG posters written with a .png name: give them their real extension
    renames = {}
    for name in zin.namelist():
        if name.startswith('ppt/media/') and name.endswith('.png') and zin.read(name)[:2] == b'\xff\xd8':
            renames[name] = name[:-4] + '.jpg'
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename.endswith('.rels') and renames:
            t = data.decode('utf8')
            for a, b in renames.items():
                t = t.replace('../media/' + a.split('/')[-1], '../media/' + b.split('/')[-1])
            data = t.encode('utf8')
        if item.filename == '[Content_Types].xml':
            t = data.decode('utf8')
            if 'Extension="jpg"' not in t:
                t = t.replace('<Default ', '<Default Extension="jpg" ContentType="image/jpeg"/><Default ', 1)
            data = t.encode('utf8')
        if item.filename in renames:
            item = zipfile.ZipInfo(renames[item.filename], date_time=item.date_time)
        if re.match(r'ppt/slides/slide\d+\.xml$', item.filename):
            xml = data.decode('utf8')
            xml = re.sub(r'<p:transition[^>]*/>|<p:transition.*?</p:transition>', '', xml, flags=re.S)
            vid = re.search(r'<p:pic>(?:(?!</p:pic>).)*?<a:videoFile', xml, flags=re.S)
            timing = ''
            if vid:
                spid = re.search(r'<p:cNvPr id="(\d+)"', vid.group(0)).group(1)
                timing = TIMING.format(spid=spid, dur=video_dur_ms(zin, item.filename, xml))
                xml = re.sub(r'<p:timing>.*?</p:timing>', '', xml, flags=re.S)
                done += 1
            # p:sld children order: cSld, clrMapOvr, transition, timing, extLst
            anchor = '</p:clrMapOvr>' if '</p:clrMapOvr>' in xml else '</p:cSld>'
            xml = xml.replace(anchor, anchor + TRANS + timing, 1)
            data = xml.encode('utf8')
        # store media uncompressed (faster to open, mp4 is already compressed)
        if item.filename.startswith('ppt/media/'):
            zout.writestr(item, data, compress_type=zipfile.ZIP_STORED)
        else:
            zout.writestr(item, data)
shutil.move(tmp, src)
print('autoplay added to', done, 'video slides; fade transitions on all slides')
