// Regenerate docs/SCENE_MANIFEST.md and docs/SPEAKER_NOTES.md from js/manifest.js
import fs from 'fs';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['js/layout.js', 'js/references.js', 'js/manifest.js']) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx);
const M = ctx.window.MANIFEST, R = ctx.window.REFERENCES;
const total = M.scenes.reduce((a, s) => a + s.steps, 0);
let a = `# Scene manifest\n\nGenerated from \`js/manifest.js\` by \`node tools/export_docs.mjs\`. ${M.scenes.length} scenes, ${total} reveal states (${total - 1} advances).\n\n`;
a += `| # | Chapter | Scene | Reveals | What each advance does | Sources | Images |\n|---|---|---|---|---|---|---|\n`;
M.scenes.forEach((s, i) => {
  a += `| ${i + 1} | ${s.chapter} | ${s.title} | ${s.steps} | ${s.cues.map((c, k) => `**${k + 1}.** ${c}`).join('<br>')} | ${s.sources.map(k => R[k].short).join('; ') || '—'} | ${s.assets.join(', ')} |\n`;
});
fs.writeFileSync(path.join(root, 'docs/SCENE_MANIFEST.md'), a);
let b = `# Speaker notes\n\nMapped to the supplied script; generated from \`js/manifest.js\`. Press **N** during the presentation to show these on screen (or **P** for a separate presenter window when served over http).\n\n**${total - 1} advances in total.** \`▶ ADVANCE\` marks each click. Bracketed stage directions come from the script; passages marked *bridging* are optional additions drawn from the report where the script has no matching passage.\n\n`;
let adv = 0;
M.scenes.forEach((s, i) => {
  b += `---\n\n## ${i + 1}. ${s.title}  \n*${s.chapter}*\n\n`;
  s.script.forEach((p, k) => {
    b += `${k === 0 ? (i === 0 ? '**[Opens on this state]**' : '**▶ ADVANCE — new scene**') : '**▶ ADVANCE**'} (#${adv++}) — *${s.cues[k]}*\n\n`;
    b += p.split('\n').map(l => `> ${l}`).join('\n') + '\n\n';
  });
  b += `**Keep in mind:** ${s.notes}\n\n`;
  if (s.sources.length) b += `**Sources:** ${s.sources.map(k => R[k].short).join('; ')}\n\n`;
});
fs.writeFileSync(path.join(root, 'docs/SPEAKER_NOTES.md'), b);
console.log('docs written', M.scenes.length, total);
