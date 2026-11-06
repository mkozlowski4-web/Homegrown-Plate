"""Hooks: build candidates from site facts, score them out of 100, keep only 75+ that the site backs up."""
import re

from .common import MONTHS, load

STAKES = ["waste", "wasted", "binned", "bin", "rot", "rots", "lose", "losing", "lost", "miss", "missed", "too late",
          "stop", "mistake", "wrong", "die", "dies", "kill", "cost", "pay", "buying", "money", "before it",
          "last chance", "still", "goes off", "go to waste", "a year", "never", "ruin", "nobody tells"]
CURIOUS = ["nobody tells", "why", "the one", "this is", "what to", "here's what", "secret", "most people", "instead",
           "you don't need", "before", "after", "turns out", "actually", "?"]
UK_WORDS = ["uk", "allotment", "raised bed", "greenhouse", "windowsill", "frost", "garden", "balcony", "plot",
            "veg", "grow your own", "homegrown"] + [m.lower() for m in MONTHS]
US_WORDS = ["yard", "zucchini", "eggplant", "cilantro", "arugula", "fall ", "scallion", "zone 7", "fahrenheit"]


def _has_number(t):
    return bool(re.search(r"\b\d+\b", t)) or any(w in t.lower().split() for w in
                                                  ["one", "two", "three", "four", "five", "six", "seven", "ten"])


def score(hook, crop_names=()):
    t = hook.lower()
    words = re.findall(r"[\w'’]+", hook)
    parts = {}
    parts["stakes"] = 30 if any(s in t for s in STAKES) else 0
    detail = 0
    if any(n.lower() in t for n in crop_names if n):
        detail += 10
    if any(m.lower() in t for m in MONTHS):
        detail += 6
    if _has_number(hook):
        detail += 6
    parts["specific_detail"] = min(20, detail)
    parts["curiosity"] = 20 if any(c in t for c in CURIOUS) else (10 if _has_number(hook) else 0)
    n = len(words)
    parts["short_and_clear"] = 15 if n <= 12 else (7 if n <= 15 else 0)
    uk = 15 if any(w in t for w in UK_WORDS) or any(n.lower() in t for n in crop_names) else 8
    if any(w in t for w in US_WORDS):
        uk = 0
    parts["fits_uk_home_growers"] = uk
    w = load("instagram-rules.json")["hook_score_weights"]
    base = {"stakes": 30, "specific_detail": 20, "curiosity": 20, "short_and_clear": 15, "fits_uk_home_growers": 15}
    total = sum(parts[k] * w[k] / base[k] for k in parts)
    return round(total), parts


def backed(hook, site, crops=(), months_ok=(), numbers_ok=()):
    """A hook may only name months and numbers that the site backs for these crops (spelled-out numbers included)."""
    from .guardrails import WORDNUM
    t = hook
    for w, d in WORDNUM.items():
        if d.isdigit() and w != "zero":
            t = re.sub(rf"\b{w}\b", d, t, flags=re.I)
    for m in MONTHS:
        if re.search(rf"\b{m}\b", t) and m not in months_ok:
            return False, f"month {m} not in the site's months for this post"
    for num in re.findall(r"\b\d+\b", t):
        if num not in {str(x) for x in numbers_ok}:
            return False, f"number {num} is not backed by the site"
    return True, ""


OPENINGS = {}  # how often each hook opening has been used this week (reset by the planner)


def opening(h, crop_names=()):
    """The hook's pattern with crop names blanked, so 'Kale glut?' and 'Leek glut?' count as the same style."""
    t = h.lower()
    for n in sorted(crop_names, key=len, reverse=True):
        if n:
            t = t.replace(n.lower(), "x")
    t = re.sub(r"\b(january|february|march|april|may|june|july|august|september|october|november|december)\b", "m", t)
    return " ".join(t.split()[:3])


