/* Homegrown Plate static site generator.
   Reads the data in src/data, writes a real HTML page for every section, crop,
   garden size and recipe into dist/, plus sitemap.xml, robots.txt and a 404 page.
   No dependencies: run with `node build.mjs` (or `npm run build`). */
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PLANTS } from './src/data/plants.mjs';
import { SIZES } from './src/data/sizes.mjs';
import { RECIPES } from './src/data/recipes.mjs';
import { HOWTO, HARVEST } from './src/data/guide.mjs';
import { MONTHS, CALENDAR } from './src/data/calendar.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, 'dist');
const SITE = (process.env.SITE_URL || 'https://www.homegrownplate.co.uk').replace(/\/$/, '');
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

/* ---------- data checks: fail the build on typos ---------- */
function validate() {
  const errors = [];
  const warnings = [];
  const dupes = (arr, label) => {
    const seen = new Set();
    for (const x of arr) {
      if (seen.has(x.id)) errors.push(`Duplicate ${label} id: ${x.id}`);
      seen.add(x.id);
      if (!/^[a-z0-9-]+$/.test(x.id)) errors.push(`Invalid ${label} id (use lowercase letters, numbers, hyphens): ${x.id}`);
    }
  };
  dupes(PLANTS, 'plant'); dupes(SIZES, 'size'); dupes(RECIPES, 'recipe');
  for (const p of PLANTS) {
    for (const s of p.sizes) if (!sizeMap.has(s)) errors.push(`Plant ${p.id} lists unknown size "${s}"`);
    if (!CALENDAR[p.id]) errors.push(`Plant ${p.id} has no entry in calendar.mjs`);
  }
  for (const [id, c] of Object.entries(CALENDAR)) {
    if (!plantMap.has(id)) errors.push(`calendar.mjs has entry for unknown plant "${id}"`);
    for (const k of ['i', 'o', 'h']) if (!/^[01]{12}$/.test(c[k] || '')) errors.push(`Calendar ${id}.${k} must be 12 characters of 0/1`);
  }
  for (const s of SIZES) {
    for (const id of s.grow) {
      const p = plantMap.get(id);
      if (!p) errors.push(`Size ${s.id} recommends unknown plant "${id}"`);
      else if (!p.sizes.includes(s.id)) warnings.push(`Size ${s.id} recommends ${id}, but ${id} does not list ${s.id} in its sizes`);
    }
  }
  for (const r of RECIPES) for (const id of r.uses) if (!plantMap.has(id)) errors.push(`Recipe ${r.id} uses unknown plant "${id}"`);
  warnings.forEach((w) => console.warn(`warning: ${w}`));
  if (errors.length) {
    console.error(errors.map((e) => `error: ${e}`).join('\n'));
    process.exit(1);
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
  ['Recipes', '/recipes/', 'recipes'],
];

function layout({ title, description, path, body, section, ld = [], noindex = false, fullTitle = false }) {
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
${noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${url}">`}
<meta name="theme-color" content="#2d6a4f">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:title" content="${esc(pageTitle)}">
<meta property="og:description" content="${esc(description)}">
${noindex ? '' : `<meta property="og:url" content="${url}">\n`}<meta property="og:locale" content="en_GB">
<meta name="twitter:card" content="summary">
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

/* ---------- pages ---------- */
function buildHome() {
  const body = `
<section class="hero">
  <h1>Grow your own food, whatever your garden size</h1>
  <p>From a single windowsill to a full allotment, find out what to plant, how to look after it, how to harvest it, and what to cook with it.</p>
  <a class="btn" href="/sizes/">Find my garden size</a>
</section>
<h2>Explore</h2>
<div class="grid">
  ${SIZES.map((s) => `<div class="card size-card ${s.cls}">${emoji(s.emoji)}<h3>${esc(s.title)}</h3><p class="muted">${esc(s.desc)}</p><a href="/sizes/${s.id}/">See ideas &rarr;</a></div>`).join('\n  ')}
</div>
<h2>Quick start</h2>
<div class="grid">
  <div class="card"><h3>Plant Guide</h3><p class="muted">${PLANTS.length} crops with sowing, care, pests and harvest.</p><a href="/plants/">Browse plants &rarr;</a></div>
  <div class="card"><h3>Planting Calendar</h3><p class="muted">What to sow and harvest, month by month.</p><a href="/calendar/">See the calendar &rarr;</a></div>
  <div class="card"><h3>How-To</h3><p class="muted">Seven steps from plan to first harvest.</p><a href="/howto/">Read the guide &rarr;</a></div>
  <div class="card"><h3>Harvesting</h3><p class="muted">Know when and how to pick for best flavour.</p><a href="/harvest/">Learn to harvest &rarr;</a></div>
  <div class="card"><h3>Recipes</h3><p class="muted">${RECIPES.length} recipes built around what you grow.</p><a href="/recipes/">Start cooking &rarr;</a></div>
</div>`;
  addPage({
    path: '/', section: 'home', fullTitle: true, body,
    title: `${SITE_NAME}: grow your own food in any size of garden`,
    description: `Grow your own food on a balcony, patio or allotment. UK sowing and harvesting guides, a planting calendar, storage tips and recipes for ${PLANTS.length} crops.`,
    ld: [{ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: `${SITE}/` }],
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
    <a href="/sizes/${s.id}/">Full guide &rarr;</a>
  </div>`).join('\n  ')}
</div>`;
  addPage({
    path: '/sizes/', section: 'sizes', body, title: 'Garden Sizes: what to grow in your space',
    description: 'Find out what to grow on a balcony, in a small garden, a medium garden or an allotment, with tips and crop recommendations for each.',
    crumbs: [['Home', '/'], ['Garden Sizes', '/sizes/']],
  });

  for (const s of SIZES) {
    const crops = s.grow.map((id) => plantMap.get(id));
    const detail = `
<a class="back" href="/sizes/">&larr; All garden sizes</a>
<h1>${emoji(s.emoji)} ${esc(s.title)}</h1>
<p class="lead">${esc(s.desc)}</p>
<h2>Top tips for this space</h2>
<ul class="tips">${s.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
<h2>Recommended crops</h2>
<div class="grid">
  ${crops.map((p) => `<div class="card">${emoji(p.emoji)}<h3>${esc(p.name)}</h3><span class="tag">${esc(p.difficulty)}</span><p class="muted card-note">${esc(p.sow)}</p><a href="/plants/${p.id}/">Grow ${esc(p.name)} &rarr;</a></div>`).join('\n  ')}
</div>`;
    addPage({
      path: `/sizes/${s.id}/`, section: 'sizes', body: detail,
      title: `${s.title}: what to grow`,
      description: `${s.desc} ${crops.length} recommended crops with tips for this space.`,
      crumbs: [['Home', '/'], ['Garden Sizes', '/sizes/'], [s.title, `/sizes/${s.id}/`]],
    });
  }
}

function buildPlants() {
  const cards = PLANTS.map((p) => `<a href="/plants/${p.id}/" class="card card-link" data-plant data-sizes="${p.sizes.join(' ')}" data-search="${esc(lower(`${p.name} ${p.sun}`))}">
    ${emoji(p.emoji)}
    <h3>${esc(p.name)}</h3>
    <span class="tag">${esc(p.difficulty)}</span>
    <span class="tag warm">${esc(p.sun.split(' (')[0])}</span>
    <p class="muted card-note">${esc(p.sow)}</p>
  </a>`).join('\n  ');
  const body = `
<h1>Plant Guide</h1>
<p class="lead">Search crops or filter by the garden size you have.</p>
<div class="filters" id="plantFilters" hidden>
  <div><label for="plantSearch">Search</label><input type="search" id="plantSearch" placeholder="Search by name or sunlight..."></div>
  <div><label for="plantSize">Garden size</label>
    <select id="plantSize">
      <option value="all">All garden sizes</option>
      ${SIZES.map((s) => `<option value="${s.id}">${esc(s.title)}</option>`).join('\n      ')}
    </select>
  </div>
</div>
<div class="grid" id="plantGrid">
  ${cards}
</div>
<div class="empty" id="plantEmpty" hidden>No crops match your search.</div>`;
  addPage({
    path: '/plants/', section: 'plants', body, title: `Plant Guide: ${PLANTS.length} crops to grow in the UK`,
    description: `Sowing, spacing, care, pests, harvesting and storage for ${PLANTS.length} crops that grow well in the UK. Filter by garden size.`,
    crumbs: [['Home', '/'], ['Plant Guide', '/plants/']],
  });

  for (const p of PLANTS) {
    const related = RECIPES.filter((r) => r.uses.includes(p.id));
    const cal = CALENDAR[p.id];
    const calRows = [
      ['Sow indoors', monthRanges(cal.i)],
      ['Sow or plant outside', monthRanges(cal.o)],
      ['Harvest', monthRanges(cal.h)],
    ].filter(([, v]) => v);
    const body2 = `
<a class="back" href="/plants/">&larr; Plant Guide</a>
<h1>${emoji(p.emoji)} ${esc(p.name)}</h1>
<p>
  <span class="tag">Difficulty: ${esc(p.difficulty)}</span>
  ${p.sizes.map((id) => `<a class="tag warm tag-link" href="/sizes/${id}/">${esc(sizeMap.get(id).title)}</a>`).join('\n  ')}
</p>
<div class="info-row">
  <div>Sunlight</div><div>${esc(p.sun)}</div>
  <div>When to sow</div><div>${esc(p.sow)}</div>
  <div>Spacing</div><div>${esc(p.spacing)}</div>
  <div>Sowing depth</div><div>${esc(p.depth)}</div>
  <div>Watering</div><div>${esc(p.water)}</div>
</div>
<h2>Keeping it alive</h2>
<ul class="tips">${p.care.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
<h3>Watch out for</h3>
<p>${p.pests.map((x) => `<span class="tag red">${esc(x)}</span>`).join('')}</p>
<h2>Harvesting</h2>
<p>${esc(p.harvest)}</p>
<p><strong>Storage:</strong> ${esc(p.storage)}</p>
${calRows.length ? `<h2>UK calendar</h2>
<div class="info-row">
  ${calRows.map(([label, v]) => `<div>${label}</div><div>${esc(v)}</div>`).join('\n  ')}
</div>
<p class="muted small-note">Typical UK timings. See the <a href="/calendar/">planting calendar</a> for every crop at a glance.</p>` : ''}
${related.length ? `<h2>Cook with ${esc(lower(p.name))}</h2>
<div class="grid">${related.map((r) => `<div class="card"><h3>${esc(r.title)}</h3><p class="muted">${esc(r.time)} &middot; ${esc(servesText(r.serves))}</p><a href="/recipes/${r.id}/">View recipe &rarr;</a></div>`).join('')}</div>` : ''}`;
    addPage({
      path: `/plants/${p.id}/`, section: 'plants', body: body2, title: `How to grow ${p.name} in the UK`,
      description: `How to grow ${lower(p.name)} in the UK: when to sow, spacing, watering, pests, harvesting and storage. Difficulty: ${lower(p.difficulty)}.`,
      crumbs: [['Home', '/'], ['Plant Guide', '/plants/'], [p.name, `/plants/${p.id}/`]],
    });
  }
}

function buildRecipes() {
  const withRecipes = PLANTS.filter((p) => RECIPES.some((r) => r.uses.includes(p.id)));
  const cards = RECIPES.map((r) => `<a href="/recipes/${r.id}/" class="card card-link" data-recipe data-uses="${r.uses.join(' ')}">
    <h3>${esc(r.title)}</h3>
    <p class="muted card-meta">${esc(r.time)} &middot; ${esc(servesText(r.serves))}</p>
    <p class="card-tags">${r.uses.map((u) => { const p = plantMap.get(u); return `<span class="tag">${p.emoji} ${esc(p.name)}</span>`; }).join('')}</p>
  </a>`).join('\n  ');
  const body = `
<h1>Garden Recipes</h1>
<p class="lead">Every recipe is built around crops you can grow yourself.</p>
<div class="filters" id="recipeFilters" hidden>
  <div></div>
  <div><label for="recipeFilter">Crop</label>
    <select id="recipeFilter">
      <option value="all">All crops</option>
      ${withRecipes.map((p) => `<option value="${p.id}">${p.emoji} ${esc(p.name)}</option>`).join('\n      ')}
    </select>
  </div>
</div>
<div class="grid">
  ${cards}
</div>
<div class="empty" id="recipeEmpty" hidden>No recipes for that crop yet.</div>`;
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
    return `<tr data-calrow data-sizes="${p.sizes.join(' ')}"><th scope="row"><a href="/plants/${p.id}/"><span aria-hidden="true">${p.emoji}</span> ${esc(p.name)}</a></th>${cells}</tr>`;
  }).join('\n      ');
  const body = `
<h1>Planting Calendar</h1>
<p class="lead">When to plant indoors, plant or sow outside, and harvest, month by month. Based on typical UK timings; the current month is highlighted.</p>
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
<p class="lead">Pick at the right time, handle with care, and make the most of every crop.</p>
<div class="grid">
  ${HARVEST.map((h) => `<div class="card"><h3>${esc(h.title)}</h3><p class="muted card-note-flat">${esc(h.body)}</p></div>`).join('\n  ')}
</div>`;
  addPage({
    path: '/harvest/', section: 'harvest', body: harvest, title: 'Harvesting Tips',
    description: 'When and how to pick home-grown crops, how to tell they are ripe, and how to store and preserve the surplus.',
    crumbs: [['Home', '/'], ['Harvesting', '/harvest/']],
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
  const urls = pages.map((p) => `  <url><loc>${SITE}${p}</loc></url>`).join('\n');
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

buildHome();
buildSizes();
buildPlants();
buildRecipes();
buildCalendar();
buildGuides();
build404();
buildSupportFiles();

console.log(`Built ${pages.length} pages + 404 into dist/ (site URL: ${SITE})`);
