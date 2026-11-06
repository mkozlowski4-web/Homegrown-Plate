"""Plans and makes one week of posts from the site's planting calendar.

Week = the Sunday after the Saturday run, to the following Saturday.
Instagram + Facebook 18:30: reels Tue and Fri, carousels Wed and Sun (first Sunday of a month = What to sow).
Stories 09:00 daily. Pinterest pin 20:00 daily, plus a video pin for every reel.
"""
import json
import re
import shutil
from datetime import date, timedelta

from . import captions as C
from . import guardrails, hooks, library, quality
from .common import MONTHS, ROOT, Site, load, save, uk_dt, iso_utc
from .reels import make_reel

FROST = "Check your local frost dates."
CAROUSEL_ROTATION = ["sow_to_plate", "glut", "preserve", "kids"]
REEL_ROTATION = ["sow_to_plate", "glut"]
STORY_ROTATION = ["crop", "job", "question", "crop", "job", "question", "crop"]  # Sun..Sat


def easter(year):
    a = year % 19; b, c = divmod(year, 100); d, e = divmod(b, 4); f = (b + 8) // 25; g = (b - f + 1) // 3
    h = (19 * a + b - d - g + 15) % 30; i, k = divmod(c, 4); l = (32 + 2 * e + 2 * i - h - k) % 7
    m = (a + 11 * h + 22 * l) // 451; month = (h + l - 7 * m + 114) // 31; day = (h + l - 7 * m + 114) % 31 + 1
    return date(year, month, day)


def moment_date(spec, year):
    if spec.startswith("easter"):
        off = int(spec[6:] or 0)
        return easter(year) + timedelta(days=off)
    mm, dd = map(int, spec.split("-"))
    return date(year, mm, dd)


def moments_in_week(start):
    cal = load("calendar.json")
    found = []
    for m in cal["moments"]:
        lead = m.get("lead_weeks", cal["default_lead_weeks"])
        for y in (start.year, start.year + 1):
            post_day = moment_date(m["date"], y) - timedelta(weeks=lead)
            if start <= post_day < start + timedelta(days=7):
                found.append({**m, "event_date": moment_date(m["date"], y).isoformat(), "post_day": post_day})
    return found


def kid_months(start_text):
    if "any time" in start_text.lower():
        return MONTHS
    ms = [m for m in MONTHS if m.lower() in start_text.lower()]
    if len(ms) == 2:
        a, b = MONTHS.index(ms[0]), MONTHS.index(ms[1])
        return [MONTHS[(a + i) % 12] for i in range((b - a) % 12 + 1)]
    return ms


