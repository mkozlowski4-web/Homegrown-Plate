"""Shared helpers: paths, JSON, UK time, site data lookups."""
import json
import os
import re
from datetime import date, datetime, time, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent.parent
# Settings and records live in data/, a checkout of the social-data branch (kept off main so the site doesn't redeploy)
DATA = Path(os.environ.get("SOCIAL_DATA") or ROOT / "data")
UK = ZoneInfo("Europe/London")
MONTHS = ["January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"]
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def load(name, default=None):
    p = DATA / name
    if not p.exists():
        return default
    return json.loads(p.read_text(encoding="utf-8"))


def save(name, obj):
    p = DATA / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, indent=1, ensure_ascii=False), encoding="utf-8")


def uk_dt(d: date, hhmm: str) -> datetime:
    h, m = map(int, hhmm.split(":"))
    return datetime.combine(d, time(h, m), tzinfo=UK)


def iso_utc(dt: datetime) -> str:
    return dt.astimezone(ZoneInfo("UTC")).strftime("%Y-%m-%dT%H:%M:%S.000Z")


def today_uk() -> date:
    return datetime.now(UK).date()


def week_start_for(run_day: date) -> date:
    """The Saturday run makes the week starting the next day (Sunday) and ending the Saturday after."""
    days_to_sunday = (6 - run_day.weekday()) % 7 or 7
    return run_day + timedelta(days=days_to_sunday)


def is_live() -> bool:
    return bool(load("state/live.json", {}).get("live"))


def slug(s):
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


class Site:
    """Read-only view of site-data.json. Everything posted comes from here."""

    def __init__(self):
        self.d = load("site-data.json")
        self.crops = {c["id"]: c for c in self.d["crops"]}
        self.recipes = {r["id"]: r for r in self.d["recipes"]}
        self.pests = {p["id"]: p for p in self.d["pests"]}
        self.kids = self.d["kids"]
        self.base = self.d["site"]

    def months_window(self, start: date, days=14):
        """Months touched by the next fortnight from start."""
        ms = []
        for i in range(days):
            m = MONTHS[(start + timedelta(days=i)).month - 1]
            if m not in ms:
                ms.append(m)
        return ms

    def in_season(self, months, what):
        key = {"sow": ("sow_indoors", "sow_or_plant_outside"), "harvest": ("harvest",)}[what]
        return [c for c in self.d["crops"] if any(m in c[k] for k in key for m in months)]

    def preserve_now(self, months):
        ids = []
        for p in self.d["what_to_preserve"]:
            if p["month"] in months:
                for lst in p["lists"].values():
                    ids += [i for i in lst if i not in ids]
        return [self.crops[i] for i in ids if i in self.crops and self.crops[i]["preserving"]]

    def sow_page(self, month):
        return next(p for p in self.d["what_to_sow"] if p["month"] == month)

    def preserve_page(self, month):
        return next(p for p in self.d["what_to_preserve"] if p["month"] == month)

    def jobs(self, month):
        return next(j for j in self.d["weekend_jobs"] if j["month"] == month)

    def best_image(self, crop, prefer=("photo", "drawing")):
        for kind in prefer:
            for i in crop["images"]:
                if i["kind"] == kind:
                    return i["url"]
        return crop["images"][0]["url"] if crop["images"] else None

    def has_photo(self, crop):
        return any(i["kind"] == "photo" for i in crop["images"])

    def recipes_for(self, crop):
        return [self.recipes[r] for r in crop["recipes"] if r in self.recipes]

    def all_source_text(self, crop=None, recipe=None):
        """All site text that backs a post, for fact checks."""
        parts = []
        if crop:
            t = crop["text"]
            for v in t.values():
                parts += v if isinstance(v, list) else [v]
            parts += [p["how"] + " " + p["keeps"] + " " + p["method"] for p in crop["preserving"]]
            parts += [c["job"] for c in crop["care"]] + crop["safety"]
            parts += [f"{k}: {v}" for k, v in crop["facts"].items()]
            for r in self.recipes_for(crop):
                parts += r["steps"] + r["tips"] + [r["time"] or ""]
        if recipe:
            parts += recipe["steps"] + recipe["tips"] + [recipe["time"] or "", str(recipe.get("serves") or "")]
            parts += [i["qty"] or "" for i in recipe["ingredients"]]
        return " ".join(str(p) for p in parts)


def env(name, default=None):
    v = os.environ.get(name)
    return v if v else default