def pick(candidates, site, crop_names=(), months_ok=(), numbers_ok=(), avoid=()):
    """Score every candidate; return the best backed hook scoring 75+, plus the scored list."""
    scored = []
    bait = re.compile(r"\b(trick|tricks|secret|you won't believe|shocking|hack|hacks|this one)\b", re.I)
    banned = [w.lower() for w in (load("brand.json") or {}).get("voice", {}).get("never_words", [])]
    for h in candidates:
        h = h.strip().rstrip(".")
        if not h or bait.search(h) or any(re.search(rf"(?<![\w-]){re.escape(w)}(?![\w-])", h.lower()) for w in banned) or "—" in h:
            continue
        s, parts = score(h, crop_names)
        ok, why = backed(h, site, months_ok=months_ok, numbers_ok=numbers_ok)
        scored.append({"hook": h, "score": s, "parts": parts, "backed": ok, "why": why})
    min_s = 75
    good = [x for x in scored if x["backed"] and x["score"] >= min_s and x["hook"] not in avoid]
    key = lambda h: opening(h, crop_names)
    good.sort(key=lambda x: -(x["score"] - 7 * OPENINGS.get(key(x["hook"]), 0)))
    if good:
        OPENINGS[key(good[0]["hook"])] = OPENINGS.get(key(good[0]["hook"]), 0) + 1
    return (good[0] if good else None), scored


PROPER = ("Jerusalem", "Swiss", "Brussels", "Chinese", "French", "Japanese", "Florence", "Roman", "Welsh", "Cape")


def lc(name):
    """Crop name as it reads mid-sentence (keeps Jerusalem, Brussels, Swiss and so on capitalised)."""
    if not name or name.split()[0] in PROPER or name[:2].isupper():
        return name
    return name[0].lower() + name[1:]


COUNTABLE = {"apple", "pear", "plum", "cherry", "fig", "peach", "apricot", "quince", "tomato", "courgette", "marrow", "cucumber", "gherkin",
             "chilli", "sweet-pepper", "aubergine", "pumpkin", "butternut-squash", "patty-pan", "melon", "onion", "shallot", "leek", "potato",
             "sweet-potato", "carrot", "parsnip", "beetroot", "turnip", "swede", "radish", "mooli", "brussels-sprouts", "bean", "french-bean",
             "broad-bean", "borlotti-bean", "runner-bean", "pea", "redcurrant", "blackcurrant", "whitecurrant", "loganberry", "elderberry", "cobnut", "sweetcorn", "strawberry", "raspberry", "blackberry", "gooseberry", "blueberry",
             "cauliflower", "cabbage", "artichoke", "globe-artichoke", "spring-onion", "egg", "grape"}


def plural(crop):
    """'too many courgettes' / 'too much kale': (phrase noun, countable?, pronoun)."""
    n = lc(crop["name"])
    if crop["id"] not in COUNTABLE:
        return n, False, "it"
    if n.endswith("s"):
        p = n
    elif re.search(r"[^aeiou]y$", n):
        p = n[:-1] + "ies"
    elif n.endswith("o") and not n.endswith("oo"):
        p = n + "es"
    elif re.search(r"(sh|ch|x)$", n):
        p = n + "es"
    else:
        p = n + "s"
    return p, True, "them"


def too(crop):
    p, countable, _ = plural(crop)
    return f"too many {p}" if countable else f"too much {p}"


HERB_BANNED = re.compile(r"\b(glut|too much|too many|waste|wasting|wasted|rot|rots|bin|binning|spare|surplus|use up)\b", re.I)


def herb_candidates(kind, crop, month, extra=None):
    """Herbs are snipped as needed, so no glut or waste talk: the stakes are paying for plastic packs and missing an easy win."""
    n = lc(crop["name"])
    out = [f"Stop buying {n} in plastic packs. Grow your own",
           f"Nobody tells you {n} is this easy to grow",
           f"Still paying for {n}? One plant fixes that"]
    if "balcony" in crop["garden_sizes"]:
        out.append(f"You don't need a garden to grow {n}")
    if month and month in crop["sow_indoors"] + crop["sow_or_plant_outside"]:
        out.append(f"Don't miss {month}: it's still {n} {'planting' if crop.get('perennial_planting') else 'sowing'} time")
    if kind == "recipe" and extra:
        out += [f"Stop buying {n}. Snip your own for {extra['name']}",
                f"Nobody tells you how good homegrown {n} is in {extra['name']}"]
    return out


