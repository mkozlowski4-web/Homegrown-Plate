/* Google Search Console (average position, clicks, impressions) for the owner dashboard.
   Uses a Google service account that has been added as a user on the Search Console property.
   The key lives only in the Worker secret GOOGLE_SERVICE_ACCOUNT (the service account JSON file, pasted whole). */

import { dayOf } from './analytics.mjs';

const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const API = 'https://www.googleapis.com/webmasters/v3/sites/';
const b64url = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64urlStr = (s) => b64url(new TextEncoder().encode(s));

let tokenCache = { token: '', exp: 0 };

export function readKey(env) {
  const raw = env.GOOGLE_SERVICE_ACCOUNT;
  if (!raw || typeof raw !== 'string') return null;
  try {
    const k = JSON.parse(raw);
    if (k && typeof k.client_email === 'string' && typeof k.private_key === 'string') return k;
  } catch { /* fall through */ }
  return { invalid: true };
}

async function accessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  if (tokenCache.token && tokenCache.exp - 120 > now) return tokenCache.token;
  const aud = key.token_uri || 'https://oauth2.googleapis.com/token';
  const head = b64urlStr(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64urlStr(JSON.stringify({ iss: key.client_email, scope: SCOPE, aud, iat: now, exp: now + 3600 }));
  const der = Uint8Array.from(atob(key.private_key.replace(/-----[A-Z ]+-----/g, '').replace(/\s+/g, '')), (c) => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey('pkcs8', der, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(head + '.' + claims));
  const res = await fetch(aud, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=' + encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') + '&assertion=' + head + '.' + claims + '.' + b64url(sig) });
  if (!res.ok) throw Object.assign(new Error('token'), { kind: 'token', status: res.status });
  const j = await res.json();
  tokenCache = { token: j.access_token, exp: now + (j.expires_in || 3600) };
  return tokenCache.token;
}

async function query(token, site, body) {
  const res = await fetch(API + encodeURIComponent(site) + '/searchAnalytics/query', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!res.ok) throw Object.assign(new Error('api'), { kind: 'api', status: res.status });
  return (await res.json()).rows || [];
}

const round = (n, d) => { const f = Math.pow(10, d); return Math.round((n || 0) * f) / f; };
const shape = (r, label) => ({ name: label, clicks: r.clicks || 0, impressions: r.impressions || 0, ctr: round((r.ctr || 0) * 100, 1), position: round(r.position, 1) });

async function fetchAll(env, key, days) {
  const token = await accessToken(key);
  /* Search Console data is final about two days behind. */
  const end = dayOf(Date.now() - 2 * 86400000), start = dayOf(Date.now() - (days + 1) * 86400000);
  const sites = env.GSC_SITE ? [env.GSC_SITE] : ['sc-domain:homegrownplate.co.uk', 'https://homegrownplate.co.uk/', 'https://www.homegrownplate.co.uk/'];
  let lastErr = null;
  for (const site of sites) {
    try {
      const base = { startDate: start, endDate: end };
      const [total, daily, queries, pages] = await Promise.all([
        query(token, site, base),
        query(token, site, { ...base, dimensions: ['date'], rowLimit: 400 }),
        query(token, site, { ...base, dimensions: ['query'], rowLimit: 15 }),
        query(token, site, { ...base, dimensions: ['page'], rowLimit: 15 }),
      ]);
      const t = total[0] ? shape(total[0], 'total') : { clicks: 0, impressions: 0, ctr: 0, position: 0 };
      return {
        connected: true, site, start, end, totals: t,
        series: daily.map((r) => ({ date: r.keys[0], ...shape(r, r.keys[0]) })).sort((a, b) => (a.date < b.date ? -1 : 1)),
        queries: queries.map((r) => shape(r, r.keys[0])),
        pages: pages.map((r) => shape(r, r.keys[0].replace(/^https?:\/\/[^/]+/, '') || '/')),
      };
    } catch (e) { lastErr = e; if (e.kind === 'token') throw e; }
  }
  throw lastErr || new Error('api');
}

/* Result for the dashboard. Never throws; says what is wrong in plain terms instead. */
export async function searchStats(env, daysRaw) {
  const days = [7, 30, 90].includes(Number(daysRaw)) ? Number(daysRaw) : 30;
  const key = readKey(env);
  if (!key) return { connected: false, reason: 'not-configured' };
  if (key.invalid) return { connected: false, reason: 'bad-key' };
  const cacheKey = new Request('https://cache.homegrownplate.internal/gsc/' + days);
  const cache = typeof caches !== 'undefined' && caches.default ? caches.default : null;
  try { const hit = cache && await cache.match(cacheKey); if (hit) return await hit.json(); } catch { /* ignore */ }
  try {
    const data = await fetchAll(env, key, days);
    data.email = key.client_email;
    if (cache) try { await cache.put(cacheKey, new Response(JSON.stringify(data), { headers: { 'Cache-Control': 'max-age=21600' } })); } catch { /* ignore */ }
    return data;
  } catch (e) {
    if (e.kind === 'token') return { connected: false, reason: 'bad-key', email: key.client_email };
    if (e.status === 403 || e.status === 404) return { connected: false, reason: 'no-access', email: key.client_email };
    return { connected: false, reason: 'error', email: key.client_email };
  }
}
