/* Homegrown Plate static site generator.
   Reads the data in src/data, writes a real HTML page for every section, crop,
   garden size and recipe into dist/, plus sitemap.xml, robots.txt and a 404 page.
   No dependencies: run with `node build.mjs` (or `npm run build`). */
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PLANTS } from './src/data/plants.mjs';
import { SIZES } from './src/data/sizes.mjs';
import { RECIPES } from './src/data/recipes.mjs';
import { CARE } from './src/data/care.mjs';
import { STORAGE } from './src/data/storage.mjs';
import { ZONES, AREA_ZONE } from './src/data/zones.mjs';
import { PESTS, PEST_KINDS, pestForLabel } from './src/data/pests.mjs';
import { RECIPE_CATEGORIES, RECIPE_CATEGORY_OF } from './src/data/recipe-categories.mjs';
import { HOWTO, HARVEST } from './src/data/guide.mjs';
import { MONTHS, CALENDAR } from './src/data/calendar.mjs';
import { illustration } from './src/illustrations.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, 'dist');
const SITE = (process.env.SITE_URL || 'https://homegrownplate.co.uk').replace(/\/$/, '');
const SITE_NAME = 'Homegrown Plate';

/* ---------- helpers ---------- */
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const plantMap = new Map(PLANTS.map((p) => [p.id, p]));
const sizeMap = new Map(SIZES.map((s) => [s.id, s]));
const lower = (s) => s.toLowerCase();
/* "2" -> "serves 2"; "makes 1 jar" stays as is */
const servesText = (v) => (/^\d/.test(String(v)) ? `serves ${v}` : String(v));
const joinAnd = (items) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`);
const jsonLd = (obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;

/* Turn a 12-character 0/1 string into "Mar–Jun, Oct" (runs may wrap past December). */
function monthRanges(bits) {
  const on = [...bits].map((c) => c === '1');
  if (!on.some(Boolean)) return null;
  if (on.every(Boolean)) return 'All year';
  const start = on.findIndex((v) => !v);
  const runs = [];
  let cur = null;
  for (let k = 1; k <= 12; k++) {
    const m = (start + k) % 12;
    if (on[m]) {
      if (!cur) { cur = { from: m, to: m }; runs.push(cur); } else cur.to = m;
    } else cur = null;
  }
  runs.sort((a, b) => a.from - b.from);
  return runs.map((r) => (r.from === r.to ? MONTHS[r.from] : `${MONTHS[r.from]}–${MONTHS[r.to]}`)).join(', ');
}

/* "25 min" -> "PT25M" for recipe structured data */
function isoDuration(text) {
  const m = String(text).match(/^(\d+)\s*min/i);
  return m ? `PT${m[1]}M` : null;
}

/* ---------- plant taxonomy ---------- */
const SUN_LEVELS = [
  { id: 'full', label: 'Full sun', hint: '6+ hours of direct sun', icon: '☀️' },
  { id: 'partial', label: 'Partial shade', hint: '3–6 hours of direct sun', icon: '⛅' },
  { id: 'shade', label: 'Shade', hint: 'under 3 hours of direct sun', icon: '☁️' },
];
const sunLevel = new Map(SUN_LEVELS.map((s) => [s.id, s]));
const MIN_SECTION_WORDS = 60;
const wordCount = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;
const sectionWords = (sec) => [...sec.p, ...sec.tips].reduce((n, t) => n + wordCount(t), 0);
const SECTION_KEYS = ['sow', 'grow', 'harvest', 'use'];

/* Recommended crops for a garden size: the curated list first, then every other crop that suits it. */
function cropsForSize(s) {
  const curated = s.grow.map((id) => plantMap.get(id)).filter((p) => p && p.sizes.includes(s.id));
  const rest = PLANTS.filter((p) => p.sizes.includes(s.id) && !s.grow.includes(p.id));
  return [...curated, ...rest];
}

/* ---------- data checks: fail the build on typos ---------- */
function validate() {
  const errors = [];
  const warnings = [];
  const soft = (msg) => errors.push(msg);
  const dupes = (arr, label) => {
    const seen = new Set();
    for (const x of arr) {
      if (seen.has(x.id)) errors.push(`Duplicate ${label} id: ${x.id}`);
      seen.add(x.id);
      if (!/^[a-z0-9-]+$/.test(x.id)) errors.push(`Invalid ${label} id (use lowercase letters, numbers, hyphens): ${x.id}`);
    }
  };
  dupes(PLANTS, 'plant'); dupes(SIZES, 'size'); dupes(RECIPES, 'recipe');

  const words = [];
  for (const p of PLANTS) {
    for (const s of p.sizes) if (!sizeMap.has(s)) errors.push(`Plant ${p.id} lists unknown size "${s}"`);
    if (!CALENDAR[p.id]) soft(`Plant ${p.id} has no entry in calendar.mjs`);
    if (!p.latin) errors.push(`Plant ${p.id} has no latin name`);
    if (!p.sunText) errors.push(`Plant ${p.id} has no sunText`);
    if (!Array.isArray(p.sun) || !p.sun.length || p.sun.some((x) => !sunLevel.has(x))) errors.push(`Plant ${p.id} needs sun: a list of full / partial / shade`);
    if (!p.facts || !p.facts.length) errors.push(`Plant ${p.id} has no facts`);
    else if (!p.facts.some(([l]) => l === 'Sow')) errors.push(`Plant ${p.id} needs a short 'Sow' fact (used on the plant cards)`);
    if (!p.info || !p.info.length) errors.push(`Plant ${p.id} has no info paragraphs`);
    if (!p.varieties || !p.varieties.length) errors.push(`Plant ${p.id} has no varieties`);
    for (const g of p.groups || []) {
      if (!g.name || !g.when || !g.note || !g.varieties || !g.varieties.length) errors.push(`Plant ${p.id}: each variety group needs name, when, note and varieties`);
    }
    if (!p.pests || !p.pests.length) errors.push(`Plant ${p.id} has no pests list`);
    let total = (p.info || []).reduce((n, t) => n + wordCount(t), 0);
    for (const k of SECTION_KEYS) {
      const sec = p[k];
      if (!sec || !sec.p || !sec.p.length || !sec.tips || !sec.tips.length) { errors.push(`Plant ${p.id} is missing section "${k}" (needs p and tips)`); continue; }
      const w = sectionWords(sec);
      total += w;
      if (w < MIN_SECTION_WORDS) errors.push(`Plant ${p.id} section "${k}" is too short (${w} words, minimum ${MIN_SECTION_WORDS})`);
    }
    words.push([p.id, total]);
  }
  for (const [id, c] of Object.entries(CALENDAR)) {
    if (!plantMap.has(id)) soft(`calendar.mjs has entry for unknown plant "${id}"`);
    for (const k of ['i', 'o', 'h']) if (!/^[01]{12}$/.test(c[k] || '')) errors.push(`Calendar ${id}.${k} must be 12 characters of 0/1`);
  }
  for (const s of SIZES) {
    for (const id of s.grow) {
      const p = plantMap.get(id);
      if (!p) soft(`Size ${s.id} recommends unknown plant "${id}"`);
      else if (!p.sizes.includes(s.id)) errors.push(`Size ${s.id} recommends ${id}, but ${id} does not list ${s.id} in its sizes`);
    }
  }
  dupes(PESTS, 'pest');
  for (const e of PESTS) {
    if (!pestKind.has(e.kind)) errors.push(`Pest ${e.id} has unknown kind "${e.kind}"`);
    for (const f of ['summary', 'spot', 'when']) if (!e[f] || e[f].length < (f === 'when' ? 8 : 20)) errors.push(`Pest ${e.id} is missing ${f}`);
    for (const f of ['prevent', 'control']) if (!Array.isArray(e[f]) || e[f].length < 2) errors.push(`Pest ${e.id} needs at least two ${f} points`);
    for (const c of e.crops || []) if (!plantMap.has(c)) errors.push(`Pest ${e.id} lists unknown crop "${c}"`);
    if (pestCrops.get(e.id).size === 0) soft(`Pest ${e.id} is not linked to any crop`);
  }
  for (const p of PLANTS) {
    const st = STORAGE[p.id];
    if (!st || st.length < 3) { errors.push(`Storage for ${p.id} needs at least 3 methods`); continue; }
    st.forEach(([m, how, keeps], k) => { if (!m || !how || how.length < 24 || !keeps) errors.push(`Storage method ${k + 1} for ${p.id} is incomplete`); });
  }
  for (const id of Object.keys(STORAGE)) if (!plantMap.has(id)) errors.push(`Storage entry for unknown crop ${id}`);
  for (const [id, tasks] of Object.entries(CARE)) {
    if (!plantMap.has(id)) { errors.push(`Care data for unknown plant "${id}"`); continue; }
    tasks.forEach(([spec, text], k) => { if (!careBits(spec)) errors.push(`Care task ${k + 1} for ${id} has bad months "${spec}"`); if (!text || text.length < 25) errors.push(`Care task ${k + 1} for ${id} is too short`); });
  }
  for (const r of RECIPES) if (!RECIPE_CATEGORY_OF.has(r.id)) errors.push(`Recipe ${r.id} has no category in recipe-categories.mjs`);
  for (const r of RECIPES) for (const id of r.uses) if (!plantMap.has(id)) soft(`Recipe ${r.id} uses unknown plant "${id}"`);

  warnings.forEach((w) => console.warn(`warning: ${w}`));
  if (errors.length) {
    console.error(errors.map((e) => `error: ${e}`).join('\n'));
    process.exit(1);
  }
  if (words.length) {
    const sorted = [...words].sort((a, b) => a[1] - b[1]);
    const avg = Math.round(words.reduce((n, w) => n + w[1], 0) / words.length);
    console.log(`Plant content: ${words.length} crops, average ${avg} words each (shortest: ${sorted[0][0]} ${sorted[0][1]}, longest: ${sorted[sorted.length - 1][0]} ${sorted[sorted.length - 1][1]})`);
  }
}

/* ---------- output ---------- */
const pages = [];      // indexable pages, for the sitemap
let assetVersion = {}; // content hashes for cache-busting

function outFile(urlPath, html) {
  const rel = urlPath.endsWith('/') ? `${urlPath}index.html` : urlPath;
  const file = join(DIST, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}

const NAV = [
  ['Home', '/', 'home'],
  ['Garden Sizes', '/sizes/', 'sizes'],
  ['Plant Guide', '/plants/', 'plants'],
  ['Planting Calendar', '/calendar/', 'calendar'],
  ['How-To', '/howto/', 'howto'],
  ['Harvesting', '/harvest/', 'harvest'],
  ['Preserving', '/preserving/', 'preserving'],
  ['Recipes', '/recipes/', 'recipes'],
  ['Pests & Diseases', '/pests/', 'pests'],
  ['My Garden', '/my-garden/', 'garden'],
];

/* Site ownership tags for search engines and affiliate networks. Only added to the home page. */
const VERIFICATION_TAGS = [
  '<meta name="fo-verify" content="9802a8cf-5857-475b-be4a-7821a8d791c7" />', // FlexOffers
];
const trimDesc = (s) => { if (s.length <= 160) return s; const cut = s.slice(0, 157); return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\s]+$/, '') + '...'; };
function layout({ title, description, path, body, section, ld = [], noindex = false, fullTitle = false, image = '' }) {
  description = trimDesc(description);
  const pageTitle = fullTitle ? title : `${title} | ${SITE_NAME}`;
  const url = `${SITE}${path}`;
  const nav = NAV.map(([label, href, key]) => `<a href="${href}"${key === section ? ' aria-current="page"' : ''}>${label}</a>`).join('\n      ');
  return `<!DOCTYPE html>
