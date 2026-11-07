/* Homegrown Plate Worker: serves the static site and a small account API under /api/.
   Storage: Cloudflare D1 (binding DB). Passwords: PBKDF2-SHA256 with a per-user salt.
   Sessions: random tokens in an HttpOnly cookie; only a SHA-256 hash of each token is stored. */

import { forecast } from './weather.mjs';
import { collect, stats, tidyAnalytics } from './analytics.mjs';
import { searchStats } from './gsc.mjs';
import { paymentsOn, isMember, startCheckout, billingPortal, cancelOnDelete, webhook } from './billing.mjs';
import { redeem, listCodes, createCode, setCodeActive } from './codes.mjs';
import { googleOn, googleStart, googleCallback } from './google.mjs';

const SESSION_DAYS = 30;
const PBKDF2_ITERATIONS = 100000; /* the maximum the Workers runtime allows */
const MAX_BODY = 40000;
const COOKIE = 'hp_session';
const enc = new TextEncoder();
/* My Garden crop limits: 5 without an account (enforced in the browser), 8 with a free account, no limit for members. */
const FREE_ACCOUNT_CROPS = 8;

const json = (obj, status = 200, headers = {}) =>
  new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers } });
const fail = (status, error) => json({ error }, status);

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (s) => Uint8Array.from(s.match(/../g) || [], (h) => parseInt(h, 16));
const sha256 = async (s) => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));

async function hashPassword(password, saltHex) {
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(saltHex), iterations: PBKDF2_ITERATIONS }, key, 256));
}
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
const randomHex = (bytes) => hex(crypto.getRandomValues(new Uint8Array(bytes)));

/* ---- validation ---- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ID_RE = /^[a-z0-9][a-z0-9-]{0,60}$/;
const normEmail = (e) => (typeof e === 'string' ? e.trim().toLowerCase() : '');
function passwordProblem(pw, email) {
  if (typeof pw !== 'string') return 'Please enter a password.';
  if (pw.length < 10) return 'Use at least 10 characters for your password.';
  if (pw.length > 128) return 'That password is too long (128 characters at most).';
  if (email && pw.toLowerCase() === email) return 'Your password should not be your email address.';
  if (/^(.)\1+$/.test(pw)) return 'Please choose a less guessable password.';
  return '';
}

/* Only the fields the site stores are accepted, with strict shapes and sizes. */
function cleanData(d) {
  if (!d || typeof d !== 'object') return null;
  const out = { garden: [], done: {}, region: null, kids: false };
  if (Array.isArray(d.garden)) out.garden = [...new Set(d.garden.filter((x) => typeof x === 'string' && ID_RE.test(x)))].slice(0, 300);
  if (d.done && typeof d.done === 'object' && !Array.isArray(d.done)) {
    for (const [k, v] of Object.entries(d.done).slice(0, 60)) {
      if (!/^\d{4}-\d{1,2}$/.test(k) || !Array.isArray(v)) continue;
      out.done[k] = [...new Set(v.filter((x) => typeof x === 'string' && x.length <= 80))].slice(0, 400);
    }
  }
  const r = d.region;
  if (r && typeof r === 'object' && typeof r.off === 'number' && r.off >= -3 && r.off <= 4 && typeof r.name === 'string' && r.name.length <= 80) {
    out.region = { off: r.off, name: r.name };
    if (typeof r.z === 'string' && r.z.length <= 30) out.region.z = r.z;
    if (typeof r.pc === 'string' && /^[A-Za-z]{1,2}$/.test(r.pc)) out.region.pc = r.pc.toUpperCase(); /* postcode area only, never a full postcode */
  }
  out.kids = d.kids === true;
  return out;
}

