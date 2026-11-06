"""Mark's photos and clips: the library, matching clips to posts, and the 12-week no-repeat rule."""
from datetime import date, timedelta

from .common import ROOT, load, save

LIB = "library/library.json"
REUSE_WEEKS = 12


def items():
    return load(LIB, {"items": []})["items"]


def save_items(lst):
    save(LIB, {"items": lst})


def free(item, on: date):
    last = item.get("used", [])
    return not last or (on - date.fromisoformat(last[-1])) >= timedelta(weeks=REUSE_WEEKS)


def find(crop_id=None, task=None, recipe_id=None, on: date = None, taken=()):
    """Best unused library item for a crop/task/dish. Clips first, then photos."""
    best = []
    for it in items():
        if it["id"] in taken or not it.get("usable", True) or not free(it, on):
            continue
        s = 0
        if crop_id and it.get("crop") == crop_id:
            s += 10
        elif crop_id:
            continue
        if task and it.get("task") == task:
            s += 5
        if recipe_id and it.get("recipe") == recipe_id:
            s += 6
        s += 2 if it["kind"] == "clip" else 0
        best.append((s, it))
    best.sort(key=lambda x: -x[0])
    return best[0][1] if best else None


def crops_with_media(on: date):
    return {it["crop"] for it in items() if it.get("crop") and free(it, on) and it.get("usable", True)}


CACHE = ROOT / ".clips"


def local_file(it):
    """Mark's originals stay in Drive; a working copy is fetched only when a post uses it (never stored in the repo)."""
    CACHE.mkdir(exist_ok=True)
    f = CACHE / f"{it['id']}.{'mp4' if it['kind'] == 'clip' else 'jpg'}"
    if not f.exists():
        from . import intake
        intake.fetch_to(it, f)
    return f


def as_source(it):
    return {"src": str(local_file(it)), "kind": "clip" if it["kind"] == "clip" else "photo",
            "start": it.get("best_second", 0.0), "library_id": it["id"]}


def mark_used(ids, on: date):
    lst = items()
    for it in lst:
        if it["id"] in ids:
            it.setdefault("used", []).append(on.isoformat())
    save_items(lst)


def topic_free(key, on: date, weeks=REUSE_WEEKS):
    used = load("state/used.json", {})
    last = used.get(key)
    return not last or (on - date.fromisoformat(last)) >= timedelta(weeks=weeks)


def mark_topic(key, on: date):
    used = load("state/used.json", {})
    used[key] = on.isoformat()
    save("state/used.json", used)
