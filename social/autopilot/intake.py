"""Drive 'Social inbox' -> library/. New photos and videos are copied, made smaller, and labelled
(crop, task, dish) so the planner can match them to posts. Uses a Google service account that Mark
shared the folder with (read-only). Sign-in is keyless (GitHub to Google workload identity), giving GOOGLE_ACCESS_TOKEN. Folder: DRIVE_FOLDER_ID."""
import base64
import json
import re
import subprocess
import tempfile
from datetime import datetime, timezone
from pathlib import Path

import requests

from . import library
from .captions import gemini
from .common import ROOT, Site, env

FOLDER = env("DRIVE_FOLDER_ID", "17hn8fs8m5jSPhRox4z9MJagbxf7O77lg")
TASKS = ["sow", "grow", "pick", "cook", "store", "other"]
TASK_WORDS = {"sow": ["sow", "sowing", "seed", "seeds", "plant", "planting", "planted", "going in", "goes in", "putting in", "clove", "cloves", "seedling", "tray"],
              "grow": ["grow", "growing", "water", "weed", "net", "support", "flower"],
              "pick": ["pick", "picking", "harvest", "harvesting", "lift", "dig", "crop"],
              "cook": ["cook", "cooking", "recipe", "dish", "kitchen", "roast", "soup", "bake", "plate"],
              "store": ["store", "storing", "jar", "pickle", "freeze", "jam", "chutney", "dry", "cure", "keep"]}


def token():
    """Keyless: the workflow signs in to Google as the read-only helper and passes a one-hour token.
    (Google blocks downloadable keys on Mark's account, so GOOGLE_SERVICE_ACCOUNT_JSON is only a fallback.)"""
    if env("GOOGLE_ACCESS_TOKEN"):
        return env("GOOGLE_ACCESS_TOKEN")
    from google.auth.transport.requests import Request
    from google.oauth2 import service_account
    info = json.loads(env("GOOGLE_SERVICE_ACCOUNT_JSON"))
    creds = service_account.Credentials.from_service_account_info(info, scopes=["https://www.googleapis.com/auth/drive.readonly"])
    creds.refresh(Request())
    return creds.token


def list_files(tok):
    q = f"'{FOLDER}' in parents and trashed=false and (mimeType contains 'image/' or mimeType contains 'video/')"
    out, page = [], None
    while True:
        r = requests.get("https://www.googleapis.com/drive/v3/files", headers={"Authorization": f"Bearer {tok}"},
                         params={"q": q, "pageSize": 200, "pageToken": page, "supportsAllDrives": True, "includeItemsFromAllDrives": True,
                                 "fields": "nextPageToken,files(id,name,mimeType,createdTime,description,size)"}, timeout=60)
        r.raise_for_status()
        j = r.json(); out += j.get("files", [])
        page = j.get("nextPageToken")
        if not page:
            return out


def download(tok, fid, dest):
    with requests.get(f"https://www.googleapis.com/drive/v3/files/{fid}", params={"alt": "media", "supportsAllDrives": True},
                      headers={"Authorization": f"Bearer {tok}"}, stream=True, timeout=600) as r:
        r.raise_for_status()
        with open(dest, "wb") as f:
            for chunk in r.iter_content(1 << 20):
                f.write(chunk)


def probe(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration",
                        "-of", "json", str(path)], capture_output=True, text=True)
    j = json.loads(r.stdout or "{}")
    s = (j.get("streams") or [{}])[0]
    return float(j.get("format", {}).get("duration") or 0), s.get("width"), s.get("height")


def process_video(src, dest):
    """Keep up to 60 s, short side at most 1080, no sound (reels use music), H.264."""
    vf = "scale='if(gt(iw,ih),-2,min(1080,iw))':'if(gt(iw,ih),min(1080,ih),-2)'"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-t", "60", "-vf", vf, "-an", "-c:v", "libx264",
                    "-preset", "veryfast", "-crf", "24", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(dest)], check=True)


def process_photo(src, dest):
    from PIL import Image, ImageOps
    try:
        import pillow_heif
        pillow_heif.register_heif_opener()
    except ImportError:
        pass
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    im.thumbnail((2160, 2160))
    im.save(dest, "JPEG", quality=88)


def frames(path, kind, tmp):
    if kind == "photo":
        from PIL import Image
        f = Path(tmp) / "f0.jpg"
        im = Image.open(path); im.thumbnail((768, 768)); im.save(f, "JPEG", quality=80)
        return [f], 0
    dur, _, _ = probe(path)
    out = []
    for i, frac in enumerate((0.1, 0.35, 0.6, 0.85)):
        f = Path(tmp) / f"f{i}.jpg"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{dur * frac:.2f}", "-i", str(path), "-frames:v", "1",
                        "-vf", "scale=768:-2", str(f)], check=False)
        if f.exists():
            out.append(f)
    return out, dur