<html lang="en-GB">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(pageTitle)}</title>
<meta name="description" content="${esc(description)}">
${path === '/' ? VERIFICATION_TAGS.join('\n') : ''}
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
<meta name="theme-color" content="#2d6a4f">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="${esc(pageTitle)}">
<meta property="og:description" content="${esc(description)}">
${noindex ? '' : `<meta property="og:url" content="${url}">\n`}<meta property="og:locale" content="en_GB">
${image ? `<meta property="og:image" content="${SITE}${image}">\n<meta name="twitter:card" content="summary_large_image">` : '<meta name="twitter:card" content="summary">'}
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/style.css?v=${assetVersion['style.css']}">
${ld.map(jsonLd).join('\n')}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/">Homegrown <span>Plate</span></a>
    <nav class="site-nav" aria-label="Main">
      ${nav}
    </nav>
  </div>
</header>

<main class="wrap" id="main" tabindex="-1">
${body}
</main>

<footer class="site-footer">
  <div class="wrap">Homegrown Plate &mdash; growing your own food in any size of garden. Always check local frost dates and sowing times for your region.</div>
</footer>
<script src="/assets/site.js?v=${assetVersion['site.js']}" defer></script>
</body>
</html>
`;
}

function addPage({ path, ...opts }) {
  const { ld = [], crumbs } = opts;
  const allLd = [...ld];
  if (crumbs) {
    allLd.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: crumbs.map(([name, href], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${href}` })),
    });
  }
  outFile(path, layout({ ...opts, path, ld: allLd }));
  pages.push(path);
}

const emoji = (e) => `<span class="emoji" aria-hidden="true">${e}</span>`;
const plantLink = (p) => `<a href="/plants/${p.id}/" class="tag tag-link">${p.emoji} ${esc(p.name)}</a>`;


