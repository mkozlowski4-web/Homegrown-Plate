"""Makes the reels' backing music from scratch (original, so royalty-free). Run once: python scripts/make_music.py"""
import subprocess, wave
from pathlib import Path
import numpy as np

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "music"
NOTE = lambda n: 440.0 * 2 ** ((n - 69) / 12)


def pluck(freq, dur, bright=0.5, rng=None):
    n = int(SR * dur); p = max(2, int(SR / freq))
    buf = (rng.random(p) * 2 - 1) * 0.5
    out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * (0.994 + 0.004 * bright)
    return out


def pad(freqs, dur):
    t = np.arange(int(SR * dur)) / SR
    env = np.minimum(1, t / 0.8) * np.minimum(1, (dur - t) / 0.8)
    s = sum(np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 2 * f * t) for f in freqs)
    return 0.05 * s * env


def track(name, key, prog, bpm, seconds, seed, pattern):
    rng = np.random.default_rng(seed)
    beat = 60 / bpm; bar = 4 * beat
    total = np.zeros(int(SR * (seconds + 3)))
    t0 = 0.0; bars = int(seconds / bar) + 1
    for b in range(bars):
        chord = [key + x for x in prog[b % len(prog)]]
        start = int(t0 * SR)
        p = pad([NOTE(n - 12) for n in chord], bar)
        total[start:start + len(p)] += p[: len(total) - start]
        for i, step in enumerate(pattern):
            if step is None: continue
            n = chord[step % 3] + 12 * (step // 3)
            s = int((t0 + i * beat / 2) * SR)
            pl = pluck(NOTE(n), 1.6, rng=rng) * (0.22 if i % 2 == 0 else 0.15)
            e = min(len(total), s + len(pl)); total[s:e] += pl[: e - s]
        bass = pluck(NOTE(chord[0] - 24), 2.0, bright=0.2, rng=rng) * 0.3
        e = min(len(total), start + len(bass)); total[start:e] += bass[: e - start]
        t0 += bar
    total = total[: int(SR * seconds)]
    fade = int(SR * 2.5); total[-fade:] *= np.linspace(1, 0, fade); total[: int(SR * .05)] *= np.linspace(0, 1, int(SR * .05))
    total = total / np.max(np.abs(total)) * 0.7
    stereo = np.stack([total, np.roll(total, 300)], axis=1)
    wav = OUT / f"{name}.wav"
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((stereo * 32767).astype(np.int16).tobytes())
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(wav), "-c:a", "aac", "-b:a", "128k", str(OUT / f"{name}.m4a")], check=True)
    wav.unlink()


OUT.mkdir(exist_ok=True)
MAJ = [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]]          # I V vi IV
FOLK = [[0, 4, 7], [5, 9, 12], [0, 4, 7], [7, 11, 14]]           # I IV I V
SOFT = [[0, 4, 7], [9, 12, 16], [5, 9, 12], [7, 11, 14]]         # I vi IV V
track("morning-plot", 60, MAJ, 96, 34, 1, [0, 1, 2, 3, 2, 1, 0, 2])
track("potting-shed", 62, FOLK, 104, 34, 2, [0, 2, 1, 2, 3, None, 2, 1])
track("kitchen-window", 57, SOFT, 88, 34, 3, [0, None, 2, 1, 3, 2, 1, None])
print("music made:", sorted(p.name for p in OUT.glob("*.m4a")))