def candidates(kind, site, crop=None, month=None, extra=None):
    """Hook ideas built only from site facts. Gemini ideas are added by the caller and scored the same way."""
    if crop and crop.get("group") == "herb":
        return herb_candidates(kind, crop, month, extra)
    out = []
    if kind in ("sow_to_plate", "reel_sow") and crop:
        n = lc(crop["name"])
        p, countable, _ = plural(crop)
        are = "are" if countable else "is"
        verb = "planting" if crop.get("perennial_planting") else "sowing"
        sow = crop["sow_or_plant_outside"] + crop["sow_indoors"]
        if month in sow:
            out += [f"Nobody tells you {month} is still {n} {verb} time",
                    f"Stop buying {p}. {'Plant' if verb == 'planting' else 'Sow'} your own this {month}"]
            nxt = MONTHS[(MONTHS.index(month) + 1) % 12]
            if nxt not in sow:
                out.append(f"Last {verb} month for {p}: miss {month} and it waits a year")
        if "balcony" in crop["garden_sizes"]:
            out.append(f"You don't need a garden to grow {p}")
        if crop["harvest"]:
            out.append(f"From a {month or sow[0]} {verb} to your plate: {p}, start to finish")
            out += [f"Stop buying {p}. Grow your own", f"Don't miss {n} {verb} time", f"Nobody tells you {p} {are} this easy"]
        out.append(f"The {n} job most beginners miss in {month}")
    if kind in ("glut", "reel_glut") and crop:
        p, countable, it = plural(crop)
        subj = "they" if countable else "it"
        r = len(crop["recipes"])
        cap = lambda t: t[0].upper() + t[1:]
        out += [f"{cap(too(crop))}? Don't bin {it}",
                f"More {p} than you can eat? Don't let {it} rot",
                f"A bumper crop of {p}? Here's what to cook before {subj} {'go' if countable else 'goes'} off",
                f"Nobody tells you what to do with all {'those' if countable else 'that'} {p}",
                f"Stop binning spare {p}. Cook {it} instead"]
        if r >= 2:
            out.append(f"{r} ways to use up {p} before {subj} {'go' if countable else 'goes'} to waste")
        if r >= 3:
            out.append(f"{cap(too(crop))}? Don't let {it} rot. Cook {it} these 3 ways")
        out.append(f"{cap(p)} glut? Don't let {it} rot")
    if kind == "preserve" and crop:
        n = lc(crop["name"])
        keeps = crop["preserving"][0]["keeps"]
        out += [f"Stop letting your {n} go off. Keep it {keeps.lower()}" if re.search(r"\d", keeps) else "",
                f"Nobody tells you how to store {n} so it doesn't rot",
                f"Don't waste your {n}. The site's way to keep it"]
    if kind == "month" and month:
        n = extra.get("count") if extra else None
        out += [f"{n} crops you can still sow in {month} before it's too late" if n else "",
                f"Don't waste {month}: {n} crops you can still sow" if n else "",
                f"What to sow in {month} so you don't miss a single crop",
                f"Nobody tells you how much you can still sow in {month}",
                f"Stop thinking {month} is too late to sow anything"]
    if kind == "kids" and extra:
        t = extra["title"].lower()
        out += [f"Bored kids this weekend? Don't waste it. Try {t}",
                f"Nobody tells you how easy {t} is with kids",
                f"Stop buying craft kits. Grow {t} with your kids instead",
                f"You don't need a garden for {t} with kids"]
    if kind == "job" and month:
        out += [f"Don't miss this {month} garden job before the weekend's gone",
                f"Stop putting off this {month} garden job"]
    if kind == "recipe" and crop and extra:
        n = lc(crop["name"]); rn = extra["name"]; p, countable, it = plural(crop)
        out += [f"Don't waste your {p}. Make {rn} instead" if countable or crop["id"] not in ("calabrese",) else "",
                f"{too(crop)[0].upper() + too(crop)[1:]}? Make {rn} before {'they go' if countable else 'it goes'} off",
                f"Stop letting {p} go to waste. Make this {rn}",
                f"Nobody tells you how good homegrown {n} is in {rn}"]
    return [h for h in out if h]
