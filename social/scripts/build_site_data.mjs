/* Builds site-data.json from the Homegrown Plate site.
   Reads the site's own data files (src/data/*.mjs) and its built pages (dist/), so every fact
   here is exactly what the site says. Nothing is invented or added.

   Usage: node scripts/build_site_data.mjs <path to site checkout> [output file]
   The site checkout must already be built (node build.mjs) so dist/ exists. */
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const SITE = resolve(process.argv[2] || '../homegrown-plate');
const OUT = process.argv[3] || 'site-data.json';
const BASE = 'https://homegrownplate.co.uk';
const D = (f) => import(pathToFileURL(join(SITE, 'src/data', f)).href);
const html = (p) => { const f = join(SITE, 'dist', p, 'index.html'); return existsSync(f) ? readFileSync(f, 'utf8') : ''; };
const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&rsquo;/g, '’').replace(/&rarr;/g, '→').replace(/&middot;/g, '·').replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const NICE = MONTHS.map((m) => m[0].toUpperCase() + m.slice(1));

const { PLANTS } = await D('plants.mjs');
const { RECIPES } = await D('recipes.mjs');
const { STORAGE } = await D('storage.mjs');
const { PESTS, pestForLabel } = await D('pests.mjs');
const { CARE } = await D('care.mjs');
const KIDS = await D('kids.mjs');
const { WEEKEND_JOBS } = await D('weekend-jobs.mjs');
const ids = async (f, k) => { try { return (await D(f))[k].map((p) => p.id); } catch { return []; } };
const HERB_IDS = new Set([...(await ids('plants/herbs.mjs', 'HERBS')), ...(await ids('plants/more-herbs.mjs', 'MORE_HERBS')), 'chives', 'sorrel']);
const FRUIT_IDS = new Set([...(await ids('plants/fruit.mjs', 'FRUIT')), ...(await ids('plants/more-fruit.mjs', 'MORE_FRUIT'))]);
let photos = {};
try { photos = JSON.parse(readFileSync(join(SITE, 'src/photos/photos.json'), 'utf8')); } catch {}

