/* Sign in with Google (OAuth 2.0 authorisation code flow with PKCE, done entirely by the Worker: no Google script runs on the site).

   Settings (Cloudflare, Worker > Settings > Variables and Secrets):
     GOOGLE_CLIENT_ID      not secret, kept in wrangler.jsonc vars
     GOOGLE_CLIENT_SECRET  Secret, set in the Cloudflare dashboard
   Until both exist, the Google button stays hidden and these routes send people back to the account page.

   Flow: /api/auth/google sets a short-lived cookie holding a random state and PKCE verifier, then sends the browser to Google.
   Google sends it back to /api/auth/google/callback with a code, which the Worker swaps for an ID token directly with Google
   over HTTPS (so, as Google's documentation allows, the token's signature does not need checking; its claims still are).
   We keep only the verified email address and Google's account id (sub). */

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const STATE_COOKIE = 'hp_google';
const STATE_PATH = '/api/auth/google';
const ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];
const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

export const googleOn = (env) => !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

const b64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const randomB64 = (n) => b64url(crypto.getRandomValues(new Uint8Array(n)));
const back = (origin, result, cookies = []) => {
  const h = new Headers({ Location: origin + '/account/?google=' + result, 'Cache-Control': 'no-store' });
  cookies.forEach((c) => h.append('Set-Cookie', c));
  return new Response(null, { status: 302, headers: h });
};
const clearState = `${STATE_COOKIE}=; Path=${STATE_PATH}; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;

function decodeIdToken(idToken) {
  const part = String(idToken || '').split('.')[1];
  if (!part) return null;
  try {
    const bin = atob(part.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((part.length + 3) % 4));
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0))));
  } catch { return null; }
}

/* Step 1: send the visitor to Google. mode 'gsc' is the owner connecting Search Console for the dashboard
   (read-only access to search figures, kept as a refresh token); anything else is signing in. */
export async function googleStart(url, env, mode = 'login') {
  if (!googleOn(env)) return mode === 'gsc' ? backAdmin(url.origin, 'off') : back(url.origin, 'off');
  const state = randomB64(24), verifier = randomB64(48);
  const challenge = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  const q = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: url.origin + '/api/auth/google/callback',
    response_type: 'code',
    scope: mode === 'gsc' ? GSC_SCOPE : 'openid email',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    prompt: mode === 'gsc' ? 'select_account consent' : 'select_account',
  });
  if (mode === 'gsc') q.set('access_type', 'offline');
  const h = new Headers({ Location: AUTH_URL + '?' + q, 'Cache-Control': 'no-store' });
  h.append('Set-Cookie', `${STATE_COOKIE}=${mode === 'gsc' ? 'gsc' : 'login'}.${state}.${verifier}; Path=${STATE_PATH}; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
  return new Response(null, { status: 302, headers: h });
}

/* Step 2: Google sends the visitor back. Returns a redirect to the account page with ?google=ok, new, cancelled, failed or off.
   h holds helpers from index.mjs: getCookie, safeEqual, clientIp, tooMany, noteAttempt, startSession, sessionCookie, sessionMaxAge, cleanData,
   currentUser and saveSearchToken (for the Search Console connection). */
