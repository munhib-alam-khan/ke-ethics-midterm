// Build the submission PowerPoint from the frame-exact clips (tools/v3/clips.mjs).
// One slide per advance: a full-bleed video that starts automatically and holds on its
// final frame (the poster), the script in the speaker notes. Cover and references are native.
// Usage: node tools/v3/build_pptx.mjs clipsDir out.pptx [pptxgenjsModuleDir]
import fs from 'fs'; import path from 'path'; import os from 'os';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';
const [clipsDir, outFile, modDir] = process.argv.slice(2);
const require = createRequire(modDir ? path.join(modDir, 'x.js') : import.meta.url);
const pptxgen = require('pptxgenjs');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

global.window = {};
new Function('window', fs.readFileSync(path.join(root, 'v3/js/content.js'), 'utf8'))(global.window);
new Function('window', fs.readFileSync(path.join(root, 'v3/js/references.js'), 'utf8'))(global.window);
const tmp = path.join(os.tmpdir(), 'v3scenes_pptx.mjs');
fs.copyFileSync(path.join(root, 'v3/src/deck/scenes.js'), tmp);
const { SCENES } = await import(pathToFileURL(tmp).href);
const REFS = window.REFERENCES;
const INTERVIEWS = window.INTERVIEWS, RECORDINGS_URL = window.RECORDINGS_URL;
delete global.window;   // pptxgenjs switches to browser mode if window exists
const strip = s => s.replace(/<[^>]+>/g, '');

const THEME = { name: 'Paid On Time', headFontFace: 'Cambria', bodyFontFace: 'Calibri',
  colors: { dk1: '0B0C10', lt1: 'FFFFFF', dk2: '1D1B19', lt2: 'EFE6D2', accent1: 'F0AD45', accent2: '8FC3BC', accent3: 'C4623F', accent4: '3F7F7A', accent5: 'B23A2A', accent6: '6F5A8A', hlink: 'F0AD45', folHlink: 'C9822A' } };

const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';
pres.title = 'Paid. On time. — K-Electric, load-shedding and corporate accountability';
pres.author = 'Munhib Alam Khan, Rabie Sami, Abdullah Khan, Karan Kumar';
pres.subject = 'KSBL Business Ethics and Law midterm';
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };

pres.defineSlideMaster({ title: 'VIDEO', background: { color: '05060A' } });
pres.defineSlideMaster({ title: 'DARK', background: { color: '0B0C10' },
  objects: [{ text: { text: 'Paid. On time. · KSBL Business Ethics & Law', options: { x: 0.5, y: 5.2, w: 6, h: 0.3, fontSize: 10, color: '8A8478', fontFace: 'Calibri', margin: 0 } } }],
  slideNumber: { x: 9.0, y: 5.2, w: 0.5, h: 0.3, fontSize: 10, color: '8A8478', align: 'right' } });

