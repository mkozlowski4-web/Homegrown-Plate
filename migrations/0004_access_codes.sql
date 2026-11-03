/* Access codes: the owner makes a code, a signed-in visitor redeems it for member access for a set number of days.
   gift_until is kept apart from paid_until so Stripe updates never overwrite time given by a code. */
ALTER TABLE users ADD COLUMN gift_until INTEGER;
CREATE TABLE IF NOT EXISTS access_codes (
  code TEXT PRIMARY KEY,
  days INTEGER NOT NULL,
  max_uses INTEGER,          /* NULL means no limit */
  uses INTEGER NOT NULL DEFAULT 0,
  redeem_by INTEGER,         /* last moment the code can be used; NULL means no end date */
  note TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);
/* One use of each code per account. */
CREATE TABLE IF NOT EXISTS code_redemptions (
  code TEXT NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  at INTEGER NOT NULL,
  PRIMARY KEY (code, user_id)
);