/* ---------- plant images: drop-in photos, otherwise a drawn illustration ---------- */
const PHOTO_DIR = join(ROOT, 'src/photos');
const photoMeta = existsSync(join(PHOTO_DIR, 'photos.json')) ? JSON.parse(readFileSync(join(PHOTO_DIR, 'photos.json'), 'utf8')) : {};
let sharp = null;
try { sharp = (await import('sharp')).default; } catch { /* optional: photos are copied as-is without it */ }
const PHOTOS = new Map();
for (const p of PLANTS) {
  const ext = ['jpg', 'jpeg', 'png', 'webp'].find((e) => existsSync(join(PHOTO_DIR, `${p.id}.${e}`)));
  if (ext) PHOTOS.set(p.id, { file: join(PHOTO_DIR, `${p.id}.${ext}`), ext, alt: photoMeta[p.id]?.alt || `${p.name} growing`, credit: photoMeta[p.id]?.credit || '', creditUrl: photoMeta[p.id]?.creditUrl || '' });
}
async function writePlantImages() {
  mkdirSync(join(DIST, 'img/plants'), { recursive: true });
  for (const p of PLANTS) writeFileSync(join(DIST, 'img/plants', `${p.id}.svg`), illustration(p.id));
  if (!PHOTOS.size) return;
  mkdirSync(join(DIST, 'img/photos'), { recursive: true });
  for (const [id, ph] of PHOTOS) {
    if (sharp) {
      for (const w of [480, 960]) await sharp(ph.file).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: 78 }).toFile(join(DIST, 'img/photos', `${id}-${w}.webp`));
      ph.src = `/img/photos/${id}-960.webp`; ph.small = `/img/photos/${id}-480.webp`;
      ph.srcset = `/img/photos/${id}-480.webp 480w, /img/photos/${id}-960.webp 960w`;
    } else {
      cpSync(ph.file, join(DIST, 'img/photos', `${id}.${ph.ext}`));
      ph.src = ph.small = `/img/photos/${id}.${ph.ext}`; ph.srcset = '';
      const thumb = join(PHOTO_DIR, `${id}-thumb.${ph.ext}`);
      if (existsSync(thumb)) { cpSync(thumb, join(DIST, 'img/photos', `${id}-thumb.${ph.ext}`)); ph.small = `/img/photos/${id}-thumb.${ph.ext}`; }
    }
  }
}
/* Small image for cards and lists: the photo if there is one, else the illustration. */
function plantImg(p, size = 'small') {
  const ph = PHOTOS.get(p.id);
  const px = size === 'large' ? 160 : 72;
  if (ph) return `<img class="pimg photo ${size}" src="${size === 'large' ? ph.src : ph.small}" width="${px}" height="${px}" alt="${size === 'large' ? esc(ph.alt) : ''}" loading="${size === 'large' ? 'eager' : 'lazy'}" decoding="async">`;
  return `<img class="pimg ${size}" src="/img/plants/${p.id}.svg" width="${px}" height="${px}" alt="" loading="${size === 'large' ? 'eager' : 'lazy'}" decoding="async">`;
}
const MONTH_LETTERS = 'JFMAMJJASOND';
function growCard(p, cal) {
  const rows = [['Sow or start indoors', cal.i, 'i'], ['Sow or plant outside', cal.o, 'o'], ['Harvest', cal.h, 'h']].filter(([, bits]) => bits.includes('1'));
  const cells = (bits) => [...bits].map((b, k) => `<i${b === '1' ? ' class="on"' : ''} data-m="${k}"></i>`).join('');
  const ph = PHOTOS.get(p.id);
  const harvestTime = p.facts.find(([l]) => l === 'Time to harvest');
  const media = ph
    ? `<figure class="gc-media">${plantImg(p, 'large')}${ph.credit ? `<figcaption>${ph.creditUrl ? `<a href="${esc(ph.creditUrl)}" rel="noopener">${esc(ph.credit)}</a>` : esc(ph.credit)}</figcaption>` : ''}</figure>`
    : `<div class="gc-media">${plantImg(p, 'large')}</div>`;
  return `<section class="grow-card" aria-label="${esc(p.name)} at a glance">
  ${media}
  <div class="gc-body">
    <dl class="gc-facts">
      <div><dt>Sunlight</dt><dd>${p.sun.map((id) => `${sunLevel.get(id).icon} ${esc(sunLevel.get(id).label)}`).join(', ')}</dd></div>
      <div><dt>Garden sizes</dt><dd>${p.sizes.map((id) => esc(sizeMap.get(id).short)).join(', ')}</dd></div>
      <div><dt>Difficulty</dt><dd>${esc(p.difficulty)}</dd></div>
      ${harvestTime ? `<div><dt>Time to harvest</dt><dd>${esc(harvestTime[1])}</dd></div>` : ''}
    </dl>
    <div class="mbar" data-i="${cal.i}" data-o="${cal.o}" data-h="${cal.h}">
      <div class="mrow mhead"><span class="mlabel"></span><span class="mcells" aria-hidden="true">${[...MONTH_LETTERS].map((c, k) => `<b data-m="${k}">${c}</b>`).join('')}</span></div>
      ${rows.map(([label, bits, cls]) => `<div class="mrow m-${cls}" data-row="${cls}"><span class="mlabel">${label}</span><span class="mcells" aria-hidden="true">${cells(bits)}</span><span class="sr-only">${esc(monthRanges(bits))}</span></div>`).join('\n      ')}
    </div>
  </div>
</section>`;
}



/* Which crops each pest or problem affects, found from the plants' "Watch out for" labels. */
const pestCrops = new Map(PESTS.map((p) => [p.id, new Set(p.crops || [])]));
for (const p of PLANTS) for (const label of p.pests) { const e = pestForLabel(label); if (e) pestCrops.get(e.id).add(p.id); }
const pestMap = new Map(PESTS.map((p) => [p.id, p]));
const pestKind = new Map(PEST_KINDS.map((k) => [k.id, k]));

/* Care tasks: expand "4-8", "11-2" or "4,9" into a 12-character 0/1 string. */
function careBits(spec) {
  const bits = Array(12).fill('0');
  for (const part of String(spec).split(',')) {
    const m = part.trim().match(/^(\d{1,2})(?:-(\d{1,2}))?$/);
    if (!m) return null;
    const from = Number(m[1]); const to = m[2] ? Number(m[2]) : from;
    if (from < 1 || from > 12 || to < 1 || to > 12) return null;
    for (let k = from; ; k = (k % 12) + 1) { bits[k - 1] = '1'; if (k === to) break; }
  }
  return bits.join('');
}
const careFor = (id) => (CARE[id] || []).map(([spec, text]) => [careBits(spec), text]);

/* ---------- pages ---------- */
const FULL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function buildHome() {
  const rank = { Easy: 0, Medium: 1, Hard: 2 };
  const byEase = [...PLANTS].sort((x, y) => rank[x.difficulty] - rank[y.difficulty] || x.name.localeCompare(y.name, 'en-GB'));
  const nowMonth = new Date().getMonth();
  const monthPanels = FULL_MONTHS.map((name, m) => {
    const sow = byEase.filter((p) => CALENDAR[p.id].i[m] === '1' || CALENDAR[p.id].o[m] === '1');
    const harvest = byEase.filter((p) => CALENDAR[p.id].h[m] === '1');
    const list = (items, label) => `<div><h3>${label} <span class="count">(${items.length})</span></h3>
      <p class="card-tags">${items.slice(0, 14).map(plantLink).join('')}${items.length > 14 ? `<a class="tag tag-link more" href="/calendar/">+${items.length - 14} more</a>` : ''}${items.length === 0 ? '<span class="muted">Nothing this month: a good time to plan and tidy.</span>' : ''}</p></div>`;
    return `<div class="month-panel" data-month-panel="${m}"${m === nowMonth ? '' : ' hidden'}>
    <h2 class="month-title">In the garden in <span data-month-name>${name}</span></h2>
    <div class="month-cols">${list(sow, 'Sow or plant')}${list(harvest, 'Harvest')}</div>
    <p><a href="/calendar/">See the full planting calendar &rarr;</a></p>
  </div>`;
  }).join('\n  ');

  const popular = ['tomato', 'potato', 'strawberry', 'courgette', 'bean', 'carrot', 'basil', 'kale'].map((id) => plantMap.get(id)).filter(Boolean);
  const popularCards = popular.map((p) => `<a href="/plants/${p.id}/" class="card card-link pop-card">${plantImg(p)}<h3>${esc(p.name)}</h3><span class="tag">${esc(p.difficulty)}</span></a>`).join('\n  ');
  const featuredRecipes = ['summer-pudding', 'pizza-margherita', 'butternut-squash-soup', 'apple-blackberry-crumble'].map((id) => RECIPES.find((r) => r.id === id)).filter(Boolean);
  const recipeCards = featuredRecipes.map((r) => `<a href="/recipes/${r.id}/" class="card card-link">
    <h3>${esc(r.title)}</h3>
    <p class="muted card-meta">${esc(r.time)} &middot; ${esc(servesText(r.serves))}</p>
    <p class="card-tags">${r.uses.slice(0, 3).map((u) => { const p = plantMap.get(u); return `<span class="tag">${p.emoji} ${esc(p.name)}</span>`; }).join('')}</p>
  </a>`).join('\n  ');
  const easyCount = PLANTS.filter((p) => p.difficulty === 'Easy').length;

  const body = `
<section class="hero">
  <h1>Grow your own food, whatever your garden size</h1>
  <p>From a single windowsill to a full allotment, find out what to plant, how to look after it, how to harvest it, and what to cook with it.</p>
  <form class="hero-search" action="/plants/" method="get" role="search">
    <label class="sr-only" for="heroSearch">Search the plant guide</label>
    <input type="search" id="heroSearch" name="q" placeholder="Search ${PLANTS.length} crops, for example tomato, mint, apple" autocomplete="off">
    <button type="submit" class="btn">Search plants</button>
  </form>
  <p class="hero-links"><a href="/sizes/">Find my garden size</a> <span aria-hidden="true">&middot;</span> <a href="/plants/?diff=easy">Easy crops for beginners</a> <span aria-hidden="true">&middot;</span> <a href="/my-garden/">Build my garden</a> <span aria-hidden="true">&middot;</span> <a href="/howto/">How to get started</a></p>
  <ul class="hero-stats">
    <li><strong>${PLANTS.length}</strong> crops</li>
    <li><strong>${RECIPES.length}</strong> recipes</li>
    <li><strong>4</strong> garden sizes</li>
    <li><strong>12</strong> months of growing</li>
  </ul>
</section>

<section class="month-box" id="thisMonth">
  ${regionBar('homeRegion')}
  ${monthPanels}
</section>

<h2>Pick your garden size</h2>
<div class="grid">
  ${SIZES.map((s) => `<a href="/sizes/${s.id}/" class="card card-link size-card ${s.cls}">${emoji(s.emoji)}<h3>${esc(s.title)}</h3><p class="muted">${esc(s.desc)}</p><span class="more-link">See ideas &rarr;</span></a>`).join('\n  ')}
</div>

<h2>Popular crops to start with</h2>
<div class="grid pop-grid">
  ${popularCards}
</div>
<p><a href="/plants/">Browse all ${PLANTS.length} crops &rarr;</a></p>

<h2>From the garden to the table</h2>
<div class="grid">
  ${recipeCards}
</div>
<p><a href="/recipes/">Browse all ${RECIPES.length} recipes &rarr;</a></p>

<h2>Everything you need</h2>
<div class="grid grid-3">
  <a href="/plants/" class="card card-link"><h3>Plant Guide</h3><p class="muted">${PLANTS.length} crops with sowing, care, pests and harvest. Filter by sunlight, garden size and difficulty.</p><span class="more-link">Browse plants &rarr;</span></a>
  <a href="/calendar/" class="card card-link"><h3>Planting Calendar</h3><p class="muted">What to sow and harvest, month by month.</p><span class="more-link">See the calendar &rarr;</span></a>
  <a href="/howto/" class="card card-link"><h3>How-To</h3><p class="muted">Seven steps from plan to first harvest.</p><span class="more-link">Read the guide &rarr;</span></a>
  <a href="/harvest/" class="card card-link"><h3>Harvesting</h3><p class="muted">Know when and how to pick for best flavour.</p><span class="more-link">Learn to harvest &rarr;</span></a>
  <a href="/recipes/" class="card card-link"><h3>Recipes</h3><p class="muted">${RECIPES.length} recipes, from salads and soups to puddings, preserves and drinks.</p><span class="more-link">Start cooking &rarr;</span></a>
  <a href="/preserving/" class="card card-link"><h3>Preserving</h3><p class="muted">Freeze, dry, pickle or store a glut: storage ideas for every crop, grouped by method.</p><span class="more-link">Keep your harvest &rarr;</span></a>
  <a href="/pests/" class="card card-link"><h3>Pests &amp; Diseases</h3><p class="muted">${PESTS.length} common problems, how to spot them and what to do, linked from every crop.</p><span class="more-link">Fix a problem &rarr;</span></a>
  <a href="/my-garden/" class="card card-link"><h3>My Garden</h3><p class="muted">Add the crops you grow and get a checklist of jobs and recipes for every month. Free, no sign-up.</p><span class="more-link">Build my garden &rarr;</span></a>
  <a href="/plants/?diff=easy" class="card card-link"><h3>Beginner-friendly crops</h3><p class="muted">${easyCount} easy crops that forgive mistakes and reward you quickly.</p><span class="more-link">See easy crops &rarr;</span></a>
</div>`;
  addPage({
    path: '/', section: 'home', fullTitle: true, body,
    title: `${SITE_NAME}: grow your own food in any size of garden`,
    description: `Grow your own food on a balcony, patio or allotment. UK sowing and harvesting guides, a planting calendar, storage tips and ${RECIPES.length} recipes for ${PLANTS.length} crops.`,
    ld: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: `${SITE}/`, potentialAction: { '@type': 'SearchAction', target: `${SITE}/plants/?q={search_term_string}`, 'query-input': 'required name=search_term_string' } }],
  });
}

