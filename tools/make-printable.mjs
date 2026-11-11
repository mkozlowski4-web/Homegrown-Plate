/* Makes the downloads for the free printable sowing calendar (/printable-sowing-calendar/):
   the two-page A4 PDF, and a tall picture for Pinterest and link previews.

     npm run build
     node tools/make-printable.mjs

   Needs Google Chrome (or Chromium) installed. Files are saved to static/downloads/; commit them.
   Run it again whenever the crops on the printable or their calendar dates change. */
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, rmSync, existsSync, mkdirSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const OUT = join(ROOT, 'static/downloads');
const PAGE = join(DIST, 'printable-sowing-calendar/index.html');
if (!existsSync(PAGE)) { console.error('Build the site first: npm run build'); process.exit(1); }
const CHROME = ['google-chrome', 'chromium', 'chromium-browser', 'google-chrome-stable']
  .find((c) => spawnSync(c, ['--version']).status === 0);
if (!CHROME) { console.error('Google Chrome or Chromium is needed.'); process.exit(1); }
mkdirSync(OUT, { recursive: true });

/* The Pinterest picture: a title, then the vegetables sheet on a sheet of "paper". */
const html = readFileSync(PAGE, 'utf8');
const css = html.match(/<link rel="stylesheet" href="([^"]+)">/)[1];
const sheet = html.match(/<section class="ps-sheet"[\s\S]*?<\/section>/)[0].replace(/<a href="[^"]*">([^<]*)<\/a>/g, '$1');
const crops = (html.match(/when to sow, plant out and harvest (\d+)/) || [])[1] || '';
writeFileSync(join(DIST, '_pin.html'), `<!DOCTYPE html><html lang="en-GB"><head><meta charset="UTF-8">
<link rel="stylesheet" href="${css}">
<style>
  html, body { margin: 0; width: 1000px; height: 1500px; overflow: hidden; }
  body { background: #2d6a4f; font-family: Inter, system-ui, sans-serif; color: #fff; }
  .top { padding: 70px 70px 0; }
  .free { display: inline-block; background: #f4a261; color: #1f2a24; font-weight: 700; font-size: 26px; letter-spacing: .08em; padding: 8px 20px; border-radius: 999px; }
  h1 { font-family: var(--serif); font-weight: 500; color: #fff; font-size: 104px; line-height: 1; margin: 30px 0 18px; letter-spacing: -.02em; }
  .sub { font-size: 34px; line-height: 1.35; color: #e3efe8; margin: 0; }
  .paper { position: absolute; left: 60px; top: 480px; width: 1180px; background: #fff; padding: 30px 34px 24px; border-radius: 10px;
    transform-origin: top left; transform: scale(.745) rotate(-2deg); box-shadow: 0 30px 60px rgba(0,0,0,.35); color: #1f2a24; }
  .paper.back { height: 1250px; transform: translate(40px, -20px) scale(.745) rotate(2.5deg); opacity: .5; }
  .paper .cal-wrap { overflow: visible; }
  .paper table.ps-cal { min-width: 0; font-size: 15px; }
  .paper table.ps-cal td, .paper table.ps-cal th { padding: 3px 4px; }
  .paper .ps-foot { display: none; }
  .foot { position: absolute; left: 0; right: 0; bottom: 0; background: #1f4d38; padding: 26px 70px; font-size: 34px; font-weight: 600; display: flex; justify-content: space-between; }
</style></head><body>
<div class="top"><span class="free">FREE PRINTABLE</span><h1>UK sowing calendar</h1>
<p class="sub">When to sow, plant out and harvest ${crops} popular veg, salads, herbs and fruit. Two A4 pages.</p></div>
<div class="paper back"></div>
<div class="paper">${sheet}</div>
<div class="foot"><span>Homegrown Plate</span><span>homegrownplate.co.uk</span></div>
</body></html>`);

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff': 'font/woff', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };
const server = createServer((req, res) => {
  let file = join(DIST, decodeURIComponent(req.url.split('?')[0]));
  if (file.endsWith('/')) file = join(file, 'index.html');
  if (!file.startsWith(DIST) || !existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' });
  res.end(readFileSync(file));
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${server.address().port}`;
const chrome = (args) => new Promise((ok, fail) => {
  const p = spawn(CHROME, ['--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', ...args], { stdio: 'ignore' });
  p.on('exit', (code) => (code === 0 ? ok() : fail(new Error(`Chrome exited with ${code}`))));
});

const pdf = join(OUT, 'uk-sowing-calendar-homegrown-plate.pdf');
const pin = join(OUT, 'uk-sowing-calendar-pin.png');
try {
  await chrome(['--no-pdf-header-footer', `--print-to-pdf=${pdf}`, `${base}/printable-sowing-calendar/`]);
  await chrome(['--window-size=1000,1500', '--force-device-scale-factor=1', `--screenshot=${pin}`, `${base}/_pin.html`]);
} finally {
  server.close();
  rmSync(join(DIST, '_pin.html'), { force: true });
}
console.log(`Saved ${pdf}\nSaved ${pin}\nCommit them, then build again so the site includes them.`);
