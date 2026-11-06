"""A single HTML page showing the week: images, reels, captions, scores, guardrail results."""
import html
import os
from datetime import date
from pathlib import Path

from .common import DAYS

CSS = """
:root{--green:#2d6a4f;--leaf:#52b788;--cream:#fdfbf4;--ink:#1f2a24;--muted:#5f6f66;--line:#e3e8e1;--tomato:#d1495b;--card:#fff}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--cream:#141a17;--ink:#e8efe9;--muted:#9fb0a6;--line:#2b3631;--card:#1c2420}}
:root[data-theme=dark]{--cream:#141a17;--ink:#e8efe9;--muted:#9fb0a6;--line:#2b3631;--card:#1c2420}
*{box-sizing:border-box}body{margin:0;background:var(--cream);color:var(--ink);font:16px/1.5 Inter,system-ui,sans-serif}
main{max-width:1100px;margin:0 auto;padding:24px 16px 80px}h1{font:700 32px/1.1 Georgia,serif;color:var(--green);margin:8px 0}
.lead{color:var(--muted);max-width:70ch}.sum{display:flex;gap:10px;flex-wrap:wrap;margin:16px 0 28px}
.sum span{background:var(--card);border:1px solid var(--line);border-radius:999px;padding:6px 14px;font-weight:600;font-size:14px}
h2{font:700 22px Georgia,serif;margin:36px 0 12px;border-bottom:2px solid var(--line);padding-bottom:6px}
.post{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;margin:0 0 18px}
.head{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:10px}
.tag{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;border-radius:999px;padding:3px 10px;background:var(--line)}
.ok{background:#d8f3dc;color:#1b4332}.held{background:#ffd6dc;color:#7a1626}.time{font-weight:700}
.media{display:flex;gap:8px;overflow-x:auto;padding-bottom:6px}.media img{height:300px;border-radius:10px;border:1px solid var(--line)}
.media video{height:420px;border-radius:10px;background:#000}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:10px}@media(max-width:760px){.cols{grid-template-columns:1fr}.media img{height:220px}.media video{height:340px}}
pre{white-space:pre-wrap;font:14px/1.45 Inter,system-ui,sans-serif;background:var(--cream);border:1px solid var(--line);border-radius:10px;padding:10px;margin:4px 0 0}
.lbl{font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.4px;margin-top:8px}
.fails{color:var(--tomato);font-weight:600;font-size:14px}.small{font-size:13px;color:var(--muted)}
details summary{cursor:pointer;color:var(--muted);font-size:14px}
"""


def page(plan, media_url=lambda p: p, title=None):
    posts = plan["posts"]
    start = date.fromisoformat(plan["week_start"])
    ready = sum(1 for p in posts if p["status"] == "ready")
    held = [p for p in posts if p["status"] != "ready"]
    q = [p["quality"]["score"] for p in posts if p.get("quality", {}).get("score") is not None]
    out = [f"<!doctype html><html lang='en-GB'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'>"
           f"<title>{html.escape(title or 'Social preview')}</title><style>{CSS}</style></head><body><main>",
           f"<h1>{html.escape(title or 'Homegrown Plate: week of ' + start.strftime('%-d %B %Y'))}</h1>",
           "<p class='lead'>Preview only. Nothing has been sent to Buffer. Every post has passed (or failed) the guardrails, "
           "then had its quality scored out of 100.</p>",
           f"<div class='sum'><span>{len(posts)} posts</span><span>{ready} ready</span><span>{len(held)} held back</span>"
           f"<span>Average quality {round(sum(q)/len(q)) if q else '-'}</span>"
           + "".join(f"<span>Key moment: {html.escape(m['title'])}</span>" for m in plan.get("moments", [])) + "</div>"]
    if held:
        out.append("<h2>Held back</h2>")
        for p in held:
            out.append(f"<p><b>{html.escape(p['date'])} {p['kind']}: {html.escape(p['topic'])}</b><br><span class='fails'>"
                       + "<br>".join(html.escape(r) for r in p.get("held_reasons", [])) + "</span></p>")
    day = None
    for p in posts:
        d = date.fromisoformat(p["date"])
        if d != day:
            day = d
            out.append(f"<h2>{DAYS[d.weekday()]} {d.strftime('%-d %B')}</h2>")
        st = "ok" if p["status"] == "ready" else "held"
        qs = p.get("quality", {}).get("score")
        out.append(f"<div class='post'><div class='head'><span class='time'>{p['time']}</span><span class='tag'>{p['kind'].replace('_', ' ')}</span>"
                   f"<span class='tag'>{' + '.join(p['channels'])}</span><span class='tag {st}'>{'ready' if st == 'ok' else 'held'}</span>"
                   + (f"<span class='tag'>quality {qs}</span>" if qs is not None else "")
                   + (f"<span class='tag'>hook {p['hook'].get('score')}</span>" if p.get("hook") else "")
                   + (f"<span class='tag'>{p['reel']['seconds']}s</span>" if p.get("reel") else "")
                   + f"</div><b>{html.escape(p['topic'])}</b> <a class='small' href='{p['url']}'>{html.escape(p['url'].replace('https://', ''))}</a>")
        out.append("<div class='media'>")
        for m in p.get("media", []):
            u = media_url(m)
            if m.endswith(".mp4"):
                poster = media_url(p["cover"]) if p.get("cover") else ""
                out.append(f"<video controls preload='none' playsinline poster='{poster}' src='{u}'></video>")
            else:
                out.append(f"<img loading='lazy' src='{u}' alt=''>")
        if p.get("cover"):
            out.append(f"<img loading='lazy' src='{media_url(p['cover'])}' alt='Reel cover'>")
        out.append("</div>")
        c = p.get("captions", {})
        if c.get("instagram"):
            out.append("<div class='cols'><div><div class='lbl'>Instagram / Facebook caption</div>"
                       f"<pre>{html.escape(c['instagram'])}</pre></div><div>")
            if "pinterest" in p["channels"]:
                out.append(f"<div class='lbl'>Pinterest title</div><pre>{html.escape(c['pin_title'])}</pre>"
                           f"<div class='lbl'>Pinterest description ({len(c['pin_description'])} chars)</div><pre>{html.escape(c['pin_description'])}</pre>")
            if "tiktok" in p["channels"]:
                out.append(f"<div class='lbl'>TikTok (when the account exists)</div><pre>{html.escape(c['tiktok'])}</pre>")
            out.append("</div></div>")
        g = p.get("guardrails", {})
        out.append(f"<p class='small'>Guardrails: {'all passed' if g.get('passed') else '<span class=fails>' + html.escape('; '.join(g.get('fails', []))) + '</span>'}"
                   + (f" · Quality notes: {html.escape('; '.join(p['quality'].get('notes', [])))}" if p.get('quality', {}).get('notes') else "")
                   + (f" · Music: {p['reel']['music']}" if p.get("reel") else "")
                   + (" · Uses Mark's own media" if p.get("library_used") else " · Uses the site's images") + "</p>")
        if p.get("hook_candidates"):
            out.append("<details><summary>Hooks considered</summary><ul class='small'>" + "".join(
                f"<li>{h['score']}: {html.escape(h['hook'])}{'' if h['backed'] else ' (not backed: ' + html.escape(h['why']) + ')'}</li>"
                for h in p["hook_candidates"]) + "</ul></details>")
        out.append("</div>")
    out.append("</main></body></html>")
    return "\n".join(out)
