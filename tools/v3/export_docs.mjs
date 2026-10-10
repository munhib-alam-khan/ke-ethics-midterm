// Generate docs/SCENE_MANIFEST_V3.md and docs/SPEAKER_NOTES_V3.md from v3/src/deck/scenes.js.
import fs from 'fs'; import path from 'path'; import os from 'os';
import { fileURLToPath, pathToFileURL } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
global.window = {};
new Function('window', fs.readFileSync(path.join(root, 'v3/js/content.js'), 'utf8'))(global.window);
new Function('window', fs.readFileSync(path.join(root, 'v3/js/references.js'), 'utf8'))(global.window);
const tmp = path.join(os.tmpdir(), 'v3scenes.mjs');
fs.copyFileSync(path.join(root, 'v3/src/deck/scenes.js'), tmp);
const { SCENES } = await import(pathToFileURL(tmp).href);
const R = window.REFERENCES;
let n = 0;
let man = `# Scene manifest — v3 (live 3D)\n\nGenerated from \`v3/src/deck/scenes.js\` by \`node tools/v3/export_docs.mjs\`. ${SCENES.length} scenes, ${SCENES.reduce((a, s) => a + s.states.length, 0)} advances. Sets: street (with the room), chamber, desk, imad, roofs, ops, studio.\n\n| # | Scene | Set | Advances | Choreography (per advance) | Sources |\n|---|---|---|---|---|---|\n`;
let sp = `# Speaker notes — v3\n\nGenerated from \`v3/src/deck/scenes.js\`. Script passages are unchanged from v1/v2 (scene 13 split at “And this standard also applies to the committee.”). Press **N** during the talk for the same notes.\n\n`;
SCENES.forEach((sc, i) => {
  const sets = [...new Set(sc.states.map(s => s.set || sc.set))].join(' → ');
  man += `| ${i + 1} | ${sc.title} | ${sets} | ${sc.states.length} | ${sc.cues.map((c, k) => `${k + 1}. ${c}`).join('<br>')} | ${sc.sources.map(s => R[s].short).join('; ') || '—'} |\n`;
  sp += `## ${i + 1}. ${sc.chapter} — ${sc.title}\n\n`;
  sc.states.forEach((st, k) => { n++; sp += `**Advance ${n} · reveal ${k + 1}/${sc.states.length}** — _${sc.cues[k] || ''}_\n\n${(sc.script[k] || '').replace(/\n/g, '  \n')}\n\n`; });
  sp += `> ${sc.notes}\n\n`;
});
fs.writeFileSync(path.join(root, 'docs/SCENE_MANIFEST_V3.md'), man);
fs.writeFileSync(path.join(root, 'docs/SPEAKER_NOTES_V3.md'), sp);
console.log('wrote manifest + notes,', n, 'advances');