/* ---- request helpers ---- */
async function readJson(request) {
  if (!(request.headers.get('Content-Type') || '').toLowerCase().startsWith('application/json')) return { error: fail(415, 'Unsupported request.') };
  const text = await request.text();
  if (text.length > MAX_BODY) return { error: fail(413, 'That is too much data.') };
  try { return { body: JSON.parse(text) }; } catch { return { error: fail(400, 'Could not read that request.') }; }
}
const clientIp = (request) => request.headers.get('CF-Connecting-IP') || 'unknown';
const getCookie = (request, name) => {
  const m = (request.headers.get('Cookie') || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? m[1] : '';
};
const sessionCookie = (token, maxAge) => `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;

async function currentUser(request, env) {
  const token = getCookie(request, COOKIE);
  if (!/^[0-9a-f]{64}$/.test(token)) return null;
  const row = await env.DB.prepare('SELECT u.id, u.email, u.created_at, u.is_admin, u.plan, u.paid_until, u.cancel_at_end, u.stripe_customer, u.stripe_sub, u.gift_until, (u.pw_hash != \'\') AS has_pw, (u.google_sub IS NOT NULL) AS google FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?')
    .bind(await sha256(token), Date.now()).first();
  return row || null;
}
async function startSession(env, userId) {
  const token = randomHex(32);
  await env.DB.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(await sha256(token), userId, Date.now() + SESSION_DAYS * 86400000).run();
  return token;
}

/* What the browser needs to know about the visitor's plan. */
const planInfo = (user) => ({
  plan: isMember(user) ? 'member' : 'free',
  limit: isMember(user) ? null : FREE_ACCOUNT_CROPS,
  paidUntil: user.plan === 'comp' ? null : user.paid_until || null,
  paying: !!(user.stripe_sub && user.paid_until > Date.now()),
  renews: !!(user.stripe_sub && user.paid_until > Date.now() && !user.cancel_at_end),
  codeUntil: user.gift_until > Date.now() ? user.gift_until : null,
  gift: user.plan === 'comp',
  billing: !!user.stripe_customer,
});

/* Free accounts can keep crops they already had (for example after a membership ends) but cannot add past the limit.
   New crops beyond the limit are dropped, and the browser is sent the corrected garden. */
function capGarden(next, stored, user) {
  if (isMember(user) || next.length <= FREE_ACCOUNT_CROPS) return { garden: next, trimmed: false };
  const had = new Set(stored || []);
  const kept = next.filter((id) => had.has(id));
  const room = Math.max(0, FREE_ACCOUNT_CROPS - kept.length);
  const added = next.filter((id) => !had.has(id)).slice(0, room);
  const keep = new Set([...kept, ...added]);
  const garden = next.filter((id) => keep.has(id));
  return { garden, trimmed: garden.length !== next.length };
}

/* ---- rate limiting (kept in D1) ---- */
async function tooMany(env, key, limit, windowMs) {
  const r = await env.DB.prepare('SELECT COUNT(*) AS n FROM attempts WHERE key = ? AND at > ?').bind(key, Date.now() - windowMs).first();
  return (r?.n || 0) >= limit;
}
const noteAttempt = (env, key) => env.DB.prepare('INSERT INTO attempts (key, at) VALUES (?, ?)').bind(key, Date.now()).run();
async function tidy(env) {
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now),
    env.DB.prepare('DELETE FROM attempts WHERE at < ?').bind(now - 86400000),
  ]);
}

/* ---- handlers ---- */
async function signup(request, env) {
  const { body, error } = await readJson(request); if (error) return error;
  const email = normEmail(body.email);
  if (!EMAIL_RE.test(email) || email.length > 254) return fail(400, 'Please enter a valid email address.');
  const problem = passwordProblem(body.password, email); if (problem) return fail(400, problem);
  const ipKey = 'signup:' + clientIp(request);
  if (await tooMany(env, ipKey, 8, 3600000)) return fail(429, 'Too many sign-ups from this connection. Please try again later.');
  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  await noteAttempt(env, ipKey);
  if (existing) return fail(409, 'There is already an account with that email. Try signing in instead.');
  const salt = randomHex(16);
  const hash = await hashPassword(body.password, salt);
  let userId;
  try {
    const res = await env.DB.prepare('INSERT INTO users (email, pw_hash, pw_salt, created_at) VALUES (?, ?, ?, ?)').bind(email, hash, salt, Date.now()).run();
    userId = res.meta.last_row_id;
  } catch { return fail(409, 'There is already an account with that email. Try signing in instead.'); }
  const data = cleanData(body.data) || cleanData({});
  data.garden = data.garden.slice(0, FREE_ACCOUNT_CROPS);
  await env.DB.prepare('INSERT INTO user_data (user_id, json, updated_at) VALUES (?, ?, ?)').bind(userId, JSON.stringify(data), Date.now()).run();
  const token = await startSession(env, userId);
  return json({ user: { email, ...planInfo({ plan: 'free' }) }, data }, 201, { 'Set-Cookie': sessionCookie(token, SESSION_DAYS * 86400) });
}

async function login(request, env) {
  const { body, error } = await readJson(request); if (error) return error;
  const email = normEmail(body.email);
  const password = typeof body.password === 'string' ? body.password.slice(0, 128) : '';
  const emailKey = 'login:' + email, ipKey = 'loginip:' + clientIp(request);
  if ((await tooMany(env, emailKey, 8, 900000)) || (await tooMany(env, ipKey, 30, 900000))) return fail(429, 'Too many attempts. Please wait 15 minutes and try again.');
  const user = await env.DB.prepare('SELECT id, email, pw_hash, pw_salt, plan, paid_until, cancel_at_end, stripe_customer, stripe_sub, gift_until FROM users WHERE email = ?').bind(email).first();
  /* Always do the same work so timing does not reveal whether an email has an account. */
  const candidate = await hashPassword(password, user ? user.pw_salt : '00'.repeat(16));
  if (user && !user.pw_hash) {
    await noteAttempt(env, ipKey);
    return fail(401, 'This account signs in with Google. Use the Continue with Google button.');
  }
  if (!user || !safeEqual(candidate, user.pw_hash)) {
    await Promise.all([noteAttempt(env, emailKey), noteAttempt(env, ipKey)]);
    return fail(401, 'That email and password do not match.');
  }
  await env.DB.prepare('DELETE FROM attempts WHERE key = ?').bind(emailKey).run();
  const token = await startSession(env, user.id);
  const row = await env.DB.prepare('SELECT json FROM user_data WHERE user_id = ?').bind(user.id).first();
  tidy(env).catch(() => {});
  tidyAnalytics(env).catch(() => {});
  return json({ user: { email: user.email, ...planInfo(user) }, data: row ? JSON.parse(row.json) : cleanData({}) }, 200, { 'Set-Cookie': sessionCookie(token, SESSION_DAYS * 86400) });
}

async function logout(request, env) {
  const token = getCookie(request, COOKIE);
  if (/^[0-9a-f]{64}$/.test(token)) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run();
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie('', 0) });
}

async function getData(user, env) {
  const row = await env.DB.prepare('SELECT json, updated_at FROM user_data WHERE user_id = ?').bind(user.id).first();
  return json({ data: row ? JSON.parse(row.json) : cleanData({}), updated: row ? row.updated_at : 0, ...planInfo(user) });
}
async function putData(request, user, env) {
  const { body, error } = await readJson(request); if (error) return error;
  const data = cleanData(body.data); if (!data) return fail(400, 'Could not read that data.');
  let trimmed = false;
  if (!isMember(user) && data.garden.length > FREE_ACCOUNT_CROPS) {
    const prev = await env.DB.prepare('SELECT json FROM user_data WHERE user_id = ?').bind(user.id).first();
    const c = capGarden(data.garden, prev ? JSON.parse(prev.json).garden : [], user);
    data.garden = c.garden; trimmed = c.trimmed;
  }
  const now = Date.now();
  await env.DB.prepare('INSERT INTO user_data (user_id, json, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at')
    .bind(user.id, JSON.stringify(data), now).run();
  return json(trimmed ? { ok: true, updated: now, trimmed: true, data, ...planInfo(user) } : { ok: true, updated: now, ...planInfo(user) });
}
async function exportData(user, env) {
  const row = await env.DB.prepare('SELECT json, updated_at FROM user_data WHERE user_id = ?').bind(user.id).first();
  const out = { email: user.email, createdAt: new Date(user.created_at).toISOString(), savedAt: row ? new Date(row.updated_at).toISOString() : null, data: row ? JSON.parse(row.json) : null };
  return new Response(JSON.stringify(out, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': 'attachment; filename="homegrown-plate-my-data.json"', 'Cache-Control': 'no-store' } });
}

async function changePassword(request, user, env) {
  const { body, error } = await readJson(request); if (error) return error;
  const row = await env.DB.prepare('SELECT pw_hash, pw_salt FROM users WHERE id = ?').bind(user.id).first();
  const key = 'login:' + user.email;
  if (await tooMany(env, key, 8, 900000)) return fail(429, 'Too many attempts. Please wait 15 minutes and try again.');
  /* Accounts made with Google have no password yet, so they can set one without a current password. */
  if (row.pw_hash) {
    const current = await hashPassword(typeof body.current === 'string' ? body.current.slice(0, 128) : '', row.pw_salt);
    if (!safeEqual(current, row.pw_hash)) { await noteAttempt(env, key); return fail(401, 'Your current password is not right.'); }
  }
  const problem = passwordProblem(body.next, user.email); if (problem) return fail(400, problem);
  const salt = randomHex(16);
  const token = getCookie(request, COOKIE);
  await env.DB.batch([
    env.DB.prepare('UPDATE users SET pw_hash = ?, pw_salt = ? WHERE id = ?').bind(await hashPassword(body.next, salt), salt, user.id),
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash != ?').bind(user.id, await sha256(token)), /* sign out other devices */
  ]);
  return json({ ok: true });
}

async function deleteAccount(request, user, env) {
  const { body, error } = await readJson(request); if (error) return error;
  const row = await env.DB.prepare('SELECT pw_hash, pw_salt FROM users WHERE id = ?').bind(user.id).first();
  const key = 'login:' + user.email;
  if (await tooMany(env, key, 8, 900000)) return fail(429, 'Too many attempts. Please wait 15 minutes and try again.');
  if (row.pw_hash) {
    const given = await hashPassword(typeof body.password === 'string' ? body.password.slice(0, 128) : '', row.pw_salt);
    if (!safeEqual(given, row.pw_hash)) { await noteAttempt(env, key); return fail(401, 'That password is not right.'); }
  } else if (normEmail(body.confirm) !== user.email) {
    /* No password (a Google account): typing the email address confirms it. */
    await noteAttempt(env, key); return fail(401, 'Type your email address exactly as shown to confirm.');
  }
  try { await cancelOnDelete(env, user.id); } catch (e) {
    console.error('cancel on delete', e && e.message);
    return fail(502, 'We could not stop your membership payments just now, so your account has not been deleted. Please try again in a few minutes.');
  }
  await env.DB.batch([
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(user.id),
    env.DB.prepare('DELETE FROM user_data WHERE user_id = ?').bind(user.id),
    env.DB.prepare('DELETE FROM attempts WHERE key = ?').bind(key),
    env.DB.prepare('DELETE FROM users WHERE id = ?').bind(user.id),
  ]);
  return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie('', 0) });
}

async function api(request, env, url, ctx) {
  const path = url.pathname.replace(/\/+$/, '');
  const method = request.method;
  /* Stripe calls this directly (no browser, no Origin header); it is checked by its signature instead. */
  if (path === '/api/stripe-webhook' && method === 'POST') return webhook(request, env);
  if (method !== 'GET' && method !== 'HEAD') {
    /* Cross-site request protection: browsers always send Origin on these, and it must be this site. */
    if (request.headers.get('Origin') !== url.origin) return fail(403, 'Request not allowed.');
  }
  if (path === '/api/me' && method === 'GET') {
    const user = await currentUser(request, env);
    return json({ user: user ? { email: user.email, admin: !!user.is_admin, hasPassword: !!user.has_pw, google: !!user.google, ...planInfo(user) } : null, payments: paymentsOn(env, user), googleOn: googleOn(env) });
  }
  if (path === '/api/hit' && method === 'POST') {
    /* Page view and interaction counter (no response body, no cookies). Bots and the owner are filtered out. */
    return collect(request, env, url, await currentUser(request, env), ctx);
  }
  if (path === '/api/auth/google' && method === 'GET') return googleStart(url, env);
  if (path === '/api/auth/google/callback' && method === 'GET') {
    return googleCallback(request, url, env, { getCookie, safeEqual, clientIp, tooMany, noteAttempt, startSession, sessionCookie, sessionMaxAge: SESSION_DAYS * 86400, cleanData });
  }
  if (path === '/api/signup' && method === 'POST') return signup(request, env);
  if (path === '/api/login' && method === 'POST') return login(request, env);
  if (path === '/api/logout' && method === 'POST') return logout(request, env);
  const user = await currentUser(request, env);
  if (!user) return fail(401, 'Please sign in.');
  if (path === '/api/admin/stats' && method === 'GET') {
    if (!user.is_admin) return fail(404, 'Not found.'); /* do not reveal that the page exists */
    return json(await stats(env, url.searchParams.get('days')));
  }
  if (path === '/api/admin/search' && method === 'GET') {
    if (!user.is_admin) return fail(404, 'Not found.');
    return json(await searchStats(env, url.searchParams.get('days')));
  }
  if (path === '/api/weather' && method === 'GET') {
    if (!isMember(user)) return fail(402, 'The week-ahead plan is for members.');
    const r = await forecast(url.searchParams.get('zone') || '', ctx);
    return r.error ? fail(r.status, r.error) : json(r.body, 200, { 'Cache-Control': 'private, max-age=1800' });
  }
  if (path === '/api/data' && method === 'GET') return getData(user, env);
  if (path === '/api/data' && method === 'PUT') return putData(request, user, env);
  if (path === '/api/export' && method === 'GET') return exportData(user, env);
  if (path === '/api/password' && method === 'POST') return changePassword(request, user, env);
  if (path === '/api/delete' && method === 'POST') return deleteAccount(request, user, env);
  if (path === '/api/redeem' && method === 'POST') {
    const { body, error } = await readJson(request); if (error) return error;
    const r = await redeem(user, body, env, { tooMany, noteAttempt, isMember });
    return r.error ? fail(r.status, r.error) : json(r.body);
  }
  if (path.startsWith('/api/admin/codes')) {
    if (!user.is_admin) return fail(404, 'Not found.');
    let r;
    if (path === '/api/admin/codes' && method === 'GET') r = { body: await listCodes(env) };
    else if (path === '/api/admin/codes' && method === 'POST') { const { body, error } = await readJson(request); if (error) return error; r = await createCode(body, env); }
    else if (path === '/api/admin/codes/active' && method === 'POST') { const { body, error } = await readJson(request); if (error) return error; r = await setCodeActive(body, env); }
    else return fail(404, 'Not found.');
    return r.error ? fail(r.status, r.error) : json(r.body);
  }
  if ((path === '/api/checkout' || path === '/api/billing') && method === 'POST') {
    const r = await (path === '/api/checkout' ? startCheckout : billingPortal)(user, env, url.origin);
    return r.error ? fail(r.status, r.error) : json(r.body);
  }
  return fail(404, 'Not found.');
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      try { return await api(request, env, url, ctx); } catch (e) { console.error('api error', e && e.message); return fail(500, 'Something went wrong. Please try again.'); }
    }
    return env.ASSETS.fetch(request);
  },
};
