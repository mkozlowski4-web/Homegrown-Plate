"""Quality score out of 100 after guardrails: hook 30, search words 20, one ask 15, sounds human 15, visual 10, channel rules 10."""
import re

from .captions import ASKS
from .common import load


def score(post):
    w = load("quality.json")["weights"]
    c = post["captions"]
    ig = c["instagram"]
    notes = []
    s = {}
    s["hook"] = round(w["hook"] * post["hook"]["score"] / 100)
    phrase = c["search_phrase"].lower()
    words = [x for x in re.findall(r"\w+", phrase) if len(x) > 2 and x not in ("what", "how", "the", "with", "too", "much")]
    hit_ig = sum(1 for x in words if x in ig.lower()) / max(1, len(words))
    hit_pin = 1.0 if c["pin_title"].lower().startswith(phrase[:20]) or phrase in c["pin_title"].lower() else 0.5
    s["search_words"] = round(w["search_words"] * (0.6 * hit_ig + 0.4 * hit_pin))
    if hit_ig < 0.7:
        notes.append(f"search phrase '{phrase}' only partly in the caption")
    asks = sum(1 for a in ASKS.values() if a in ig) + len(re.findall(r"\b(comment below|tag a friend|double tap|follow for more|share this with)\b", ig, re.I))
    s["one_ask"] = w["one_ask"] if asks == 1 else 0
    if asks != 1:
        notes.append(f"{asks} asks in the caption")
    # sounds human
    sents = [x for x in re.split(r"(?<=[.!?])\s+", ig) if x.strip()]
    lens = [len(x.split()) for x in sents]
    human = w["sounds_human"]
    if lens and max(lens) > 32:
        human -= 5; notes.append("a very long sentence")
    if ig.count("!") > 2:
        human -= 5; notes.append("too many exclamation marks")
    if not re.search(r"\b(I|I'm|I've|my|you|your)\b", ig):
        human -= 5; notes.append("no 'I' or 'you'")
    if len(set(lens)) <= 1 and len(lens) > 3:
        human -= 3
    s["sounds_human"] = max(0, human)
    # visual
    v = w["visual"]
    if not post.get("media_ok", True):
        v = 0; notes.append("media missing or wrong size")
    elif post.get("uses_drawings_only"):
        v -= 3; notes.append("uses site drawings, no real photos or clips")
    s["visual"] = v
    # channel rules
    ch = w["channel_rules"]
    first = ig.split("\n")[0]
    limit = 55 if post["kind"] == "reel" else 125
    if len(first) > limit:
        ch -= 4; notes.append(f"Instagram first line is {len(first)} characters (limit {limit})")
    if len(c["pin_title"]) >= 100:
        ch -= 2; notes.append("pin title too long")
    if not 150 <= len(c["pin_description"]) <= 300:
        ch -= 2; notes.append(f"pin description {len(c['pin_description'])} characters (want 150-300)")
    if phrase[:15] not in c["pin_description"].lower()[:60]:
        ch -= 2; notes.append("pin description doesn't open with the search phrase")
    s["channel_rules"] = max(0, ch)
    return sum(s.values()), s, notes
