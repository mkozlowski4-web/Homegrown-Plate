"""HTML templates to PNG with Playwright (headless Chromium)."""
import hashlib
from pathlib import Path

from jinja2 import Environment, FileSystemLoader
from playwright.sync_api import sync_playwright

from .common import ROOT, env, load

SIZES = {"slide": (1080, 1350), "pin": (1000, 1500), "story": (1080, 1920), "reel": (1080, 1920)}


def local_media(url):
    """Use the built site on disk (SITE_DIR/dist) for site images, so renders don't depend on the network."""
    if not url:
        return ""
    if url.startswith("file://") or url.startswith("/"):
        return url if url.startswith("file://") else "file://" + url
    site_dir = env("SITE_DIR")
    if site_dir and "homegrownplate.co.uk/" in url:
        p = Path(site_dir) / "dist" / url.split("homegrownplate.co.uk/", 1)[1].split("?")[0].split("#")[0]
        if p.exists():
            return "file://" + str(p)
    return url


class Renderer:
    def __init__(self):
        self.env = Environment(loader=FileSystemLoader(str(ROOT / "templates")), autoescape=True)
        self.tmp = ROOT / ".render"
        self.tmp.mkdir(exist_ok=True)
        self.colours = load("site-data.json")["brand_look"]["colours"]
        logo = local_media("https://homegrownplate.co.uk/favicon.svg")
        self.logo = logo
        self.pw = sync_playwright().start()
        self.browser = self.pw.chromium.launch()

    def close(self):
        self.browser.close()
        self.pw.stop()

    def render(self, template, out, **ctx):
        w, h = SIZES[template]
        if ctx.get("image"):
            ctx["image"] = local_media(ctx["image"])
            ctx.setdefault("img_class", "drawing" if ctx["image"].endswith(".svg") or "/img/recipes/" in ctx["image"] else "photo")
        html = self.env.get_template(f"{template}.html").render(
            c=self.colours, w=w, h=h, logo=self.logo, logo_white=self.logo, **ctx)
        key = hashlib.md5(html.encode()).hexdigest()[:10]
        f = self.tmp / f"{template}-{key}.html"
        f.write_text(html, encoding="utf-8")
        page = self.browser.new_page(viewport={"width": w, "height": h}, device_scale_factor=1)
        page.goto("file://" + str(f))
        page.wait_for_load_state("networkidle")
        page.evaluate("document.fonts.ready")
        out = Path(out)
        out.parent.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(out), omit_background=bool(ctx.get("transparent")))
        page.close()
        return out