let gardenMemo = null;
function gardenData() {
  if (gardenMemo) return gardenMemo;
  const data = {
    plants: PLANTS.map((p) => ({ id: p.id, n: p.name, e: p.emoji, d: p.difficulty, i: CALENDAR[p.id].i, o: CALENDAR[p.id].o, h: CALENDAR[p.id].h, img: PHOTOS.get(p.id)?.small || `/img/plants/${p.id}.svg`, c: careFor(p.id) })),
    recipes: RECIPES.map((r) => ({ id: r.id, t: r.title, m: r.time, u: r.uses })),
  };
  const json = JSON.stringify(data);
  gardenMemo = { json, ver: createHash('sha1').update(json).digest('hex').slice(0, 8) };
  return gardenMemo;
}
let zonesMemo = null;
function zonesData() {
  if (zonesMemo) return zonesMemo;
  const json = JSON.stringify({ zones: ZONES.map(({ id, name, off }) => ({ id, name, off })), areas: AREA_ZONE });
  zonesMemo = { json, ver: createHash('sha1').update(json).digest('hex').slice(0, 8) };
  return zonesMemo;
}
/* "Your location" bar. The site script unhides it and applies regional timings; without JavaScript the default dates stay. */
function regionBar(id = 'regionBar') {
  const g = gardenData(); const z = zonesData();
  return `<section class="region-bar" id="${id}" data-region-bar data-zones="/assets/zones.json?v=${z.ver}" data-garden="/assets/garden-data.json?v=${g.ver}" aria-label="Adjust dates for your location" hidden>
  <p class="region-status" aria-live="polite"><strong>Dates for your area.</strong> <span data-region-text>Showing typical dates for central England.</span> <button type="button" class="chip chip-reset" data-region-clear hidden>Reset</button></p>
  <details class="region-more" data-region-more><summary>Enter your postcode or choose a region</summary>
  <form class="region-form" data-region-form>
    <label for="${id}-pc">Your postcode</label>
    <input type="text" id="${id}-pc" inputmode="text" autocomplete="postal-code" maxlength="8" placeholder="For example EX4 or SW1A 1AA" data-region-pc>
    <button type="submit" class="btn">Adjust dates</button>
  </form>
  <p class="muted small-note" data-region-msg>Only the first letters of your postcode are used, and they are saved in this browser only. Nothing is sent anywhere.</p>
  <div class="region-manual">
    <label for="${id}-zone">Or choose your region</label><br>
    <select id="${id}-zone" data-region-zone>
      <option value="">Choose a region</option>
      ${ZONES.map((zn) => `<option value="${zn.id}" data-off="${zn.off}">${esc(zn.name)}</option>`).join('\n      ')}
    </select>
  </div>
  </details>
</section>`;
}

function buildMyGarden() {
  const { json, ver } = gardenData();
  writeFileSync(join(DIST, 'assets', 'garden-data.json'), json);
  writeFileSync(join(DIST, 'assets', 'zones.json'), zonesData().json);
  const body = `
<h1>My Garden</h1>
<p class="lead">Add the crops you grow and see what to sow, plant and harvest each month, plus recipes for whatever is ready. Your garden is saved in this browser, so no sign-up is needed.</p>
${regionBar()}
<noscript><p class="empty">My Garden needs JavaScript. You can still browse the <a href="/calendar/">planting calendar</a> and the <a href="/plants/">plant guide</a>.</p></noscript>
<div id="myGarden" data-src="/assets/garden-data.json?v=${ver}" hidden>
  <div class="garden-layout">
    <section class="card garden-picker" aria-labelledby="gPickTitle">
      <h2 id="gPickTitle">Add crops</h2>
      <label class="sr-only" for="gSearch">Search crops to add</label>
      <input type="search" id="gSearch" placeholder="Search ${PLANTS.length} crops, for example tomato" autocomplete="off">
      <p class="muted small-note" id="gHint">Popular crops to start with:</p>
      <ul class="garden-results" id="gResults"></ul>
    </section>
    <section class="card garden-mine" aria-labelledby="gMineTitle">
      <h2 id="gMineTitle">Your garden <span class="count" id="gCount"></span></h2>
      <p class="muted" id="gEmpty">Nothing here yet. Add a few crops on the left and your monthly jobs will appear below.</p>
      <ul class="garden-chips" id="gSelected"></ul>
      <button type="button" class="chip chip-reset" id="gClear" hidden>Clear my garden</button>
    </section>
  </div>
  <div class="month-nav">
    <button type="button" class="chip" id="gPrev" aria-label="Previous month">&larr;</button>
    <h2 id="gMonthTitle" aria-live="polite"></h2>
    <button type="button" class="chip" id="gNext" aria-label="Next month">&rarr;</button>
    <button type="button" class="chip" id="gToday" hidden>Back to this month</button>
  </div>
  <div id="gJobs" class="jobs-grid"></div>
  <p class="muted small-note">Tick jobs off as you go and your ticks are remembered. Sowing and harvest months follow typical UK conditions, so adjust for your local frost dates and weather. Reminders for watering, feeding and pruning are planned for a later version.</p>
  <h2 id="gRecipeTitle">Recipes for this month</h2>
  <div class="grid" id="gRecipes"></div>
</div>`;
  addPage({
    path: '/my-garden/', section: 'garden', body, title: 'My Garden: monthly jobs and recipes for your crops',
    description: 'Add the crops you grow and get a checklist of what to sow, plant and harvest each month, plus recipes for what is ready. Free, no sign-up.',
    crumbs: [['Home', '/'], ['My Garden', '/my-garden/']],
  });
}

