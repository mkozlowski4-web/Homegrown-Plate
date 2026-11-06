"""Guardrails from guardrails.json. Every post is checked before queueing. Failures are held, never rewritten."""
import re
from urllib.parse import urlparse

from .common import MONTHS, load

ACTION_WORDS = {
    "sow": ["sow", "sowing", "plant", "planting", "plant out", "goes in", "go in", "put in", "start"],
    "harvest": ["harvest", "harvesting", "pick", "picking", "lift", "lifting", "dig up", "ready"],
}
NUM_UNIT = re.compile(r"\b(\d+(?:[.,]\d+)?(?:\s*(?:[–-]|to)\s*\d+(?:[.,]\d+)?)?)\s*(°\s?[CF]|degrees|minutes?|mins?|hours?|hrs?|days?|weeks?|months?|%|ml|litres?|liters?|g\b|kg|cm|mm|pH)",
                     re.I)


def _texts(post):
    c = post["captions"]
    return {k: c[k] for k in ("instagram", "facebook", "pin_title", "pin_description", "tiktok") if c.get(k)} | \
        {"on_image": " ".join(post.get("on_image_text", []))}


def _all_text(post):
    return " \n".join(_texts(post).values())


def check(post, site):
    g = load("guardrails.json")
    brand = load("brand.json")
    fails = []
    text = _all_text(post)
    low = text.lower()
    crops = [site.crops[c] for c in post.get("crops", []) if c in site.crops]
    recipe = site.recipes.get(post.get("recipe")) if post.get("recipe") else None

    # ad_label
    comm = [d.lower() for d in brand["commission"]["current_commission_domains"]]
    links = re.findall(r"(?:https?://)?(?:www\.)?([a-z0-9.-]+\.[a-z]{2,})(/\S*)?", low)
    for dom, _ in links:
        if any(dom.endswith(c) for c in comm):
            for k, t in _texts(post).items():
                if k in ("instagram", "facebook", "tiktok") and not t.strip().startswith("Ad"):
                    fails.append(f"ad_label: {k} links to commission site {dom} but does not start with 'Ad'")
        elif not dom.endswith("homegrownplate.co.uk") and dom not in ("e.g", "i.e"):
            fails.append(f"style_basics: links to {dom}, which is not the site or a disclosed commission link")
    link = post.get("url", "")
    if link and urlparse(link).netloc not in ("homegrownplate.co.uk", "www.homegrownplate.co.uk"):
        fails.append(f"style_basics: post links to {link}")

    # timings_from_site
    timing_words = any(w in low for w in ["sow", "plant", "harvest", "pick", "lift"])
    if crops or post.get("month"):
        source = " ".join(site.all_source_text(crop=c) for c in crops)
        allowed_sow = {m for c in crops for m in c["sow_indoors"] + c["sow_or_plant_outside"]}
        allowed_harv = {m for c in crops for m in c["harvest"]}
        if post.get("month_page"):
            allowed_sow |= {post["month"]}; allowed_harv |= {post["month"]}
        for m in MONTHS:
            for mm in re.finditer(rf"\b{m}\b", text):
                before = text[max(0, mm.start() - 70): mm.start()].lower()
                hits = []
                for kind, words in ACTION_WORDS.items():
                    for w in words:
                        for h in re.finditer(rf"\b{re.escape(w)}\b", before):
                            hits.append((h.end(), kind))
                kind = max(hits)[1] if hits else None
                if not crops:
                    continue
                if kind == "harvest" and m not in allowed_harv:
                    fails.append(f"timings_from_site: '{m}' used for picking but the site's harvest months are {sorted(allowed_harv)}")
                elif kind == "sow" and m not in allowed_sow:
                    fails.append(f"timings_from_site: '{m}' used for sowing/planting but the site's months are {sorted(allowed_sow)}")
                elif kind is None and m not in allowed_sow | allowed_harv and not post.get("month_page") and m != post.get("month"):
                    fails.append(f"timings_from_site: month '{m}' is not in the site's text for {', '.join(c['name'] for c in crops)}")
        if timing_words and post["kind"] in g["rules"][1]["applies_to_kinds"] and post.get("timing"):
            for k in ("instagram", "pin_description", "tiktok"):
                t = _texts(post).get(k, "")
                if t and "frost" not in t.lower():
                    fails.append(f"timings_from_site: {k} gives timings without the frost-dates line")

    # preserving_from_site (and any figure with a unit, for any post)
    source_all = " ".join(site.all_source_text(crop=c) for c in crops) + (site.all_source_text(recipe=recipe) if recipe else "")
    source_all = source_all.replace("–", "-")
    if post.get("kid"):
        k = post["kid"]
        source_all += " " + " ".join(k["steps"] + k["need"] + [k["wait"], k["start"], k["fact"] or "", k["adult_note"] or ""])
    if post.get("month_page"):
        source_all += " " + post.get("page_text", "")
    for m in NUM_UNIT.finditer(text.replace("–", "-")):
        num = m.group(1).replace(" ", "")
        found = re.search(re.escape(m.group(1).replace("–", "-")), source_all) or num.split("-")[0] in re.findall(r"\d+(?:[.,]\d+)?", source_all)
        if not found:
            rule = "preserving_from_site" if post["kind"] in ("preserve",) or post.get("topic_kind") == "preserve" else "timings_from_site"
            fails.append(f"{rule}: '{m.group(0)}' is not in the site's text")

    # toxic_parts
    tox = next(r for r in g["rules"] if r["id"] == "toxic_parts")
    for ph in tox["always_flag_phrases"]:
        for mm in re.finditer(re.escape(ph), low):
            win = low[max(0, mm.start() - 80): mm.end() + 80]
            if any(e in win for e in tox["edible_words"]) and not any(n in win for n in tox["negation_words"]):
                fails.append(f"toxic_parts: '{ph}' appears next to eating words without a warning")
    for c in crops:
        warn = [s for s in c["safety"] if re.search(r"poison|toxic|never be eaten|never eat|solanine|oxalic|botulism|blister|burn", s, re.I)]
        if warn and post.get("about_eating", True):
            for k in ("instagram", "pin_description"):
                t = _texts(post).get(k, "")
                if t and not any(w[:40] in t for w in warn):
                    fails.append(f"toxic_parts: {k} is about {c['name']} but misses the site's warning ('{warn[0][:60]}...')")

    # kids_safety
    if post.get("kid"):
        note = post["kid"].get("adult_note") or ""
        for k in ("instagram", "pin_description"):
            t = _texts(post).get(k, "")
            if t and note and note[:40] not in t:
                fails.append(f"kids_safety: {k} misses the adult-helper note")
        if "grown-up" not in low:
            fails.append("kids_safety: missing the 'only eat what a grown-up says is safe' rule")

    # pests_from_site
    pest_rule = next(r for r in g["rules"] if r["id"] == "pests_from_site")
    pest_src = " ".join(" ".join(str(v) for v in p.values()) for p in site.pests.values()).lower()
    for w in pest_rule["treatment_words"]:
        if re.search(rf"\b{re.escape(w)}\b", low) and w not in pest_src and w not in source_all.lower():
            fails.append(f"pests_from_site: '{w}' is not advice the site's pest pages give")

    # ai_label
    if post.get("ai_made"):
        for k in ("instagram", "facebook"):
            if "Made with AI" not in _texts(post).get(k, ""):
                fails.append(f"ai_label: {k} uses an AI-made image without the AI label")

    # style_basics
    for k, t in _texts(post).items():
        if "—" in t:
            fails.append(f"style_basics: em dash in {k}")
        for w in brand["voice"]["never_words"]:
            if re.search(rf"(?<![\w-]){re.escape(w)}(?![\w-])", t, re.I):
                fails.append(f"style_basics: banned word '{w}' in {k}")
        if k in ("instagram", "facebook") and re.search(r"(^|\s)#\w", t):
            fails.append(f"style_basics: hashtag in {k}")
    return sorted(set(fails))
