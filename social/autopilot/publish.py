"""Hosting media (public GitHub Pages repo) and queueing posts in Buffer.

MEDIA_DIR       folder that becomes the social-media branch of the site repo, served by GitHub Pages
MEDIA_BASE_URL  e.g. https://mkozlowski4-web.github.io/Homegrown-Plate
BUFFER_API_KEY  Buffer API key (Settings > API)
Buffer free plan holds 10 scheduled posts per channel, so posts are sent a few days ahead, every day."""
import json
import os
import re
import shutil
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import requests

from .common import ROOT, env, load, save
from . import preview

API = "https://api.buffer.com"
AHEAD_DAYS = 3
KEEP_WEEKS = 2  # the branch is rebuilt each week with only recent media, so it never grows


def latest_week_dir():
    weeks = sorted((ROOT / "build").glob("week-*"))
    return weeks[-1] if weeks else None


def copy_week_to_media_repo():
    wd = latest_week_dir()
    media_dir = Path(env("MEDIA_DIR", ROOT / "media"))
    base = env("MEDIA_BASE_URL", "https://mkozlowski4-web.github.io/Homegrown-Plate").rstrip("/")
    plan = json.loads((wd / "plan.json").read_text())
    week = plan["week_start"]
    dest_root = media_dir / "w" / week
    if dest_root.exists():
        shutil.rmtree(dest_root)
    url_of = {}

    def put(path, post_id):
        p = Path(path)
        rel = Path("w") / week / post_id / p.name
        (media_dir / rel).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(p, media_dir / rel)
        url_of[str(p)] = f"{base}/{rel.as_posix()}"
        return url_of[str(p)]

    for post in plan["posts"]:
        pid = re.sub(r"[^a-z0-9-]", "", post["id"].lower())[:60]
        post["media_urls"] = [put(m, pid) for m in post.get("media", [])]
        if post.get("cover"):
            post["cover_url"] = put(post["cover"], pid)
    # preview page with public URLs
    html = preview.page(plan, lambda p: url_of.get(str(Path(p)), p))
    for sub in (f"preview/{week}", "preview/latest"):
        (media_dir / sub).mkdir(parents=True, exist_ok=True)
        (media_dir / sub / "index.html").write_text(html, encoding="utf-8")
    (media_dir / ".nojekyll").write_text("")
    (media_dir / "index.html").write_text('<meta http-equiv="refresh" content="0; url=preview/latest/">', encoding="utf-8")
    # keep the media repo small: drop weeks older than KEEP_WEEKS
    cutoff = date.fromisoformat(week) - timedelta(weeks=KEEP_WEEKS)
    for old in (media_dir / "w").glob("*"):
        try:
            if date.fromisoformat(old.name) < cutoff:
                shutil.rmtree(old)
        except ValueError:
            pass
    for old in (media_dir / "preview").glob("20*"):
        try:
            if date.fromisoformat(old.name) < cutoff:
                shutil.rmtree(old)
        except ValueError:
            pass
    # plan kept in the private repo (small, no media) for queueing and the Monday report
    slim = {**plan, "posts": [{k: v for k, v in p.items() if k not in ("hook_candidates", "on_image_text", "page_text")} for p in plan["posts"]]}
    save(f"plans/{week}.json", slim)
    print(f"Media for week {week} copied to {media_dir}. Preview: {base}/preview/latest/")


# ---------------- Buffer ----------------

