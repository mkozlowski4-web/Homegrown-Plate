/* Privacy-friendly first-party analytics.
   - No cookies and nothing stored on the visitor's device.
   - No IP address or user agent is saved. A visitor is a short code made from IP + browser + a random salt that
     changes every day, so people cannot be followed from one day to the next.
   - Bots and scrapers are filtered out in layers (see classify) and only counted, by reason, in bot_counts. */

const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const sha256 = async (s) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));

export const EVENTS = new Set(['add_crop', 'kids_on', 'region_set', 'search', 'install', 'signup', 'tick_job']);

/* Crawlers, AI agents, SEO tools, link previewers, monitors, HTTP libraries and automation frameworks. */
const BOT_UA = /bot\b|bot[\/;_ -]|crawl|spider|slurp|scrap|headless|phantom|selenium|puppeteer|playwright|lighthouse|pagespeed|gtmetrix|pingdom|uptime|monitor|curl|wget|python|requests|httpclient|http-client|okhttp|axios|node-fetch|undici|go-http|java\/|libwww|\bphp\b|ruby|perl|scrapy|postman|insomnia|gptbot|chatgpt|oai-|claude|anthropic|perplexity|bytespider|ccbot|amazonbot|applebot|facebookexternalhit|facebot|meta-external|twitterbot|linkedinbot|whatsapp|telegram|discord|slack|embedly|preview|google-extended|googleother|adsbot|mediapartners|yandex|baidu|duckduck|semrush|ahrefs|mj12|dotbot|petalbot|screaming|sistrix|archive\.org|wayback|ia_archiver|cohere|diffbot|omgili|imagesift|dataforseo|seokicks|blexbot|feedfetcher|feedly|netcraft|nutch|heritrix|\bdataprovider|\bgrapeshot|\bcensys|\bzgrab|masscan|nmap|nikto|sqlmap/i;

/* Cloud and hosting networks. Real visitors do not browse from these. (Consumer VPN and Cloudflare WARP/iCloud Relay networks are
   deliberately NOT here, so people using them are still counted.) */
const DATACENTER_ASN = new Set([16509, 14618, 15169, 396982, 19527, 8075, 8068, 14061, 16276, 24940, 63949, 20473, 31898, 45102, 132203, 51167, 60781, 28753, 9009, 12876, 8560, 26496, 27357, 36351, 55286, 62567, 394380, 46606, 35916, 40021, 53667, 49981, 29802, 136907, 37963, 45090]);

const DAILY_CAP = 40000; /* protects the database allowance from floods */
const MAX_BODY = 2000;

const london = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/London', year: 'numeric', month: '2-digit', day: '2-digit' });
export const dayOf = (ms = Date.now()) => london.format(ms); /* YYYY-MM-DD */

export function cleanPath(p) {
  if (typeof p !== 'string') return '';
  p = p.split('#')[0].split('?')[0];
  if (!p.startsWith('/') || p.length > 120 || !/^[A-Za-z0-9/_\-.~%]+$/.test(p)) return '';
  if (/^\/(api|admin|offline)(\/|$)/.test(p) || p === '/sw.js') return '';
  return p;
}
function cleanRef(r, ownHost) {
  if (typeof r !== 'string') return null;
  const h = r.toLowerCase().replace(/^www\./, '').slice(0, 60);
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(h) || h === ownHost.replace(/^www\./, '')) return null;
  return h;
}

/* Why this request should not be counted, or '' if it looks like a real person. */
export function classify(request, body) {
  const ua = request.headers.get('User-Agent') || '';
  if (ua.length < 20) return 'no-user-agent';
  if (BOT_UA.test(ua)) return 'known-bot';
  if (body && body.wd === 1) return 'automated-browser';
  if (!request.headers.get('Accept-Language')) return 'no-language';
  const asn = Number(request.cf && request.cf.asn);
  if (asn && DATACENTER_ASN.has(asn)) return 'datacenter';
  return '';
}

async function bump(env, day, reason) {
  await env.DB.prepare('INSERT INTO bot_counts (day, reason, n) VALUES (?, ?, 1) ON CONFLICT(day, reason) DO UPDATE SET n = n + 1').bind(day, reason).run();
}

async function saltFor(env, day) {
  let row = await env.DB.prepare('SELECT salt FROM salts WHERE day = ?').bind(day).first();
  if (!row) {
    const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
    await env.DB.prepare('INSERT OR IGNORE INTO salts (day, salt) VALUES (?, ?)').bind(day, salt).run();
    row = await env.DB.prepare('SELECT salt FROM salts WHERE day = ?').bind(day).first();
  }
  return row.salt;
}