class Week:
    def __init__(self, start: date, outdir, renderer, use_gemini=True):
        self.start = start
        self.site = Site()
        self.out = outdir
        self.r = renderer
        self.use_gemini = use_gemini
        self.state = load("state/rotation.json", {"carousel": 0, "reel": 0, "ask": 0, "deferred": []})
        self.taken_media = set()
        self.week_crops = set()
        self.posts = []
        hooks.OPENINGS.clear()

    # ---------- helpers ----------
    def next_ask(self):
        k = C.ASK_ORDER[self.state["ask"] % 3]
        self.state["ask"] += 1
        return k

    def pick_crop(self, pool, on, kind, prefer_media=True):
        import random
        rnd = random.Random(f"{on.isoformat()}-{kind}")
        media = library.crops_with_media(on)
        best = []
        no_herbs = kind.startswith("reel") or kind in ("glut", "preserve", "sow_to_plate")
        for c in pool:
            if c["id"] in self.week_crops or (no_herbs and c.get("group") == "herb" and c["id"] not in media):
                continue
            fresh = library.topic_free(f"{kind}:{c['id']}", on)
            s = (50 if fresh else 0) + (40 if prefer_media and c["id"] in media else 0) + \
                (10 if self.site.has_photo(c) else 0) + (8 if c["difficulty"] == "Easy" else 0) + \
                (5 if "balcony" in c["garden_sizes"] else 0) + min(len(c["recipes"]), 5) + rnd.random() * 12
            best.append((s, c["name"], c))
        best.sort(key=lambda x: (-x[0], x[1]))
        return best[0][2] if best else None

    def my_photo(self, c, d, post):
        """Mark's own photo of this crop if one is free (not used this week or in the last 12 weeks)."""
        it = library.find(c["id"], None, None, d, self.taken_media)
        if it and it["kind"] == "photo":
            self.taken_media.add(it["id"]); post.setdefault("library_used", []).append(it["id"])
            return str(library.local_file(it))
        return None

    def verb(self, c):
        return "Plant" if c.get("perennial_planting") and not c["sow_indoors"] else "Sow"

    def safety_for(self, crop):
        return [s for s in crop["safety"] if re.search(r"poison|toxic|never be eaten|never eat|solanine|oxalic|botulism|blister|burn", s, re.I)][:1]

    def finish(self, post, facts, body_lines, hook_cands, months_ok, numbers_ok, frost):
        """Gemini copy (optional), hook choice, captions, guardrails, quality (one rewrite), status."""
        crop_names = [self.site.crops[c]["name"] for c in post.get("crops", []) if c in self.site.crops]
        g = C.gemini_copy(post, facts) if self.use_gemini else None
        post["gemini"] = g
        cands = list(hook_cands) + ([h for h in (g or {}).get("hooks", []) if isinstance(h, str)])
        if post["kind"] == "reel":
            cands = [h for h in cands if len(h) <= 55]
        best, scored = hooks.pick(cands, self.site, crop_names, months_ok, numbers_ok)
        post["hook_candidates"] = sorted(scored, key=lambda x: -x["score"])[:6]
        if not best:
            post["hook"] = {"hook": "", "score": 0}
            post["status"] = "held"
            post["held_reasons"] = ["No hook scored 75 or more with only site-backed claims"]
            return post
        post["hook"] = best
        ask = self.next_ask()
        post["captions"] = C.build(post, facts, body_lines, best["hook"], ask, frost=frost)
        post["timing"] = frost
        self._check(post)
        if post["status"] == "ready" and post["quality"]["score"] < load("quality.json")["min_score"]:
            # one rewrite: next-best hook, template body (no Gemini), then re-check
            others = [x for x in post["hook_candidates"] if x["backed"] and x["score"] >= 75 and x["hook"] != best["hook"]]
            post["gemini"] = None
            if others:
                post["hook"] = others[0]
            post["captions"] = C.build(post, facts, body_lines, post["hook"]["hook"], ask, frost=frost)
            post["rewritten"] = True
            self._check(post)
            if post["status"] == "ready" and post["quality"]["score"] < load("quality.json")["min_score"]:
                post["status"] = "held"
                post["held_reasons"] = [f"Quality {post['quality']['score']}/100 after one rewrite: " + "; ".join(post["quality"]["notes"])]
        return post

    def _check(self, post):
        fails = guardrails.check(post, self.site)
        post["guardrails"] = {"passed": not fails, "fails": fails}
        s, parts, notes = quality.score(post)
        post["quality"] = {"score": s, "parts": parts, "notes": notes}
        post["status"] = "ready" if not fails else "held"
        post["held_reasons"] = fails

    def base_post(self, kind, day, time, channels, topic_kind, topic, url, crops=(), month=None, **kw):
        d = self.start + timedelta(days=day)
        p = {"id": f"{d.isoformat()}-{kind}-{topic_kind}-{len(self.posts)}", "kind": kind, "date": d.isoformat(),
             "time": time, "due_utc": iso_utc(uk_dt(d, time)), "channels": channels, "topic_kind": topic_kind,
             "topic": topic, "url": url, "crops": list(crops), "month": month or MONTHS[d.month - 1],
             "channel_group": " + ".join(channels), "media": [], "on_image_text": [], "ai_made": False, **kw}
        if crops:
            p["crop_name"] = self.site.crops[crops[0]]["name"]
        p["search_phrase"] = C.search_phrase(p)
        return p

    def crop_facts(self, c):
        return {"crop": c["name"], "url": c["url"], "sow_indoors": c["sow_indoors"], "sow_or_plant_outside": c["sow_or_plant_outside"],
                "harvest": c["harvest"], "difficulty": c["difficulty"], "garden_sizes": c["garden_sizes"], "sun": c["sun_text"],
                "how_to_sow": C.first_sentences(c["text"]["sow"], 2), "growing": C.first_sentences(c["text"]["grow"], 2),
                "harvesting": C.first_sentences(c["text"]["harvest"], 2), "using": C.first_sentences(c["text"]["use"], 1),
                "keeping": [f"{p['method']}: {p['how']} Keeps {p['keeps']}." for p in c["preserving"]],
                "recipes": [r["name"] for r in self.site.recipes_for(c)][:5], "safety": self.safety_for(c),
                "frost_line": FROST}

    def numbers_for(self, c):
        txt = self.site.all_source_text(crop=c)
        return set(re.findall(r"\b\d+\b", txt)) | {str(len(c["recipes"])), str(len(c["preserving"])), str(min(len(c["recipes"]), 3))}

    # ---------- carousels ----------
    def carousel(self, day, kind, moment=None):
        d = self.start + timedelta(days=day)
        months = self.site.months_window(d)
        month = MONTHS[d.month - 1]
        folder = self.out / f"{d.isoformat()}-carousel"
        if kind == "month":
            off = (moment or {}).get("month_offset", 0)
            month = MONTHS[(d.month - 1 + off) % 12]
            return self.month_carousel(day, month, folder, moment)
        if kind == "kids":
            return self.kids_carousel(day, months, folder, moment)
        pool_ids = (moment or {}).get("crops")
        if kind == "sow_to_plate":
            pool = self.site.in_season(months, "sow")
        elif kind == "glut":
            pool = [c for c in self.site.in_season(months, "harvest") if len(c["recipes"]) >= 2]
        else:
            pool = [c for c in self.site.preserve_now(months) if any(m in c["harvest"] for m in months)] or self.site.preserve_now(months)
        if pool_ids:
            pool = [self.site.crops[i] for i in pool_ids if i in self.site.crops] or pool
        crop = self.pick_crop(pool, d, kind)
        if not crop:
            return None
        self.week_crops.add(crop["id"])
        return self.crop_carousel(day, kind, crop, month, folder, moment)

    def slides(self, folder, specs):
        paths = []
        for i, s in enumerate(specs):
            p = self.r.render("slide", folder / f"slide{i+1:02d}.png", index=i, total=len(specs), **s)
            paths.append(str(p))
        return paths

    def crop_carousel(self, day, kind, c, month, folder, moment):
        name = c["name"]
        recipes = self.site.recipes_for(c)
        topic = {"sow_to_plate": f"{name} from sowing to your plate", "glut": f"What to cook with a glut of {hooks.lc(name)}",
                 "preserve": f"How to keep {hooks.lc(name)}"}[kind]
        post = self.base_post("carousel", day, "18:30", ["instagram", "facebook"], kind, topic, c["url"], [c["id"]], month,
                              moment=(moment or {}).get("id"), safety_lines=self.safety_for(c))
        facts = self.crop_facts(c)
        post["related"] = [f"{hooks.lc(name)} recipes", f"growing {hooks.lc(name)} UK", f"storing {hooks.lc(name)}"]
        lib_cover = library.find(c["id"], None, None, self.start + timedelta(days=day), self.taken_media)
        lib_photo = lib_cover if lib_cover and lib_cover["kind"] == "photo" else None
        cover_img = str(library.local_file(lib_photo)) if lib_photo else self.site.best_image(c)
        if lib_photo:
            self.taken_media.add(lib_photo["id"]); post.setdefault("library_used", []).append(lib_photo["id"])
        sow_months = c["sow_indoors"] + c["sow_or_plant_outside"]
        sow_txt = C.month_range(c["sow_or_plant_outside"]) if c["sow_or_plant_outside"] else C.month_range(c["sow_indoors"])
        cands = hooks.candidates(kind, self.site, c, month)
        body = []
        specs = [{"layout": "cover", "kicker": {"sow_to_plate": "Sow to plate", "glut": "Glut to plate", "preserve": "Keep it"}[kind],
                  "title": "", "image": cover_img}]
        if kind == "sow_to_plate":
            if c["sow_indoors"]:
                specs.append({"layout": "text", "kicker": "Sow", "step": "1", "title": f"Start indoors: {C.month_range(c['sow_indoors'])}",
                              "paras": C.first_sentences(c["text"]["sow"], 2), "frost": FROST})
            if c["sow_or_plant_outside"]:
                specs.append({"layout": "text", "kicker": "Sow", "step": "1" if not c["sow_indoors"] else "2",
                              "title": f"Sow or plant outside: {C.month_range(c['sow_or_plant_outside'])}",
                              "paras": C.first_sentences(c["text"]["sow"], 2)[-1:] + C.first_sentences(c["text"]["sow_tips"], 1), "frost": FROST})
            specs.append({"layout": "text", "kicker": "Grow", "title": "While it grows", "paras": C.first_sentences(c["text"]["grow"], 2)})
            specs.append({"layout": "text", "kicker": "Pick", "title": f"Ready to pick: {C.month_range(c['harvest'])}",
                          "paras": C.first_sentences(c["text"]["harvest"], 2), "frost": FROST})
            if recipes:
                specs.append({"layout": "list", "kicker": "Cook", "title": f"What to cook with your {hooks.lc(name)}",
                              "chips": [r["name"] for r in recipes[:6]], "more": f"All {len(recipes)} recipes on the site" if len(recipes) > 6 else ""})
            if c["preserving"]:
                p0 = c["preserving"][0]
                specs.append({"layout": "text", "kicker": "Keep", "title": f"{p0['method']}: keeps {p0['keeps']}", "paras": [C.clean(p0["how"])]})
            body = [f"How to grow {hooks.lc(name)} in the UK, from sowing to your plate.",
                    (C.first_sentences(c["text"]["sow"], 1) or [""])[0],
                    f"{self.verb(c)} {sow_txt}, pick {C.month_range(c['harvest'])}." if sow_txt and c["harvest"] else "",
                    f"The site has {len(recipes)} recipes for it and how to keep any spare." if recipes else ""]
        elif kind == "glut":
            specs.append({"layout": "text", "kicker": "Pick", "title": f"Ready to pick: {C.month_range(c['harvest'])}",
                          "paras": C.first_sentences(c["text"]["harvest"], 2), "frost": FROST})
            for r in recipes[:3]:
                specs.append({"layout": "text", "kicker": "Cook", "title": r["name"],
                              "paras": [f"{r['time']} · serves {r['serves']}" if r.get("serves") else r["time"] or "",
                                        C.clean(r["steps"][0]) if r["steps"] else ""], "image": r["image"]})
            if c["preserving"]:
                specs.append({"layout": "text", "kicker": "Keep", "title": "Still too much? Keep it",
                              "paras": [f"{p['method']}: {C.clean(p['how'])} Keeps {p['keeps']}." for p in c["preserving"][:2]]})
            picks = [r["name"] for r in recipes[:3]]
            body = [f"What to do with a glut of {hooks.lc(name)}? Pick it {C.month_range(c['harvest'])}, then this is what I'd cook first: {C.month_list(picks)}.",
                    (f"Still too much? {c['preserving'][0]['method']}: keeps {c['preserving'][0]['keeps']}." if c["preserving"] else ""),
                    "Every recipe is on the site."]
        else:
            for p in c["preserving"][:3]:
                specs.append({"layout": "text", "kicker": "Keep", "title": f"{p['method']}", "paras": [C.clean(p["how"]), f"Keeps: {p['keeps']}"]})
            body = [f"How to store {hooks.lc(name)} so none of it goes to waste.",
                    " ".join(f"{p['method']}: keeps {p['keeps']}." for p in c["preserving"][:3])]
        if post["safety_lines"]:
            specs.append({"layout": "text", "kicker": "Safety", "pill_class": "tomato", "title": "Worth knowing", "paras": [], "note": post["safety_lines"][0]})
        specs.append({"layout": "end", "title": f"The full {hooks.lc(name)} guide", "paras": ["Sowing, growing, picking, cooking and keeping it, in plain English."],
                      "url": c["url"].replace("https://", "").rstrip("/")})
        post = self.finish(post, facts, [b for b in body if b], cands, set(sow_months + c["harvest"]) | {month}, self.numbers_for(c), True)
        specs[0]["title"] = post["hook"]["hook"] or topic
        post["on_image_text"] = [s.get("title", "") for s in specs] + [" ".join(s.get("paras", [])) for s in specs] + [s.get("note") or "" for s in specs]
        post["media"] = self.slides(folder, specs)
        post["uses_drawings_only"] = not (lib_photo or self.site.has_photo(c))
        self._check(post) if post["status"] == "ready" else None
        library.mark_topic(f"{kind}:{c['id']}", self.start + timedelta(days=day))
        return post

    def month_carousel(self, day, month, folder, moment):
        page = self.site.sow_page(month)
        lists = page["lists"]
        names = lambda ids: [self.site.crops[i]["name"] for i in ids if i in self.site.crops]
        post = self.base_post("carousel", day, "18:30", ["instagram", "facebook"], "month", f"What to sow in {month}", page["url"],
                              [], month, month_page=True, page_text=page["lead"] + " " + " ".join(sum((names(v) for v in lists.values()), [])),
                              moment=(moment or {}).get("id"))
        indoors = names(lists.get("Sow or start indoors", []))
        outside = names(lists.get("Sow or plant outside", []))
        harvest = names(lists.get("Ready to harvest", []))
        count = len(indoors) + len(outside)
        specs = [{"layout": "cover", "kicker": f"What to sow in {month}", "title": "", "image": self._month_image(lists)}]
        if indoors:
            specs.append({"layout": "list", "kicker": "Under cover", "title": f"Sow or start indoors in {month}", "chips": indoors[:14],
                          "more": f"+ {len(indoors) - 14} more on the site" if len(indoors) > 14 else "", "frost": FROST})
        if outside:
            specs.append({"layout": "list", "kicker": "Outside", "title": f"Sow or plant outside in {month}", "chips": outside[:14],
                          "more": f"+ {len(outside) - 14} more on the site" if len(outside) > 14 else "", "frost": FROST})
        if harvest:
            specs.append({"layout": "list", "kicker": "Pick now", "pill_class": "tomato", "title": f"Ready to pick in {month}", "chips": harvest[:14],
                          "more": f"+ {len(harvest) - 14} more on the site" if len(harvest) > 14 else ""})
        jobs = self.site.jobs(month)["jobs"][:3]
        if jobs:
            specs.append({"layout": "text", "kicker": "Jobs", "title": f"{month} jobs for a dry weekend", "paras": [C.clean(j["text"]) for j in jobs]})
            post["page_text"] += " " + " ".join(j["text"] for j in jobs)
        specs.append({"layout": "end", "title": f"Everything to sow in {month}", "paras": [C.clean(page["lead"])],
                      "url": page["url"].replace("https://", "").rstrip("/")})
        facts = {"page": page["title"], "lead": page["lead"], "sow_indoors": indoors, "sow_outside": outside, "ready_to_pick": harvest[:20],
                 "jobs": [j["text"] for j in jobs], "frost_line": FROST}
        body = [C.clean(page["lead"]), f"Here's what to sow in {month} in the UK, and what you can pick now."]
        cands = hooks.candidates("month", self.site, month=month, extra={"count": count})
        post = self.finish(post, facts, body, cands, {month}, {str(count), str(len(outside)), str(len(indoors))}, True)
        specs[0]["title"] = post["hook"]["hook"] or post["topic"]
        post["on_image_text"] = [s.get("title", "") for s in specs] + [" ".join(s.get("paras", [])) for s in specs]
        post["media"] = self.slides(folder, specs)
        self._check(post) if post["status"] == "ready" else None
        return post

    def _month_image(self, lists):
        for i in lists.get("Ready to harvest", []) + lists.get("Sow or plant outside", []):
            c = self.site.crops.get(i)
            if c and self.site.has_photo(c):
                return self.site.best_image(c)
        first = (lists.get("Sow or plant outside") or lists.get("Ready to harvest") or [None])[0]
        return self.site.best_image(self.site.crops[first]) if first else None

    def kids_carousel(self, day, months, folder, moment):
        d = self.start + timedelta(days=day)
        projs = [k for k in self.site.kids["projects"] if any(m in kid_months(k["start"]) for m in months)]
        projs.sort(key=lambda k: (not library.topic_free(f"kids:{k['id']}", d), k["id"]))
        if not projs:
            return None
        k = projs[0]
        crop = self.site.crops.get(k["crop"]) if k["crop"] else None
        general = [n for n in self.site.kids["adult_helper_notes"] if "grown-up" in n][:1]
        post = self.base_post("carousel", day, "18:30", ["instagram", "facebook"], "kids", f"{k['title']}: a growing project for kids",
                              k["url"], [crop["id"]] if crop else [], MONTHS[d.month - 1], kid=k,
                              safety_lines=[k["adult_note"]] + general if k["adult_note"] else general, about_eating=False,
                              moment=(moment or {}).get("id"))
        steps = [C.clean(s) for s in k["steps"]]
        half = (len(steps) + 1) // 2
        specs = [{"layout": "cover", "kicker": "Growing with kids", "title": "", "image": self.site.best_image(crop) if crop else None},
                 {"layout": "list", "kicker": "You'll need", "title": f"{k['title']}: what you need", "chips": k["need"],
                  "more": f"Start: {k['start']}. Wait: {k['wait']}."},
                 {"layout": "text", "kicker": "Steps", "step": "1", "title": "How to do it", "paras": steps[:half]},
                 {"layout": "text", "kicker": "Steps", "step": "2", "title": "Then", "paras": steps[half:]}]
        if k["fact"]:
            specs.append({"layout": "text", "kicker": "Did you know?", "pill_class": "leaf", "title": "A fact for the kids", "paras": [C.clean(k["fact"])]})
        specs.append({"layout": "text", "kicker": "Grown-ups", "pill_class": "tomato", "title": "Adult helper notes", "paras": [],
                      "note": " ".join(post["safety_lines"])})
        specs.append({"layout": "end", "title": "More projects for kids", "paras": ["Easy growing projects and simple recipes for little ones."],
                      "url": "homegrownplate.co.uk/kids"})
        facts = {"project": k["title"], "blurb": k["blurb"], "start": k["start"], "wait": k["wait"], "need": k["need"], "steps": k["steps"],
                 "fact": k["fact"], "adult_helper_note": post["safety_lines"]}
        body = [C.clean(k["blurb"]), f"Growing veg with kids doesn't need much: start {k['start'].lower()}, then wait {k['wait'].lower()}."]
        nums = set(re.findall(r"\b\d+\b", " ".join(k["steps"] + [k["wait"], k["start"], k["fact"] or ""])))
        post = self.finish(post, facts, body, hooks.candidates("kids", self.site, extra=k), set(kid_months(k["start"])), nums, False)
        specs[0]["title"] = post["hook"]["hook"] or post["topic"]
        post["on_image_text"] = [s.get("title", "") for s in specs] + [" ".join(s.get("paras", [])) for s in specs]
        post["media"] = self.slides(folder, specs)
        post["uses_drawings_only"] = not (crop and self.site.has_photo(crop))
        self._check(post) if post["status"] == "ready" else None
        library.mark_topic(f"kids:{k['id']}", d)
        return post

    # ---------- reels ----------
    def reel(self, day, kind, moment=None):
        d = self.start + timedelta(days=day)
        months = self.site.months_window(d)
        month = MONTHS[d.month - 1]
        if kind == "sow_to_plate":
            pool = [c for c in self.site.in_season(months, "sow") if c["recipes"]]
        else:
            pool = [c for c in self.site.in_season(months, "harvest") if len(c["recipes"]) >= 2]
        if moment and moment.get("crops"):
            pool = [self.site.crops[i] for i in moment["crops"] if i in self.site.crops] or pool
        c = self.pick_crop(pool, d, f"reel_{kind}")
        if not c:
            return None
        self.week_crops.add(c["id"])
        recipes = self.site.recipes_for(c)
        topic = f"{c['name']}: sow it, grow it, cook it" if kind == "sow_to_plate" else f"{c['name']} glut: pick it, cook it, keep it"
        post = self.base_post("reel", day, "18:30", ["instagram", "facebook", "pinterest", "tiktok"], kind, topic, c["url"], [c["id"]],
                              month, safety_lines=self.safety_for(c), moment=(moment or {}).get("id"))
        used = []
        imgs = [i["url"] for i in c["images"] if i["kind"] == "photo"] + [i["url"] for i in c["images"] if i["kind"] != "photo"]
        turn = {"n": 0}

        def next_img():
            if not imgs:
                return None
            u = imgs[turn["n"] % len(imgs)]; turn["n"] += 1
            return u

        def src(task, recipe=None, fallback=None, label=None, sub=None):
            tasks = task if isinstance(task, (list, tuple)) else [task]
            it = None
            for t in tasks:
                cand = library.find(c["id"], t, recipe["id"] if recipe else None, d, self.taken_media)
                if cand and (cand.get("task") == t or (recipe and cand.get("recipe") == recipe["id"])):
                    it = cand; break
            if it:
                self.taken_media.add(it["id"]); used.append(it["id"])
                s = library.as_source(it)
            else:
                img = fallback or next_img()
                s = {"src": img, "kind": "drawing" if (img or "").endswith(".svg") or "/img/recipes/" in (img or "") else "photo"}
            s.update(label=label, sub=sub)
            return s

        r0 = recipes[0] if recipes else None
        opening = src(["pick", "cook"], r0, r0["image"] if r0 and not self.site.has_photo(c) else None)
        sow_t = C.month_range(c["sow_or_plant_outside"] or c["sow_indoors"])
        if kind == "sow_to_plate":
            steps = [src("sow", label=self.verb(c), sub=sow_t), src("grow", label="Grow", sub=None),
                     src("pick", label="Pick", sub=C.month_range(c["harvest"]))]
            if r0:
                steps.append(src("cook", r0, r0["image"], label="Cook", sub=r0["name"]))
        else:
            steps = [src("pick", label="Pick", sub=C.month_range(c["harvest"]))]
            for r in recipes[:2]:
                steps.append(src("cook", r, r["image"], label="Cook", sub=r["name"]))
            if c["preserving"]:
                steps.append(src("store", label="Keep", sub=f"{c['preserving'][0]['method']}: {c['preserving'][0]['keeps']}"))
        facts = self.crop_facts(c)
        body = [f"How to grow {hooks.lc(c['name'])} in the UK, start to finish." if kind == "sow_to_plate" else
                f"What to do with a glut of {hooks.lc(c['name'])}: pick it, cook it, keep it.",
                (f"Then cook it: {C.month_list([r['name'] for r in recipes[:2]])}." if recipes else ""),
                f"{self.verb(c)} {sow_t}, pick {C.month_range(c['harvest'])}." if sow_t and c["harvest"] else ""]
        cands = hooks.candidates("sow_to_plate" if kind == "sow_to_plate" else "glut", self.site, c, month)
        post["tiktok_tags"] = ["#growyourown", f"#{re.sub(r'[^a-z]', '', c['name'].lower())}", "#ukgardening",
                               "#allotment" if "large" in c["garden_sizes"] else "#smallgarden", "#homegrown"]
        post["related"] = [f"{hooks.lc(c['name'])} recipes", f"growing {hooks.lc(c['name'])} UK", f"storing {hooks.lc(c['name'])}"]
        post = self.finish(post, facts, [b for b in body if b], cands,
                           set(c["sow_indoors"] + c["sow_or_plant_outside"] + c["harvest"]) | {month}, self.numbers_for(c), True)
        post["on_image_text"] = [post["hook"]["hook"]] + [f"{s.get('label') or ''} {s.get('sub') or ''}" for s in steps] + \
            [c["name"], "homegrownplate.co.uk"]
        if post["hook"]["hook"]:
            mp4, cover, meta = make_reel(self.r, self.out / f"{d.isoformat()}-reel", opening, steps, post["hook"]["hook"],
                                         f"The full {hooks.lc(c['name'])} guide", "Sow it, grow it, cook it, keep it.",
                                         c["name"], "Sow to plate" if kind == "sow_to_plate" else "Glut to plate",
                                         opening["src"] if opening["kind"] != "clip" else self.site.best_image(c), seed=d.toordinal())
            post["media"] = [str(mp4)]
            post["cover"] = str(cover)
            post["reel"] = meta
            post["media_ok"] = 15 <= meta["seconds"] <= 31
        post["library_used"] = used
        post["uses_drawings_only"] = not used and not self.site.has_photo(c)
        self._check(post) if post["status"] == "ready" else None
        library.mark_topic(f"reel_{kind}:{c['id']}", d)
        return post

    # ---------- stories ----------
    def story(self, day, kind):
        d = self.start + timedelta(days=day)
        months = self.site.months_window(d)
        month = MONTHS[d.month - 1]
        folder = self.out / f"{d.isoformat()}-story"
        if kind == "job":
            jobs = self.site.jobs(month)["jobs"]
            j = jobs[(d.day // 7 + day) % len(jobs)]
            post = self.base_post("story", day, "09:00", ["instagram"], "story", f"This week's job: {month}", f"{self.site.base}/weekend-jobs/{month.lower()}/",
                                  [], month, page_text=j["text"], month_page=True)
            best, _ = hooks.pick(hooks.candidates("job", self.site, month=month), self.site, (), {month}, ())
            title = best["hook"] if best else "This week's garden job"
            paras = [C.clean(j["text"])]
            img = None
            post["hook"] = best or {"hook": title, "score": 0}
            frost = False
        elif kind == "question":
            harvest = [c for c in self.site.in_season(months, "harvest") if c["id"] not in self.week_crops]
            c = self.pick_crop(harvest, d, "story_q") or harvest[0]
            qs = [f"Got a glut of {hooks.lc(c['name'])}? What do you cook first so none goes to waste?",
                  "What's one crop you'd never waste space on again?",
                  f"What did you lose to the weather this year? I'll start: half my {hooks.lc(c['name'])}."][:2]
            q = qs[(d.toordinal() // 7 + day) % len(qs)]
            post = self.base_post("story", day, "09:00", ["instagram"], "story", "Question for growers", self.site.base + "/", [c["id"]] if "glut" in q else [], month)
            title = q
            paras = []
            img = self.site.best_image(c) if "glut" in q else None
            sc = hooks.score(title, [c["name"]])
            post["hook"] = {"hook": title, "score": sc[0], "parts": sc[1]}
            post["about_eating"] = False
            frost = False
        else:
            sow_ids = {x["id"] for x in self.site.in_season(months, "sow")}
            pool = [x for x in self.site.in_season(months, "harvest") + self.site.in_season(months, "sow") if x.get("group") != "herb" or x["id"] in sow_ids]
            c = self.pick_crop(pool, d, "story_crop")
            self.week_crops.add(c["id"])
            post = self.base_post("story", day, "09:00", ["instagram"], "story", f"Crop of the day: {c['name']}", c["url"], [c["id"]], month,
                                  safety_lines=self.safety_for(c))
            cands = hooks.candidates("sow_to_plate" if any(m in c["sow_or_plant_outside"] for m in months) else "glut", self.site, c, month)
            best, _ = hooks.pick(cands, self.site, [c["name"]], set(c["sow_indoors"] + c["sow_or_plant_outside"] + c["harvest"]) | {month}, self.numbers_for(c))
            title = best["hook"] if best else f"Crop of the day: {c['name']}"
            post["hook"] = best or {"hook": title, "score": 0}
            sow_t = C.month_range(c["sow_or_plant_outside"] or c["sow_indoors"])
            paras = [f"{self.verb(c)}: {sow_t}. Pick: {C.month_range(c['harvest'])}."] + post["safety_lines"]
            img = self.my_photo(c, d, post) or self.site.best_image(c)
            frost = True
            library.mark_topic(f"story_crop:{c['id']}", d)
        p = self.r.render("story", folder / f"story-{kind}.png", kicker={"job": "This week's job", "question": "Question", "crop": "Crop of the day"}[kind],
                          title=title, paras=paras, image=img, question=kind == "question", frost=FROST if frost else None)
        post["media"] = [str(p)]
        post["on_image_text"] = [title] + paras + ([FROST] if frost else [])
        post["captions"] = {"instagram": "", "facebook": "", "pin_title": "", "pin_description": "", "tiktok": "", "ask": "", "search_phrase": ""}
        post["timing"] = frost
        fails = guardrails.check(post, self.site)
        if frost and FROST not in " ".join(post["on_image_text"]):
            fails.append("timings_from_site: story gives timings without the frost line")
        post["guardrails"] = {"passed": not fails, "fails": fails}
        post["quality"] = {"score": None, "notes": ["Stories are image-only; quality score applies to captioned posts"]}
        post["status"] = "ready" if not fails else "held"
        post["held_reasons"] = fails
        return post

    # ---------- pins ----------
    def pin(self, day):
        d = self.start + timedelta(days=day)
        months = self.site.months_window(d)
        month = MONTHS[d.month - 1]
        pinned = load("state/pinned.json", {})
        folder = self.out / f"{d.isoformat()}-pin"
        crops = {c["id"]: c for c in self.site.in_season(months, "sow") + self.site.in_season(months, "harvest")}
        harvest_ids = {c["id"] for c in self.site.in_season(months, "harvest")}
        recipes = [r for r in self.site.d["recipes"] if any(x in harvest_ids for x in r["crops"])]
        first_week = d.day <= 7
        options = []
        if first_week and pinned.get(self.site.sow_page(month)["url"], "")[:7] != d.isoformat()[:7]:
            options.append((0, "month", self.site.sow_page(month)))
        sow_ids = {c["id"] for c in self.site.in_season(months, "sow")}
        for c in crops.values():
            if c.get("group") == "herb" and c["id"] not in sow_ids:
                continue
            options.append((pinned.get(c["url"], "0000"), "crop", c))
        for r in recipes:
            options.append((pinned.get(r["url"], "0000"), "recipe", r))
        taken = {p["url"] for p in self.posts if p["kind"] == "pin"}
        week_urls = {self.site.crops[i]["url"] for i in self.week_crops if i in self.site.crops}
        options = [o for o in options if o[2]["url"] not in taken and o[2]["url"] not in week_urls]
        # least recently pinned first; alternate crop / recipe by day
        want = "recipe" if day % 2 else "crop"
        import random
        rnd = random.Random(d.isoformat())
        jitter = {o[2]["url"]: rnd.random() for o in options}
        bonus = lambda o: 0 if o[1] != "crop" else (0 if self.site.has_photo(o[2]) or o[2]["difficulty"] == "Easy" else 0.5)
        mine = library.crops_with_media(d)
        options.sort(key=lambda o: (o[0] != 0, not (o[1] == "crop" and o[2]["id"] in mine), o[1] != want, str(o[0]), bonus(o) + jitter[o[2]["url"]]))
        _, kind, item = options[0]
        if kind == "month":
            names = lambda ids: [self.site.crops[i]["name"] for i in ids if i in self.site.crops]
            lists = item["lists"]
            count = len(lists.get("Sow or start indoors", [])) + len(lists.get("Sow or plant outside", []))
            post = self.base_post("pin", day, "20:00", ["pinterest"], "pin_month", f"What to sow in {month}", item["url"], [], month,
                                  month_page=True, page_text=item["lead"] + " " + " ".join(sum((names(v) for v in lists.values()), [])))
            facts = {"page": item["title"], "lead": item["lead"], "sow": names(lists.get("Sow or plant outside", []))[:12]}
            body = [C.clean(item["lead"]), f"{count} crops to sow or plant in {month}, plus what's ready to pick."]
            cands = hooks.candidates("month", self.site, month=month, extra={"count": count})
            post = self.finish(post, facts, body, cands, {month}, {str(count)}, True)
            img, kicker, sub = self._month_image(lists), "Planting calendar", f"{count} crops to sow or plant"
        elif kind == "crop":
            c = item
            post = self.base_post("pin", day, "20:00", ["pinterest"], "pin_crop", f"How to grow {hooks.lc(c['name'])}", c["url"], [c["id"]], month,
                                  safety_lines=self.safety_for(c))
            sow_t = C.month_range(c["sow_or_plant_outside"] or c["sow_indoors"])
            body = C.first_sentences(c["text"]["info"], 1) + [f"{self.verb(c)} {sow_t}, pick {C.month_range(c['harvest'])}."]
            cands = hooks.candidates("sow_to_plate" if c["id"] in {x["id"] for x in self.site.in_season(months, "sow")} else "glut", self.site, c, month)
            post = self.finish(post, self.crop_facts(c), body, cands, set(c["sow_indoors"] + c["sow_or_plant_outside"] + c["harvest"]) | {month},
                               self.numbers_for(c), True)
            img, kicker, sub = self.my_photo(c, d, post) or self.site.best_image(c), "Grow guide", f"{self.verb(c)} {sow_t} · Pick {C.month_range(c['harvest'])}"
        else:
            r = item
            cs = [self.site.crops[x] for x in r["crops"] if x in harvest_ids and x in self.site.crops]
            c = next((x for x in cs if x.get("group") != "herb"), cs[0])
            post = self.base_post("pin", day, "20:00", ["pinterest"], "pin_recipe", r["name"], r["url"], [c["id"]], month, recipe=r["id"],
                                  safety_lines=self.safety_for(c))
            post["search_phrase"] = f"{hooks.lc(c['name'])} recipe"
            facts = {"recipe": r["name"], "time": r["time"], "serves": r.get("serves"), "crops": [self.site.crops[x]["name"] for x in r["crops"] if x in self.site.crops],
                     "first_steps": r["steps"][:2], "tips": r["tips"][:1]}
            body = [f"{r['name']}, made with homegrown {hooks.lc(c['name'])}.", f"Ready in {r['time']}." if r["time"] else ""]
            cands = hooks.candidates("recipe", self.site, c, month, extra=r)
            post = self.finish(post, facts, [b for b in body if b], cands, set(c["harvest"]) | {month},
                               self.numbers_for(c) | set(re.findall(r"\d+", r["time"] or "")), False)
            img, kicker, sub = r["image"], "Recipe", f"{r['time']} · uses your {hooks.lc(c['name'])}"
        title_on_image = post["hook"]["hook"] or post["topic"]
        p = self.r.render("pin", folder / "pin.png", kicker=kicker, title=title_on_image, sub=sub, image=img,
                          size=72 if len(title_on_image) < 45 else 62)
        post["media"] = [str(p)]
        post["on_image_text"] = [title_on_image, sub]
        if post["status"] == "ready":
            self._check(post)
        pinned[item["url"]] = d.isoformat()
        save("state/pinned.json", pinned)
        return post

    # ---------- the week ----------
    def safe(self, fn, *args):
        """One post going wrong never stops the week: retry without Gemini, else record it as held."""
        import traceback
        try:
            return fn(*args)
        except Exception:  # noqa: BLE001
            err = traceback.format_exc(limit=3)
            print("Post failed, retrying with templates:", err[-400:])
            g, self.use_gemini = self.use_gemini, False
            try:
                return fn(*args)
            except Exception:  # noqa: BLE001
                err = traceback.format_exc(limit=3)
                d = self.start + timedelta(days=args[0])
                return {"id": f"{d.isoformat()}-{fn.__name__}-error-{len(self.posts)}", "kind": fn.__name__, "date": d.isoformat(), "time": "",
                        "due_utc": "", "channels": [], "topic_kind": "error", "topic": f"{fn.__name__} could not be made", "url": "",
                        "crops": [], "media": [], "hook": {"hook": "", "score": 0}, "status": "held",
                        "held_reasons": ["Could not be made: " + err.strip().splitlines()[-1][:200]], "captions": {}, "guardrails": {"passed": False, "fails": []}}
            finally:
                self.use_gemini = g

    def make(self):
        moments = moments_in_week(self.start)
        moment_slots = {}
        for m in moments:
            moment_slots.setdefault(m["slot"], []).append(m)
        deferred = list(self.state.get("deferred", []))
        self.state["deferred"] = []
        # carousels: Sun (day 0) and Wed (day 3)
        for day in (0, 3):
            d = self.start + timedelta(days=day)
            if day == 0 and d.day <= 7:
                kind, moment = "month", None
            elif moment_slots.get("carousel"):
                moment = moment_slots["carousel"].pop(0)
                kind = moment["kind"]
                ordinary = CAROUSEL_ROTATION[self.state["carousel"] % 4]
                self.state.setdefault("deferred", []).append({"slot": "carousel", "kind": ordinary})
                self.state["carousel"] += 1
            elif deferred and deferred[0]["slot"] == "carousel":
                kind, moment = deferred.pop(0)["kind"], None
            else:
                kind, moment = CAROUSEL_ROTATION[self.state["carousel"] % 4], None
                self.state["carousel"] += 1
            p = self.safe(self.carousel, day, kind, moment)
            if p:
                self.posts.append(p)
        # reels: Tue (day 2) and Fri (day 5)
        for day in (2, 5):
            if moment_slots.get("reel"):
                moment = moment_slots["reel"].pop(0)
                kind = moment["kind"]
                self.state.setdefault("deferred", []).append({"slot": "reel", "kind": REEL_ROTATION[self.state["reel"] % 2]})
                self.state["reel"] += 1
            elif any(x["slot"] == "reel" for x in deferred):
                x = next(x for x in deferred if x["slot"] == "reel"); deferred.remove(x)
                kind, moment = x["kind"], None
            else:
                kind, moment = REEL_ROTATION[self.state["reel"] % 2], None
                self.state["reel"] += 1
            p = self.safe(self.reel, day, kind, moment)
            if p:
                self.posts.append(p)
                if p.get("media") and p.get("topic_kind") != "error":
                    vp = {**p, "id": p["id"] + "-videopin", "kind": "video_pin", "time": "20:30", "channels": ["pinterest"],
                          "due_utc": iso_utc(uk_dt(date.fromisoformat(p["date"]), "20:30"))}
                    self.posts.append(vp)
        self.state["deferred"] += deferred
        for day in range(7):
            self.posts.append(self.safe(self.story, day, STORY_ROTATION[day]))
            self.posts.append(self.safe(self.pin, day))
        done = set()
        for p in self.posts:
            ids = [i for i in p.get("library_used", []) if i not in done]
            if ids:
                library.mark_used(ids, date.fromisoformat(p["date"])); done |= set(ids)
            p.pop("gemini", None)
        save("state/rotation.json", self.state)
        self.posts.sort(key=lambda p: (p["date"], p["time"]))
        plan = {"week_start": self.start.isoformat(), "moments": [{"id": m["id"], "title": m["title"], "event_date": m["event_date"]} for m in moments],
                "posts": self.posts}
        (self.out / "plan.json").write_text(json.dumps(plan, indent=1, ensure_ascii=False), encoding="utf-8")
        return plan