export async function googleCallback(request, url, env, h) {
  const [mode, state, verifier] = h.getCookie(request, STATE_COOKIE).split('.');
  if (mode === 'gsc') return gscCallback(request, url, env, h, state, verifier);
  if (!googleOn(env)) return back(url.origin, 'off', [clearState]);
  const ipKey = 'google:' + h.clientIp(request);
  if (await h.tooMany(env, ipKey, 30, 900000)) return back(url.origin, 'busy', [clearState]);
  await h.noteAttempt(env, ipKey);

  const gotState = url.searchParams.get('state') || '';
  if (!state || !verifier || !h.safeEqual(state, gotState)) return back(url.origin, 'failed', [clearState]);
  if (url.searchParams.get('error')) return back(url.origin, 'cancelled', [clearState]);
  const code = url.searchParams.get('code');
  if (!code) return back(url.origin, 'failed', [clearState]);

  let claims;
  try {
    const r = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: url.origin + '/api/auth/google/callback', grant_type: 'authorization_code', code_verifier: verifier,
      }),
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) { console.error('google token', r.status, body.error); return back(url.origin, 'failed', [clearState]); }
    claims = decodeIdToken(body.id_token);
  } catch (e) { console.error('google token', e && e.message); return back(url.origin, 'failed', [clearState]); }

  const email = typeof claims?.email === 'string' ? claims.email.trim().toLowerCase() : '';
  const sub = typeof claims?.sub === 'string' ? claims.sub : '';
  if (!claims || !ISSUERS.includes(claims.iss) || claims.aud !== env.GOOGLE_CLIENT_ID || !(claims.exp * 1000 > Date.now())
    || !sub || sub.length > 255 || !email || email.length > 254 || (claims.email_verified !== true && claims.email_verified !== 'true')) {
    return back(url.origin, 'failed', [clearState]);
  }

  /* Find the account: by Google id first, then by email (linking Google to an account made with a password). */
  let user = await env.DB.prepare('SELECT id FROM users WHERE google_sub = ?').bind(sub).first();
  let result = 'ok';
  if (!user) {
    user = await env.DB.prepare('SELECT id, google_sub FROM users WHERE email = ?').bind(email).first();
    if (user && user.google_sub && user.google_sub !== sub) return back(url.origin, 'other', [clearState]);
    if (user) await env.DB.prepare('UPDATE users SET google_sub = ? WHERE id = ?').bind(sub, user.id).run();
  }
  if (!user) {
    try {
      const res = await env.DB.prepare("INSERT INTO users (email, pw_hash, pw_salt, created_at, google_sub) VALUES (?, '', '', ?, ?)").bind(email, Date.now(), sub).run();
      user = { id: res.meta.last_row_id };
    } catch (e) { console.error('google signup', e && e.message); return back(url.origin, 'failed', [clearState]); }
    await env.DB.prepare('INSERT INTO user_data (user_id, json, updated_at) VALUES (?, ?, ?)').bind(user.id, JSON.stringify(h.cleanData({})), Date.now()).run();
    result = 'new';
  }
  const token = await h.startSession(env, user.id);
  return back(url.origin, result, [clearState, h.sessionCookie(token, h.sessionMaxAge)]);
}

const backAdmin = (origin, result, cookies = []) => {
  const h = new Headers({ Location: origin + '/admin/?gsc=' + result, 'Cache-Control': 'no-store' });
  cookies.forEach((c) => h.append('Set-Cookie', c));
  return new Response(null, { status: 302, headers: h });
};

/* The owner is back from Google after allowing read-only Search Console access. Only an admin who is signed in can save it. */
async function gscCallback(request, url, env, h, state, verifier) {
  if (!googleOn(env)) return backAdmin(url.origin, 'off', [clearState]);
  const user = await h.currentUser(request, env);
  if (!user || !user.is_admin) return backAdmin(url.origin, 'failed', [clearState]);
  if (!state || !verifier || !h.safeEqual(state, url.searchParams.get('state') || '')) return backAdmin(url.origin, 'failed', [clearState]);
  if (url.searchParams.get('error')) return backAdmin(url.origin, 'cancelled', [clearState]);
  const code = url.searchParams.get('code');
  if (!code) return backAdmin(url.origin, 'failed', [clearState]);
  if (!String(url.searchParams.get('scope') || '').split(' ').includes(GSC_SCOPE)) return backAdmin(url.origin, 'noscope', [clearState]);
  try {
    const r = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: url.origin + '/api/auth/google/callback', grant_type: 'authorization_code', code_verifier: verifier,
      }),
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok || !body.refresh_token) { console.error('gsc token', r.status, body.error); return backAdmin(url.origin, 'failed', [clearState]); }
    await h.saveSearchToken(env, body.refresh_token, body.access_token, body.expires_in);
  } catch (e) { console.error('gsc token', e && e.message); return backAdmin(url.origin, 'failed', [clearState]); }
  return backAdmin(url.origin, 'connected', [clearState]);
}
