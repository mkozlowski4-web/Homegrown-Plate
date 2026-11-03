/* Homegrown Plate static site generator.
   Reads the data in src/data, writes a real HTML page for every section, crop,
   garden size and recipe into dist/, plus sitemap.xml, robots.txt and a 404 page.
   No dependencies: run with `node build.mjs` (or `npm run build`). */
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PLANTS } from './src/data/plants.mjs';
import { HERBS } from './src/data/plants/herbs.mjs';
import { MORE_HERBS } from './src/data/plants/more-herbs.mjs';
import { SIZES } from './src/data/sizes.mjs';
import { RECIPES } from './src/data/recipes.mjs';
import { CARE } from './src/data/care.mjs';
import { STORAGE } from './src/data/storage.mjs';
import { ZONES, AREA_ZONE } from './src/data/zones.mjs';
import { WEEKEND_JOBS } from './src/data/weekend-jobs.mjs';
import { GLOSSARY } from './src/data/glossary.mjs';
import { PICKS, WHY, SOIL, BUY, YEAR } from './src/data/beginners.mjs';
import { KIDS_NOTES, PROJECTS as KID_PROJECTS, RECIPES as KID_RECIPES } from './src/data/kids.mjs';
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
/* Kids mode shows only fruit and veg that are not rated Hard: herbs, edible flowers and herb-like leaves are hidden. */
const KID_HIDE = new Set([...HERBS, ...MORE_HERBS].map((p) => p.id).concat(['chives', 'sorrel']).concat(PLANTS.filter((p) => p.difficulty === 'Hard').map((p) => p.id)));
const kh = (p) => (KID_HIDE.has(p.id) ? ' kid-hide' : '');
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
  for (const [size, bySun] of Object.entries(PICKS)) {
    for (const [sun, ids] of Object.entries(bySun)) {
      for (const id of ids) {
        const p = plantMap.get(id);
        if (!p) { errors.push(`Beginner pick ${id} is not a crop`); continue; }
        if (p.difficulty !== 'Easy') errors.push(`Beginner pick ${id} is not rated Easy`);
        if (!p.sizes.includes(size)) errors.push(`Beginner pick ${id} does not suit a ${size} garden`);
        if (!p.sun.includes(sun)) errors.push(`Beginner pick ${id} does not suit ${sun}`);
        if (!WHY[id]) errors.push(`Beginner pick ${id} needs a line in WHY`);
      }
    }
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
  ['Beginners', '/beginners/', 'beginners'],
  ['Garden Sizes', '/sizes/', 'sizes'],
  ['Plant Guide', '/plants/', 'plants'],
  ['Planting Calendar', '/calendar/', 'calendar'],
  ['Harvesting', '/harvest/', 'harvest'],
  ['Preserving', '/preserving/', 'preserving'],
  ['Recipes', '/recipes/', 'recipes'],
  ['Pests & Diseases', '/pests/', 'pests'],
  ['This Weekend', '/this-weekend/', 'weekend'],
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
  const SHORT = { 'Planting Calendar': 'Calendar' };
  const PRIMARY_NAV = new Set(['plants', 'calendar', 'recipes', 'preserving', 'garden']);
  const nav = NAV.filter(([, , key]) => PRIMARY_NAV.has(key)).map(([label, href, key]) => `<a${key === 'garden' ? ' class="nav-cta"' : ''} href="${href}"${key === section ? ' aria-current="page"' : ''}>${SHORT[label] || label}</a>`).join('\n      ');
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
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<meta name="theme-color" content="#2d6a4f">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Homegrown Plate">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<script src="/assets/theme.js?v=${assetVersion['theme.js']}"></script>
<link rel="stylesheet" href="/assets/style.css?v=${assetVersion['style.css']}">
${ld.map(jsonLd).join('\n')}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-bar">
    <a class="brand" href="/" aria-label="Homegrown Plate, home"><img class="brand-mark" src="/favicon.svg" width="44" height="44" alt=""><span class="brand-text"><span class="brand-name">Homegrown <span>Plate</span></span><small class="brand-tag">Grow it. Cook it. Keep it.</small></span></a>
    <a class="acct-link" href="/account/" aria-label="Account: sign in or create an account" title="Account"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg><span class="acct-dot" hidden></span></a>
    <button type="button" class="kids-pill" data-kids-toggle aria-pressed="false" title="Switch kids mode on or off" hidden><span class="kp-icon" aria-hidden="true">🧒</span><span class="kids-switch-label">Kids mode</span><span class="kp-track" aria-hidden="true"><span class="knob"></span></span></button>
    <button type="button" class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="siteNav" hidden><span class="burger" aria-hidden="true"></span>Menu</button>
    <nav class="site-nav" id="siteNav" aria-label="Main">
      <a class="nav-home" href="/"${section === 'home' ? ' aria-current="page"' : ''}>Home</a>
      <a class="nav-acct" href="/account/"${section === 'account' ? ' aria-current="page"' : ''}>Account</a>
      ${nav}
      <button type="button" class="nav-kids" data-kids-toggle aria-pressed="false" hidden><span class="kp-icon" aria-hidden="true">🧒</span><span class="kids-switch-label">Kids mode</span><span class="kp-track" aria-hidden="true"><span class="knob"></span></span></button>
    </nav>
  </div>
</header>

<main class="wrap" id="main" tabindex="-1">
${body}
</main>

<footer class="site-footer">
  <div class="wrap foot-grid">
    <div class="foot-about"><strong class="foot-brand">Homegrown Plate</strong><p>Growing your own food in any size of garden. Always check local frost dates and sowing times for your area.</p>
      <button type="button" class="foot-kids" data-kids-toggle aria-pressed="false" hidden><span class="kp-icon" aria-hidden="true">🧒</span><span class="kids-switch-label">Kids mode</span></button></div>
    <nav class="foot-col" aria-label="Grow"><strong>Grow</strong><a href="/plants/">Plant guide</a><a href="/calendar/">Planting calendar</a><a href="/this-weekend/">This weekend</a><a href="/what-to-sow/">What to sow</a><a href="/sizes/">Garden sizes</a><a href="/pests/">Pests and diseases</a><a href="/harvest/">Harvesting</a></nav>
    <nav class="foot-col" aria-label="Cook and keep"><strong>Cook and keep</strong><a href="/recipes/">Recipes</a><a href="/preserving/">Preserving</a><a href="/what-to-preserve/">What to preserve</a><a href="/kids/">Growing with kids</a></nav>
    <nav class="foot-col" aria-label="Start here"><strong>Start here</strong><a href="/beginners/">Beginner&rsquo;s guide</a><a href="/howto/">Grow in 7 steps</a><a href="/glossary/">Gardening words</a><a href="/kit/">Essential kit</a><a href="/install/">Get the app</a></nav>
    <nav class="foot-col" aria-label="Site"><strong>Site</strong><a href="/about/">About</a><a href="/contact/">Contact</a><a href="/account/">Account</a><a href="/privacy/">Privacy</a><a href="/affiliate-disclosure/">Affiliate disclosure</a></nav>
  </div>
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
const plantLink = (p) => `<a href="/plants/${p.id}/" class="tag tag-link${kh(p)}">${p.emoji} ${esc(p.name)}</a>`;


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
  const chips = [`${p.sun.map((id) => `${sunLevel.get(id).icon} ${esc(sunLevel.get(id).label)}`).join(', ')}`, `${esc(p.difficulty)}`, harvestTime ? esc(harvestTime[1]) : ''].filter(Boolean).map((c) => `<span class="chip">${c}</span>`).join('');
  return `<section class="plant-top" aria-label="${esc(p.name)} at a glance">
  ${media.replace('class="gc-media"', 'class="pt-media"')}
  <div class="pt-body">
    <nav class="crumb" aria-label="Breadcrumb"><a href="/plants/">Plant Guide</a> <span aria-hidden="true">/</span> ${esc(p.name)}</nav>
    <h1>${esc(p.name)}</h1>
    <p class="latin">${esc(p.latin)}</p>
    <p class="pt-chips">${chips}</p>
    <div class="pt-cal">
      <div class="mbar" data-i="${cal.i}" data-o="${cal.o}" data-h="${cal.h}">
        <div class="mrow mhead"><span class="mlabel"></span><span class="mcells" aria-hidden="true">${[...MONTH_LETTERS].map((c, k) => `<b data-m="${k}">${c}</b>`).join('')}</span></div>
        ${rows.map(([label, bits, cls]) => `<div class="mrow m-${cls}" data-row="${cls}"><span class="mlabel">${label}</span><span class="mcells" aria-hidden="true">${cells(bits)}</span><span class="sr-only">${esc(monthRanges(bits))}</span></div>`).join('\n        ')}
      </div>
      ${regionBar()}
    </div>
    <p class="garden-add-row"><button type="button" class="btn-garden" data-garden-add="${p.id}" data-name="${esc(p.name)}" hidden>+ Add ${esc(p.name)} to my garden</button> <a class="garden-link" href="/my-garden/" hidden>Open my garden</a></p>
    <p class="pt-sizes muted">Suits: ${p.sizes.map((id) => esc(sizeMap.get(id).short)).join(', ')}.</p>
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
      <p class="card-tags">${items.slice(0, 6).map(plantLink).join('')}${items.length > 6 ? `<a class="tag tag-link more" href="/calendar/">+${items.length - 6} more</a>` : ''}${items.length === 0 ? '<span class="muted">Nothing this month: a good time to plan and tidy.</span>' : ''}</p></div>`;
    return `<div class="month-panel" data-month-panel="${m}"${m === nowMonth ? '' : ' hidden'}>
    <h2 class="month-title">In the garden in <span data-month-name>${name}</span></h2>
    <div class="month-cols">${list(sow, 'Sow or plant')}${list(harvest, 'Harvest')}</div>
    <p><a href="/calendar/">See the full planting calendar &rarr;</a> &middot; <a href="/what-to-sow/${monthSlug(m)}/">What to sow in ${name}</a> &middot; <a href="/what-to-preserve/${monthSlug(m)}/">What to preserve</a></p>
  </div>`;
  }).join('\n  ');

  const heroPhotos = ['tomato', 'strawberry', 'courgette', 'potato'].map((id) => { const p = plantMap.get(id); const ph = PHOTOS.get(id); return p && ph ? `<a href="/plants/${id}/" tabindex="-1"><img src="${ph.small}" width="240" height="240" alt="" loading="eager" decoding="async"><span>${esc(p.name)}</span></a>` : ''; }).join('\n  ');
  const popular = ['tomato', 'potato', 'strawberry', 'courgette', 'bean', 'carrot'].map((id) => plantMap.get(id)).filter(Boolean);
  const popularCards = popular.map((p) => `<a href="/plants/${p.id}/" class="card card-link pop-card${kh(p)}">${plantImg(p)}<h3>${esc(p.name)}</h3><span class="tag">${esc(p.difficulty)}</span></a>`).join('\n  ');
  const featuredRecipes = ['summer-pudding', 'pizza-margherita', 'butternut-squash-soup', 'apple-blackberry-crumble'].map((id) => RECIPES.find((r) => r.id === id)).filter(Boolean);
  const recipeCards = featuredRecipes.map((r) => `<a href="/recipes/${r.id}/" class="card card-link">
    <h3>${esc(r.title)}</h3>
    <p class="muted card-meta">${esc(r.time)} &middot; ${esc(servesText(r.serves))}</p>
    <p class="card-tags">${r.uses.slice(0, 3).map((u) => { const p = plantMap.get(u); return `<span class="tag${kh(p)}">${p.emoji} ${esc(p.name)}</span>`; }).join('')}</p>
  </a>`).join('\n  ');
  const easyCount = PLANTS.filter((p) => p.difficulty === 'Easy').length;

  const tomatoPhoto = PHOTOS.get('tomato');
  const heroPhoto = tomatoPhoto ? `<div class="hero-photo"><img src="${tomatoPhoto.src}" width="560" height="440" alt="${esc(tomatoPhoto.alt)}" fetchpriority="high" decoding="async"></div>` : '';
  const startImg = (id) => { const ph = PHOTOS.get(id); return ph ? `<img src="${ph.src}" width="400" height="220" alt="" loading="lazy" decoding="async">` : `<img src="/img/plants/${id}.svg" width="400" height="220" alt="" loading="lazy">`; };
  const kidsCards = KID_PROJECTS.map((k) => `<a class="kid-mini" href="/kids/#${k.id}"><span class="kid-emoji" aria-hidden="true">${k.emoji}</span><strong>${esc(k.title)}</strong><span>${esc(k.wait)}</span></a>`).join('\n    ');
  const kidsHomeBlock = `<section class="kids-home" aria-label="Kids mode">
  <div class="kids-hero">
    <p class="kids-sparkle" aria-hidden="true">🌱 ☀️ 🐛 🌻 🍓</p>
    <h1>Let’s grow something amazing!</h1>
    <p>Plant a seed, watch it grow, and then eat what you grew. Pick a project and get your hands dirty!</p>
    <p class="kids-actions"><a class="btn-big" href="/kids/#projects">Pick a project</a> <a class="btn-big alt" href="/kids/#recipes">Yummy recipes</a></p>
  </div>
  <div class="kid-mini-grid">
    ${kidsCards}
  </div>
  <p class="muted small-note">Grown-ups: these projects need a helper. Read the <a href="/kids/#grownups">safety notes</a>.</p>
</section>`;
  const body = `
${kidsHomeBlock}
<section class="hero hero2">
 <div class="hero-copy">
  <p class="eyebrow">Grow it. Cook it. Keep it.</p>
  <h1>Grow your own food, whatever your space.</h1>
  <p class="hero-sub">Planting guides, recipes and storage tips for ${PLANTS.length} crops, timed for where you live in the UK.</p>
  <form class="hero-search" action="/plants/" method="get" role="search">
    <label class="sr-only" for="heroSearch">Search the plant guide</label>
    <input type="search" id="heroSearch" name="q" placeholder="Search crops, for example tomato or mint" autocomplete="off">
    <button type="submit" class="btn">Search</button>
  </form>
  <p class="size-chips"><span>I garden on a</span> ${SIZES.map((z) => `<a class="chip" href="/sizes/${z.id}/">${esc(z.short)}</a>`).join(' ')}</p>
 </div>
 ${heroPhoto}
</section>

<section class="week" aria-label="This week in the garden">
${regionBar('homeRegion')}
<div class="week-grid">
${weekendPanel()}
<div class="month-box" id="thisMonth">
  ${monthPanels}
</div>
</div>
</section>

<section class="start">
<h2>Start here</h2>
<div class="start-grid">
  <a class="start-card" href="/plants/">${startImg('courgette')}<h3>Grow</h3><p>Sowing, care and harvest for ${PLANTS.length} crops, with advice that fits your garden size.</p></a>
  <a class="start-card" href="/recipes/">${startImg('strawberry')}<h3>Cook</h3><p>${RECIPES.length} recipes built around what is ready in your garden right now.</p></a>
  <a class="start-card" href="/preserving/">${startImg('carrot')}<h3>Keep</h3><p>Freeze, dry, pickle and store a surplus so nothing goes to waste.</p></a>
</div>
</section>

<section class="popular">
<div class="sec-head"><h2>Popular crops</h2><a href="/plants/">Browse all ${PLANTS.length} &rarr;</a></div>
<div class="pop-grid">
  ${popularCards}
</div>
</section>

<section class="band">
  <div><h2>New to growing?</h2><p>Start with ${easyCount} easy crops and a seven-step guide from plan to first harvest.</p></div>
  <p class="band-actions"><a class="btn" href="/beginners/">Beginner&rsquo;s guide</a> <a class="chip" href="/plants/?diff=easy">Easy crops</a></p>
</section>
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
    plants: PLANTS.map((p) => ({ k: KID_HIDE.has(p.id) ? 1 : 0, id: p.id, n: p.name, e: p.emoji, d: p.difficulty, i: CALENDAR[p.id].i, o: CALENDAR[p.id].o, h: CALENDAR[p.id].h, img: PHOTOS.get(p.id)?.small || `/img/plants/${p.id}.svg`, c: careFor(p.id) })),
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
<p class="lead">Add the crops you grow and see what to sow, plant and harvest each month, plus recipes for whatever is ready. Your garden is saved in this browser, so no sign-up is needed. Want it on every device? <a href="/account/">Create a free account</a>.</p>
<div class="callout acct-prompt" data-acct-prompt hidden><strong>Keep your garden on every device.</strong> Create a free account and your crops, ticked-off jobs and area are saved for you. <a class="btn-small" href="/account/">Sign up or sign in</a></div>
<p class="muted acct-saved" data-acct-saved hidden>&#10003; Your garden is saved to your account. <a href="/account/">Account</a></p>
${regionBar()}
<noscript><p class="empty">My Garden needs JavaScript. You can still browse the <a href="/calendar/">planting calendar</a> and the <a href="/plants/">plant guide</a>.</p></noscript>
<div id="myGarden" data-src="/assets/garden-data.json?v=${ver}" hidden>
  <div class="tabs" role="tablist" aria-label="My Garden">
    <button type="button" role="tab" class="tab" id="tab-weekend" aria-controls="panel-weekend" data-tab="weekend">This weekend</button>
    <button type="button" role="tab" class="tab" id="tab-months" aria-controls="panel-months" data-tab="months">Jobs by month</button>
    <button type="button" role="tab" class="tab" id="tab-crops" aria-controls="panel-crops" data-tab="crops">My crops <span class="count" id="gTabCount"></span></button>
  </div>
  <div role="tabpanel" id="panel-weekend" aria-labelledby="tab-weekend" data-tabpanel="weekend" hidden>
    <div class="wk-personal card" id="wkPersonal" data-garden="/assets/garden-data.json?v=${ver}" hidden aria-live="polite"></div>
    <p class="wk-cta-line" id="wkCta" hidden><a href="/account/">Sign in</a> for a plan built around your crops and your local forecast.</p>
    <div id="wkGeneric" data-compact>
${wkSections()}
    </div>
    <p><a class="btn-small" href="/this-weekend/">See the full weekend plan</a></p>
  </div>
  <div role="tabpanel" id="panel-crops" aria-labelledby="tab-crops" data-tabpanel="crops" hidden>
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
  </div>
  <div role="tabpanel" id="panel-months" aria-labelledby="tab-months" data-tabpanel="months" hidden>
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
  </div>
</div>
<script src="/assets/weekend.js?v=${assetVersion['weekend.js']}" defer></script>`;
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
  ${crops.map((p) => `<div class="card${kh(p)}">${plantImg(p)}<h3>${esc(p.name)}</h3><span class="tag">${esc(p.difficulty)}</span><span class="tag warm">${esc(sunLevel.get(minSun(p)).label)}</span><span class="tag blue">${esc(sizeMap.get(minSize(p)).short)}</span><p class="muted card-note">${esc(p.facts.find(([l]) => l === 'Sow')?.[1] || p.sunText)}</p><a href="/plants/${p.id}/">Grow ${esc(p.name)} &rarr;</a></div>`).join('\n  ')}
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


