"""Reels with ffmpeg: 1080x1920, 15-30 s. Best shot ~1.2 s with the hook as big text in the first 2 s,
then 3-4 clips or images (sow, grow, pick, cook) with labels, then an end card naming the site, then the cover frame."""
import json
import random
import subprocess
from pathlib import Path

from .common import ROOT
from .render import local_media

W, H, FPS = 1080, 1920, 30


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError("ffmpeg failed: " + r.stderr[-1500:])
    return r


def duration(path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "json", str(path)])
    return float(json.loads(r.stdout)["format"]["duration"])


def _path(src):
    s = local_media(src)
    return s[7:] if s.startswith("file://") else s


def still_segment(img, out, dur, zoom_in=True):
    """Slow push-in on a still image, filling the 9:16 frame."""
    frames = int(dur * FPS)
    z = f"min(1+0.0009*on,1.12)" if zoom_in else f"max(1.12-0.0009*on,1)"
    vf = (f"scale={W*2}:{H*2}:force_original_aspect_ratio=increase,crop={W*2}:{H*2},"
          f"zoompan=z='{z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s={W}x{H}:fps={FPS},format=yuv420p")
    run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-i", str(img), "-vf", vf, "-t", f"{dur}",
         "-r", str(FPS), "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", str(out)])


def clip_segment(clip, out, dur, start=0.0):
    have = max(0.5, duration(clip) - start)
    d = min(dur, have)
    vf = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},format=yuv420p"
    run(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{start}", "-i", str(clip), "-t", f"{d}", "-vf", vf, "-an",
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", str(out)])
    return d


def overlay(seg, png, out):
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(seg), "-i", str(png), "-filter_complex", "[0][1]overlay=0:0,format=yuv420p",
         "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", str(out)])


def make_reel(renderer, workdir, opening, steps, hook, end_title, end_sub, cover_title, cover_sub, cover_image, seed=0):
    """opening/steps: dicts {src, kind: 'clip'|'photo'|'drawing', label, sub, start}. Returns (mp4, cover_png, meta)."""
    wd = Path(workdir); wd.mkdir(parents=True, exist_ok=True)
    segs = []

    def make(item, i, dur, label=True):
        seg = wd / f"seg{i}.mp4"
        src = item["src"]
        if item["kind"] == "clip":
            dur = clip_segment(_path(src), seg, dur, item.get("start", 0.0))
        else:
            img = src
            if item["kind"] == "drawing":
                img = renderer.render("reel", wd / f"stage{i}.png", mode="stage", image=src)
            still_segment(_path(str(img)) if isinstance(img, str) else img, seg, dur, zoom_in=i % 2 == 0)
        if label and item.get("label"):
            lab = renderer.render("reel", wd / f"label{i}.png", mode="label", text=item["label"], sub=item.get("sub"), transparent=True)
            seg2 = wd / f"seg{i}l.mp4"; overlay(seg, lab, seg2); seg = seg2
        segs.append((seg, dur))

    make(opening, 0, 1.2, label=False)
    per = 4.6 if len(steps) == 3 else 4.0
    for i, st in enumerate(steps[:4], start=1):
        make(st, i, per)
    endpng = renderer.render("reel", wd / "end.png", mode="end", text=end_title, sub=end_sub)
    endseg = wd / "end.mp4"; still_segment(endpng, endseg, 2.8, zoom_in=True); segs.append((endseg, 2.8))
    cover = renderer.render("reel", wd / "cover.png", mode="cover", text=cover_title, sub=cover_sub, image=cover_image)
    coverseg = wd / "cover.mp4"
    run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-i", str(cover), "-t", "0.5", "-r", str(FPS),
         "-vf", "format=yuv420p", "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", str(coverseg)])
    segs.append((coverseg, 0.5))

    lst = wd / "list.txt"
    lst.write_text("".join(f"file '{s}'\n" for s, _ in segs))
    joined = wd / "joined.mp4"
    run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(joined)])
    total = duration(joined)

    hookpng = renderer.render("reel", wd / "hook.png", mode="hook", text=hook, transparent=True,
                              size=96 if len(hook) < 40 else 80)
    tracks = sorted((ROOT / "music").glob("*.m4a"))
    music = random.Random(seed).choice(tracks)
    out = wd / "reel.mp4"
    fc = (f"[0][1]overlay=0:0:enable='lt(t,2.2)',format=yuv420p[v];"
          f"[2]atrim=0:{total},afade=t=in:d=0.4,afade=t=out:st={max(0, total - 1.8)}:d=1.8,volume=0.8[a]")
    run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(joined), "-i", str(hookpng), "-i", str(music),
         "-filter_complex", fc, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
         "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-c:a", "aac", "-b:a", "128k",
         "-shortest", str(out)])
    meta = {"seconds": round(duration(out), 1), "music": music.name, "cover_offset_ms": int((total - 0.25) * 1000),
            "segments": [round(d, 1) for _, d in segs]}
    return out, cover, meta
