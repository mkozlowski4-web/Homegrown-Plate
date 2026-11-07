/* Membership. A user is a member while paid_until is in the future (plus a few days' grace),
   or when plan is 'comp' (a free membership given by the owner, for testing or as a gift). */
ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN paid_until INTEGER;
ALTER TABLE users ADD COLUMN cancel_at_end INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN stripe_customer TEXT;
ALTER TABLE users ADD COLUMN stripe_sub TEXT;
CREATE INDEX IF NOT EXISTS users_stripe_customer ON users(stripe_customer);

/* Stripe webhook events already handled, so a repeated delivery is ignored. */
CREATE TABLE IF NOT EXISTS stripe_events (
  id TEXT PRIMARY KEY,
  at INTEGER NOT NULL
);
