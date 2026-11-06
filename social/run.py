"""Homegrown Plate social autopilot. Commands (used by the GitHub workflows):

  python run.py intake                 copy new photos/videos from Drive 'Social inbox' into library/
  python run.py week [--start DATE]    plan and make next week's posts into build/week-DATE/ (+ preview page)
  python run.py publish-media          copy the week's media into the public media repo folder (MEDIA_DIR)
  python run.py queue                  send posts due in the next few days to Buffer (only when live)
  python run.py buffer-check           list Buffer channels and Pinterest boards into state/buffer.json
"""
import argparse
import json
import os
import shutil
import sys
from datetime import date, timedelta
from pathlib import Path

from autopilot.common import ROOT, is_live, load, save, today_uk, week_start_for


def cmd_week(args):
    from autopilot import planner, preview
    from autopilot.render import Renderer
    start = date.fromisoformat(args.start) if args.start else week_start_for(today_uk())
    # remaking a week starts from the records as they were before it was first made
    from autopilot.common import DATA
    snap = DATA / "state" / "snapshots" / start.isoformat()
    tracked = ["state/rotation.json", "state/used.json", "state/pinned.json", "library/library.json"]
    if snap.exists():
        for t in tracked:
            src = snap / t.replace("/", "__")
            if t == "library/library.json":
                continue  # never replace the photo list: new photos must survive a remake
            if src.exists():
                shutil.copy2(src, DATA / t)
            elif (DATA / t).exists():
                (DATA / t).unlink()
        if (DATA / "library/library.json").exists():  # keep newly added clips, restore only their use history
            old = {i["id"]: i.get("used", []) for i in json.loads((snap / "library__library.json").read_text())["items"]} if (snap / "library__library.json").exists() else {}
            lib = json.loads((DATA / "library/library.json").read_text())
            for i in lib["items"]:
                i["used"] = old.get(i["id"], [])
            (DATA / "library/library.json").write_text(json.dumps(lib, indent=1))
    else:
        snap.mkdir(parents=True, exist_ok=True)
        for t in tracked:
            if (DATA / t).exists():
                shutil.copy2(DATA / t, snap / t.replace("/", "__"))
    for old in sorted((DATA / "state" / "snapshots").glob("*"))[:-4]:
        shutil.rmtree(old)
    out = ROOT / "build" / f"week-{start.isoformat()}"
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    r = Renderer()
    try:
        plan = planner.Week(start, out, r, use_gemini=not args.no_gemini).make()
    finally:
        r.close()
    rel = lambda p: os.path.relpath(p, out)
    (out / "index.html").write_text(preview.page(plan, rel), encoding="utf-8")
    held = [{"date": p["date"], "kind": p["kind"], "topic": p["topic"], "reasons": p["held_reasons"]} for p in plan["posts"] if p["status"] != "ready"]
    save("state/held.json", {"week_start": start.isoformat(), "held": held})
    print(f"Week of {start}: {len(plan['posts'])} posts, {len(held)} held. Preview: {out / 'index.html'}")


def cmd_publish_media(args):
    from autopilot import publish
    publish.copy_week_to_media_repo()


def cmd_queue(args):
    from autopilot import publish
    if not is_live() and not args.force:
        print("Not live yet: preview only, nothing sent to Buffer.")
        return
    publish.queue_due()


def cmd_intake(args):
    from autopilot import intake
    intake.run()


def cmd_results(args):
    from autopilot import publish
    publish.collect_results()


def cmd_buffer_check(args):
    from autopilot import publish
    publish.buffer_check()


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sp = ap.add_subparsers(dest="cmd", required=True)
    w = sp.add_parser("week"); w.add_argument("--start"); w.add_argument("--no-gemini", action="store_true"); w.set_defaults(f=cmd_week)
    sp.add_parser("publish-media").set_defaults(f=cmd_publish_media)
    q = sp.add_parser("queue"); q.add_argument("--force", action="store_true"); q.set_defaults(f=cmd_queue)
    sp.add_parser("intake").set_defaults(f=cmd_intake)
    sp.add_parser("buffer-check").set_defaults(f=cmd_buffer_check)
    sp.add_parser("results").set_defaults(f=cmd_results)
    a = ap.parse_args()
    a.f(a)
