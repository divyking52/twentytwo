from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "standalone"
existing = (OUT / "index.html").read_text(encoding="utf-8")

# Keep existing local @font-face block from previous standalone build
font_match = re.search(
    r"/\* Local fonts \*/\s*(.*?)/\* Site styles \*/",
    existing,
    re.S,
)
if not font_match:
    raise SystemExit("Could not find local fonts block in standalone/index.html")
fonts_css = font_match.group(1).strip()

html = (ROOT / "index.html").read_text(encoding="utf-8")
css = (ROOT / "css" / "styles.css").read_text(encoding="utf-8")
js = (ROOT / "js" / "main.js").read_text(encoding="utf-8")
lenis_js = (ROOT / "js" / "lenis.min.js").read_text(encoding="utf-8")

# Single-page nav / CTAs
link_map = [
    ('href="index.html"', 'href="#main"'),
    ('href="about.html"', 'href="#about"'),
    ('href="treatments.html#haircut"', 'href="#treatments"'),
    ('href="treatments.html#colour"', 'href="#treatments"'),
    ('href="treatments.html#bridal"', 'href="#treatments"'),
    ('href="treatments.html#facial"', 'href="#treatments"'),
    ('href="treatments.html#rituals"', 'href="#treatments"'),
    ('href="treatments.html"', 'href="#treatments"'),
    ('href="gallery.html"', 'href="#moments"'),
    ('href="contact.html#form"', 'href="#form"'),
    ('href="contact.html"', 'href="#form"'),
]
for old, new in link_map:
    html = html.replace(old, new)

html = html.replace(
    '<section class="section center">\n      <h2 class="display">Welcome to Twenty Two</h2>',
    '<section class="section center" id="about">\n      <h2 class="display">Welcome to Twenty Two</h2>',
    1,
)
html = html.replace(
    '<section class="section center" style="padding-top:70px">\n      <p class="eyebrow">Treatments</p>',
    '<section class="section center" id="treatments" style="padding-top:70px">\n      <p class="eyebrow">Treatments</p>',
    1,
)
html = html.replace(
    '<section class="section center" style="padding-top:20px">\n      <p class="eyebrow">Our best sellers</p>',
    '<section class="section center" id="moments" style="padding-top:20px">\n      <p class="eyebrow">Our best sellers</p>',
    1,
)

head_old = """  <link rel="icon" href="https://media.storebox.ai/media/6029c648-5071-4e1b-ab3d-b14528fa88d9/86cacdd5-f96c-456b-978b-0a0b01117961/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css">"""

head_new = f"""  <link rel="icon" href="https://media.storebox.ai/media/6029c648-5071-4e1b-ab3d-b14528fa88d9/86cacdd5-f96c-456b-978b-0a0b01117961/favicon.png">
  <style>
/* Local fonts */
{fonts_css}

/* Site styles */
{css}
  </style>"""

if head_old not in html:
    raise SystemExit("HEAD block not found — check favicon / font links in index.html")

html = html.replace(head_old, head_new)
html = html.replace(
    '  <script src="js/lenis.min.js"></script>\n  <script src="js/main.js"></script>',
    f"  <script>\n{lenis_js}\n  </script>\n  <script>\n{js}\n  </script>",
)
html = html.replace(
    '<a class="logo" href="#main">Twenty Two</a>',
    '<a class="logo" href="#">Twenty Two</a>',
)

out_path = OUT / "index.html"
out_path.write_text(html, encoding="utf-8")
print(f"Wrote {out_path} ({out_path.stat().st_size} bytes)")

# Sanity checks
checks = {
    "reveal-left": "reveal-left" in css,
    "hero overflow": "overflow: hidden" in css and ".hero {" in css,
    "bidirectional reveal": "entry.isIntersecting" in js,
    "lenis init": "new Lenis" in js,
    "lenis bundled": "globalThis.Lenis=Lenis" in html or "window.lenisVersion" in html,
    "storebox media": "media.storebox.ai" in html,
    "inline style": "<style>" in html,
    "inline script": "setupReveals" in html,
}
for label, ok in checks.items():
    print(("OK" if ok else "MISSING"), label)