function buildSizes() {
  const body = `
<h1>Garden Sizes</h1>
<p class="lead">Whatever space you have, there is something you can grow. Choose your garden size for tailored advice.</p>
<div class="grid">
  ${SIZES.map((s) => `<div class="card size-card ${s.cls}">
    ${emoji(s.emoji)}
    <h3>${esc(s.title)}</h3>
    <p class="muted">${esc(s.desc)}</p>
    <p><strong>Good crops:</strong><br>${s.grow.slice(0, 6).map((id) => plantLink(plantMap.get(id))).join('')}</p>
    <p class="card-meta muted">${cropsForSize(s).length} crops suit this space</p>
    <a href="/sizes/${s.id}/">Full guide &rarr;</a>
  </div>`).join('\n  ')}
</div>`;
  addPage({
    path: '/sizes/', section: 'sizes', body, title: 'Garden Sizes: what to grow in your space',
    description: 'Find out what to grow on a balcony, in a small garden, a medium garden or an allotment, with tips and crop recommendations for each.',
    crumbs: [['Home', '/'], ['Garden Sizes', '/sizes/']],
  });

  for (const s of SIZES) {
    const crops = cropsForSize(s);
    const detail = `
<a class="back" href="/sizes/">&larr; All garden sizes</a>
<h1>${emoji(s.emoji)} ${esc(s.title)}</h1>
<p class="lead">${esc(s.desc)}</p>
<h2>Top tips for this space</h2>
<ul class="tips">${s.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
<h2>Recommended crops (${crops.length})</h2>
<p><a href="/plants/?size=${s.id}">Filter the Plant Guide for this garden size &rarr;</a></p>
<div class="grid">
  ${crops.map((p) => `<div class="card">${plantImg(p)}<h3>${esc(p.name)}</h3><span class="tag">${esc(p.difficulty)}</span><span class="tag warm">${esc(sunLevel.get(minSun(p)).label)}</span><span class="tag blue">${esc(sizeMap.get(minSize(p)).short)}</span><p class="muted card-note">${esc(p.facts.find(([l]) => l === 'Sow')?.[1] || p.sunText)}</p><a href="/plants/${p.id}/">Grow ${esc(p.name)} &rarr;</a></div>`).join('\n  ')}
</div>`;
    addPage({
      path: `/sizes/${s.id}/`, section: 'sizes', body: detail,
      title: `${s.title}: what to grow`,
      description: `${s.desc} ${crops.length} recommended crops with tips for this space.`,
      crumbs: [['Home', '/'], ['Garden Sizes', '/sizes/'], [s.title, `/sizes/${s.id}/`]],
    });
  }
}

const paras = (arr) => arr.map((t) => `<p>${esc(t)}</p>`).join('\n');
const tipsList = (arr, heading = 'Top tips') =>
  arr && arr.length ? `<h3>${heading}</h3>\n<ul class="tips">${arr.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '';
const factRows = (rows) => `<div class="info-row">\n  ${rows.map(([l, v]) => `<div>${esc(l)}</div><div>${esc(v)}</div>`).join('\n  ')}\n</div>`;
const accordion = (id, title, inner, open = false) => `<details class="acc" id="${id}"${open ? ' open' : ''}>
  <summary>${esc(title)}</summary>
  <div class="acc-body">
${inner}
  </div>
</details>`;
const chip = (group, value, label, pressed = false) =>
  `<button type="button" class="chip" data-filter="${group}" data-value="${value}" aria-pressed="${pressed}">${label}</button>`;

/* Tiles show the minimum a crop needs: the shadiest level it tolerates and the smallest garden it suits. */
const minSun = (p) => [...SUN_LEVELS].reverse().find((s) => p.sun.includes(s.id)).id;
const minSize = (p) => SIZES.find((s) => p.sizes.includes(s.id)).id;
const DIFFICULTIES = [['easy', 'Easy'], ['medium', 'Medium'], ['hard', 'Hard']];

function careSection(p) {
  const tasks = careFor(p.id);
  if (!tasks.length) return '';
  const rows = tasks.map(([bits, text]) => `<li data-bits="${bits}"><span class="care-when">${esc(monthRanges(bits))}</span> ${esc(text)}</li>`).join('\n  ');
  return `<section class="care-list" aria-labelledby="care-h"><h2 id="care-h">Care through the year</h2>
<ul class="care-ul">
  ${rows}
</ul></section>`;
}

function buildPlants() {
  const cards = PLANTS.map((p) => `<a href="/plants/${p.id}/" class="card card-link" data-plant data-sizes="${p.sizes.join(' ')}" data-sun="${p.sun.join(' ')}" data-diff="${esc(lower(p.difficulty))}" data-search="${esc(lower(`${p.name} ${p.latin} ${(p.groups || []).map((g) => g.name).join(' ')}`))}">
    ${plantImg(p)}
    <h3>${esc(p.name)}</h3>
    <span class="tag">${esc(p.difficulty)}</span>
    <span class="tag warm">${esc(sunLevel.get(minSun(p)).label)}</span><span class="tag blue">${esc(sizeMap.get(minSize(p)).short)}</span>${p.groups && p.groups.length ? `<span class="badge-types">${p.groups.length} types</span>` : ''}
    <p class="muted card-note">${esc(p.facts.find(([l]) => l === 'Sow')?.[1] || p.sunText)}</p>
  </a>`).join('\n  ');
  const sunChips = [chip('sun', 'any', 'Any sunlight', true), ...SUN_LEVELS.map((s) => chip('sun', s.id, `<span aria-hidden="true">${s.icon}</span> ${s.label}`))].join('\n      ');
  const sizeChips = [chip('size', 'any', 'Any size', true), ...SIZES.map((s) => chip('size', s.id, `<span aria-hidden="true">${s.emoji}</span> ${esc(s.short)}`))].join('\n      ');
  const diffChips = [chip('diff', 'any', 'Any difficulty', true), ...DIFFICULTIES.map(([id, label]) => chip('diff', id, label))].join('\n      ');
  const body = `
<h1>Plant Guide</h1>
<p class="lead">${PLANTS.length} crops for UK gardens, each with detailed advice on sowing, growing, harvesting and storing. Pick the sunlight you have, your garden size and how much experience you have to narrow the list. Each tile shows the minimum a crop needs.</p>
<div class="filter-panel" id="plantFilters" hidden>
  <div class="filter-search"><label for="plantSearch">Search by name</label><input type="search" id="plantSearch" placeholder="For example: tomato, thyme, apple"></div>
  <fieldset class="chip-group">
    <legend>Sunlight</legend>
      ${sunChips}
  </fieldset>
  <fieldset class="chip-group">
    <legend>Garden size</legend>
      ${sizeChips}
  </fieldset>
  <fieldset class="chip-group">
    <legend>Difficulty</legend>
      ${diffChips}
  </fieldset>
  <p class="muted small-note">${SUN_LEVELS.map((s) => `${s.label}: ${s.hint}`).join('. ')}. Many crops cope with more than one level, so they appear under each.</p>
  <p class="filter-status"><span id="plantCount" aria-live="polite"></span> <button type="button" class="chip chip-reset" id="plantReset" hidden>Clear filters</button></p>