/* Images actually used on a page, with alt text. */
function pageImages(path) {
  const h = html(path); const out = []; const seen = new Set();
  const og = h.match(/property="og:image" content="([^"]+)"/);
  if (og) { seen.add(og[1]); out.push({ url: og[1], alt: '', role: 'og' }); }
  for (const m of h.matchAll(/<img[^>]*src="([^"]+)"[^>]*>/g)) {
    if (/favicon|brand-mark/.test(m[0])) continue;
    const url = m[1].startsWith('http') ? m[1] : BASE + m[1];
    if (seen.has(url)) continue; seen.add(url);
    out.push({ url, alt: (m[0].match(/alt="([^"]*)"/) || [])[1] || '', role: 'page' });
  }
  return out.map((i) => ({ ...i, kind: /\/img\/photos\//.test(i.url) ? 'photo' : /\.svg/.test(i.url) ? 'drawing' : /\/img\/recipes\//.test(i.url) ? 'recipe-card' : 'other', ai_made: false }));
}

/* Monthly pages: which crops each section lists, read from the built page. */
function monthLists(path) {
  const h = html(path); const res = {}; const parts = h.split(/<h2>/).slice(1);
  for (const part of parts) {
    const title = strip(part.split('</h2>')[0]).replace(/\(\d+\)/, '').trim();
    const ids = [...part.matchAll(/href="\/plants\/([a-z0-9-]+)\/[^"]*"/g)].map((m) => m[1]);
    res[title] = [...new Set(ids)];
  }
  const lead = strip((h.match(/<p class="lead">([\s\S]*?)<\/p>/) || [])[1] || '');
  const title = strip((h.match(/<h1>([\s\S]*?)<\/h1>/) || [])[1] || '');
  return { title, lead, lists: res };
}

const sow = MONTHS.map((m, i) => ({ month: NICE[i], url: `${BASE}/what-to-sow/${m}/`, ...monthLists(`what-to-sow/${m}`) }));
const preserve = MONTHS.map((m, i) => {
  const r = monthLists(`what-to-preserve/${m}`);
  return { month: NICE[i], url: `${BASE}/what-to-preserve/${m}/`, ...r };
});

/* Per crop months, exactly as the monthly pages list them. */
const monthsFor = (id, section) => sow.filter((s) => (s.lists[section] || []).includes(id)).map((s) => s.month);

/* Sentences in the site's own text that warn about poisonous or inedible parts. */
const SAFETY_RE = /poison|toxic|inedible|not edible|never eat|do not eat|don't eat|oxalic|solanine|botulism|lectin|irritat|sap can|harmful/i;
const sentences = (txt) => String(txt).split(/(?<=[.!?])\s+/);
function safetyLines(p) {
  const all = [...p.info, ...p.sow.p, ...(p.sow.tips || []), ...p.grow.p, ...(p.grow.tips || []), ...p.harvest.p, ...(p.harvest.tips || []), ...p.use.p, ...(p.use.tips || []),
    ...(STORAGE[p.id] || []).map((s) => s[1]), ...(CARE[p.id] || []).map((c) => c[1])];
  return [...new Set(all.flatMap(sentences).filter((s) => SAFETY_RE.test(s)))];
}

const recipeById = Object.fromEntries(RECIPES.map((r) => [r.id, r]));
const crops = PLANTS.map((p) => {
  const url = `${BASE}/plants/${p.id}/`;
  return {
    id: p.id, name: p.name, latin: p.latin, url, emoji: p.emoji,
    group: HERB_IDS.has(p.id) ? 'herb' : FRUIT_IDS.has(p.id) ? 'fruit' : 'veg',
    perennial_planting: /tree|shrub|cane|climber|perennial(?!, grown as an annual)/i.test((Object.fromEntries(p.facts) || {}).Type || '') || /^\s*plant\b/i.test((p.sow.p || [''])[0]) || /\bplant (the )?(cloves|sets|bulbs|tubers|crowns|runners|canes|seed potatoes|chitted)/i.test((p.sow.p || []).join(' ')) || /seed potatoes|chitted|bare-root/i.test((p.sow.p || []).join(' ')),
    difficulty: p.difficulty, sun: p.sun, sun_text: p.sunText, garden_sizes: p.sizes,
    sow_indoors: monthsFor(p.id, 'Sow or start indoors'),
    sow_or_plant_outside: monthsFor(p.id, 'Sow or plant outside'),
    harvest: monthsFor(p.id, 'Ready to harvest'),
    facts: Object.fromEntries(p.facts),
    varieties: p.varieties,
    types: (p.groups || []).map((g) => ({ name: g.name, when: g.when, note: g.note, varieties: g.varieties })),
    text: { info: p.info, sow: p.sow.p, sow_tips: p.sow.tips || [], grow: p.grow.p, grow_tips: p.grow.tips || [], harvest: p.harvest.p, harvest_tips: p.harvest.tips || [], use: p.use.p, use_tips: p.use.tips || [] },
    care: (CARE[p.id] || []).map(([months, job]) => ({ months, job })),
    pests: p.pests.map((label) => { const e = pestForLabel(label); return { label, pest_id: e ? e.id : null, url: e ? `${BASE}/pests/${e.id}/` : null }; }),
    preserving: (STORAGE[p.id] || []).map(([method, how, keeps]) => ({ method, how, keeps, url: `${url}#usage-and-storage` })),
    recipes: RECIPES.filter((r) => r.uses.includes(p.id)).map((r) => r.id),
    safety: safetyLines(p),
    images: pageImages(`plants/${p.id}`),
    photo_credit: photos[p.id] ? photos[p.id].credit : null,
  };
});

const recipes = RECIPES.map((r) => ({
  id: r.id, name: r.title, url: `${BASE}/recipes/${r.id}/`, time: r.time, serves: r.serves,
  crops: r.uses, ingredients: r.ingredients.map(([key, label, qty]) => ({ key, label, qty })), steps: r.steps, tips: r.tips || [],
  image: (pageImages(`recipes/${r.id}`)[0] || {}).url || null, images: pageImages(`recipes/${r.id}`),
}));

const pests = PESTS.map((x) => ({ id: x.id, name: x.name, kind: x.kind, url: `${BASE}/pests/${x.id}/`, summary: x.summary, spot: x.spot, prevent: x.prevent, control: x.control, when: x.when }));

const kids = {
  url: `${BASE}/kids/`,
  adult_helper_notes: KIDS.KIDS_NOTES,
  projects: KIDS.PROJECTS.map((k) => ({ id: k.id, title: k.title, url: `${BASE}/kids/#${k.id}`, blurb: k.blurb, crop: k.crop, wait: k.wait, start: k.start, level: k.level, need: k.need, steps: k.steps, fact: k.fact, adult_note: k.adult, emoji: k.emoji })),
  recipes: KIDS.RECIPES.map((k) => ({ ...k, url: `${BASE}/kids/#${k.id}` })),
};

const weekend_jobs = WEEKEND_JOBS.map((jobs, i) => ({ month: NICE[i], url: `${BASE}/weekend-jobs/${MONTHS[i]}/`, jobs: jobs.map(([tag, text, half = 0]) => ({ weather: tag, text, half })) }));

const preservingPage = { url: `${BASE}/preserving/`, title: strip((html('preserving').match(/<h1>([\s\S]*?)<\/h1>/) || [])[1] || '') };

/* Site look, for the post templates. */
const css = readFileSync(join(SITE, 'src/assets/style.css'), 'utf8');
const colour = (n) => (css.match(new RegExp(`--${n}:\\s*(#[0-9a-fA-F]{3,6})`)) || [])[1];
const brand_look = {
  colours: { green: colour('green'), leaf: colour('leaf'), cream: colour('cream'), soil: colour('soil'), tomato: colour('tomato'), ink: colour('ink'), muted: colour('muted'), line: colour('line') },
  fonts: { body: 'Inter', heading_serif: '"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", Georgia, serif', font_files: ['inter-regular.woff', 'inter-medium.woff', 'inter-semibold.woff'].map((f) => `${BASE}/assets/fonts/${f}`) },
  logo: `${BASE}/favicon.svg`,
};

const sitemapUrls = existsSync(join(SITE, 'dist/sitemap.xml')) ? [...readFileSync(join(SITE, 'dist/sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]) : [];

const data = {
  generated: new Date().toISOString(), source: 'homegrownplate.co.uk data files and built pages', site: BASE,
  tagline: 'Grow it. Cook it. Keep it.',
  timing_note: 'Timings are typical UK estimates. Check them against your local frost dates.',
  counts: { crops: crops.length, recipes: recipes.length, pests: pests.length, kids_projects: kids.projects.length, pages: sitemapUrls.length },
  brand_look, crops, recipes, what_to_sow: sow, what_to_preserve: preserve, preserving_page: preservingPage, pests, kids, weekend_jobs, pages: sitemapUrls,
};
writeFileSync(OUT, JSON.stringify(data, null, 1));
console.log(`site-data.json: ${crops.length} crops, ${recipes.length} recipes, ${pests.length} pest pages, ${kids.projects.length} kids projects, ${sitemapUrls.length} pages`);
