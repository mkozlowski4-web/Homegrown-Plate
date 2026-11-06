"""Captions. Gemini (free tier) writes them from site facts only; built-in templates take over if it fails."""
import json
import re
import time

import requests

from .common import env, load

ASKS = {
    "save": "Save this for when you need it.",
    "send": "Send this to a fellow grower who needs it.",
    "comment": "Tell me in the comments: what are you growing this month?",
}
ASK_ORDER = ["save", "send", "comment"]


def clean(t):
    """Site sentences into caption-friendly text (no em dashes, plain spacing)."""
    t = re.sub(r"\s*[—–]\s*(?=[A-Za-z])", ", ", t) if "—" in t else t
    return re.sub(r"\s+", " ", t).strip()


def first_sentences(paras, n=1, maxlen=220):
    out = []
    for p in paras or []:
        for s in re.split(r"(?<=[.!?])\s+", p):
            s = clean(s)
            if 20 <= len(s) <= maxlen and s not in out:
                out.append(s)
            if len(out) >= n:
                return out
    return out


def month_list(ms):
    if not ms:
        return ""
    return ms[0] if len(ms) == 1 else ", ".join(ms[:-1]) + " and " + ms[-1]


def month_range(ms):
    """Compact range text using the site's own month list order."""
    from .common import MONTHS
    idx = sorted(MONTHS.index(m) for m in ms)
    if not idx:
        return ""
    runs, start, prev = [], idx[0], idx[0]
    for i in idx[1:]:
        if i == prev + 1:
            prev = i
            continue
        runs.append((start, prev)); start = prev = i
    runs.append((start, prev))
    if len(runs) > 1 and runs[0][0] == 0 and runs[-1][1] == 11:
        runs = [(runs[-1][0], runs[0][1])] + runs[1:-1]
    txt = [MONTHS[a] if a == b else f"{MONTHS[a]} to {MONTHS[b]}" for a, b in runs]
    return " and ".join(txt)


def C_join(xs):
    return month_list(list(xs)[:3])


# ---------------- Gemini ----------------

MODELS = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-2.5-flash", "gemini-flash-lite-latest", "gemini-2.5-flash-lite"]
_DEAD = set()
_FAILS = {"n": 0}  # consecutive complete failures; after 4 the run stops asking and uses templates


def gemini(prompt, want_json=True, parts_extra=None, model=None):
    """Ask Gemini; on busy (429/503) or a missing model, wait and try the next model. None if all fail."""
    key = env("GEMINI_API_KEY")
    if not key or _FAILS["n"] >= 4:
        return None
    models = [model or env("GEMINI_MODEL")] if (model or env("GEMINI_MODEL")) else []
    models += [m for m in MODELS if m not in models and m not in _DEAD]
    parts = [{"text": prompt}] + (parts_extra or [])
    body = {"contents": [{"role": "user", "parts": parts}],
            "generationConfig": {"temperature": 0.8, **({"responseMimeType": "application/json"} if want_json else {})}}
    last = ""
    for m in models:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent"
        for attempt in range(2):
            try:
                r = requests.post(url, headers={"x-goog-api-key": key}, json=body, timeout=90)
                if r.status_code in (429, 500, 503):
                    last = f"{m}: {r.status_code} {r.text[:200]}"
                    time.sleep(4 * (attempt + 1)); continue
                if r.status_code == 404:
                    _DEAD.add(m); last = f"{m}: not available"; break
                if r.status_code in (400, 401, 403):
                    print("Gemini refused the request:", r.status_code, r.text[:400])
                    return None
                r.raise_for_status()
                txt = r.json()["candidates"][0]["content"]["parts"][0]["text"]
                _FAILS["n"] = 0
                return json.loads(txt) if want_json else txt
            except Exception as e:  # noqa: BLE001
                last = f"{m}: {e}"
                time.sleep(4)
    _FAILS["n"] += 1
    print("Gemini failed, using templates:", last)
    return None