</div>
<div class="grid" id="plantGrid">
  ${cards}
</div>
<div class="empty" id="plantEmpty" hidden>No crops match those filters. Try a different sunlight, garden size or difficulty.</div>`;
  addPage({
    path: '/plants/', section: 'plants', body, title: `Plant Guide: ${PLANTS.length} crops to grow in the UK`,
    description: `Detailed sowing, growing, harvesting and storage advice for ${PLANTS.length} crops that grow well in the UK. Filter by sunlight, garden size and difficulty.`,
    crumbs: [['Home', '/'], ['Plant Guide', '/plants/']],
  });

  for (const p of PLANTS) {
    const related = RECIPES.filter((r) => r.uses.includes(p.id));
    const cal = CALENDAR[p.id];
    const calRow = (label, bits) => { const v = monthRanges(bits); return v ? [[label, v]] : []; };
    const sowCal = [...calRow('Sow or start indoors', cal.i), ...calRow('Sow or plant outside', cal.o)];
    const harvestCal = calRow('Harvest months', cal.h);

    const infoBody = [
      factRows([['Sunlight', p.sunText], ...p.facts]),
      paras(p.info),
      p.groups && p.groups.length
        ? `<h3>Types and varieties</h3>\n<p>${esc(p.groupsIntro || 'This crop is grown in different groups, which are sown and harvested at different times. Choose one or more to spread the harvest.')}</p>\n<div class="vgroups">${p.groups.map((g) => `<div class="vgroup"><h4>${esc(g.name)}</h4><p class="vwhen">${esc(g.when)}</p><p>${esc(g.note)}</p><p>${g.varieties.map((v) => `<span class="tag">${esc(v)}</span>`).join('')}</p></div>`).join('')}</div>`
        : `<h3>Varieties to try</h3>\n<p>${p.varieties.map((v) => `<span class="tag">${esc(v)}</span>`).join('')}</p>`,
    ].join('\n');
    const sowBody = [sowCal.length ? factRows(sowCal) : '', paras(p.sow.p), tipsList(p.sow.tips)].filter(Boolean).join('\n');
    const growBody = [paras(p.grow.p), tipsList(p.grow.tips), `<h3>Watch out for</h3>\n<p>${p.pests.map((x) => { const e = pestForLabel(x); return e ? `<a class="tag red tag-link" href="/pests/${e.id}/">${esc(x)}</a>` : `<span class="tag red">${esc(x)}</span>`; }).join('')}</p>\n<p class="muted small-note">Tap a problem to see how to spot it and what to do. See all <a href="/pests/">pests and diseases</a>.</p>`].filter(Boolean).join('\n');
    const harvestBody = [harvestCal.length ? factRows(harvestCal) : '', paras(p.harvest.p), tipsList(p.harvest.tips)].filter(Boolean).join('\n');
    const storeBody = `<h3>Storing a surplus</h3>
<p>Too much ready at once? These are the main ways to keep ${esc(lower(p.name))} for later.</p>
<ul class="store-ul">
${STORAGE[p.id].map(([m, how, keeps]) => `<li><strong>${esc(m)}</strong> ${esc(how)} <span class="keeps">Good for: ${esc(keeps)}.</span></li>`).join('\n')}
</ul>
<p class="muted small-note">Storage times are a guide. Use clean jars and containers, and follow tested guidance for bottling or canning low-acid foods. If in doubt, throw it out.</p>`;
    const useBody = [paras(p.use.p), tipsList(p.use.tips), storeBody].join('\n');

    const body2 = `
<a class="back" href="/plants/">&larr; Plant Guide</a>
<h1>${esc(p.name)}</h1>
<p class="latin">${esc(p.latin)}</p>
${growCard(p, cal)}
${regionBar()}
<p class="garden-add-row"><button type="button" class="btn-garden" data-garden-add="${p.id}" data-name="${esc(p.name)}" hidden>+ Add ${esc(p.name)} to my garden</button> <a class="garden-link" href="/my-garden/" hidden>Open my garden</a></p>
<p class="acc-controls"><button type="button" class="chip" id="accToggle" hidden>Expand all sections</button></p>
${accordion('info', 'Info', infoBody, true)}
${accordion('how-to-sow', p.sowTitle || 'How to sow', sowBody)}
${accordion('how-to-grow', 'How to grow', growBody)}
${accordion('how-to-harvest', 'How to harvest', harvestBody)}
${accordion('usage-and-storage', 'Usage and storage', useBody)}
${careSection(p)}
<p class="muted small-note">Timings are typical for the UK and vary with region, frost dates and variety. See the <a href="/calendar/">planting calendar</a> for every crop at a glance.</p>
${related.length ? `<h2>Cook with ${esc(lower(p.name))}</h2>
<div class="grid">${related.map((r) => `<div class="card"><h3>${esc(r.title)}</h3><p class="muted">${esc(r.time)} &middot; ${esc(servesText(r.serves))}</p><a href="/recipes/${r.id}/">View recipe &rarr;</a></div>`).join('')}</div>` : ''}`;
    addPage({
      path: `/plants/${p.id}/`, section: 'plants', body: body2, title: `How to grow ${p.name} in the UK`,
      description: `How to grow ${lower(p.name)} in the UK: when and how to sow, growing care, harvesting, storage and cooking tips. ${p.sunText}.`,
      crumbs: [['Home', '/'], ['Plant Guide', '/plants/'], [p.name, `/plants/${p.id}/`]],
      image: PHOTOS.get(p.id)?.src || '',
    });
  }
}

function buildPests() {
  const crops = (id) => [...pestCrops.get(id)].map((c) => plantMap.get(c)).filter(Boolean).sort((x, y) => x.name.localeCompare(y.name, 'en-GB'));
  const cards = PESTS.map((e) => {
    const n = pestCrops.get(e.id).size;
    return `<a href="/pests/${e.id}/" class="card card-link" data-pest data-kind="${e.kind}" data-search="${esc(lower(`${e.name} ${e.summary}`))}">
    <span class="tag ${e.kind === 'pest' ? 'red' : e.kind === 'disease' ? 'warm' : e.kind === 'wildlife' ? 'blue' : ''}">${esc(pestKind.get(e.kind).one)}</span>
    <h3>${esc(e.name)}</h3>
    <p class="muted card-note">${esc(e.summary)}</p>
    <p class="muted small-note">Affects ${n} ${n === 1 ? 'crop' : 'crops'}</p>
  </a>`;
  }).join('\n  ');
  const kindChips = [chip('kind', 'any', 'All', true), ...PEST_KINDS.map((k) => chip('kind', k.id, esc(k.label)))].join('\n      ');
  const body = `
<h1>Pests, Diseases and Problems</h1>
<p class="lead">${PESTS.length} common garden problems and how to deal with them, starting with the gentlest methods. Each crop's page links to the problems that affect it.</p>
<div class="filter-panel" id="pestFilters" hidden>
  <div class="filter-search"><label for="pestSearch">Search by name</label><input type="search" id="pestSearch" placeholder="For example: aphids, blight, slugs"></div>
  <fieldset class="chip-group">
    <legend>Type</legend>
      ${kindChips}
  </fieldset>
  <p class="filter-status"><span id="pestCount" aria-live="polite"></span> <button type="button" class="chip chip-reset" id="pestReset" hidden>Clear filters</button></p>
</div>
<div class="grid">
  ${cards}
