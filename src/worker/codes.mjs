/* Access codes for limited-time member access. The owner creates and turns off codes on /admin/;
   signed-in visitors redeem them on the account or membership page. */

const DAY = 86400000;
const CODE_RE = /^[A-Z0-9][A-Z0-9-]{3,31}$/;
const normCode = (c) => (typeof c === 'string' ? c.trim().toUpperCase().replace(/\s+/g, '') : '');
/* No 0/O or 1/I, so codes are easy to read out and type. */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function randomCode() {
  const b = crypto.getRandomValues(new Uint8Array(8));
  const s = [...b].map((x) => ALPHABET[x % ALPHABET.length]).join('');
  return `GROW-${s.slice(0, 4)}-${s.slice(4)}`;
}

/* POST /api/redeem { code } */
export async function redeem(user, body, env, { tooMany, noteAttempt, isMember }) {
  const key = 'redeem:' + user.id;
  if (await tooMany(env, key, 10, 3600000)) return { status: 429, error: 'Too many tries. Please wait an hour and try again.' };
  const code = normCode(body?.code);
  await noteAttempt(env, key);
  const nope = { status: 404, error: 'That code is not right, or it has expired.' };
  if (!CODE_RE.test(code)) return nope;
  const row = await env.DB.prepare('SELECT code, days, max_uses, uses, redeem_by, active FROM access_codes WHERE code = ?').bind(code).first();
  const now = Date.now();
  if (!row || !row.active || (row.redeem_by && row.redeem_by < now)) return nope;
  const used = await env.DB.prepare('SELECT 1 AS x FROM code_redemptions WHERE code = ? AND user_id = ?').bind(code, user.id).first();
  if (used) return { status: 409, error: 'You have already used this code.' };
  /* Count the use first, only if there is a use left, so two people cannot take the last one. */
  const take = await env.DB.prepare('UPDATE access_codes SET uses = uses + 1 WHERE code = ? AND active = 1 AND (max_uses IS NULL OR uses < max_uses)').bind(code).run();
  if (!take.meta?.changes) return { status: 410, error: 'This code has been used up.' };
  /* Add the days on after any time the account already has, so nothing is wasted. */
  const paidLive = typeof user.paid_until === 'number' && user.paid_until > now && user.stripe_sub;
  if (paidLive && !user.cancel_at_end) {
    await env.DB.prepare('UPDATE access_codes SET uses = uses - 1 WHERE code = ?').bind(code).run();
    return { status: 409, error: 'You already pay for membership, so this code would not add anything.' };
  }
  const start = Math.max(now, user.gift_until || 0, paidLive && user.cancel_at_end ? user.paid_until : 0);
  const until = start + row.days * DAY;
  await env.DB.batch([
    env.DB.prepare('INSERT INTO code_redemptions (code, user_id, at) VALUES (?, ?, ?)').bind(code, user.id, now),
    env.DB.prepare('UPDATE users SET gift_until = ? WHERE id = ?').bind(until, user.id),
  ]);
  return { body: { ok: true, days: row.days, giftUntil: until, wasMember: isMember(user) } };
}

/* ---- owner only ---- */
export async function listCodes(env) {
  const r = await env.DB.prepare('SELECT code, days, max_uses AS maxUses, uses, redeem_by AS redeemBy, note, active, created_at AS createdAt FROM access_codes ORDER BY created_at DESC LIMIT 200').all();
  return { codes: r.results || [] };
}

export async function createCode(body, env) {
  const days = Number(body?.days);
  if (!Number.isInteger(days) || days < 1 || days > 730) return { status: 400, error: 'Days must be a whole number from 1 to 730.' };
  let maxUses = body?.maxUses === '' || body?.maxUses == null ? null : Number(body.maxUses);
  if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1 || maxUses > 100000)) return { status: 400, error: 'Uses must be a whole number, or left empty for no limit.' };
  let redeemBy = null;
  if (body?.redeemBy) {
    const t = Date.parse(body.redeemBy + 'T23:59:59Z');
    if (Number.isNaN(t) || t < Date.now()) return { status: 400, error: 'The last day to use it must be a date in the future.' };
    redeemBy = t;
  }
  const note = typeof body?.note === 'string' ? body.note.trim().slice(0, 120) : '';
  let code = normCode(body?.code);
  if (code && !CODE_RE.test(code)) return { status: 400, error: 'Codes are 4 to 32 letters, numbers or dashes.' };
  if (!code) code = randomCode();
  try {
    await env.DB.prepare('INSERT INTO access_codes (code, days, max_uses, redeem_by, note, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(code, days, maxUses, redeemBy, note || null, Date.now()).run();
  } catch { return { status: 409, error: 'That code already exists. Choose another.' }; }
  return { body: { ok: true, code } };
}

export async function setCodeActive(body, env) {
  const code = normCode(body?.code);
  const r = await env.DB.prepare('UPDATE access_codes SET active = ? WHERE code = ?').bind(body?.active ? 1 : 0, code).run();
  return r.meta?.changes ? { body: { ok: true } } : { status: 404, error: 'No such code.' };
}