def classify(site, name, desc, frame_files, dur):
    crops = {c["id"]: c["name"] for c in site.d["crops"]}
    recipes = {r["id"]: r["name"] for r in site.d["recipes"]}
    times = [round(dur * f, 1) for f in (0.1, 0.35, 0.6, 0.85)] if dur else [0]
    prompt = f"""These are frames from a {'video' if dur else 'photo'} filmed in a UK home veg garden or kitchen for Homegrown Plate.
File name: {name}. Note from the grower: {desc or 'none'}. Frame times (seconds): {times[:len(frame_files)]}.
Say what it shows. Choose crop_id ONLY from this list (or null): {json.dumps(crops)}
Choose task from {TASKS} (sow includes planting out; pick includes harvesting; store includes preserving).
If it shows a finished dish, choose recipe_id ONLY from this list (or null): {json.dumps(recipes)}
Return JSON: {{"crop_id": ..., "task": ..., "recipe_id": ..., "description": "one plain sentence", "best_second": the frame time that looks best,
"usable": true/false (false if blurry, dark, mostly a person's face, or nothing to do with growing or cooking), "confidence": 0-1}}"""
    parts = [{"inline_data": {"mime_type": "image/jpeg", "data": base64.b64encode(Path(f).read_bytes()).decode()}} for f in frame_files]
    g = gemini(prompt, parts_extra=parts)
    if isinstance(g, dict):
        crop = g.get("crop_id") if g.get("crop_id") in crops else None
        rec = g.get("recipe_id") if g.get("recipe_id") in recipes else None
        task = g.get("task") if g.get("task") in TASKS else "other"
        return {"crop": crop, "task": task, "recipe": rec, "description": str(g.get("description", ""))[:200],
                "best_second": float(g.get("best_second") or 0), "usable": bool(g.get("usable", True)),
                "confidence": g.get("confidence"), "classified_by": "gemini"}
    # fallback: words in the file name or Drive description, e.g. "garlic planting.mp4"
    text = f"{name} {desc or ''}".lower().replace("_", " ").replace("-", " ")
    crop = None
    for cid, cname in sorted(crops.items(), key=lambda x: -len(x[1])):
        if re.search(rf"\b{re.escape(cname.lower())}s?\b", text) or re.search(rf"\b{re.escape(cid.replace('-', ' '))}s?\b", text):
            crop = cid; break
    task = next((t for t, ws in TASK_WORDS.items() if any(re.search(rf"\b{w}\b", text) for w in ws)), "other")
    return {"crop": crop, "task": task, "recipe": None, "description": "", "best_second": 0.0, "usable": True,
            "confidence": None, "classified_by": "file name" if crop else "unmatched"}


_TOKEN = {}


def fetch_to(item, dest):
    """Download one library item from Drive and make the working copy (used when a post needs it)."""
    tok = _TOKEN.get("t") or token(); _TOKEN["t"] = tok
    with tempfile.TemporaryDirectory() as tmp:
        raw = Path(tmp) / ("raw" + Path(item.get("name", "x")).suffix.lower())
        download(tok, item["drive_id"], raw)
        (process_video if item["kind"] == "clip" else process_photo)(raw, dest)


def run():
    site = Site()
    tok = token(); _TOKEN["t"] = tok
    have = {it.get("drive_id") for it in library.items()}
    files = [f for f in list_files(tok) if f["id"] not in have]
    print(f"Drive 'Social inbox': {len(files)} new file(s)")
    items = library.items()
    library.CACHE.mkdir(exist_ok=True)
    for f in files:
        kind = "clip" if f["mimeType"].startswith("video/") else "photo"
        lid = f"{datetime.now(timezone.utc):%Y%m%d}-{f['id'][:8]}"
        dest = library.CACHE / f"{lid}.{'mp4' if kind == 'clip' else 'jpg'}"
        with tempfile.TemporaryDirectory() as tmp:
            raw = Path(tmp) / ("raw" + Path(f["name"]).suffix.lower())
            download(tok, f["id"], raw)
            try:
                (process_video if kind == "clip" else process_photo)(raw, dest)
            except Exception as e:  # noqa: BLE001
                print(f"  could not read {f['name']}: {e}")
                continue
            fr, dur = frames(dest, kind, tmp)
            info = classify(site, f["name"], f.get("description"), fr, dur)
        if info["task"] == "other" and info["recipe"]:
            info["task"] = "cook"
        d, w, h = probe(dest) if kind == "clip" else (0, None, None)
        items.append({"id": lid, "drive_id": f["id"], "name": f["name"], "kind": kind,
                      "added": datetime.now(timezone.utc).date().isoformat(), "shot": f.get("createdTime"), "seconds": round(d, 1),
                      "width": w, "height": h, **info, "used": []})
        print(f"  + {f['name']}: {info['crop'] or '?'} / {info['task']} / {info['recipe'] or '-'} ({info['classified_by']}) {info['description']}")
    library.save_items(items)