</div>
<div class="empty" id="pestEmpty" hidden>No problems match that search. Try a different word or type.</div>
<p class="muted small-note">Advice here favours prevention, barriers, hand-picking and natural predators. If you choose to use a product, make sure it is approved for use in UK home gardens, follow the label exactly, and avoid spraying open flowers so bees are not harmed.</p>`;
  addPage({
    path: '/pests/', section: 'pests', body, title: 'Garden Pests, Diseases and Problems',
    description: `How to spot and deal with ${PESTS.length} common UK garden pests, diseases and growing problems, from aphids and slugs to blight, clubroot and bolting.`,
    crumbs: [['Home', '/'], ['Pests & Diseases', '/pests/']],
  });
  for (const e of PESTS) {
    const affected = crops(e.id);
    const list = (items) => `<ul class="tips">${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    const body2 = `
<a class="back" href="/pests/">&larr; Pests and diseases</a>
<h1>${esc(e.name)}</h1>
<p><span class="tag ${e.kind === 'pest' ? 'red' : e.kind === 'disease' ? 'warm' : e.kind === 'wildlife' ? 'blue' : ''}">${esc(pestKind.get(e.kind).one)}</span> <span class="muted">${esc(e.summary)}</span></p>
<h2>What to look for</h2>
<p>${esc(e.spot)}</p>
<p><strong>When:</strong> ${esc(e.when)}</p>
<h2>How to prevent it</h2>
${list(e.prevent)}
<h2>How to deal with it</h2>
${list(e.control)}
${affected.length ? `<h2>Crops it affects</h2>
<p class="card-tags">${affected.map(plantLink).join('')}</p>` : ''}
<p class="muted small-note">If you choose to use any treatment, use only products approved for UK home gardens, follow the label and avoid spraying open flowers. See all <a href="/pests/">pests and diseases</a>.</p>`;
    addPage({
      path: `/pests/${e.id}/`, section: 'pests', body: body2, title: `${e.name}: how to spot, prevent and treat`,
      description: `${e.summary} How to spot ${lower(e.name)}, prevent it and deal with it in a UK garden.`,
      crumbs: [['Home', '/'], ['Pests & Diseases', '/pests/'], [e.name, `/pests/${e.id}/`]],
    });
  }
}

function buildRecipes() {
  const withRecipes = PLANTS.filter((p) => RECIPES.some((r) => r.uses.includes(p.id)));
  const cards = RECIPES.map((r) => `<a href="/recipes/${r.id}/" class="card card-link" data-recipe data-uses="${r.uses.join(' ')}" data-cat="${RECIPE_CATEGORY_OF.get(r.id)}">
    <h3>${esc(r.title)}</h3>
    <p class="muted card-meta">${esc(r.time)} &middot; ${esc(servesText(r.serves))}</p>
    <p class="card-tags">${r.uses.map((u) => { const p = plantMap.get(u); return `<span class="tag">${p.emoji} ${esc(p.name)}</span>`; }).join('')}</p>
  </a>`).join('\n  ');
  const body = `
<h1>Garden Recipes</h1>
<p class="lead">Every recipe is built around crops you can grow yourself.</p>
<div class="filter-panel" id="recipeFilters" hidden>
  <fieldset class="chip-group">
    <legend>Type of dish</legend>
      ${[chip('cat', 'any', 'All recipes', true), ...RECIPE_CATEGORIES.map((c) => chip('cat', c.id, esc(c.label)))].join('\n      ')}
  </fieldset>
  <div class="filter-search"><label for="recipeFilter">Crop</label>
    <select id="recipeFilter">
      <option value="all">All crops</option>
      ${withRecipes.map((p) => `<option value="${p.id}">${p.emoji} ${esc(p.name)}</option>`).join('\n      ')}
    </select>
  </div>
  <p class="filter-status"><span id="recipeCount" aria-live="polite"></span></p>
</div>
<div class="grid">
  ${cards}
</div>
<div class="empty" id="recipeEmpty" hidden>No recipes match those filters. Try a different type of dish or crop.</div>`;
  addPage({
    path: '/recipes/', section: 'recipes', body, title: 'Garden Recipes',
    description: `${RECIPES.length} simple recipes built around crops you can grow yourself, from tomato salad to courgette fritters and fresh pesto.`,
    crumbs: [['Home', '/'], ['Recipes', '/recipes/']],
  });

  for (const r of RECIPES) {
    const crops = r.uses.map((id) => plantMap.get(id));
    const body2 = `
<a class="back" href="/recipes/">&larr; All recipes</a>
<h1>${esc(r.title)}</h1>
<p class="muted">${esc(r.time)} &middot; ${esc(servesText(r.serves))}</p>
<p>Crops from your garden in this recipe: ${crops.map(plantLink).join('')}</p>
<h2>Ingredients</h2>
<ul>
  ${r.ingredients.map(([key, label, qty]) => {
    const grown = plantMap.has(key);
    return `<li class="${grown ? 'ing-have' : 'ing-need'}">${esc(qty)} ${esc(label)}${grown ? ' <span aria-hidden="true">&#127807;</span><span class="sr-only">(grown in the garden)</span>' : ''}</li>`;
  }).join('\n  ')}
</ul>
<p class="muted small-note">Green items are crops you can grow yourself.</p>
<h2>Method</h2>
<div class="recipe-steps"><ol>${r.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>`;
    const description = `${r.title}: ready in ${r.time}, ${servesText(r.serves)}. Made with home-grown ${joinAnd(crops.map((p) => lower(p.name)))}.`;
    const recipeLd = {
      '@context': 'https://schema.org', '@type': 'Recipe', name: r.title, description,
      recipeYield: r.serves,
      recipeIngredient: r.ingredients.map(([, label, qty]) => `${qty} ${label}`),
      recipeInstructions: r.steps.map((text) => ({ '@type': 'HowToStep', text })),
      url: `${SITE}/recipes/${r.id}/`,
    };
    const iso = isoDuration(r.time);
    if (iso) recipeLd.totalTime = iso;
    addPage({
      path: `/recipes/${r.id}/`, section: 'recipes', body: body2, title: r.title, description,
      ld: [recipeLd],
      crumbs: [['Home', '/'], ['Recipes', '/recipes/'], [r.title, `/recipes/${r.id}/`]],
    });
  }
}

function buildCalendar() {
  const head = MONTHS.map((m, i) => `<th scope="col" data-month="${i}">${m}</th>`).join('');
  const rows = PLANTS.map((p) => {
    const c = CALENDAR[p.id];
    const cells = MONTHS.map((_, m) => {
      const bits = [
        c.i[m] === '1' ? '<span class="bar ind"></span><span class="sr-only">Sow indoors</span>' : '',
        c.o[m] === '1' ? '<span class="bar out"></span><span class="sr-only">Sow or plant outside</span>' : '',
        c.h[m] === '1' ? '<span class="bar har"></span><span class="sr-only">Harvest</span>' : '',
      ].join('');
      return `<td>${bits}</td>`;
    }).join('');
    return `<tr data-calrow data-id="${p.id}" data-i="${c.i}" data-o="${c.o}" data-h="${c.h}" data-sizes="${p.sizes.join(' ')}"><th scope="row"><a href="/plants/${p.id}/"><span aria-hidden="true">${p.emoji}</span> ${esc(p.name)}</a></th>${cells}</tr>`;
  }).join('\n      ');
  const body = `
<h1>Planting Calendar</h1>
<p class="lead">When to plant indoors, plant or sow outside, and harvest, month by month. Based on typical UK timings, and you can enter your postcode to adjust them for your area. The current month is highlighted.</p>
${regionBar()}
<div class="legend">
  <span><i class="sw-ind"></i>Plant indoors</span>
  <span><i class="sw-out"></i>Sow or plant outside</span>
  <span><i class="sw-har"></i>Harvest</span>
</div>
<div class="filters" id="calFilters" hidden>
  <div></div>
  <div><label for="calSize">Garden size</label>
    <select id="calSize">
      <option value="all">All garden sizes</option>
      ${SIZES.map((s) => `<option value="${s.id}">${esc(s.title)}</option>`).join('\n      ')}
    </select>
  </div>
</div>
<div class="cal-wrap">
  <table class="cal">
    <caption class="sr-only">UK planting calendar by month</caption>
    <thead><tr><th scope="col">Crop</th>${head}</tr></thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</div>
<p class="muted small-note">Timings vary by region, frost dates and variety. Check the <a href="/plants/">Plant Guide</a> for details on each crop.</p>`;
  addPage({
    path: '/calendar/', section: 'calendar', body, title: 'UK Planting Calendar',
    description: `Month-by-month UK guide to when to sow indoors, sow or plant outside and harvest ${PLANTS.length} crops.`,
    crumbs: [['Home', '/'], ['Planting Calendar', '/calendar/']],
  });
}

