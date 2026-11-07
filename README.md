# Homegrown Plate

Source for [homegrownplate.co.uk](https://homegrownplate.co.uk): a guide to growing your own food in any size of garden. 128 crops, each with five detailed collapsible sections (info, how to sow, how to grow, how to harvest, usage and storage), sun, garden-size and difficulty filter buttons, variety groups (for example first early, second early and maincrop potatoes), a UK planting calendar, how-to and harvesting advice, storage tips, 50 pest and disease guides and 103 recipes (every crop appears in at least one).

The site is built into plain static HTML, so every crop, recipe and garden size has its own real page (for example `/plants/tomato/`) that search engines can index. There are no dependencies to install.

## Folder layout

| Path | What it is |
| --- | --- |
| `src/data/` | All the content: `plants.mjs`, `sizes.mjs`, `recipes.mjs`, `guide.mjs`, `calendar.mjs` |
| `src/assets/` | `style.css`, `site.js` (filters and month highlight), `favicon.svg` |
| `static/` | Files copied as-is to the site root, e.g. `_headers` |
| `build.mjs` | The generator. Writes everything to `dist/` |

`dist/` is created by the build and is not stored in Git.

## Build and preview

Needs Node 18 or newer.

```
node build.mjs
python3 -m http.server -d dist 8000
```

Then open http://localhost:8000. The build stops with a clear error if the data has a mistake (unknown crop id, missing calendar entry, duplicate id), and prints a warning if a garden size recommends a crop that does not list that size.

## Deploy (Cloudflare)

The repo works with either Cloudflare Workers (static assets) or Cloudflare Pages.

**Workers (uses `wrangler.jsonc`):** in the project's Settings > Build, set the build command to `npm run build` and the deploy command to `npx wrangler deploy`. The publish folder (`dist`) is set in `wrangler.jsonc`, and its `name` must match the project name in Cloudflare.

**Pages:**

In Workers & Pages, open the project, then Settings > Builds:

- Framework preset: None
- Build command: `npm run build`
- Build output directory: `dist`

Custom domains are `homegrownplate.co.uk` (the canonical address used in page tags and the sitemap) and `www.homegrownplate.co.uk`. Set up a redirect from `www` to the bare domain. To use a different canonical address, set the `SITE_URL` environment variable in Cloudflare (for example `https://www.homegrownplate.co.uk`).

## Membership and payments

What each kind of visitor gets is set out on `/membership/`. In short: no account means up to 5 crops in My Garden and general monthly jobs; a free account means up to 8 crops, a monthly plan for their own crops and area, and their garden on every device; members (£12 a year) get unlimited crops and the week-ahead plan with the forecast and best days for each job. The 8-crop limit and the week-ahead forecast are enforced by the Worker, not just the page.

Payments use Stripe Checkout and the Stripe customer portal (`src/worker/billing.mjs`). Until all three settings below exist, the site says membership is opening soon and nothing can be bought.

1. Apply the database change once by running `migrations/0003_membership.sql` in the D1 console (done on 3 Nov 2026). The migrations in this repo are applied by hand, so do not use `wrangler d1 migrations apply`, which would try to re-run them.
2. In Stripe (start in **test mode**): create a product "Homegrown Plate membership" with a recurring yearly price of £12, and copy the price id (`price_...`).
3. In Stripe, Developers > Webhooks, add the endpoint `https://homegrownplate.co.uk/api/stripe-webhook` with the events `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated` and `customer.subscription.deleted`. Copy its signing secret (`whsec_...`).
4. In Stripe, Settings > Billing > Customer portal, turn on cancelling and updating payment methods.
5. Put the price id in `wrangler.jsonc` under `vars` as `STRIPE_PRICE` (it is not secret, and dashboard text variables are wiped by each deploy). In Cloudflare, Worker > Settings > Variables and Secrets, add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` as **Secrets**. Use test values first (only admin accounts can join while the key is a test key), pay with Stripe's test card 4242 4242 4242 4242, then swap all three for live ones.

**Access codes:** make codes on `/admin/` (Access codes). Each gives member access for a set number of days, can be limited to a number of people and a last day to use it, and can be turned off. People enter it on their account page, or open the link from Copy link (`/account/?code=...`), which fills it in. Each account can use a code once, days from several codes add up, and someone on code time who then joins is not charged until the code time ends.

To give someone free membership (or yourself, for testing), run in the D1 console: `UPDATE users SET plan = 'comp' WHERE email = 'them@example.com';` Set it back with `plan = 'free'`.

## Updating content

- **Add a crop:** copy an entry in `src/data/plants.mjs`, give it a unique lowercase `id`, list the garden sizes it suits, then add a matching line in `src/data/calendar.mjs` and (optionally) list it under the sizes in `sizes.mjs`.
- **Add a recipe:** copy an entry in one of the files in `src/data/recipes/` (or the starter list in `src/data/recipes.mjs`). The `id` becomes the web address, and `uses` lists the crop ids it features.
- **Add care tasks:** edit `src/data/care.mjs`. Each crop has a list of `[months, text]` jobs (months like `"4-8"` or `"11-2"`). They show on the plant page and in My Garden.
- **Variety type timings:** crops with types (for example autumn and spring onion sets) have each type's months in `src/data/group-calendar.mjs`, keyed by the type's short id. A crop's calendar is its own months plus all its types' months, so lists like "What to sow in October" pick up every type. The build stops if a type has no entry. `tools/make-group-calendar.mjs` drafted the file from each type's timing text; edit the data file directly from now on.
- **Calendar timings:** each is 12 characters, January to December, `1` meaning active. `i` = sow indoors, `o` = sow or plant outside, `h` = harvest.

Timings are typical UK estimates. Check them against your local frost dates.

## Sitemap dates

Each page's `<lastmod>` date in `sitemap.xml` only changes when that page's own content changes. `src/data/page-dates.json` stores a fingerprint and date for every page. After changing content, run `npm run dates` and commit the updated file with your change. If you forget, nothing breaks: the changed pages are simply dated with the day of each build until the file is updated (the build prints a note saying how many).

## What the build produces

A page per section, crop, garden size and recipe, plus `sitemap.xml`, `robots.txt`, a `404.html`, page titles and descriptions, canonical and social tags, and recipe and breadcrumb structured data. Old `/#/plants/tomato` style links forward to the new addresses.

## Plant images

Every plant has a drawn illustration (generated from `src/illustrations.mjs`). To use a real photo instead, drop `src/photos/<plant-id>.jpg` and optionally describe and credit it in `src/photos/photos.json`; see `src/photos/README.md`.


- `src/data/storage.mjs` (with `src/data/storage/`): ways to store a surplus of each crop (3+ methods each), shown on plant pages under Usage and storage.

- `src/data/zones.mjs`: six regional timing zones and the postcode-area lookup. The site script shifts sowing, planting and harvest dates in half-month steps for the visitor’s area (saved in the browser only).

- `src/data/beginners.mjs`: beginner crop picks (checked as Easy and suited to the size and sun), soil guides, shopping list and first-year plan for the Beginner’s Guide page.
- `src/data/kids.mjs`: the six kids' grow projects, six recipes and grown-up safety notes for `/kids/` and the Kids mode home block. Crop links are checked at build. Kids mode is a `data-kids` attribute on `<html>` set by `src/assets/theme.js` (saved in localStorage as `hp-kids`); its look is the `html[data-kids]` rules in `style.css`.

## Installable app (PWA)

The site can be installed to a phone or computer home screen. `static/manifest.webmanifest` and `static/icons/` hold the app details and icons (made from `src/assets/favicon.svg`). `build.mjs` generates `dist/sw.js` (a service worker: pages network-first with an offline fallback at `/offline/`, other files stale-while-revalidate; the cache name changes when the shell files change). `/install/` explains how to install and shows an install button where the browser supports it. `static/_headers` stops `sw.js` being cached. No inline scripts are used, so the CSP is unchanged.

## Accounts (save your garden across devices)

Accounts are optional; the site works fully without one. A small Cloudflare Worker (`src/worker/index.mjs`, set as `main` in `wrangler.jsonc`) runs first for `/api/*` only and serves everything else from `dist/`. Data is in a D1 database (`homegrown-plate`, schema in `migrations/0001_init.sql`).

- Email and password. Passwords are PBKDF2-SHA256 hashed with a per-user salt; session tokens live in an HttpOnly cookie and only their SHA-256 hash is stored. Sign-in attempts are rate limited, and write requests must come from the site's own origin.
- Stored per account: email, password hash, and one JSON blob (garden crops, ticked-off jobs, region and postcode area only, kids mode). The Worker validates and trims this blob.
- The browser side is the `Acct` block in `src/assets/site.js`. While signed in (`hp-acct` in localStorage) every change to `hp-garden*`, `hp-region` and `hp-kids` is pushed, and every page load pulls the account copy (the account wins; the first sign-in on a device merges).
- Pages: `/account/` (sign in, create, change password, download data, delete account) and `/privacy/`. Set `CONTACT_EMAIL` in `build.mjs` to show a contact address on the privacy page.
- There is no password reset yet: it needs an email-sending service.
- **Continue with Google** (`src/worker/google.mjs`): the Worker does the whole Google sign-in itself (OAuth code flow with PKCE), so no Google script runs on the site and the CSP is unchanged. It asks Google only for the email address (scopes `openid email`) and stores Google's account id in `users.google_sub` (`migrations/0005_google.sql`, applied 7 Nov 2026). A Google sign-in with the same verified email as a password account links to that account. Accounts made with Google have no password (empty `pw_hash`) until the person sets one on the account page; deleting one is confirmed by typing the email address. The button only shows once both settings exist:
  1. Google Cloud console, Google Auth Platform: set up the consent screen (External, app name Homegrown Plate, authorised domain `homegrownplate.co.uk`) and publish it. No Google review is needed for these basic scopes.
  2. Clients > Create client > Web application, with the authorised redirect URI `https://homegrownplate.co.uk/api/auth/google/callback`.
  3. Put the client ID in `wrangler.jsonc` under `vars` as `GOOGLE_CLIENT_ID`, and add `GOOGLE_CLIENT_SECRET` in Cloudflare as a **Secret**.
- Run the schema again with `wrangler d1 execute homegrown-plate --remote --file migrations/0001_init.sql` if the database is ever recreated (the id in `wrangler.jsonc` must then be updated).

## About, contact, disclosure and kit pages

`buildAbout()` in `build.mjs` makes `/about/`, `/contact/`, `/affiliate-disclosure/` and `/kit/` (the kit page reuses the shopping lists in `src/data/beginners.mjs`). The public contact address is `CONTACT_EMAIL` in `build.mjs`; it must be set up to forward (Cloudflare Email Routing). The disclosure page says there are currently no affiliate links: update it when links go live.

## Visitor analytics and the owner dashboard

First-party and cookieless; no third-party scripts. `src/assets/site.js` (the `track` block) sends a small beacon to `POST /api/hit` once a page has been visible for about a second, plus interaction events (add crop, tick job, kids mode, area set, search, install, sign-up). It sends nothing if Do Not Track or Global Privacy Control is on. `src/worker/analytics.mjs` filters bots and scrapers on the server (known crawler/AI/SEO/HTTP-library user agents, automated browsers, cloud hosting networks, missing browser headers, more than 150 hits an hour) and only counts what was filtered, by reason, in `bot_counts`. The owner's own visits are never counted.

Stored per hit: day, page, rough country, device type, referring site and a visitor code (a hash of IP + browser + a random per-day salt, deleted after two days). No IP, user agent or user id is stored, so unique visitors are per day only. Raw rows are deleted after 400 days. Schema in `migrations/0002_analytics.sql`.

The dashboard is `/admin/` (not in the sitemap, `noindex`); its data comes from `GET /api/admin/stats`, which returns 404 unless the signed-in account has `is_admin = 1`. To make an account the owner: `UPDATE users SET is_admin = 1 WHERE email = '...';` in D1.

## Google ranking in the dashboard

`/admin/` has a "Google search" section (average position, clicks, impressions, top searches and pages) read from the Search Console API by `src/worker/gsc.mjs`. Until it is set up it shows a "Not connected yet" panel.

One-time setup (usual way, no keys):
1. Google Cloud, in the same project as Continue with Google: enable the **Google Search Console API**.
2. On `/admin/`, tap **Connect Google Search**, choose the Google account that owns the Search Console property and allow read-only access. Google shows an "unverified app" warning for this read-only permission because the app has not been through Google's review; as the owner, choose Advanced and continue. The refresh token is stored encrypted in the `settings` table (`migrations/0006_settings.sql`, applied 7 Nov 2026), keyed from `GOOGLE_CLIENT_SECRET`, so changing that secret means connecting again. **Disconnect Google Search** under the figures removes it and revokes it with Google.

Fallback (service account): new Google Cloud accounts block service account keys by default (`iam.disableServiceAccountKeyCreation`). Where keys are allowed: create a service account and JSON key, add its email as a **Restricted** user in Search Console, and add the whole JSON as the Cloudflare secret `GOOGLE_SERVICE_ACCOUNT`. The owner connection above takes priority when both exist.

Optional: variable `GSC_SITE` if the property isn't `sc-domain:homegrownplate.co.uk` (URL-prefix properties look like `https://homegrownplate.co.uk/`).

Google's data runs about two days behind, and a new site can show nothing for a few weeks.

## Garden jobs this weekend
`/this-weekend/` shows the current month's UK jobs (`src/data/weekend-jobs.mjs`, one list per month with a weather tag and optional first/second-half) to everyone, with static pages at `/weekend-jobs/<month>/`. Signed-in visitors also get a day-by-day plan (`src/assets/weekend.js`) that combines those jobs with the crops in My Garden (shifted for their region) and the weekend forecast.

The forecast comes from `/api/weather?zone=<id>` (`src/worker/weather.mjs`, signed-in only). It calls MET Norway's Locationforecast 2.0 for one fixed city per region, summarises it per UK day and caches it for 3 hours, so it makes at most six upstream calls every three hours. It needs no key or secret. MET Norway's terms require the identifying User-Agent (set in `weather.mjs`, so keep it a website address, not a personal email) and credit under CC BY 4.0, which the plan shows.