export async function collect(request, env, url, user, ctx) {
  const text = await request.text();
  if (text.length > MAX_BODY) return new Response(null, { status: 413 });
  let body; try { body = JSON.parse(text); } catch { return new Response(null, { status: 400 }); }
  if (!body || typeof body !== 'object') return new Response(null, { status: 400 });
  const day = dayOf();
  const done = () => new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });

  if (user && user.is_admin) { await bump(env, day, 'owner'); return done(); }
  const why = classify(request, body);
  if (why) { await bump(env, day, why); return done(); }

  const path = cleanPath(body.p);
  if (!path) return done();
  const isEvent = typeof body.e === 'string' && body.e !== '';
  if (isEvent && !EVENTS.has(body.e)) return done();

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const vid = (await sha256((await saltFor(env, day)) + '|' + ip + '|' + (request.headers.get('User-Agent') || ''))).slice(0, 16);
  const now = Date.now();

  /* Behaviour check: no person opens this many pages in an hour. */
  const rate = await env.DB.prepare("SELECT COUNT(*) AS n FROM hits WHERE day = ? AND vid = ? AND ts > ?").bind(day, vid, now - 3600000).first();
  if ((rate ? rate.n : 0) >= 150) { await bump(env, day, 'too-fast'); return done(); }
  const total = await env.DB.prepare('SELECT COUNT(*) AS n FROM hits WHERE day = ?').bind(day).first();
  if ((total ? total.n : 0) >= DAILY_CAP) return done();

  const w = Number(body.w) || 0;
  const mobileUa = /Mobi|Android|iPhone|iPod/i.test(request.headers.get('User-Agent') || '');
  const device = w ? (w < 600 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop') : (mobileUa ? 'mobile' : 'desktop');
  const country = request.cf && typeof request.cf.country === 'string' ? request.cf.country.slice(0, 2) : null;
  await env.DB.prepare('INSERT INTO hits (ts, day, kind, name, path, vid, ref, country, device) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(now, day, isEvent ? 'event' : 'view', isEvent ? body.e : null, path, vid, isEvent ? null : cleanRef(body.r, url.hostname), country, device).run();

  if (Math.random() < 0.01 && ctx) ctx.waitUntil(tidyAnalytics(env));
  return done();
}

export async function tidyAnalytics(env) {
  const cut = dayOf(Date.now() - 400 * 86400000), saltCut = dayOf(Date.now() - 2 * 86400000);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM hits WHERE day < ?').bind(cut),
    env.DB.prepare('DELETE FROM bot_counts WHERE day < ?').bind(cut),
    env.DB.prepare('DELETE FROM salts WHERE day < ?').bind(saltCut),
  ]);
}

const all = async (env, sql, ...args) => (await env.DB.prepare(sql).bind(...args).all()).results || [];

export async function stats(env, daysRaw) {
  const days = [1, 7, 30, 90, 365].includes(Number(daysRaw)) ? Number(daysRaw) : 30;
  const from = dayOf(Date.now() - (days - 1) * 86400000), today = dayOf();
  const [daily, pages, refs, countries, devices, events, filtered, newUsers, totalUsers] = await Promise.all([
    all(env, "SELECT day, SUM(kind = 'view') AS views, COUNT(DISTINCT CASE WHEN kind = 'view' THEN vid END) AS visitors, SUM(kind = 'event') AS events FROM hits WHERE day >= ? GROUP BY day ORDER BY day", from),
    all(env, "SELECT path, COUNT(*) AS views, COUNT(DISTINCT day || vid) AS visitors FROM hits WHERE kind = 'view' AND day >= ? GROUP BY path ORDER BY views DESC LIMIT 15", from),
    all(env, "SELECT ref AS name, COUNT(*) AS n FROM hits WHERE kind = 'view' AND ref IS NOT NULL AND day >= ? GROUP BY ref ORDER BY n DESC LIMIT 10", from),
    all(env, "SELECT country AS name, COUNT(*) AS n FROM hits WHERE kind = 'view' AND country IS NOT NULL AND day >= ? GROUP BY country ORDER BY n DESC LIMIT 10", from),
    all(env, "SELECT device AS name, COUNT(*) AS n FROM hits WHERE kind = 'view' AND day >= ? GROUP BY device ORDER BY n DESC", from),
    all(env, "SELECT name, COUNT(*) AS n, COUNT(DISTINCT day || vid) AS people FROM hits WHERE kind = 'event' AND day >= ? GROUP BY name ORDER BY n DESC", from),
    all(env, 'SELECT reason AS name, SUM(n) AS n FROM bot_counts WHERE day >= ? GROUP BY reason ORDER BY n DESC', from),
    env.DB.prepare('SELECT COUNT(*) AS n FROM users WHERE created_at >= ?').bind(Date.now() - days * 86400000).first(),
    env.DB.prepare('SELECT COUNT(*) AS n FROM users').first(),
  ]);
  /* Fill days with no traffic so charts have a continuous axis. */
  const byDay = new Map(daily.map((d) => [d.day, d]));
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = dayOf(Date.now() - i * 86400000), r = byDay.get(d);
    series.push({ day: d, views: r ? r.views : 0, visitors: r ? r.visitors : 0, events: r ? r.events : 0 });
  }
  const sum = (k) => series.reduce((a, d) => a + (d[k] || 0), 0);
  const t = series[series.length - 1];
  return {
    days, from, today,
    totals: { views: sum('views'), visitorDays: sum('visitors'), events: sum('events'), filtered: filtered.filter((f) => f.name !== 'owner').reduce((a, f) => a + f.n, 0), today: t },
    series, pages, refs, countries, devices, events, filtered,
    accounts: { total: totalUsers ? totalUsers.n : 0, added: newUsers ? newUsers.n : 0 },
  };
}
