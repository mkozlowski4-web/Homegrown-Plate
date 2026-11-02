ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0;

/* One row per counted page view or interaction. No IP address, no user agent and no user id is stored.
   vid is a short code made from the connection and browser with a salt that changes every day. */
CREATE TABLE IF NOT EXISTS hits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts INTEGER NOT NULL,
  day TEXT NOT NULL,
  kind TEXT NOT NULL,
  name TEXT,
  path TEXT NOT NULL,
  vid TEXT NOT NULL,
  ref TEXT,
  country TEXT,
  device TEXT
);
CREATE INDEX IF NOT EXISTS hits_day ON hits(day, kind);
CREATE INDEX IF NOT EXISTS hits_vid ON hits(day, vid);

/* Daily random salts. Old salts are deleted, so old visitor codes can never be re-created. */
CREATE TABLE IF NOT EXISTS salts (
  day TEXT PRIMARY KEY,
  salt TEXT NOT NULL
);

/* Traffic that was filtered out, counted by reason (no individual records kept). */
CREATE TABLE IF NOT EXISTS bot_counts (
  day TEXT NOT NULL,
  reason TEXT NOT NULL,
  n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, reason)
);