/* Meta description that is specific to each crop: when to sow and harvest, and how hard it is. */
function plantDescription(p, cal) {
  const sow = p.facts.find(([l]) => l === 'Sow');
  const harvest = monthRanges(cal.h);
  const clip = (t, n) => (t.length <= n ? t : t.slice(0, t.lastIndexOf(' ', n - 1)).replace(/[,;:.]$/, '') + '…');
  const parts = [`How to grow ${lower(p.name)} in the UK.`, sow ? `Sow ${clip(sow[1].replace(/\.$/, ''), 60)}.` : '', harvest ? `Harvest ${harvest}.` : '', `${p.difficulty} to grow. ${p.sunText}.`];
  return clip(parts.filter(Boolean).join(' '), 158);
}
function buildPlants() {
  const cards = PLANTS.map((p) => `<a href="/plants/${p.id}/" class="card card-link${kh(p)}" data-plant data-sizes="${p.sizes.join(' ')}" data-sun="${p.sun.join(' ')}" data-diff="${esc(lower(p.difficulty))}" data-search="${esc(lower(`${p.name} ${p.latin} ${(p.groups || []).map((g) => g.name).join(' ')}`))}">
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

    const toc = [['info', 'About'], ['how-to-sow', p.sowTitle || 'How to sow'], ['how-to-grow', 'How to grow'], ['how-to-harvest', 'How to harvest'], ['usage-and-storage', 'Use and storage'], ...(careFor(p.id).length ? [['care-h', 'Care through the year']] : []), ...(related.length ? [['cook', `Cook with ${lower(p.name)}`]] : [])];
    const body2 = `
${growCard(p, cal)}
<div class="plant-body">
<nav class="plant-toc" aria-label="On this page"><strong>On this page</strong>${toc.map(([id, label]) => `<a href="#${id}">${esc(label)}</a>`).join('')}</nav>
<div class="plant-main">
<p class="acc-controls"><button type="button" class="chip" id="accToggle" hidden>Expand all sections</button></p>
${accordion('info', 'Info', infoBody, true)}
${accordion('how-to-sow', p.sowTitle || 'How to sow', sowBody)}
${accordion('how-to-grow', 'How to grow', growBody)}
${accordion('how-to-harvest', 'How to harvest', harvestBody)}
${accordion('usage-and-storage', 'Usage and storage', useBody)}
${careSection(p)}
<p class="muted small-note">Timings are typical for the UK and vary with region, frost dates and variety. See the <a href="/calendar/">planting calendar</a> for every crop at a glance.</p>
${related.length ? `<h2 id="cook">Cook with ${esc(lower(p.name))}</h2>
<div class="grid">${related.map((r) => `<div class="card"><h3>${esc(r.title)}</h3><p class="muted">${esc(r.time)} &middot; ${esc(servesText(r.serves))}</p><a href="/recipes/${r.id}/">View recipe &rarr;</a></div>`).join('')}</div>` : ''}
</div>
</div>`;
    addPage({
      path: `/plants/${p.id}/`, section: 'plants', body: glossify(body2), title: `How to grow ${p.name} in the UK`,
      description: plantDescription(p, cal),
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


/* "Grow it yourself" panel on each recipe, built from the calendar and storage data. */
function recipeGrowBlock(r, crops) {
  const when = (bits) => monthRanges(bits);
  const rows = crops.map((p) => {
    const c = CALENDAR[p.id];
    const sow = [c.i.includes('1') ? `indoors ${when(c.i)}` : '', c.o.includes('1') ? `outside ${when(c.o)}` : ''].filter(Boolean).join(', ');
    const h = when(c.h);
    return `<li class="${KID_HIDE.has(p.id) ? 'kid-hide' : ''}"><a href="/plants/${p.id}/"><strong>${esc(p.name)}</strong></a>: ${sow ? `sow ${sow}` : 'plant when the soil is workable'}${h ? `; harvest ${h}` : ''}. ${esc(p.difficulty)} to grow. <a href="/plants/${p.id}/#how-to-sow">How to sow ${esc(lower(p.name))}</a></li>`;
  }).join('\n');
  let together = '';
  if (crops.length > 1) {
    const both = [...Array(12).keys()].map((m) => (crops.every((p) => CALENDAR[p.id].h[m] === '1') ? '1' : '0')).join('');
    const span = when(both);
    together = span
      ? `<p>The home-grown ingredients here are all ready to pick at the same time in ${esc(span)}, so that is the easiest time to cook it fresh.</p>`
      : '<p>These crops are not all ready at the same time. Freeze, dry or store one of them so you can make this when the others are in season.</p>';
  }
  const keep = crops.filter((p) => STORAGE[p.id] && STORAGE[p.id].length).map((p) => {
    const [method, how, keeps] = STORAGE[p.id][0];
    return `<li class="${KID_HIDE.has(p.id) ? 'kid-hide' : ''}"><a href="/plants/${p.id}/#usage-and-storage"><strong>${esc(p.name)}</strong></a>: ${esc(lower(method))}. ${esc(how)} Good for: ${esc(keeps)}.</li>`;
  }).join('\n');
  return `<h2>Grow it yourself</h2>
<ul>
${rows}
</ul>
${together}${keep ? `\n<h3>Too much to use at once?</h3>\n<ul class="store-ul">\n${keep}\n</ul>\n<p class="muted small-note">Timings are typical for the UK and vary by region. Storage times are a guide.</p>` : ''}`;
}
function buildRecipes() {
  const withRecipes = PLANTS.filter((p) => RECIPES.some((r) => r.uses.includes(p.id)));
  const cards = RECIPES.map((r) => `<a href="/recipes/${r.id}/" class="card card-link" data-recipe data-uses="${r.uses.join(' ')}" data-cat="${RECIPE_CATEGORY_OF.get(r.id)}">
    <h3>${esc(r.title)}</h3>
    <p class="muted card-meta">${esc(r.time)} &middot; ${esc(servesText(r.serves))}</p>
    <p class="card-tags">${r.uses.map((u) => { const p = plantMap.get(u); return `<span class="tag${kh(p)}">${p.emoji} ${esc(p.name)}</span>`; }).join('')}</p>
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
<div class="recipe-steps"><ol>${r.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol></div>
${r.tips && r.tips.length ? `<h2>Tips</h2>\n${tipsList(r.tips)}` : ''}
${recipeGrowBlock(r, crops)}`;
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
    return `<tr class="${KID_HIDE.has(p.id) ? 'kid-hide' : ''}" data-calrow data-id="${p.id}" data-i="${c.i}" data-o="${c.o}" data-h="${c.h}" data-sizes="${p.sizes.join(' ')}"><th scope="row"><a href="/plants/${p.id}/"><span aria-hidden="true">${p.emoji}</span> ${esc(p.name)}</a></th>${cells}</tr>`;
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
  <div><label class="check"><input type="checkbox" id="calMine"> Show only crops in my garden</label> <a class="garden-link" href="/my-garden/">Open my garden</a></div>
  <div><label for="calSize">Garden size</label>
    <select id="calSize">
      <option value="all">All garden sizes</option>
      ${SIZES.map((s) => `<option value="${s.id}">${esc(s.title)}</option>`).join('\n      ')}
    </select>
  </div>
</div>
<p class="empty" id="calEmpty" hidden>No crops to show. Add crops with the + button beside each name, or clear the filters.</p>
<div class="cal-wrap">
  <table class="cal">
    <caption class="sr-only">UK planting calendar by month</caption>
    <thead><tr><th scope="col">Crop</th>${head}</tr></thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</div>
<p class="muted small-note">Timings vary by region, frost dates and variety. Check the <a href="/plants/">Plant Guide</a> for details on each crop. Prefer a list? See <a href="/what-to-sow/">what to sow each month</a> and <a href="/what-to-preserve/">what to preserve each month</a>.</p>`;
  addPage({
    path: '/calendar/', section: 'calendar', body, title: 'UK Planting Calendar',
    description: `Month-by-month UK guide to when to sow indoors, sow or plant outside and harvest ${PLANTS.length} crops.`,
    crumbs: [['Home', '/'], ['Planting Calendar', '/calendar/']],
  });
}

function buildGuides() {
  const how = `
<h1>How to Grow</h1>
<p class="lead">A simple seven-step process that works in any garden. Brand new to this? Start with our <a href="/beginners/">beginner’s guide</a>.</p>
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
    const lis = g.items.map(({ p, method, how, keeps }) => `<li class="${KID_HIDE.has(p.id) ? 'kid-hide' : ''}" data-store data-search="${esc((p.name + ' ' + method + ' ' + how).toLowerCase())}"><a href="/plants/${p.id}/#usage-and-storage"><strong>${esc(p.name)}</strong></a> <span class="muted">${esc(method)}.</span> ${esc(how)} <span class="keeps">Good for: ${esc(keeps)}.</span></li>`).join('\n');
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

/* ---------- glossary links: the first use of each hard word on a plant page links to its plain-English meaning ---------- */
const GLOSS_AUTO = GLOSSARY.filter((g) => g.re).map((g) => ({ ...g, rx: new RegExp(g.re, g.re.includes('pH') || g.re.includes('F1') ? '' : 'i') }));
const GLOSS_SKIP = new Set(['a', 'button', 'summary', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'script', 'style', 'label', 'option', 'select', 'figcaption', 'dt', 'title']);
function glossify(html) {
  const seen = new Set();
  let skipName = null; let skipDepth = 0;
  return html.split(/(<[^>]+>)/).map((part) => {
    if (part.startsWith('<')) {
      const m = part.match(/^<(\/?)([a-z0-9]+)([^>]*)>/i);
      if (!m) return part;
      const closing = m[1] === '/'; const name = m[2].toLowerCase();
      if (skipName) { if (name === skipName) skipDepth += closing ? -1 : 1; if (skipDepth <= 0) skipName = null; return part; }
      if (!closing && (GLOSS_SKIP.has(name) || (name === 'span' && /class="[^"]*\b(?:tag|care-when|mlabel|keeps|count)\b/.test(m[3])) || (name === 'p' && /class="[^"]*\blatin\b/.test(m[3])))) {
        if (!part.endsWith('/>')) { skipName = name; skipDepth = 1; }
      }
      return part;
    }
    if (skipName || !part.trim()) return part;
    const hits = [];
    for (const g of GLOSS_AUTO) {
      if (seen.has(g.id)) continue;
      const mm = g.rx.exec(part);
      if (mm) hits.push({ start: mm.index, end: mm.index + mm[0].length, g });
    }
    if (!hits.length) return part;
    hits.sort((x, y) => x.start - y.start);
    let out = ''; let pos = 0;
    for (const h of hits) {
      if (h.start < pos) continue;
      seen.add(h.g.id);
      out += part.slice(pos, h.start) + `<a class="gloss" href="/glossary/#${h.g.id}" title="${esc(h.g.plain)}">${part.slice(h.start, h.end)}</a>`;
      pos = h.end;
    }
    return out + part.slice(pos);
  }).join('');
}


/* ---------- month by month: what to sow and what to preserve ---------- */
const SOW_NOTES = [
  'Mostly planning time. Order seed, chit potatoes and start the slowest crops, such as chillies and onions, on a bright windowsill or in a heated propagator.',
  'Still cold outside, so most sowing is indoors. Prepare beds when the soil is workable and plant bare-root fruit if the ground is not frozen or waterlogged.',
  'The sowing year starts properly. Soil is still cold, so use cloches or fleece for outdoor sowings and keep tender crops indoors.',
  'Soil is warming up. Sow hardy crops outside and keep sowing indoors, but protect everything tender from late frosts.',
  'Frosts fade, and tender crops can go out once the risk has passed in your area. Harden plants off for a week or two first.',
  'Peak planting for tender crops, plus successional sowings of salads and roots to keep the harvest going.',
  'Sow quick crops for autumn and winter. Keep watering and feeding, and pick little and often to keep plants cropping.',
  'A key month for sowing winter salads and hardy greens, and for planting out spring cabbage and overwintering onions.',
  'Last sowings of hardy crops, then plant garlic and onion sets as the soil is still warm. Clear spent crops and tidy beds.',
  'Garlic and broad beans can go in, and bare-root fruit planting begins. Protect remaining crops from the first frosts.',
  'Quiet outdoors. Plant bare-root fruit and garlic if the soil allows, and sow a few crops under cover.',
  'Rest and plan. Check stored crops, clean tools and pots, and order seed for next year.',
];
const PRES_NOTES = [
  'Eat or process what you stored in autumn first, and check for soft or sprouting crops. Little is fresh, so this is a time to use the freezer and the larder.',
  'Keep checking stored roots, apples and onions. Use the soft ones first and turn the preserves you made last summer into meals.',
  'Little to harvest outside, so use the larder. Check stored crops weekly and use up anything starting to sprout.',
  'The first spring crops arrive, with rhubarb and the earliest leaves. Freeze or cook rhubarb while it is young and tender.',
  'Early crops such as asparagus, radishes and salad leaves are best eaten fresh. Rhubarb and herbs can be frozen or dried.',
  'Strawberries, broad beans and peas are ready, and a glut can be frozen, made into jam or cooked and bottled.',
  'The busiest month for gluts. Freeze beans, peas and berries within hours of picking, and make jams, chutneys and pickles.',
  'Peak harvest, so preserve little and often. Tomatoes, courgettes, beans, plums and soft fruit all store well made into sauces, freezer packs and chutneys.',
  'Apples, pears, squash and the main potato and onion crops. Cure and store onions and squash, and make chutneys and juice from windfalls.',
  'Final harvests before frost. Lift root crops for store, wrap and store the best apples, and pick green tomatoes to ripen indoors.',
  'Check stored crops regularly and pickle or freeze the last of the root and brassica harvest.',
  'Most of the preserving is done. Use the larder and freezer, and keep an eye on stored fruit and veg.',
];
const n = (k, w) => `${k} ${w}${k === 1 ? '' : 's'}`;
const monthSlug = (m) => FULL_MONTHS[m].toLowerCase();
const monthNav = (base, cur) => `<nav class="chips" aria-label="Choose a month">${FULL_MONTHS.map((n, m) => `<a class="chip${m === cur ? ' on' : ''}" href="/${base}/${monthSlug(m)}/"${m === cur ? ' aria-current="page"' : ''}>${n.slice(0, 3)}</a>`).join('\n')}</nav>`;
const tagList = (items) => items.map(plantLink).join('');

/* ---------- garden jobs this weekend ---------- */
const WK_TAGS = { dry: 'Needs a dry day', wet: 'Fine in damp weather', indoor: 'Indoors or under cover', frost: 'Only if frost is forecast', any: 'Any weather' };
const wkItems = (m, withHalf = true) => WEEKEND_JOBS[m].map(([tag, text, half = 0]) =>
  `<li data-tag="${tag}" data-half="${half}">${esc(text)}${withHalf && half ? ` <span class="muted">(${half === 1 ? 'first half of the month' : 'second half of the month'})</span>` : ''} <span class="wk-tag wk-${tag}">${WK_TAGS[tag]}</span></li>`).join('\n');

const wkSections = () => FULL_MONTHS.map((name, m) => `<section data-wk-month="${m}" hidden>
  <h2>Jobs for a ${name} weekend</h2>
  <ul class="wk-list">
${wkItems(m)}
  </ul>
  <p class="wk-more"><a href="/weekend-jobs/${monthSlug(m)}/">All ${name} weekend jobs</a> &middot; <a href="/what-to-sow/${monthSlug(m)}/">What to sow in ${name}</a> &middot; <a href="/what-to-preserve/${monthSlug(m)}/">What to preserve in ${name}</a></p>
</section>`).join('\n');

/* Compact "this weekend" panel for the home page; weekend.js fills it in (UK jobs, or the signed-in plan). */
function weekendPanel() {
  const g = gardenData();
  return `<section class="card wk-home" id="weekendHome" aria-labelledby="wkHomeTitle">
  <h2 id="wkHomeTitle">Garden jobs this weekend</h2>
  <div class="wk-personal" id="wkPersonal" data-garden="/assets/garden-data.json?v=${g.ver}" hidden aria-live="polite"></div>
  <p class="wk-cta-line" id="wkCta" hidden><a href="/account/">Sign in</a> for a plan built around your crops and your local forecast.</p>
  <div id="wkGeneric" data-compact>
${wkSections()}
  </div>
  <p><a class="btn-small" href="/this-weekend/">See the full weekend plan</a></p>
</section>
<script src="/assets/weekend.js?v=${assetVersion['weekend.js']}" defer></script>`;
}

function buildWeekend() {
  for (const [m, jobs] of WEEKEND_JOBS.entries()) if (jobs.length < 6) throw new Error(`Weekend jobs for ${FULL_MONTHS[m]} are too thin`);
  const g = gardenData();
  const monthLinks = `<p class="chips-label muted">Jobs for each month:</p>${monthNav('weekend-jobs', -1)}`;
  const sections = wkSections();

  const body = `
<h1>Garden jobs this weekend</h1>
<p class="lead">What to do in the garden this weekend, for the time of year in the UK. Sign in for a plan built around your own crops and the weather forecast for your area.</p>
${regionBar('wkRegion')}
<noscript><p class="empty">This page needs JavaScript to pick the right month. Choose a month below instead.</p></noscript>
<section class="card wk-personal" id="wkPersonal" data-garden="/assets/garden-data.json?v=${g.ver}" hidden aria-live="polite"></section>
<div class="callout wk-cta" id="wkCta" hidden><strong>Want a plan for your garden?</strong> Create a free account and this page will use the crops in My Garden and the weather forecast for your area to sort this weekend&rsquo;s jobs by day. <a class="btn-small" href="/account/">Sign in or create an account</a></div>
<div id="wkGeneric">
${sections}
</div>
${monthLinks}
<p class="muted small-note">General advice for typical UK conditions. Adjust for your local frost dates and soil, and check the forecast before sowing or planting out.</p>
<script src="/assets/weekend.js?v=${assetVersion['weekend.js']}" defer></script>`;
  addPage({
    path: '/this-weekend/', section: 'weekend', body, title: 'Garden jobs this weekend in the UK',
    description: 'What to do in your UK garden this weekend: sowing, planting, harvesting and tidying jobs for the time of year, with a personal plan and forecast if you sign in.',
    crumbs: [['Home', '/'], ['This weekend', '/this-weekend/']],
  });
  for (const [m, name] of FULL_MONTHS.entries()) {
    const prev = (m + 11) % 12, next = (m + 1) % 12;
    const page = `
<h1>Garden jobs for a weekend in ${name}</h1>
<p class="lead">${esc(name)} jobs for the vegetable patch, fruit, herbs and greenhouse in a typical UK garden. Pick the ones that suit your weather and your plot.</p>
${monthNav('weekend-jobs', m)}
<ul class="wk-list">
${wkItems(m)}
</ul>
<p>Looking for sowing dates? See <a href="/what-to-sow/${monthSlug(m)}/">what to sow in ${name}</a> and <a href="/what-to-preserve/${monthSlug(m)}/">what to preserve in ${name}</a>.</p>
<p><a class="btn" href="/this-weekend/">Jobs for this weekend, with a plan for your garden</a></p>
<p><a href="/weekend-jobs/${monthSlug(prev)}/">&larr; ${FULL_MONTHS[prev]}</a> &middot; <a href="/weekend-jobs/${monthSlug(next)}/">${FULL_MONTHS[next]} &rarr;</a></p>`;
    addPage({
      path: `/weekend-jobs/${monthSlug(m)}/`, section: 'weekend', body: page, title: `Garden jobs for a weekend in ${name}`,
      description: `${WEEKEND_JOBS[m].slice(0, 3).map(([, t]) => t.replace(/\.$/, '').toLowerCase()).join('; ')}. Weekend garden jobs for ${name} in the UK.`,
      crumbs: [['Home', '/'], ['This weekend', '/this-weekend/'], [name, `/weekend-jobs/${monthSlug(m)}/`]],
    });
  }
}

function buildMonthly() {
  const byName = [...PLANTS].sort((a, b) => a.name.localeCompare(b.name, 'en-GB'));
  const has = (p, k, m) => CALENDAR[p.id][k][m] === '1';

  /* What to sow in <month> */
  FULL_MONTHS.forEach((name, m) => {
    const indoors = byName.filter((p) => has(p, 'i', m));
    const outside = byName.filter((p) => has(p, 'o', m));
    const harvest = byName.filter((p) => has(p, 'h', m));
    const prev = (m + 11) % 12, next = (m + 1) % 12;
    const section = (title, items, empty) => `<h2>${title} <span class="count">(${items.length})</span></h2>\n${items.length ? `<p class="card-tags">${tagList(items)}</p>` : `<p class="muted">${empty}</p>`}`;
    const body = `
<h1>What to sow and plant in ${name}</h1>
<p class="lead">${SOW_NOTES[m]}</p>
<p>In the UK in ${name}, ${indoors.length ? `${n(indoors.length, 'crop')} can be sown indoors` : 'there is little to sow indoors'}${outside.length ? `, ${outside.length} can be sown or planted outside` : ''} and ${harvest.length} ${harvest.length === 1 ? 'is' : 'are'} ready to harvest. Timings are typical for the UK and shift with your region, so <a href="/calendar/">enter your postcode on the planting calendar</a> to adjust them.</p>
${monthNav('what-to-sow', m)}
${section('Sow or start indoors', indoors, `Nothing needs sowing indoors in ${name}.`)}
${section('Sow or plant outside', outside, `Nothing to sow or plant outside in ${name}.`)}
${section('Ready to harvest', harvest, `Nothing is ready to harvest in ${name}. See what to <a href="/what-to-preserve/${monthSlug(m)}/">preserve in ${name}</a>.`)}
<p class="muted small-note">Tap any crop for full sowing, growing and harvesting advice.</p>
<p><a href="/what-to-sow/${monthSlug(prev)}/">&larr; ${FULL_MONTHS[prev]}</a> &middot; <a href="/what-to-sow/${monthSlug(next)}/">${FULL_MONTHS[next]} &rarr;</a> &middot; <a href="/what-to-preserve/${monthSlug(m)}/">What to preserve in ${name}</a> &middot; <a href="/calendar/">Full planting calendar</a></p>`;
    addPage({
      path: `/what-to-sow/${monthSlug(m)}/`, section: 'calendar', body, title: `What to sow and plant in ${name} (UK)`,
      description: `What to sow and plant in the UK in ${name}: ${n(indoors.length, 'crop')} to start indoors, ${outside.length} to sow or plant outside and ${harvest.length} to harvest.`,
      crumbs: [['Home', '/'], ['What to sow', '/what-to-sow/'], [name, `/what-to-sow/${monthSlug(m)}/`]],
    });
  });

  addPage({
    path: '/what-to-sow/', section: 'calendar', title: 'What to sow and plant each month (UK)',
    description: 'A month-by-month guide to what to sow, plant and harvest in the UK, with the crops to start indoors and outside each month.',
    crumbs: [['Home', '/'], ['What to sow', '/what-to-sow/']],
    body: `
<h1>What to sow and plant each month</h1>
<p class="lead">Pick a month to see what to sow indoors, what to sow or plant outside, and what is ready to harvest in the UK.</p>
<p><a class="btn" href="/what-to-sow/${monthSlug(new Date().getMonth())}/" data-this-month="what-to-sow">What to sow this month</a></p>
<div class="grid">${FULL_MONTHS.map((n, m) => {
      const sow = byName.filter((p) => has(p, 'i', m) || has(p, 'o', m)).length;
      return `<a href="/what-to-sow/${monthSlug(m)}/" class="card card-link"><h3>${n}</h3><p class="muted">${sow} crops to sow or plant, ${byName.filter((p) => has(p, 'h', m)).length} to harvest</p></a>`;
    }).join('')}</div>
<p class="muted small-note">Looking for something to do with a glut? See <a href="/what-to-preserve/">what to preserve each month</a> or the <a href="/calendar/">full planting calendar</a>.</p>`,
  });

  /* What to preserve in <month> */
  FULL_MONTHS.forEach((name, m) => {
    const next = (m + 1) % 12, prevM = (m + 11) % 12;
    const inSeason = byName.filter((p) => has(p, 'h', m));
    const soon = byName.filter((p) => has(p, 'h', next) && !has(p, 'h', m));
    const item = (p) => {
      const ways = STORAGE[p.id].slice(0, 3);
      return `<li class="${KID_HIDE.has(p.id) ? 'kid-hide' : ''}"><a href="/plants/${p.id}/#usage-and-storage"><strong>${esc(p.name)}</strong></a>: ${ways.map(([mt, how, keeps]) => `<span>${esc(mt.toLowerCase())}</span> (${esc(keeps)})`).join(', ')}</li>`;
    };
    const body = `
<h1>What to preserve and store in ${name}</h1>
<p class="lead">${PRES_NOTES[m]}</p>
<p>${inSeason.length ? `${n(inSeason.length, 'crop')} ${inSeason.length === 1 ? 'is' : 'are'} in season in the UK in ${name}. Here is how to keep each one for later.` : `Very little is harvested in the UK in ${name}, so this is a good month to use up what you have stored.`} Storage times are a guide. Use clean jars and containers, and follow tested guidance for bottling or canning low-acid foods.</p>
${monthNav('what-to-preserve', m)}
${inSeason.length ? `<h2>In season now <span class="count">(${inSeason.length})</span></h2>\n<ul class="store-ul">\n${inSeason.map(item).join('\n')}\n</ul>` : ''}
${soon.length ? `<h2>Coming in ${FULL_MONTHS[next]} <span class="count">(${soon.length})</span></h2>\n<p class="muted">Get jars, freezer bags and space ready for these.</p>\n<p class="card-tags">${tagList(soon)}</p>` : ''}
<p><a href="/what-to-preserve/${monthSlug(prevM)}/">&larr; ${FULL_MONTHS[prevM]}</a> &middot; <a href="/what-to-preserve/${monthSlug(next)}/">${FULL_MONTHS[next]} &rarr;</a> &middot; <a href="/what-to-sow/${monthSlug(m)}/">What to sow in ${name}</a> &middot; <a href="/preserving/">All preserving methods</a></p>`;
    addPage({
      path: `/what-to-preserve/${monthSlug(m)}/`, section: 'preserving', body, title: `What to preserve and store in ${name} (UK)`,
      description: `${inSeason.length ? `${n(inSeason.length, 'crop')} to freeze, dry, pickle or store in the UK in ${name}` : `How to use your stored harvest in ${name}`}, with the best way to keep each one.`,
      crumbs: [['Home', '/'], ['What to preserve', '/what-to-preserve/'], [name, `/what-to-preserve/${monthSlug(m)}/`]],
    });
  });

  addPage({
    path: '/what-to-preserve/', section: 'preserving', title: 'What to preserve and store each month (UK)',
    description: 'Month by month, which home-grown crops to freeze, dry, pickle or store in the UK, with the best way to keep each one.',
    crumbs: [['Home', '/'], ['What to preserve', '/what-to-preserve/']],
    body: `
<h1>What to preserve each month</h1>
<p class="lead">Pick a month to see which crops are in season and the best ways to keep them, from freezing to chutney.</p>
<p><a class="btn" href="/what-to-preserve/${monthSlug(new Date().getMonth())}/" data-this-month="what-to-preserve">What to preserve this month</a></p>
<div class="grid">${FULL_MONTHS.map((n, m) => `<a href="/what-to-preserve/${monthSlug(m)}/" class="card card-link"><h3>${n}</h3><p class="muted">${byName.filter((p) => has(p, 'h', m)).length} crops in season</p></a>`).join('')}</div>
<p class="muted small-note">See every method in one place on the <a href="/preserving/">preserving page</a>, or <a href="/what-to-sow/">what to sow each month</a>.</p>`,
  });
}

function buildGlossary() {
  const sorted = [...GLOSSARY].sort((a, b) => a.name.localeCompare(b.name, 'en-GB'));
  const body = `
<h1>Gardening Words Explained</h1>
<p class="lead">Plain-English meanings for the gardening words used on this site. On each plant page, the first time one of these words appears, you can tap it to come here.</p>
<dl class="glossary">
${sorted.map((g) => `<div class="gloss-item" id="${g.id}"><dt>${esc(g.name)}</dt><dd>${esc(g.plain)}</dd></div>`).join('\n')}
</dl>
<p class="muted small-note">Is a word missing or still confusing? Tell us and we will add it.</p>`;
  addPage({
    path: '/glossary/', section: 'glossary', body, title: 'Gardening Words Explained: a plain-English glossary',
    description: `Simple meanings for ${GLOSSARY.length} gardening words, from mulch and fleece to hardy, bolting and brassica.`,
    crumbs: [['Home', '/'], ['Glossary', '/glossary/']],
  });
}

function buildBeginners() {
  const sunInfo = { full: ['☀️', 'Full sun', '6 or more hours of direct sun'], partial: ['⛅', 'Partial shade', '3 to 6 hours of sun, or bright shade'], shade: ['☁️', 'Shade', 'Less than 3 hours of direct sun'] };
  const orBits = (a, b) => [...a].map((c, k) => (c === '1' || b[k] === '1' ? '1' : '0')).join('');
  const cropCard = (id) => {
    const p = plantMap.get(id); const c = CALENDAR[p.id];
    return `<a class="beg-crop card-link" href="/plants/${p.id}/">${plantImg(p)}<span class="beg-body"><strong>${esc(p.name)}</strong><span class="beg-why">${esc(WHY[id])}</span><span class="beg-when">Sow or plant: ${esc(monthRanges(orBits(c.i, c.o)) || 'see page')}</span></span></a>`;
  };
  const sizeSections = SIZES.map((sz) => `<section class="beg-size" data-bsize="${sz.id}">
  <h3>${sz.emoji} ${esc(sz.title)}</h3>
  <div class="beg-suns">
    ${Object.keys(sunInfo).map((sun) => `<div class="beg-sun" data-bsun="${sun}">
      <h4>${sunInfo[sun][0]} ${sunInfo[sun][1]} <span class="muted small-note">(${sunInfo[sun][2]})</span></h4>
      <div class="beg-crops">${PICKS[sz.id][sun].map(cropCard).join('')}</div>
      <p class="beg-add-row" data-add-row hidden><button type="button" class="btn-garden" data-add-crops="${PICKS[sz.id][sun].join(',')}">+ Add these ${PICKS[sz.id][sun].length} to my garden</button> <span class="beg-added" data-add-msg aria-live="polite"></span></p>
    </div>`).join('\n    ')}
  </div>
</section>`).join('\n');
  const stepList = (steps) => `<ol class="soil-steps">${steps.map(([h, t]) => `<li><strong>${esc(h)}.</strong> ${esc(t)}</li>`).join('')}</ol>`;
  const soilAcc = Object.entries(SOIL).map(([id, v]) => accordion(`soil-${id}`, v.title, `${stepList(v.steps)}<p class="callout"><strong>Tip:</strong> ${esc(v.tip)}</p>`, id === 'ground')).join('\n');
  const li = (items) => `<ul class="tips">${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  const buyBody = `
<h3>Everyone needs</h3>
<ul class="buy-list">${BUY.essentials.map(([n, t]) => `<li><strong>${esc(n)}.</strong> ${esc(t)}</li>`).join('')}</ul>
<h3>Then add, for your garden size</h3>
<div class="grid buy-grid">${SIZES.map((sz) => `<div class="card"><h4>${sz.emoji} ${esc(sz.short)}</h4>${li(BUY.bySize[sz.id])}</div>`).join('')}</div>
<div class="grid buy-grid">
  <div class="card"><h4>Buy later, if you need it</h4>${li(BUY.later)}</div>
  <div class="card"><h4>Skip for now</h4>${li(BUY.skip)}</div>
</div>
<h3>A rough first-year budget</h3>
<table class="budget"><tbody>${BUY.budget.map(([a, b]) => `<tr><th scope="row">${esc(a)}</th><td>${esc(b)}</td></tr>`).join('')}</tbody></table>
<p class="muted small-note">These are rough guides only and prices vary. You can spend much less by sharing seeds, reusing pots and making your own compost.</p>`;
  const yearBody = `<ol class="year-list">${YEAR.map(([w, t]) => `<li><strong>${esc(w)}</strong><span>${esc(t)}</span></li>`).join('')}</ol>`;
  const body = `
<h1>Beginner’s Guide to Growing Your Own</h1>
<p class="lead">Never grown anything before? This guide shows you what to grow for your garden size and light, how to get your soil ready, and exactly what to buy. Start small and you will be eating your own food within weeks.</p>
<nav class="chip-group jump" aria-label="On this page">
  <a class="chip" href="#crops">1. Choose your crops</a>
  <a class="chip" href="#soil">2. Prepare your soil</a>
  <a class="chip" href="#buy">3. What to buy</a>
  <a class="chip" href="#year">4. Your first year</a>
</nav>
<div class="grid grid-3 rules">
  <div class="card"><h3>Start small</h3><p class="muted">Pick 3 to 5 crops, not 20. A small, well-looked-after patch beats a big, neglected one.</p></div>
  <div class="card"><h3>Water steadily</h3><p class="muted">Most beginner failures are from too little water in dry spells. Soak well, less often.</p></div>
  <div class="card"><h3>Pick often</h3><p class="muted">Regular picking keeps beans, courgettes and salad leaves producing for longer.</p></div>
</div>

<h2 id="crops">1. Choose your crops</h2>
<p>Every crop below is rated <strong>Easy</strong>, and is chosen because it forgives mistakes and gives you something to eat quickly. Pick your garden size and the sunlight your space gets. Not sure? See our <a href="/sizes/">garden sizes guide</a>.</p>
<div class="filter-panel" id="begFilters" hidden>
  <fieldset class="chip-group"><legend>Garden size</legend>
    ${chip('bsize', 'all', 'All sizes', true)}
    ${SIZES.map((sz) => chip('bsize', sz.id, esc(sz.short))).join('\n    ')}
  </fieldset>
  <fieldset class="chip-group"><legend>Sunlight</legend>
    ${chip('bsun', 'all', 'Any sunlight', true)}
    ${Object.entries(sunInfo).map(([id, v]) => chip('bsun', id, `${v[0]} ${v[1]}`)).join('\n    ')}
  </fieldset>
</div>
${sizeSections}
<p class="callout"><strong>Next:</strong> found a few you like? <a href="/my-garden/">Add them to My Garden</a> and we will tell you what to sow, plant and harvest each month.</p>

<h2 id="soil">2. Prepare your soil</h2>
<p>Good soil is the biggest thing you can do to help your crops. Choose the way you will be growing.</p>
${soilAcc}

<h2 id="buy">3. What to buy</h2>
${buyBody}

<h2 id="year">4. Your first year</h2>
${yearBody}
<p>Want the basics in seven short steps? Read <a href="/howto/">how to grow your own food</a>. Check the <a href="/calendar/">planting calendar</a> and enter your postcode to see dates for your area. Stuck on a word? See <a href="/glossary/">gardening words explained</a>, and <a href="/pests/">pests and diseases</a> if something goes wrong.</p>`;
  addPage({
    path: '/beginners/', section: 'beginners', body: glossify(body), title: 'Beginner’s Guide: what to grow, how to prepare soil and what to buy',
    description: 'A first-time grower’s guide to the easiest crops for your garden size and sunlight, how to prepare soil for planting, and a simple shopping list.',
    crumbs: [['Home', '/'], ['Beginner’s Guide', '/beginners/']],
  });
}

function buildKids() {
  for (const k of KID_PROJECTS) if (k.crop && !plantMap.has(k.crop)) throw new Error(`Kids project ${k.id} links to unknown crop ${k.crop}`);
  for (const r of KID_RECIPES) for (const u of r.uses) if (!plantMap.has(u)) throw new Error(`Kids recipe ${r.id} uses unknown crop ${u}`);
  const projects = KID_PROJECTS.map((k, n) => `<article class="kid-project" id="${k.id}">
  <header><span class="kid-emoji" aria-hidden="true">${k.emoji}</span><div><h3>${esc(k.title)}</h3><p class="muted">${esc(k.blurb)}</p></div></header>
  <p class="kid-facts"><span class="kid-badge">⏱ ${esc(k.wait)}</span> <span class="kid-badge">📅 ${esc(k.start)}</span> <span class="kid-badge">⭐ ${esc(k.level)}</span></p>
  <h4>You will need</h4>
  <ul class="kid-need">${k.need.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
  <h4>Let’s go!</h4>
  <ol class="kid-steps">${k.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
  <p class="kid-fact"><strong>Did you know?</strong> ${esc(k.fact)}</p>
  <p class="kid-adult"><strong>Grown-up helper:</strong> ${esc(k.adult)}</p>
  ${k.crop ? `<p><a href="/plants/${k.crop}/">More about growing ${esc(lower(plantMap.get(k.crop).name))} &rarr;</a></p>` : ''}
</article>`).join('\n');
  const recipes = KID_RECIPES.map((r) => `<article class="kid-project kid-recipe" id="${r.id}">
  <header><span class="kid-emoji" aria-hidden="true">${r.emoji}</span><div><h3>${esc(r.title)}</h3><p class="muted">Great with: ${esc(r.made)}</p></div></header>
  <p class="kid-facts"><span class="kid-badge">🍽 ${esc(r.serves)}</span> <span class="kid-badge">⏱ ${esc(r.time)}</span></p>
  <h4>You will need</h4>
  <ul class="kid-need">${r.ingredients.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
  <h4>Let’s cook!</h4>
  <ol class="kid-steps">${r.steps.map((x) => (x.startsWith('👩‍🍳') ? `<li class="adult-job"><span class="adult-tag">Grown-up job</span> ${esc(x.replace('👩‍🍳', '').trim())}</li>` : `<li>${esc(x)}</li>`)).join('')}</ol>
  <p class="muted small-note">Uses: ${r.uses.map((u) => `<a href="/plants/${u}/">${esc(plantMap.get(u).name)}</a>`).join(', ')}</p>
</article>`).join('\n');
  const body = `
<h1>Growing Food with Kids</h1>
<p class="lead">Six easy projects to grow your own food, and six recipes to cook it. Written for children aged about 6 to 10, with a grown-up helper.</p>
<nav class="chip-group jump" aria-label="On this page">
  <a class="chip" href="#grownups">For grown-ups</a>
  <a class="chip" href="#projects">Grow projects</a>
  <a class="chip" href="#recipes">Recipes</a>
</nav>
<section class="callout kids-notes" id="grownups">
  <h2>For grown-ups</h2>
  <ul class="tips">${KIDS_NOTES.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>
</section>
<h2 id="projects">Grow it!</h2>
<p>Start with the cress, which is ready in a week. Then pick a project for the time of year.</p>
<div class="kid-list">
${projects}
</div>
<h2 id="recipes">Cook it!</h2>
<p>When your crops are ready, turn them into something yummy. A grown-up does the jobs marked <span class="adult-tag">Grown-up job</span>.</p>
<div class="kid-list">
${recipes}
</div>
<p class="callout"><strong>Ready for more?</strong> Try the <a href="/beginners/">beginner’s guide</a> to pick crops for your garden, or <a href="/my-garden/">build your own garden</a>.</p>`;
  addPage({
    path: '/kids/', section: 'kids', body, title: 'Growing Food with Kids: easy projects and recipes',
    description: 'Six simple grow-your-own projects for children, from cress heads to a potato treasure bucket, plus six child-friendly recipes to cook what you grow.',
    crumbs: [['Home', '/'], ['Growing with Kids', '/kids/']],
  });
}

function buildInstall() {
  const body = `
<h1>Get the Homegrown Plate app</h1>
<p class="lead">Add Homegrown Plate to your phone, tablet or computer. It opens full screen like an app, loads faster, and the pages you have visited still work when you have no signal in the garden.</p>
<div class="callout" data-install-box hidden>
  <p><strong>Ready to install.</strong> One tap and it is on your home screen.</p>
  <p><button type="button" class="btn-big" data-install-btn>Install the app</button></p>
</div>
<p class="muted" data-installed hidden>You are already using the installed app. Nothing more to do.</p>
<h2>How to install</h2>
<div class="grid">
  <div class="card"><h3>iPhone or iPad</h3><ol><li>Open this site in <strong>Safari</strong>.</li><li>Tap the <strong>Share</strong> button (the square with an arrow).</li><li>Choose <strong>Add to Home Screen</strong>, then <strong>Add</strong>.</li></ol></div>
  <div class="card"><h3>Android</h3><ol><li>Open this site in <strong>Chrome</strong>.</li><li>Tap the install button above, or the <strong>three dots</strong> menu.</li><li>Choose <strong>Install app</strong> (or <strong>Add to Home screen</strong>).</li></ol></div>
  <div class="card"><h3>Computer</h3><ol><li>Open this site in <strong>Chrome</strong> or <strong>Edge</strong>.</li><li>Click the install icon at the right of the address bar, or use the browser menu.</li><li>Choose <strong>Install</strong>.</li></ol></div>
</div>
<h2>What you get</h2>
<ul>
  <li>Quick links on the app icon to My Garden, the Planting Calendar and Growing with Kids.</li>
  <li>Pages you have already opened work offline. Your garden is saved on your device.</li>
  <li>No account and no cost. It is the same site, just easier to reach.</li>
</ul>`;
  addPage({
    path: '/install/', section: '', body, title: 'Get the Homegrown Plate app',
    description: 'Install Homegrown Plate on your phone, tablet or computer for quick access and offline use in the garden.',
    crumbs: [['Home', '/'], ['Get the app', '/install/']],
  });
}

const CONTACT_EMAIL = 'hello@homegrownplate.co.uk'; /* forwarded to the owner's inbox with Cloudflare Email Routing */

function buildAccount() {
  const field = (id, label, type, ac, extra = '') => `<p class="acct-field"><label for="${id}">${label}</label><input id="${id}" name="${id}" type="${type}" autocomplete="${ac}" ${extra}></p>`;
  const body = `
<h1>Your account</h1>
<noscript><p class="empty">Accounts need JavaScript. You can still use the whole site without one.</p></noscript>
<div id="acct" hidden>
  <section id="acctOut">
    <p class="lead">Save your garden to a free account and it follows you: the same crops, ticked-off jobs and area on your phone, tablet and computer, even after you clear your browser. You do not need an account to use the site.</p>
    <div class="acct-tabs" role="tablist" aria-label="Account">
      <button type="button" class="chip" role="tab" id="tabIn" aria-selected="true" aria-controls="formIn">Sign in</button>
      <button type="button" class="chip" role="tab" id="tabUp" aria-selected="false" aria-controls="formUp">Create account</button>
    </div>
    <form id="formIn" class="card acct-form" novalidate>
      <h2>Sign in</h2>
      ${field('inEmail', 'Email address', 'email', 'username', 'required maxlength="254"')}
      ${field('inPass', 'Password', 'password', 'current-password', 'required maxlength="128"')}
      <p class="acct-error" role="alert" data-error></p>
      <button class="btn-big" type="submit">Sign in</button>
    </form>
    <form id="formUp" class="card acct-form" novalidate hidden>
      <h2>Create account</h2>
      ${field('upEmail', 'Email address', 'email', 'username', 'required maxlength="254"')}
      ${field('upPass', 'Choose a password', 'password', 'new-password', 'required minlength="10" maxlength="128" aria-describedby="upHelp"')}
      <p class="muted small-note" id="upHelp">At least 10 characters. A few random words works well. <strong>Keep it safe:</strong> we cannot reset a forgotten password yet.</p>
      <p class="muted small-note">We save your email, a scrambled version of your password, and your garden. Nothing else, and we never sell it. See the <a href="/privacy/">privacy page</a>.</p>
      <p class="acct-error" role="alert" data-error></p>
      <button class="btn-big" type="submit">Create my account</button>
    </form>
  </section>
  <section id="acctIn" hidden>
    <p class="lead">Signed in as <strong id="acctEmail"></strong>. <span id="acctStatus" class="muted">Your garden is saved to your account.</span></p>
    <div class="card"><h2>Your garden</h2><p>Changes you make on any device are saved automatically and appear on your other devices next time you open the site.</p><p><a class="btn-small" href="/my-garden/">Go to My Garden</a></p><p data-admin-link hidden><a class="btn-small" href="/admin/">Open the visitor dashboard</a></p></div>
    <div class="card"><h2>Look after your account</h2>
      <p><button type="button" class="chip" id="acctOutBtn">Sign out</button> <a class="chip" href="/api/export" download>Download my data</a></p>
      <details><summary>Change password</summary>
        <form id="formPw" class="acct-form" novalidate>
          ${field('pwCur', 'Current password', 'password', 'current-password', 'required maxlength="128"')}
          ${field('pwNew', 'New password (10+ characters)', 'password', 'new-password', 'required minlength="10" maxlength="128"')}
          <p class="acct-error" role="alert" data-error></p>
          <button class="chip" type="submit">Change password</button>
        </form>
        <p class="muted small-note">Changing it signs you out on your other devices.</p>
      </details>
      <details><summary>Delete my account</summary>
        <form id="formDel" class="acct-form" novalidate>
          <p>This permanently deletes your email, password and saved garden from our servers. The garden on this device stays. It cannot be undone.</p>
          ${field('delPass', 'Your password', 'password', 'current-password', 'required maxlength="128"')}
          <p class="acct-error" role="alert" data-error></p>
          <button class="chip chip-danger" type="submit">Delete everything</button>
        </form>
      </details>
    </div>
  </section>
</div>`;
  addPage({
    path: '/account/', section: 'account', body, title: 'Your account: save your garden on every device',
    description: 'Create a free Homegrown Plate account to keep your garden, ticked-off jobs and area on all your devices.',
    crumbs: [['Home', '/'], ['Account', '/account/']],
  });
}

function buildPrivacy() {
  const body = `
<h1>Privacy</h1>
<p class="lead">Homegrown Plate is a small independent gardening site for the UK. This page explains in plain words what we keep and why.</p>
<h2>If you just browse</h2>
<p>You do not need an account. Your garden, area, ticked-off jobs and kids mode setting are kept only in your own browser, and nothing about them is sent to us.</p>
<h2>If you create an account</h2>
<p>We keep:</p>
<ul>
  <li>your <strong>email address</strong>, to recognise you when you sign in;</li>
  <li>a <strong>scrambled copy of your password</strong> (we cannot read your password);</li>
  <li>your <strong>garden</strong>: the crops you added, jobs you ticked off, your region and the first letters of your postcode (never your full postcode), and whether kids mode is on;</li>
  <li>a small sign-in record on each device so you stay signed in for up to 30 days, and short-lived technical records (such as failed sign-in attempts) to block password guessing.</li>
</ul>
<p>We use this only to give you your saved garden. We do not sell it, share it for advertising, or use it to profile you. The site sets no advertising or tracking cookies; the only cookie is the sign-in cookie, which exists only if you sign in.</p>
<h2>Weather forecasts</h2>
<p>If you are signed in, the weekend jobs page asks our server for the forecast for your region (one of six, such as the Midlands or central Scotland). Our server gets it from MET Norway, using a fixed city for each region, so MET Norway never receives your location, postcode or any detail about you. Forecasts are kept for a few hours to avoid repeat requests.</p>
<h2>Counting visits</h2>
<p>We count how many people visit and which pages and features they use, so we can see what is useful. This is done without cookies and without storing anything on your device. We do not save your IP address or browser details. Each visit is given a short anonymous code that is made from your connection and browser together with a random value that is thrown away every day, so we cannot recognise you from one day to the next or build a profile of you. We also keep your rough country, the type of device (phone, tablet or computer), and the website that sent you here, if any. If your browser sends a Do Not Track or Global Privacy Control signal, we do not count you at all.</p>
<h2>Where it is kept</h2>
<p>Account data is stored with Cloudflare, who also host this site, in a database set up in their European region.</p>
<h2>Your choices</h2>
<ul>
  <li><strong>See your data:</strong> sign in and choose <a href="/account/">Download my data</a>.</li>
  <li><strong>Delete your data:</strong> sign in and choose Delete my account. Everything we hold about you is removed straight away.</li>
  <li><strong>Change your mind:</strong> you can stop using an account at any time and keep using the site without one.</li>
</ul>
${CONTACT_EMAIL ? `<p>Questions about your data? Email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>` : ''}
<p class="muted small-note">If you are unhappy with how your data is handled you can also complain to the Information Commissioner's Office (ico.org.uk).</p>`;
  addPage({
    path: '/privacy/', section: '', body, title: 'Privacy: what Homegrown Plate keeps and why',
    description: 'What Homegrown Plate stores if you create an account, why, and how to download or delete it.',
    crumbs: [['Home', '/'], ['Privacy', '/privacy/']],
  });
}

function buildAbout() {
  const mail = `<a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>`;
  addPage({
    path: '/about/', section: '', title: 'About Homegrown Plate',
    description: 'Homegrown Plate is a free UK guide to growing, cooking and storing your own food, for every size of garden.',
    crumbs: [['Home', '/'], ['About', '/about/']],
    body: `
<h1>About Homegrown Plate</h1>
<p class="lead">Homegrown Plate is a free UK guide to growing your own food, cooking it and keeping it, whether you have a windowsill or an allotment.</p>
<h2>What you will find here</h2>
<ul>
  <li><a href="/plants/">${PLANTS.length} crops</a> with plain-English advice on sowing, growing, harvesting and storing, written for UK conditions.</li>
  <li>A <a href="/calendar/">planting calendar</a> and <a href="/my-garden/">My Garden</a>, which adjust dates for your part of the country.</li>
  <li><a href="/recipes/">${RECIPES.length} recipes</a> for the things you grow, plus ideas for <a href="/preserving/">preserving a surplus</a>.</li>
  <li>A <a href="/beginners/">beginner's guide</a>, and a <a href="/kids/">section for growing with children</a>.</li>
</ul>
<h2>How to use it</h2>
<p>Sowing and harvest times are typical for the UK and are adjusted for your area using the first letters of your postcode. They are a good guide, not a guarantee: always check your own frost dates, soil and weather. The guidance is general. For specific plant health problems or food safety questions, check with a trusted source such as the RHS or your local garden centre.</p>
<h2>Free to use</h2>
<p>You never need an account to use the site. An optional free <a href="/account/">account</a> saves your garden across devices. The site may in future earn a small commission from some links, which never changes what we recommend. Read the <a href="/affiliate-disclosure/">affiliate disclosure</a> and the <a href="/privacy/">privacy page</a>.</p>
<h2>Get in touch</h2>
<p>Spotted a mistake, or have a crop or recipe you would like to see? Email ${mail}. See the <a href="/contact/">contact page</a>.</p>`,
  });

  addPage({
    path: '/contact/', section: '', title: 'Contact Homegrown Plate',
    description: 'How to contact Homegrown Plate about corrections, suggestions, your data or working together.',
    crumbs: [['Home', '/'], ['Contact', '/contact/']],
    body: `
<h1>Contact</h1>
<p class="lead">Email ${mail}. A real person reads it, and we aim to reply within a few days.</p>
<h2>Good reasons to write</h2>
<ul>
  <li><strong>Corrections.</strong> If something on a crop or recipe page looks wrong, please tell us which page and what you think it should say.</li>
  <li><strong>Suggestions.</strong> A crop, recipe or storage method you would like to see.</li>
  <li><strong>Your data.</strong> You can download or delete everything we hold yourself from your <a href="/account/">account page</a>. If you cannot get in, email us from the address you signed up with.</li>
  <li><strong>Working together.</strong> Garden and kitchen brands are welcome to get in touch. See the <a href="/affiliate-disclosure/">affiliate disclosure</a> for how we handle links and sponsorship.</li>
</ul>
<p class="muted small-note">We cannot give personal advice on plant diseases or medical or food-allergy questions.</p>`,
  });

  addPage({
    path: '/affiliate-disclosure/', section: '', title: 'Affiliate disclosure',
    description: 'How Homegrown Plate may earn money from links, and how that never affects what it recommends.',
    crumbs: [['Home', '/'], ['Affiliate disclosure', '/affiliate-disclosure/']],
    body: `
<h1>Affiliate disclosure</h1>
<p class="lead">Homegrown Plate is free to use. This page explains how the site may earn money, so you can judge our advice with the full picture.</p>
<h2>Where things stand today</h2>
<p>At the time of writing, the site does <strong>not</strong> contain affiliate links or paid placements.</p>
<h2>If we add affiliate links</h2>
<ul>
  <li>Some links to products, such as seeds, tools or kitchen equipment, may become <strong>affiliate links</strong>. If you buy through one, we may earn a small commission <strong>at no extra cost to you</strong>.</li>
  <li>Pages with affiliate links will say so clearly near the links.</li>
  <li>Commission never decides what we recommend. We suggest what is useful for the job, and we will not recommend something just because it pays.</li>
  <li>Growing advice and recipes stay free and complete without buying anything.</li>
</ul>
<h2>Sponsored content</h2>
<p>If we are ever paid or given products to feature something, we will label it clearly as sponsored.</p>
<h2>Questions</h2>
<p>Email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>`,
  });

  const kit = (items) => `<ul class="kit-list">${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
  addPage({
    path: '/kit/', section: '', title: 'Essential gardening kit for every garden size',
    description: 'A simple checklist of the basic tools, compost and supplies you need to start growing food, for balconies, small, medium and large gardens.',
    crumbs: [['Home', '/'], ['Essential kit', '/kit/']],
    body: `
<h1>Essential kit for growing your own food</h1>
<p class="lead">You do not need much to start. Here is a simple checklist, then the extras that suit each size of garden. Buy a few good basics rather than a big set.</p>
<h2>The basics, for everyone</h2>
<div class="grid">
${BUY.essentials.map(([a, b]) => `  <div class="card"><h3>${esc(a)}</h3><p class="muted">${esc(b)}</p></div>`).join('\n')}
</div>
<h2>Add these for your garden size</h2>
<div class="grid">
${['balcony', 'small', 'medium', 'large'].map((id) => { const sz = sizeMap.get(id); return `  <div class="card"><h3>${sz.emoji} ${esc(sz.title)}</h3>${kit(BUY.bySize[id])}<p class="muted small-note">Typical start-up cost: ${esc(BUY.budget.find(([n]) => n.toLowerCase().startsWith(sz.short.toLowerCase().split(' ')[0]))?.[1] || 'varies')}</p><a href="/sizes/${id}/">Crops for this size &rarr;</a></div>`; }).join('\n')}
</div>
<h2>Nice to have later</h2>
${kit(BUY.later)}
<h2>Best left out at first</h2>
${kit(BUY.skip)}
<p>New to this? Start with the <a href="/beginners/">beginner's guide</a>.</p>`,
  });
}

function buildAdmin() {
  const body = `
<h1>Dashboard</h1>
<p class="muted">Visits and interactions with bots and scrapers filtered out. Only the site owner can see the figures.</p>
<div class="chip-group" role="group" aria-label="Time range">
  <button type="button" class="chip" data-days="7" aria-pressed="false">7 days</button>
  <button type="button" class="chip" data-days="30" aria-pressed="true">30 days</button>
  <button type="button" class="chip" data-days="90" aria-pressed="false">90 days</button>
  <button type="button" class="chip" data-days="365" aria-pressed="false">1 year</button>
</div>
<noscript><p class="empty">The dashboard needs JavaScript.</p></noscript>
<div id="dash" aria-live="polite"></div>
<script src="/assets/admin.js?v=${assetVersion['admin.js']}" defer></script>`;
  outFile('/admin/', layout({ path: '/admin/', section: '', body, noindex: true, title: 'Dashboard', description: 'Site analytics for the owner.' }));
}

function buildOffline() {
  const body = `
<h1>You are offline</h1>
<p class="lead">This page has not been saved on your device yet, and there is no signal right now. Pages you have visited before still work.</p>
<div class="grid">
  <div class="card"><h3>My Garden</h3><a href="/my-garden/">Open My Garden &rarr;</a></div>
  <div class="card"><h3>Planting Calendar</h3><a href="/calendar/">Open the calendar &rarr;</a></div>
  <div class="card"><h3>Home</h3><a href="/">Back to the home page &rarr;</a></div>
</div>`;
  outFile('/offline/', layout({ path: '/offline/', section: '', body, noindex: true, title: 'You are offline', description: 'You are offline.' }));
}

/* Service worker: precaches the shell, serves pages network-first (falling back to the saved copy, then the offline page)
   and everything else stale-while-revalidate. The cache name changes whenever the shell files change. */
function buildServiceWorker() {
  const shell = ['/', '/offline/', '/my-garden/', '/calendar/', '/favicon.svg',
    ...['style.css', 'site.js', 'theme.js'].map((f) => `/assets/${f}?v=${assetVersion[f]}`)];
  const version = createHash('sha1').update(shell.join('|')).digest('hex').slice(0, 8);
  writeFileSync(join(DIST, 'sw.js'), `/* Homegrown Plate service worker (generated by build.mjs) */
const CACHE = 'hp-${version}';
const SHELL = ${JSON.stringify(shell)};
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('hp-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || r.headers.has('range') || u.pathname === '/sw.js' || u.pathname.startsWith('/api/')) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(r, copy)); } return res; })
      .catch(() => caches.match(r).then((m) => m || caches.match('/offline/'))));
    return;
  }
  e.respondWith(caches.open(CACHE).then((c) => c.match(r).then((hit) => {
    const net = fetch(r).then((res) => { if (res.ok) c.put(r, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  })));
});
`);
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

for (const f of ['style.css', 'site.js', 'theme.js', 'admin.js', 'weekend.js']) {
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
buildMonthly();
buildWeekend();
buildGlossary();
buildBeginners();
buildKids();
buildInstall();
buildAccount();
buildPrivacy();
buildAbout();
buildAdmin();
buildMyGarden();
buildCalendar();
buildGuides();
build404();
buildOffline();
buildSupportFiles();
buildServiceWorker();

console.log(`Built ${pages.length} pages + 404 into dist/ (site URL: ${SITE})`);
