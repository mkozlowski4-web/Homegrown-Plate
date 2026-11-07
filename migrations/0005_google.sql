/* Sign in with Google: google_sub is Google's permanent id for the person's Google account.
   Accounts made with Google have no password: pw_hash and pw_salt are empty strings until the person sets one. */
ALTER TABLE users ADD COLUMN google_sub TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS users_google_sub ON users(google_sub) WHERE google_sub IS NOT NULL;
