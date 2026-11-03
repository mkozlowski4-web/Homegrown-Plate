/* Membership payments with Stripe (Checkout for paying, the Customer Portal for cancelling or changing card).
   Card details never reach this site. Settings, all in Cloudflare (Worker > Settings > Variables and Secrets):
     STRIPE_SECRET_KEY     secret, sk_test_... while testing, sk_live_... when live
     STRIPE_WEBHOOK_SECRET secret, whsec_... from the webhook endpoint set up in Stripe
     STRIPE_PRICE          the price id (price_...) of the yearly membership
   Until all three are set, membership is shown as "opening soon" and nothing can be bought. */

const API = 'https://api.stripe.com/v1/';
const GRACE_MS = 3 * 86400000; /* keep access for a few days if a renewal payment is late */
const enc = new TextEncoder();

export const paymentsOn = (env) => !!(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET && env.STRIPE_PRICE);

export function isMember(user, now = Date.now()) {
  if (!user) return false;
  if (user.plan === 'comp') return true;
  return typeof user.paid_until === 'number' && user.paid_until + GRACE_MS > now;
}

/* Stripe takes form-encoded bodies with bracketed keys, e.g. line_items[0][price]. */
function form(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (typeof v === 'object') form(v, key, out); else out.append(key, String(v));
  }
  return out;
}
async function stripe(env, method, path, params) {
  const init = { method, headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } };
  if (params) { init.body = form(params); init.headers['Content-Type'] = 'application/x-www-form-urlencoded'; }
  const res = await fetch(API + path, init);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Stripe ${path}: ${body?.error?.message || res.status}`);
  return body;
}

/* Newer Stripe API versions keep the period end on the subscription item, older ones on the subscription. */
const periodEnd = (sub) => (sub.current_period_end || sub.items?.data?.[0]?.current_period_end || 0) * 1000;
const LIVE = new Set(['active', 'trialing', 'past_due']);

async function saveSubscription(env, sub, userIdHint) {
  const customer = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
  let user = null;
  const uid = Number(userIdHint || sub.metadata?.user_id);
  if (uid) user = await env.DB.prepare('SELECT id FROM users WHERE id = ?').bind(uid).first();
  if (!user && customer) user = await env.DB.prepare('SELECT id FROM users WHERE stripe_customer = ?').bind(customer).first();
  if (!user) return; /* account deleted since, nothing to do */
  const live = LIVE.has(sub.status);
  const until = live ? periodEnd(sub) : Math.min(periodEnd(sub) || Date.now(), (sub.ended_at || sub.canceled_at || Date.now() / 1000) * 1000);
  await env.DB.prepare('UPDATE users SET stripe_customer = ?, stripe_sub = ?, paid_until = ?, cancel_at_end = ? WHERE id = ?')
    .bind(customer || null, live ? sub.id : null, until || null, live && (sub.cancel_at_period_end || sub.cancel_at) ? 1 : 0, user.id).run();
}

/* POST /api/checkout: start paying. Returns the Stripe page to send the visitor to. */
export async function startCheckout(user, env, origin) {
  if (!paymentsOn(env)) return { status: 503, error: 'Membership is not open yet. Please check back soon.' };
  if (isMember(user)) return { status: 409, error: 'You are already a member.' };
  const row = await env.DB.prepare('SELECT stripe_customer FROM users WHERE id = ?').bind(user.id).first();
  const session = await stripe(env, 'POST', 'checkout/sessions', {
    mode: 'subscription',
    line_items: { 0: { price: env.STRIPE_PRICE, quantity: 1 } },
    client_reference_id: String(user.id),
    customer: row?.stripe_customer || undefined,
    customer_email: row?.stripe_customer ? undefined : user.email,
    subscription_data: { metadata: { user_id: String(user.id) } },
    allow_promotion_codes: 'true',
    success_url: `${origin}/account/?member=welcome`,
    cancel_url: `${origin}/membership/`,
  });
  return { body: { url: session.url } };
}

/* POST /api/billing: the Stripe page where members cancel, change card or get receipts. */
export async function billingPortal(user, env, origin) {
  if (!paymentsOn(env)) return { status: 503, error: 'Membership is not open yet.' };
  const row = await env.DB.prepare('SELECT stripe_customer FROM users WHERE id = ?').bind(user.id).first();
  if (!row?.stripe_customer) return { status: 404, error: 'There is no membership payment on this account.' };
  const s = await stripe(env, 'POST', 'billing_portal/sessions', { customer: row.stripe_customer, return_url: `${origin}/account/` });
  return { body: { url: s.url } };
}

/* When an account is deleted, stop its membership so it is never charged again. */
export async function cancelOnDelete(env, userId) {
  if (!env.STRIPE_SECRET_KEY) return;
  const row = await env.DB.prepare('SELECT stripe_sub FROM users WHERE id = ?').bind(userId).first();
  if (row?.stripe_sub) await stripe(env, 'DELETE', `subscriptions/${row.stripe_sub}`);
}

/* ---- Webhook: Stripe tells us when a membership starts, renews, changes or ends ---- */
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
function safeEqual(a, b) { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }

export async function verifySignature(payload, header, secret, now = Date.now()) {
  const parts = {}; const v1 = [];
  for (const p of (header || '').split(',')) { const [k, v] = p.split('='); if (k === 'v1') v1.push(v || ''); else if (k) parts[k] = v; }
  const t = Number(parts.t);
  if (!t || !v1.length || Math.abs(now / 1000 - t) > 300) return false;
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = hex(await crypto.subtle.sign('HMAC', key, enc.encode(`${t}.${payload}`)));
  return v1.some((s) => safeEqual(s, sig));
}

export async function webhook(request, env) {
  if (!env.STRIPE_WEBHOOK_SECRET) return new Response('Not configured', { status: 503 });
  const payload = await request.text();
  if (payload.length > 200000) return new Response('Too large', { status: 413 });
  if (!(await verifySignature(payload, request.headers.get('Stripe-Signature'), env.STRIPE_WEBHOOK_SECRET))) return new Response('Bad signature', { status: 400 });
  let event; try { event = JSON.parse(payload); } catch { return new Response('Bad payload', { status: 400 }); }
  const seen = await env.DB.prepare('SELECT id FROM stripe_events WHERE id = ?').bind(event.id).first();
  if (seen) return new Response('ok');
  const obj = event.data?.object || {};
  if (event.type === 'checkout.session.completed' && obj.mode === 'subscription' && obj.subscription) {
    const sub = await stripe(env, 'GET', `subscriptions/${obj.subscription}`);
    await saveSubscription(env, sub, obj.client_reference_id);
  } else if (/^customer\.subscription\.(created|updated|deleted|resumed|paused)$/.test(event.type)) {
    /* Re-read the subscription so events arriving out of order still leave the right state. */
    const sub = event.type.endsWith('deleted') ? obj : await stripe(env, 'GET', `subscriptions/${obj.id}`);
    await saveSubscription(env, sub);
  }
  await env.DB.prepare('INSERT OR IGNORE INTO stripe_events (id, at) VALUES (?, ?)').bind(event.id, Date.now()).run();
  env.DB.prepare('DELETE FROM stripe_events WHERE at < ?').bind(Date.now() - 30 * 86400000).run().catch(() => {});
  return new Response('ok');
}
