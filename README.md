# Homegrown Plate

A static website for growing your own food in any size of garden. Domain: homegrownplate.co.uk

## Project structure

```
index.html            Shell, navigation and script order
_headers              Security headers for Cloudflare Pages
css/style.css         All styling
js/data/sizes.js      Garden size guides
js/data/plants.js     Crop data (add crops here)
js/data/recipes.js    Recipes (add recipes here)
js/data/guide.js      How-to steps and harvesting advice
js/helpers.js         Shared helper functions
js/pages.js           Page templates
js/router.js          Hash-based routing and filters
images/               Put real photos here (not yet used)
```

## Run locally

Open `index.html` in a browser, or run a local server from this folder:

```
python -m http.server 8000
```

Then visit http://localhost:8000.

## Adding content

- **New crop:** add an object to `PLANTS` in `js/data/plants.js`. Give it a unique `id` and list its `sizes`.
- **New recipe:** add an object to `RECIPES` in `js/data/recipes.js`. Use plant ids in `uses` so it links to the Plant Guide.
- **New garden size:** add an entry to `SIZES` in `js/data/sizes.js`, then add its id to the `sizes` of each crop that suits it.

## Deploy (Cloudflare Pages)

1. Create a GitHub repository (for example `homegrown-plate`) and push the contents of this folder so `index.html` sits at the top level.
2. In the Cloudflare dashboard, go to Workers & Pages > Create > Pages > Connect to Git, and select the repo.
3. Use these build settings:
   - Framework preset: None
   - Build command: (leave blank)
   - Build output directory: / (or leave blank)
4. Save and deploy.
5. Open the project's Custom domains tab and add `homegrownplate.co.uk` and `www.homegrownplate.co.uk`.

Every push to the repository redeploys the site automatically.

## Before launch

- Replace placeholder content with checked sowing times for your region.
- Add real photos to `images/`.
- Add a privacy policy and terms page before taking payments.
