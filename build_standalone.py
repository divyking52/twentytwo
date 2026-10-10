from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "standalone"

html = (ROOT / "index.html").read_text(encoding="utf-8")
css = (ROOT / "css" / "styles.css").read_text(encoding="utf-8")
js = (ROOT / "js" / "main.js").read_text(encoding="utf-8")
fonts_css = (OUT / "assets" / "fonts.css").read_text(encoding="utf-8")

repl = {
    "https://salontwentytwo.co.in/appassets/mediaassets/8f5906c7f3e34d8581a1cfd8bcf0bdb7/icon/salontwentytwoo.png": "assets/favicon.png",
    "https://salontwentytwo.co.in/commonassets/image/9814762a-aac2-454d-8592-63a576bd0278.webp": "assets/stylists.webp",
    "https://salontwentytwo.co.in/commonassets/image/329d7ed2-7be4-46cd-8cb4-c34315d2cb90.webp": "assets/guest-care.webp",
    "https://salontwentytwo.co.in/commonassets/image/a6d12d3e-d0ba-4a93-b8c1-878f510b2e84.webp": "assets/interior.webp",
    "https://salontwentytwo.co.in/appassets/mediaassets/8f5906c7f3e34d8581a1cfd8bcf0bdb7/image/60e9f46d-bc82-4783-93fd-ec5af1e6a46e.file.webp": "assets/haircut.webp",
    "https://salontwentytwo.co.in/appassets/mediaassets/8f5906c7f3e34d8581a1cfd8bcf0bdb7/image/f4be8bb4-12c5-4d9e-be26-01d79dccb7ab.file.webp": "assets/colour.webp",
    "https://salontwentytwo.co.in/appassets/mediaassets/8f5906c7f3e34d8581a1cfd8bcf0bdb7/image/72e5e2ea-58a4-4d22-8ff3-fa5120cab917.file.webp": "assets/bridal.webp",
    "https://salontwentytwo.co.in/appassets/mediaassets/8f5906c7f3e34d8581a1cfd8bcf0bdb7/image/ab468da8-f8b5-4b5c-9465-8d82f983092d.file.webp": "assets/facial.webp",
    "https://salontwentytwo.co.in/appassets/mediaassets/8f5906c7f3e34d8581a1cfd8bcf0bdb7/image/0b7f4c33-9eb3-41b8-b83c-b60cac3ee71f.webp": "assets/ritual.webp",
    "https://salontwentytwo.co.in/appassets/mediaassets/8f5906c7f3e34d8581a1cfd8bcf0bdb7/image/logo-cropped-1787114045512-0.png": "assets/logo.png",
    "https://assets.mixkit.co/videos/40583/40583-thumb-720-0.jpg": "assets/care-video-poster.jpg",
    "https://assets.mixkit.co/videos/40583/40583-720.mp4": "assets/care-video.mp4",
}

for old, new in repl.items():
    html = html.replace(old, new)

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

head_old = """  <link rel="icon" href="assets/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css">"""

head_new = f"""  <link rel="icon" href="assets/favicon.png">
  <style>
/* Local fonts */
{fonts_css}

/* Site styles */
{css}
  </style>"""

if head_old not in html:
    raise SystemExit("HEAD block not found — check asset remap for favicon")

html = html.replace(head_old, head_new)
html = html.replace(
    '  <script src="js/main.js"></script>',
    f"  <script>\n{js}\n  </script>",
)
html = html.replace(
    '<a class="logo" href="#main">Twenty Two</a>',
    '<a class="logo" href="#">Twenty Two</a>',
)

out_path = OUT / "index.html"
out_path.write_text(html, encoding="utf-8")
print(f"Wrote {out_path} ({out_path.stat().st_size} bytes)")

remotes = sorted(set(re.findall(r"https?://[^\s\"']+", html)))
print("Remaining remote URLs:")
for u in remotes:
    print(" ", u)

print("\nAssets:")
for p in sorted((OUT / "assets").rglob("*")):
    if p.is_file():
        print(f"  {p.relative_to(OUT)} ({p.stat().st_size})")