function buildGuides() {
  const how = `
<h1>How to Grow</h1>
<p class="lead">A simple seven-step process that works in any garden.</p>
${HOWTO.map((s, i) => `<div class="step"><div class="num">${i + 1}</div><div><h3>${esc(s.title.replace(/^\d+\.\s*/, ''))}</h3><p>${esc(s.body)}</p></div></div>`).join('\n')}`;
  addPage({
    path: '/howto/', section: 'howto', body: how, title: 'How to Grow Your Own Food: 7 Simple Steps',
    description: 'A simple seven-step guide to growing your own food in any garden: planning, soil, sowing, watering, feeding, pest control and record keeping.',
    crumbs: [['Home', '/'], ['How-To', '/howto/']],
  });

  const harvest = `
<h1>Harvesting</h1>
<p class="lead">Pick at the right time, handle with care, and make the most of every crop. Have a glut? See <a href="/preserving/">ways to preserve and store every crop</a>.</p>
<div class="grid">
  ${HARVEST.map((h) => `<div class="card"><h3>${esc(h.title)}</h3><p class="muted card-note-flat">${esc(h.body)}</p></div>`).join('\n  ')}
</div>`;
  addPage({
    path: '/harvest/', section: 'harvest', body: harvest, title: 'Harvesting Tips',
    description: 'When and how to pick home-grown crops, how to tell they are ripe, and how to store and preserve the surplus.',
    crumbs: [['Home', '/'], ['Harvesting', '/harvest/']],
  });
}

/* ---------- preserving: every storage method, grouped by type ---------- */
const STORE_GROUPS = [
  ['freeze', 'Freezing', 'Freeze raw, blanched or cooked crops in portions.', /freez/i],
  ['dry', 'Drying', 'Dry herbs, fruit, seeds and beans for the cupboard.', /^dry|dried|dehydr|^(coriander|fennel) seed|^seeds$|^flakes|^lovage salt|^herb blends/i],
  ['pickle', 'Pickling and fermenting', 'Vinegar pickles, brines, sauerkraut and kimchi-style ferments.', /pickl|ferment|^salt|brine/i],
  ['preserves', 'Jams, chutneys and bottling', 'Sweet and savoury preserves, jellies and bottled fruit.', /jam|jelly|chutney|relish|compote|membrillo|quince cheese|marmalade|bottle|preserve/i],
  ['drinks', 'Cordials, syrups and infusions', 'Cordials, juices, liqueurs, and herbs steeped in vinegar, oil, honey or sugar.', /cordial|syrup|juice|perry|wine|liqueur|infus|vinegar|candy|honey|sugar|steep|oil|butter|sachet|pesto|paste/i],
  ['cooked', 'Cooked dishes to keep', 'Soups, sauces and ready meals made from a glut.', /soup|sauce|coulis|cook|braise|roast|stuffed|blend|make a|make into|salsa|sorbet|marinat/i],
  ['cool', 'Cool storing and curing', 'Crops that keep for months in a shed, garage or cool room.', /cool store|cure|ripen|heel|store in|room temp|store the|dry and store/i],
  ['fridge', 'Fridge', 'Short-term storage for the week ahead.', /fridge/i],
  ['fresh', 'Leave in the ground or pick fresh', 'Crops that store best on the plant, or that you can grow on demand.', /.*/],
];
function buildPreserving() {
  const groups = STORE_GROUPS.map(([id, title, blurb]) => ({ id, title, blurb, items: [] }));
  for (const p of PLANTS) {
    for (const [method, how, keeps] of STORAGE[p.id]) {
      const g = groups[STORE_GROUPS.findIndex((x) => x[3].test(method))];
      g.items.push({ p, method, how, keeps });
    }
  }
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const jump = groups.map((g) => `<a class="chip" href="#${g.id}">${esc(g.title)} (${g.items.length})</a>`).join('\n  ');
  const sections = groups.map((g) => {
    g.items.sort((a, b) => a.p.name.localeCompare(b.p.name));
    const lis = g.items.map(({ p, method, how, keeps }) => `<li data-store data-search="${esc((p.name + ' ' + method + ' ' + how).toLowerCase())}"><a href="/plants/${p.id}/#usage-and-storage"><strong>${esc(p.name)}</strong></a> <span class="muted">${esc(method)}.</span> ${esc(how)} <span class="keeps">Good for: ${esc(keeps)}.</span></li>`).join('\n');
    return `<section class="store-group" id="${g.id}" data-store-group>
<h2>${esc(g.title)}</h2>
<p class="muted">${esc(g.blurb)}</p>
<ul class="store-ul">
${lis}
</ul>
</section>`;
  }).join('\n');
  const body = `
<h1>Preserving and Storing Your Harvest</h1>
<p class="lead">Too much ready at once? Find a way to keep it. ${total} storage ideas across ${PLANTS.length} crops, grouped by method. Each links back to the crop's page.</p>
<div class="filter-panel" id="storeFilters" hidden>
  <div class="filter-search"><label for="storeSearch">Search for a crop or method</label><input type="search" id="storeSearch" placeholder="For example: runner beans, chutney, freeze"></div>
  <p class="filter-status"><span id="storeCount" aria-live="polite"></span> <button type="button" class="chip chip-reset" id="storeReset" hidden>Clear search</button></p>
</div>
<nav class="chip-group jump" aria-label="Jump to a method">
  ${jump}
</nav>
${sections}
<div class="empty" id="storeEmpty" hidden>Nothing matches that search. Try a crop name such as tomato, or a method such as pickle.</div>
<p class="muted small-note">Storage times are a guide. Use clean jars and containers, and follow tested guidance for bottling or canning low-acid foods. If in doubt, throw it out.</p>`;
  addPage({
    path: '/preserving/', section: 'preserving', body, title: 'Preserving and Storing Your Harvest',
    description: `${total} ways to freeze, dry, pickle, ferment, jar and store the surplus from ${PLANTS.length} home-grown crops, grouped by method.`,
    crumbs: [['Home', '/'], ['Preserving', '/preserving/']],
  });
}

function build404() {
  const body = `
<h1>Page not found</h1>
<p class="lead">Sorry, we could not find that page. It may have moved, or the link may be wrong.</p>
<div class="grid">
  ${NAV.map(([label, href]) => `<div class="card"><h3>${label}</h3><a href="${href}">Go to ${label} &rarr;</a></div>`).join('\n  ')}
</div>`;
  outFile('/404.html', layout({
    path: '/404.html', section: '', body, noindex: true, title: 'Page not found',
    description: 'This page could not be found.',
  }));
}

function buildSupportFiles() {
  const today = new Date().toISOString().slice(0, 10);
  const urls = pages.map((p) => `  <url><loc>${SITE}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n');
  writeFileSync(join(DIST, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
  writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
}

/* ---------- run ---------- */
validate();
rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, 'assets'), { recursive: true });

for (const f of ['style.css', 'site.js']) {
  const buf = readFileSync(join(ROOT, 'src/assets', f));
  assetVersion[f] = createHash('sha1').update(buf).digest('hex').slice(0, 8);
  writeFileSync(join(DIST, 'assets', f), buf);
}
cpSync(join(ROOT, 'src/assets/favicon.svg'), join(DIST, 'favicon.svg'));
cpSync(join(ROOT, 'static'), DIST, { recursive: true });

await writePlantImages();
buildHome();
buildSizes();
buildPlants();
buildRecipes();
buildPests();
buildPreserving();
buildMyGarden();
buildCalendar();
buildGuides();
build404();
buildSupportFiles();

console.log(`Built ${pages.length} pages + 404 into dist/ (site URL: ${SITE})`);
