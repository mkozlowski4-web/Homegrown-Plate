# Homegrown Plate

A single-page website for growing your own food in any size of garden: garden-size guidance, a 28-crop plant guide, a UK planting calendar, how-to and harvesting advice, and recipes built around what you grow.

## Files

- `index.html`: the whole site (content, styles and scripts)
- `_headers`: security headers for Cloudflare Pages
- `README.md`: this file

## Preview locally

Open `index.html` in a browser, or run `python -m http.server 8000` in this folder and visit http://localhost:8000.

## Deploy (Cloudflare Pages)

1. Push this folder's contents to a GitHub repository, with `index.html` at the top level.
2. In the Cloudflare dashboard, go to Workers & Pages > Create > Pages > Connect to Git, and select the repo.
3. Use these build settings:
   - Framework preset: None
   - Build command: (leave blank)
   - Build output directory: / (or leave blank)
4. Save and deploy, then add homegrownplate.co.uk and www.homegrownplate.co.uk under Custom domains.

## Updating content

Edit the arrays at the top of the `<script>` section in `index.html`: `PLANTS`, `SIZES`, `RECIPES`, `HOWTO`, `HARVEST`, and `CALENDAR` (monthly timings, as 12-character strings of 1s and 0s).

Timings are typical UK estimates. Check them against your local frost dates.
