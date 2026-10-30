# Homegrown Plate

Source for [homegrownplate.co.uk](https://www.homegrownplate.co.uk): a guide to growing your own food in any size of garden. 28 crops, a UK planting calendar, how-to and harvesting advice, storage tips and recipes.

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

## Deploy (Cloudflare Pages)

In Workers & Pages, open the project, then Settings > Builds:

- Framework preset: None
- Build command: `npm run build`
- Build output directory: `dist`

Custom domains are `www.homegrownplate.co.uk` (the canonical address used in page tags and the sitemap) and the bare domain. Set up a redirect from the bare domain to `www`. To use a different canonical address, set the `SITE_URL` environment variable in Cloudflare (for example `https://homegrownplate.co.uk`).

## Updating content

- **Add a crop:** copy an entry in `src/data/plants.mjs`, give it a unique lowercase `id`, list the garden sizes it suits, then add a matching line in `src/data/calendar.mjs` and (optionally) list it under the sizes in `sizes.mjs`.
- **Add a recipe:** copy an entry in `src/data/recipes.mjs`. The `id` becomes the web address.
- **Calendar timings:** each is 12 characters, January to December, `1` meaning active. `i` = sow indoors, `o` = sow or plant outside, `h` = harvest.

Timings are typical UK estimates. Check them against your local frost dates.

## What the build produces

A page per section, crop, garden size and recipe, plus `sitemap.xml`, `robots.txt`, a `404.html`, page titles and descriptions, canonical and social tags, and recipe and breadcrumb structured data. Old `/#/plants/tomato` style links forward to the new addresses.
