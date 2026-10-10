// Regenerate v2 docs (scene manifest + speaker notes) from the v2 scene files.
import fs from 'fs'; import vm from 'vm'; import path from 'path'; import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const ctx = { window: {}, document: {} }; vm.createContext(ctx);
for (const f of ['assets.js', 'references.js', 'content.js', 'worlds.js', 'worlds_b.js', 'scenes_a.js', 'scenes_b.js', 'scenes_c.js', 'scenes_d.js']) vm.runInContext(fs.readFileSync(path.join(root, 'v2', 'js', f), 'utf8'), ctx);
const S = ctx.window.SCENES, R = ctx.window.REFERENCES, Wd = ctx.window.WORLDS;
const total = S.reduce((a, s) => a + s.states.length, 0);
let a = `# Scene manifest (v2 motion revision)\n\nGenerated from \`v2/js/scenes_*.js\` by \`node tools/v2/export_docs.mjs\`. ${S.length} scenes, ${total} reveal states (${total - 1} advances). Each scene names its layered world; worlds and their layers are defined in \`v2/js/worlds*.js\`.\n\n| # | Scene | World (layers) | Reveals | Choreography per advance | Sources |\n|---|---|---|---|---|---|\n`;
S.forEach((s, i) => { a += `| ${i + 1} | ${s.title} | ${s.world} (${Wd[s.world].layers.length}) | ${s.states.length} | ${s.cues.map((c, k) => `**${k + 1}.** ${c} *(${s.states[k].dur} ms)*`).join('<br>')} | ${s.sources.map(k => R[k].short).join('; ') || '—'} |\n`; });
fs.writeFileSync(path.join(root, 'docs', 'SCENE_MANIFEST_V2.md'), a);
let b = `# Speaker notes (v2 motion revision)\n\nMapped to the supplied script; generated from the v2 scene files. Press **N** for on-screen notes or **P** for the presenter window (local server).\n\n**${total - 1} advances.** Choreographed transitions run 3–6 s and then hold: it is fine to start speaking while objects settle, because text appears only after the landing. \`▶ ADVANCE\` marks each click.\n\n`;
let adv = 0;
S.forEach((s, i) => {
  b += `---\n\n## ${i + 1}. ${s.title}  \n*${s.chapter} · world: ${s.world}*\n\n`;
  s.script.forEach((p, k) => {
    b += `${k === 0 ? (i === 0 ? '**[Opens on this state]**' : '**▶ ADVANCE — new scene**') : '**▶ ADVANCE**'} (#${adv++}) — *${s.cues[k]}*\n\n` + p.split('\n').map(l => `> ${l}`).join('\n') + '\n\n';
  });
  b += `**Keep in mind:** ${s.notes}\n\n` + (s.sources.length ? `**Sources:** ${s.sources.map(k => R[k].short).join('; ')}\n\n` : '');
});
fs.writeFileSync(path.join(root, 'docs', 'SPEAKER_NOTES_V2.md'), b);
console.log('v2 docs', S.length, total);