def gql(query, variables=None):
    key = env("BUFFER_API_KEY")
    r = requests.post(API, json={"query": query, "variables": variables or {}},
                      headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"}, timeout=60)
    r.raise_for_status()
    j = r.json()
    if j.get("errors"):
        raise RuntimeError(json.dumps(j["errors"])[:800])
    return j["data"]


def buffer_check():
    """Find the organisation, channels and Pinterest boards; record the createPost input shape."""
    orgs = gql("query { account { organizations { id name } } }")["account"]["organizations"]
    org = orgs[0]
    chans = gql('query { channels(input: {organizationId: "%s"}) { id name service } }' % org["id"])["channels"]
    info = {"organization": org, "channels": chans, "checked": datetime.now(timezone.utc).isoformat()}
    # schema of the inputs we use, so field names can be checked against the live API
    shapes = {}
    for t in ("CreatePostInput", "PostInputMetaData", "InstagramPostMetadataInput", "PinterestPostMetadataInput", "FacebookPostMetadataInput",
              "AssetsInput", "ImageAssetInput", "VideoAssetInput", "InstagramStickerFieldsInput", "PostType", "PostTypeFacebook",
              "ShareMode", "SchedulingType", "ImageMetadataInput", "VideoMetadataInput", "PinterestMetadata", "Board", "PinterestBoard",
              "InstagramPollStickerInput", "InstagramStickerInput"):
        try:
            d = gql('query { __type(name: "%s") { name inputFields { name type { name kind ofType { name kind } } } enumValues { name } } }' % t)["__type"]
            if d:
                shapes[t] = d
        except Exception as e:  # noqa: BLE001
            shapes[t] = str(e)[:200]
    info["schema"] = shapes
    for t in ("PinterestMetadata", "InstagramStickerFieldsInput"):
        try:
            d = gql('query { __type(name: "%s") { fields { name type { name kind ofType { name kind ofType { name } } } } inputFields { name type { name kind ofType { name kind ofType { name } } } } } }' % t)["__type"]
            shapes[t + "_full"] = d
        except Exception as e:  # noqa: BLE001
            shapes[t + "_full"] = str(e)[:200]
    probe = 'query { __type(name: "%s") { fields { name args { name } type { name kind ofType { name kind ofType { name } } } } } }'
    for t in ("Query", "Channel", "PinterestBoard", "Post", "PostsInput", "PostsFiltersInput", "PostMetadata", "PinterestPostMetadata"):
        try:
            shapes[t + "_fields"] = gql(probe % t)["__type"]
        except Exception as e:  # noqa: BLE001
            shapes[t + "_fields"] = str(e)[:200]
    iprobe = 'query { __type(name: "%s") { inputFields { name type { name kind ofType { name kind ofType { name } } } } enumValues { name } } }'
    for t in ("PostsInput", "PostsFiltersInput", "PostStatus", "PostsSortInput"):
        try:
            shapes[t + "_input"] = gql(iprobe % t)["__type"]
        except Exception as e:  # noqa: BLE001
            shapes[t + "_input"] = str(e)[:200]
    q = next((f for f in (shapes.get("Query_fields") or {}).get("fields", []) if f["name"] == "posts"), None)
    shapes["posts_query"] = q
    pin = next((c for c in chans if c["service"] == "pinterest"), None)
    if pin:
        try:
            boards = gql('query { channel(input: {id: "%s"}) { id metadata { ... on PinterestMetadata { boards { serviceId name } } } } }' % pin["id"])
            info["pinterest_boards"] = boards
        except Exception as e:  # noqa: BLE001
            info["pinterest_boards_error"] = str(e)[:300]
    # Buffer's API lists no boards for some accounts, but every Pinterest post records its board:
    # read boards from any pins in Buffer (drafts included) and remember them.
    if pin:
        found = {b["serviceId"]: b for b in load("state/buffer.json", {}).get("boards_from_posts", [])}
        q = ('query { posts(first: 50, input: {organizationId: "%s", filter: {channelIds: ["%s"], status: [draft, scheduled, sent, error]}}) '
             '{ edges { node { id metadata { ... on PinterestPostMetadata { board { serviceId name } } } } } } }') % (org["id"], pin["id"])
        try:
            for e in gql(q)["posts"]["edges"]:
                b = ((e.get("node") or {}).get("metadata") or {}).get("board")
                if b and b.get("serviceId"):
                    found[b["serviceId"]] = {"serviceId": b["serviceId"], "name": b.get("name") or ""}
        except Exception as ex:  # noqa: BLE001
            info["boards_from_posts_error"] = str(ex)[:400]
        info["boards_from_posts"] = list(found.values())
    save("state/buffer.json", info)
    print("Pinterest boards known:", [b["name"] for b in info.get("boards_from_posts", [])])
    print(json.dumps({"organization": org["name"], "channels": [(c["service"], c["name"]) for c in chans]}, indent=1))


def channel_id(service):
    for c in load("state/buffer.json", {}).get("channels", []):
        if c["service"] == service:
            return c["id"]
    return None


BOARD_HINTS = {"pin_recipe": ["recipe"], "pin_month": ["sow", "calendar", "month"], "video_pin": ["grow"], "pin_crop": ["grow"]}


def board_id(post=None):
    """Recipe pins go to a board with 'recipe' in its name, month pins to one with 'sow', the rest to 'grow';
    PINTEREST_BOARD (a board name) or the first board is the fallback."""
    info = load("state/buffer.json", {})
    boards = (((info.get("pinterest_boards") or {}).get("channel") or {}).get("metadata") or {}).get("boards") or []
    seen = {b["serviceId"] for b in boards}
    boards = boards + [b for b in info.get("boards_from_posts", []) if b["serviceId"] not in seen]
    if not boards:
        return None
    kind = (post or {}).get("topic_kind") if (post or {}).get("kind") == "pin" else (post or {}).get("kind")
    for hint in BOARD_HINTS.get(kind, []):
        for b in boards:
            if hint in b["name"].lower():
                return b["serviceId"]
    want = env("PINTEREST_BOARD", "")
    for b in boards:
        if want and b["name"].lower() == want.lower():
            return b["serviceId"]
    for b in boards:
        if "grow" in b["name"].lower():
            return b["serviceId"]
    return boards[0]["serviceId"]


CREATE = """mutation($input: CreatePostInput!) { createPost(input: $input) {
  ... on PostActionSuccess { post { id dueAt } } ... on MutationError { message } } }"""


def build_input(post, channel):
    cap = post["captions"]
    urls = post.get("media_urls", [])
    is_video = urls and urls[0].endswith(".mp4")
    if is_video:
        assets = [{"video": {"url": urls[0], "metadata": {"thumbnailOffset": post.get("reel", {}).get("cover_offset_ms", 1000)}}}]
    else:
        alt = (post.get("hook") or {}).get("hook") or post.get("topic", "")
        assets = [{"image": {"url": u, "metadata": {"altText": f"{alt} (Homegrown Plate, slide {i + 1})" if len(urls) > 1 else alt}}}
                  for i, u in enumerate(urls)]
    inp = {"channelId": channel_id(channel), "schedulingType": "automatic", "mode": "customScheduled", "dueAt": post["due_utc"], "assets": assets}
    if channel == "instagram":
        typ = "story" if post["kind"] == "story" else "reel" if post["kind"] == "reel" else "post"
        inp["text"] = cap.get("instagram", "")
        inp["metadata"] = {"instagram": {"type": typ, "shouldShareToFeed": True, "isAiGenerated": bool(post.get("ai_made"))}}
    elif channel == "facebook":
        inp["text"] = cap.get("facebook", "")
        inp["metadata"] = {"facebook": {"type": "reel" if post["kind"] == "reel" else "post"}}
    elif channel == "pinterest":
        inp["text"] = cap.get("pin_description", "")
        inp["metadata"] = {"pinterest": {"boardServiceId": board_id(post), "title": cap.get("pin_title", ""), "url": post["url"]}}
    return inp


def queue_due():
    now = datetime.now(timezone.utc)
    horizon = now + timedelta(days=AHEAD_DAYS)
    queued = load("state/queued.json", {})
    errors = load("state/queue-errors.json", [])
    sent = 0
    from .common import DATA
    for f in sorted((DATA / "plans").glob("*.json")):
        plan = json.loads(f.read_text())
        for post in plan["posts"]:
            if post["status"] != "ready":
                continue
            due = datetime.fromisoformat(post["due_utc"].replace("Z", "+00:00"))
            if not (now + timedelta(minutes=20) < due <= horizon):
                continue
            for ch in post["channels"]:
                if ch == "tiktok":
                    continue  # TikTok is done by the daily Chrome task
                if post["kind"] == "reel" and ch == "pinterest":
                    continue  # the separate video_pin post covers Pinterest
                key = f"{post['id']}|{ch}"
                if key in queued or not channel_id(ch):
                    continue
                if ch == "pinterest" and not board_id(post):
                    errors.append({"key": key, "error": "No Pinterest board yet", "at": now.isoformat()})
                    continue
                try:
                    res = gql(CREATE, {"input": build_input(post, ch)})["createPost"]
                    if "post" in res:
                        queued[key] = {"buffer_id": res["post"]["id"], "due": res["post"]["dueAt"], "at": now.isoformat()}
                        sent += 1
                    else:
                        errors.append({"key": key, "error": res.get("message"), "at": now.isoformat()})
                except Exception as e:  # noqa: BLE001
                    errors.append({"key": key, "error": str(e)[:500], "at": now.isoformat()})
    save("state/queued.json", queued)
    save("state/queue-errors.json", errors[-200:])
    print(f"Sent {sent} post(s) to Buffer. Errors so far: {len(errors)}")