def gemini_copy(post, facts):
    brand = load("brand.json")
    prompt = f"""You write social posts for {brand['name']} ({brand['site']}), a UK grow-your-own site. Tagline: {brand['tagline']}.
Voice: {', '.join(brand['voice']['three_words'])}. {brand['voice']['how_it_sounds']}
Audience: {brand['audience']['main']}. Also: {brand['audience']['also']}.
UK spelling. Plain words, no gardening jargon. Never use em dashes. Never use these words: {', '.join(brand['voice']['never_words'])}.
No hashtags except where asked. Do not say "link in bio".
Use ONLY the facts below. Do not add any month, number, time, temperature, treatment or claim that is not in the facts.
Copy timings and figures exactly as the facts give them; never turn a season into months (if the facts say "until spring", say "until spring").
Never borrow figures from a different crop. Do not invent personal stories or anecdotes about Mark, his family or his garden;
first person is fine for advice and opinion ("I'd cook these first"), not for events that may not have happened.

POST TYPE: {post['kind']} for {post['channel_group']}
TOPIC: {post['topic']}
FACTS (from the site):
{json.dumps(facts, ensure_ascii=False, indent=1)}

Return JSON with:
"hooks": 5 different hook lines, 12 words or fewer, each putting something at stake (a waste, a cost, a missed chance), using patterns like "Nobody tells you...", "Stop doing X", a number, permission ("You don't need a garden to..."), or before and after,
"body": 2 to 4 short sentences for an Instagram caption after the hook, first person as Mark, including the search phrase "{post['search_phrase']}" naturally,
"pin_title": Pinterest title under 100 characters starting with the search phrase,
"pin_description": 150 to 300 characters, the search phrase in the first 50 characters, plus 2 to 4 related search phrases woven in,
"tiktok_body": one or two plain sentences naming the crop and the job.
Every value is a plain string except "hooks", which is a list of strings."""
    g = gemini(prompt)
    if isinstance(g, list):
        g = next((x for x in g if isinstance(x, dict)), None)
    if not isinstance(g, dict):
        return None
    flat = lambda v: " ".join(str(x) for x in v) if isinstance(v, (list, tuple)) else ("" if v is None else str(v))
    out = {k: flat(g.get(k)) for k in ("body", "pin_title", "pin_description", "tiktok_body")}
    hk = g.get("hooks") or []
    out["hooks"] = [str(h) for h in (hk if isinstance(hk, list) else [hk]) if isinstance(h, (str, int, float))]
    return out


# ---------------- assembling ----------------

def search_phrase(post):
    t = post["topic_kind"]
    name = post.get("crop_name", "")
    m = post.get("month", "")
    from .hooks import lc
    n = lc(name)
    return {
        "month": f"what to sow in {m} UK",
        "sow_to_plate": f"how to grow {n} in the UK",
        "glut": f"what to do with a glut of {n}",
        "preserve": f"how to store {n}",
        "kids": "growing veg with kids",
        "pin_crop": f"how to grow {n} UK",
        "pin_recipe": f"{n} recipe",
        "pin_month": f"what to sow in {m} UK",
        "story": "",
    }.get(t, n)


def build(post, facts, body_lines, hook, ask_key, frost=False, links=None):
    """Make every platform's text for one post. Returns dict per channel."""
    site = load("brand.json")["site"]
    url = post.get("url", "https://" + site)
    url_txt = url.replace("https://", "")
    frost_line = "Check your local frost dates." if frost else ""
    safety = post.get("safety_lines", [])
    phrase = post["search_phrase"]
    g = post.get("gemini") or {}
    body = clean(g.get("body", "")) if g.get("body") else " ".join(body_lines)
    ig_lines = [hook, "", body]
    if safety:
        ig_lines += ["", " ".join(safety)]
    if frost_line:
        ig_lines += ["", frost_line]
    ig_lines += ["", f"Full guide on {url_txt}", "", ASKS[ask_key]]
    if post.get("ad"):
        ig_lines[0] = "Ad: " + ig_lines[0]
    if post.get("ai_made"):
        ig_lines.append("Made with AI.")
    ig = "\n".join(l for l in ig_lines).strip()
    ig = re.sub(r"\n{3,}", "\n\n", ig)

    suffix = {"sow_to_plate": "sow, grow, cook and keep it", "glut": "recipes and how to keep it", "preserve": "storing, freezing and keeping it",
              "month": "the full list", "pin_month": "the full list", "kids": "an easy project", "pin_crop": "when to sow and pick",
              "pin_recipe": post.get("topic", "")}.get(post["topic_kind"], post["topic"])
    title = g.get("pin_title") or f"{phrase[0].upper() + phrase[1:]}: {suffix}"
    title = clean(title)[:99]
    rel = post.get("related") or []
    rest = " ".join(b for b in body_lines if b.lower()[:25] != phrase.lower()[:25])
    if rel:
        rest += f" Ideas for {C_join(rel)}."
    head = f"{phrase[0].upper() + phrase[1:]}."
    must = " ".join(x for x in [" ".join(safety), frost_line, url_txt] if x)
    if g.get("pin_description"):
        mid = clean(g["pin_description"])
        if mid.lower().startswith(phrase.lower()[:20]):
            head = ""
    else:
        mid = clean(rest)
    room = 300 - len(head) - len(must) - 2
    if len(mid) > room:
        cut = mid[:room]
        mid = cut[: cut.rfind(".") + 1] if "." in cut[40:] else cut.rsplit(" ", 1)[0] + "."
    desc = " ".join(x for x in [head, mid, must] if x)
    if len(desc) < 150:
        desc = (desc + f" Grow it, cook it, keep it.")[:300]

    tt_tags = post.get("tiktok_tags") or ["#growyourown", "#ukgardening", "#homegrown"]
    tt_body = clean(g.get("tiktok_body", "")) or (body_lines[0] if body_lines else "")
    tiktok = f"{hook}\n{tt_body}" + (f"\n{frost_line}" if frost_line else "") + f"\n{url_txt}\n" + " ".join(tt_tags[:5])

    return {"instagram": ig, "facebook": ig, "pin_title": title, "pin_description": desc, "tiktok": tiktok,
            "ask": ask_key, "search_phrase": phrase}
