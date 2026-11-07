/* Small owner settings. 'gsc_refresh' holds the Search Console connection made from the dashboard,
   encrypted with a key derived from GOOGLE_CLIENT_SECRET (so a copy of the database alone cannot use it). */
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);