// ------------------------------------------------ cover
pres.addSection({ title: 'Cover' });
{
  const s = pres.addSlide({ masterName: 'VIDEO', sectionTitle: 'Cover' });
  const poster = fs.existsSync(path.join(clipsDir, 'cover.jpg')) ? path.join(clipsDir, 'cover.jpg') : path.join(clipsDir, 'clip01.jpg');
  if (fs.existsSync(poster)) s.addImage({ path: poster, x: 0, y: 0, w: 10, h: 5.625, transparency: 20, objectName: 'Cover image' });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: '05060A', transparency: 45 }, line: { color: '05060A', transparency: 100 }, objectName: 'Scrim' });
  s.addText('K-ELECTRIC · LOAD-SHEDDING · CORPORATE ACCOUNTABILITY', { x: 0.6, y: 1.25, w: 8.8, h: 0.35, fontSize: 12, color: 'F0AD45', charSpacing: 3, fontFace: 'Calibri', bold: true, margin: 0, isTextBox: true, objectName: 'Kicker' });
  s.addText('Paid. On time.', { x: 0.6, y: 1.65, w: 8.8, h: 1.2, fontSize: 60, color: 'EFE6D2', fontFace: 'Cambria', bold: true, margin: 0, isTextBox: true, objectName: 'Title' });
  s.addText('When a company faces a collective financial problem, how much of the burden can it fairly place on an individual customer who has fulfilled their responsibility?', { x: 0.6, y: 2.95, w: 7.6, h: 0.9, fontSize: 16, color: 'D9D2C3', fontFace: 'Calibri', italic: true, margin: 0, isTextBox: true, objectName: 'Question' });
  s.addText([
    { text: 'Karachi School of Business and Leadership · Business Ethics & Law · Dr Faryal Razzaq', options: { breakLine: true } },
    { text: 'Munhib Alam Khan · Rabie Sami · Abdullah Khan · Karan Kumar' }
  ], { x: 0.6, y: 4.35, w: 8.8, h: 0.7, fontSize: 13, color: 'EFE6D2', fontFace: 'Calibri', margin: 0, isTextBox: true, objectName: 'Credits' });
  s.addNotes('Submission copy of the live presentation. Each following slide is one advance of the talk: its motion plays automatically when the slide opens and holds on the final frame. Speaker notes carry the script for that advance, the cue, qualifications and sources. The live interactive version: https://munhib-alam-khan.github.io/ke-ethics-midterm/');
}

// ------------------------------------------------ one slide per advance
const videoSlides = [];        // 1-based slide numbers of video slides
let n = 0, slideNo = 1;
for (const sc of SCENES) {
  const sec = `${String(SCENES.indexOf(sc) + 1).padStart(2, '0')} ${sc.title}`;
  pres.addSection({ title: sec });
  sc.states.forEach((st, k) => {
    n++; slideNo++;
    const clip = path.join(clipsDir, `clip${String(n).padStart(2, '0')}.mp4`);
    const poster = clip.replace('.mp4', '.jpg');
    const s = pres.addSlide({ masterName: 'VIDEO', sectionTitle: sec });
    if (fs.existsSync(clip)) {
      const cover = fs.readFileSync(poster).toString('base64');
      s.addMedia({ type: 'video', path: clip, cover: 'data:image/jpeg;base64,' + cover, x: 0, y: 0, w: 10, h: 5.625, objectName: `Advance ${n}` });
      videoSlides.push(slideNo);
    } else if (fs.existsSync(poster)) {
      s.addImage({ path: poster, x: 0, y: 0, w: 10, h: 5.625, objectName: `Advance ${n}` });
    }
    const notes = [
      `${sc.chapter} — ${sc.title} · scene ${SCENES.indexOf(sc) + 1}/${SCENES.length} · reveal ${k + 1}/${sc.states.length} · advance ${n}/37`,
      '',
      'SCRIPT', sc.script[k] || '',
      '',
      'ON SCREEN', sc.cues[k] || '',
      '',
      'QUALIFICATIONS', sc.notes || '',
      sc.sources.length ? '\nSOURCES\n' + sc.sources.map(r => strip(REFS[r].apa) + ' ' + REFS[r].url).join('\n') : ''
    ].join('\n');
    s.addNotes(notes);
  });
}

