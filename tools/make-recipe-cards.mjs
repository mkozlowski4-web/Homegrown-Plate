/* Makes a picture card for each recipe that has no dish photo yet, for Google's recipe results
   and link previews. The card shows the recipe name and drawings of the crops it uses.

     npm i --no-save sharp      (or have rsvg-convert installed)
     node tools/make-recipe-cards.mjs          (only makes missing cards)
     node tools/make-recipe-cards.mjs --all    (remakes every card, e.g. after changing a title)

   Cards are saved to src/photos/recipes/cards/<recipe-id>.png; commit them.
   A real photo at src/photos/recipes/<recipe-id>.jpg (or .png/.webp) is always used instead. */
import { existsSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RECIPES } from '../src/data/recipes.mjs';
import { illustration } from '../src/illustrations.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/photos/recipes/cards');
const sharp = (await import('sharp').catch(() => null))?.default;
const hasRsvg = !sharp && spawnSync('rsvg-convert', ['--version']).status === 0;
if (!sharp && !hasRsvg) { console.error('Install sharp first: npm i --no-save sharp'); process.exit(1); }
async function toPng(svg, file) {
  if (sharp) return sharp(Buffer.from(svg)).png({ palette: true, quality: 90, effort: 10 }).toFile(file);
  const r = spawnSync('rsvg-convert', ['-f', 'png', '-o', file], { input: svg });
  if (r.status !== 0) throw new Error(String(r.stderr));
}
mkdirSync(OUT, { recursive: true });

const W = 1200, H = 900;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* Split a title into at most 3 lines of about 22 characters. */
function lines(title) {
  const out = []; let cur = '';
  for (const w of title.split(' ')) {
    if ((cur + ' ' + w).trim().length > 22 && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
  }
  if (cur) out.push(cur);
  return out.slice(0, 3);
}

function card(r) {
  const crops = r.uses.slice(0, 4);
  const size = crops.length === 1 ? 380 : crops.length === 2 ? 330 : crops.length === 3 ? 280 : 230;
  const gap = 36, total = crops.length * size + (crops.length - 1) * gap;
  const top = 120;
  const pics = crops.map((id, i) => {
    const inner = illustration(id).replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    const x = (W - total) / 2 + i * (size + gap);
    return `<g transform="translate(${x} ${top}) scale(${size / 120})">${inner}</g>`;
  }).join('');
  const t = lines(r.title);
  const fs = t.length === 3 ? 62 : 72, lh = fs * 1.15;
  const ty = 640 - ((t.length - 1) * lh) / 2 + (crops.length === 1 ? 40 : 0);
  const text = t.map((l, i) => `<text x="${W / 2}" y="${ty + i * lh}" text-anchor="middle" font-family="DejaVu Serif, Georgia, serif" font-size="${fs}" fill="#1f2a24">${esc(l)}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="#faf8f3"/>
<rect x="24" y="24" width="${W - 48}" height="${H - 48}" rx="36" fill="none" stroke="#e7e3d8" stroke-width="4"/>
${pics}
${text}
<text x="${W / 2}" y="${H - 64}" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-size="30" fill="#2f6b4f" letter-spacing="1">homegrownplate.co.uk</text>
</svg>`;
}

const all = process.argv.includes('--all');
let made = 0;
for (const r of RECIPES) {
  const file = join(OUT, `${r.id}.png`);
  if (!all && existsSync(file)) continue;
  await toPng(card(r), file);
  made++;
}
console.log(`Recipe cards: ${made} made, ${RECIPES.length - made} already there.`);
