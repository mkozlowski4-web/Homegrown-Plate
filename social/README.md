# Homegrown Plate social autopilot

Makes and queues a week of Instagram, Facebook and Pinterest posts (plus TikTok captions) for
homegrownplate.co.uk, from the site's own data. It lives inside the site repo (Mark's choice, 6 Nov 2026):

- **`social/` on `main`**: the code, templates, fonts and music. Only changes when the system itself is changed.
- **`social-data` branch**: every setting and record (brand, rules, guardrails, calendar, `site-data.json`, library, state, plans, `whatworks.md`). Checked out to `social/data/` by the workflows. All automatic saves go here, so the site on `main` never redeploys because of the autopilot.
- **`social-media` branch**: finished images and reels for the current and previous week plus the preview page, rebuilt from scratch each Saturday (so it never grows) and served by GitHub Pages at `https://mkozlowski4-web.github.io/Homegrown-Plate/` for Buffer to fetch.
- Mark's original photos and videos stay in Drive. A working copy is fetched only when a post uses it, so unposted clips never appear in this public repo. Mark's only job is dropping garden photos and
videos into the Google Drive folder **Social inbox**. Mark is not technical: never ask him to edit
code; walk him through clicks one at a time.

## How a week runs

| When (UK) | What | Where |
|---|---|---|
| Sat 06:00 | Refresh `site-data.json` from the site repo, copy new Drive files into `library/`, plan and make next week (Sun to Sat), put media online, save the plan to `plans/` | `.github/workflows/social-weekly.yml` |
| Daily 07:15 | Send posts due in the next 3 days to Buffer (free plan holds only 10 per channel) | `social-daily.yml` |
| Daily 09:30 | TikTok: Claude scheduled task uses Claude in Chrome on Mark's computer to schedule new reels for 19:00 | Claude scheduled task (set up after "go live", and only once Mark has TikTok) |
| Mon 08:45 | Results review, rules re-check, `whatworks.md` log, email to Mark | Claude scheduled task |

Posting slots: reels Tue and Fri 18:30, carousels Wed and Sun 18:30 (first Sunday of a month is
always "What to sow in <month>"), all copied to Facebook; a Story every day 09:00 (job / question /
crop of the day); a pin every day 20:00 plus a video pin 20:30 for each reel.

Nothing goes to Buffer until `state/live.json` contains `{"live": true}`. Until then each run only
makes the preview at `https://mkozlowski4-web.github.io/Homegrown-Plate/preview/latest/`.

## Files (on the `social-data` branch, under `social/data/` in the workflows)

- `site-data.json`: every crop, recipe, monthly sow/preserve page, pest page, kids project and page image, built by `scripts/build_site_data.mjs` straight from the site's data files and built pages. **The only source of facts.**
- `brand.json`: audience, voice, banned words, commission domains, spelling (en-GB), channels.
- `guardrails.json`: rules checked on every post (`autopilot/guardrails.py`). A failing post is held and listed in `state/held.json` and in Monday's email. Never rewrite a failing post to make it pass.
- `instagram-rules.json`, `pinterest-rules.json`, `tiktok-rules.json`: each assumption with value, claim, source URL and date checked, plus hook scoring weights. Monday's task re-checks them against platform announcements and large studies.
- `quality.json`: quality weights (hook 30, search words 20, one ask 15, sounds human 15, visual 10, channel rules 10). Under 70: one rewrite, then held.
- `calendar.json`: key moments; each goes out `lead_weeks` (default 6) before its date, takes an ordinary slot, and the ordinary post moves back a week (`state/rotation.json` `deferred`). Add Mark's dates here.
- `library/library.json`: one record per Drive photo or clip (crop, task, dish, best moment, when used). Nothing is reused within 12 weeks.
- `state/`: rotation, used topics, pinned pages, queued Buffer posts, errors, held posts, `buffer.json` (channels, boards, schema), `live.json`.
- `plans/<week>.json`: each week's posts with captions, scores, guardrail results and public media URLs.
- `whatworks.md`: dated one-line log from the Monday review.
- `templates/`: HTML for carousel slides (1080x1350), pins (1000x1500), Stories and reel overlays (1080x1920), in the site's colours; fonts in `assets/fonts` (Inter, TeX Gyre Pagella standing in for the site's Palatino-style serif).
- `music/`: original backing tracks made by `scripts/make_music.py` (royalty-free because they are generated).

## Code (`autopilot/`)

`planner.py` (the week), `hooks.py` (hook ideas and the 100-point score), `captions.py` (Gemini plus template fallback), `guardrails.py`, `quality.py`, `render.py` (Playwright screenshots), `reels.py` (ffmpeg), `intake.py` (Drive service account plus Gemini clip labelling, with a file-name fallback), `library.py`, `publish.py` (media repo and Buffer GraphQL), `preview.py`.

Run locally from `social/` with the data branch checked out into `social/data`: `git worktree add data social-data`, `(cd .. && node build.mjs)`, then `SITE_DIR=.. python run.py week --start 2026-11-08 --no-gemini`.

## Secrets and settings (repo Settings > Secrets and variables > Actions)

- `BUFFER_API_KEY`: Buffer API key (Buffer > Settings > API).
- `GEMINI_API_KEY`: Google AI Studio key. Note: Gemini's terms say UK users get paid services only; if the free key is refused, captions fall back to templates.
- `GOOGLE_SERVICE_ACCOUNT_JSON`: service account key JSON; the Social inbox folder is shared with its email as Viewer.
- Variables (optional): `PINTEREST_BOARD` (board name), `MEDIA_BASE_URL`.
- GitHub Pages: Settings > Pages > Deploy from a branch > `social-media` / root.

Run **Actions > Social - check keys** after adding keys; it writes `state/buffer.json` including the live
Buffer input schema. If Buffer renames metadata fields, fix `publish.build_input` to match that schema.

## Known limits

- Buffer cannot add poll stickers to Stories, so the "poll" Story is a question card.
- Buffer cannot set Meta's AI label; brand.json says AI images are never made, and the guardrail would require a "Made with AI" caption line if one ever appeared.
- Most crops on the site only have drawings, not photos. Posts built only from drawings lose 3 visual points; Mark's clips fix that.
- Cloudflare Workers Builds is connected to this repo. Optional tidy-up in Cloudflare (Settings > Builds): exclude `social-data` and `social-media` from non-production branch builds, and add `social/*` and `.github/*` to build watch path excludes so code changes here don't redeploy the site.
- Mark had no TikTok account as of 6 Nov 2026; TikTok captions are made anyway.