// ------------------------------------------------ references & evidence (native, clickable)
pres.addSection({ title: 'References & evidence' });
const refs = Object.values(REFS).sort((a, b) => a.apa.localeCompare(b.apa));
const half = Math.ceil(refs.length / 2);
[refs.slice(0, half), refs.slice(half)].forEach((group, gi) => {
  slideNo++;
  const s = pres.addSlide({ masterName: 'DARK', sectionTitle: 'References & evidence' });
  s.addText(gi ? 'References (continued)' : 'References', { x: 0.5, y: 0.35, w: 9, h: 0.6, fontSize: 30, color: 'EFE6D2', fontFace: 'Cambria', bold: true, margin: 0, isTextBox: true, objectName: 'Title' });
  const runs = [];
  group.forEach((r, i) => {
    runs.push({ text: strip(r.apa) + ' ', options: { color: 'EFE6D2' } });
    runs.push({ text: r.url, options: { color: 'F0AD45', hyperlink: { url: r.url }, breakLine: i < group.length - 1 } });
  });
  s.addText(runs, { x: 0.5, y: 1.1, w: 9, h: 3.9, fontSize: 11, fontFace: 'Calibri', valign: 'top', paraSpaceAfter: 8, margin: 0, isTextBox: true, objectName: 'Reference list' });
  s.addNotes('Full reference list from the final report. Links open in a browser (internet required).');
});
{
  slideNo++;
  const s = pres.addSlide({ masterName: 'DARK', sectionTitle: 'References & evidence' });
  s.addText('Interviews and labelling', { x: 0.5, y: 0.35, w: 9, h: 0.6, fontSize: 30, color: 'EFE6D2', fontFace: 'Cambria', bold: true, margin: 0, isTextBox: true, objectName: 'Title' });
  const rows = [[
    { text: 'Participant', options: { bold: true, color: '0B0C10', fill: { color: 'F0AD45' } } },
    { text: 'Date', options: { bold: true, color: '0B0C10', fill: { color: 'F0AD45' } } },
    { text: 'Report', options: { bold: true, color: '0B0C10', fill: { color: 'F0AD45' } } }]];
  INTERVIEWS.forEach(r => rows.push([{ text: r.who }, { text: r.date }, { text: r.appx }]));
  s.addTable(rows, { x: 0.5, y: 1.05, w: 9, colW: [6.2, 1.6, 1.2], fontSize: 10, fontFace: 'Calibri', color: 'EFE6D2', border: { type: 'solid', pt: 0.5, color: '4A4640' }, fill: { color: '15161B' }, objectName: 'Interview table' });
  s.addText([
    { text: 'Interview recordings (instructor access, within participants’ consent): ', options: { bold: true, color: 'EFE6D2' } },
    { text: 'OneDrive / SharePoint audio folder', options: { color: 'F0AD45', hyperlink: { url: RECORDINGS_URL }, breakLine: true } },
    { text: 'Company-reported', options: { bold: true, color: 'F0AD45' } }, { text: ' — published by K-Electric, not independently verified (2025 activities predate the September 2026 hearing). ', options: { color: 'D9D2C3' } },
    { text: 'Participant-reported', options: { bold: true, color: 'F0AD45' } }, { text: ' — interview estimates, not verified. ', options: { color: 'D9D2C3' } },
    { text: 'Paraphrase', options: { bold: true, color: 'F0AD45' } }, { text: ' — our wording; no document or article text is reproduced. ', options: { color: 'D9D2C3' } },
    { text: 'Illustrative', options: { bold: true, color: 'F0AD45' } }, { text: ' — the household, street, 8/2 example, committee room, network model and recommendation scenes are teaching illustrations. ', options: { color: 'D9D2C3' } },
    { text: 'Proposed', options: { bold: true, color: 'F0AD45' } }, { text: ' — recommendations and milestones are our proposals, not KE practice or legal deadlines.', options: { color: 'D9D2C3', breakLine: true } },
    { text: 'All scenes are rendered from original procedural 3D illustrations made for this project; no photograph or likeness of any person, meeting or document is used. Live interactive version: ', options: { color: 'A9A398' } },
    { text: 'munhib-alam-khan.github.io/ke-ethics-midterm', options: { color: 'F0AD45', hyperlink: { url: 'https://munhib-alam-khan.github.io/ke-ethics-midterm/' } } }
  ], { x: 0.5, y: 3.25, w: 9, h: 1.85, fontSize: 10.5, fontFace: 'Calibri', valign: 'top', paraSpaceAfter: 8, margin: 0, isTextBox: true, objectName: 'Evidence notes' });
  s.addNotes('Do not open or play the interview recordings during the presentation: they contain identifying details.');
}

await pres.writeFile({ fileName: outFile });
const { applyTheme } = require(process.env.PPTX_SKILL + '/scripts/apply_theme.js');
await applyTheme(outFile, THEME);
fs.writeFileSync(outFile + '.videoslides.json', JSON.stringify(videoSlides));
console.log('wrote', outFile, 'video slides:', videoSlides.length);
