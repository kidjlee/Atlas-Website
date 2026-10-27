"""Cleans up the clinic photos in scripts/photo-sources/ and writes them to src/assets/photos/.

Run with: python3 scripts/prepare-photos.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "scripts" / "photo-sources"
OUT = ROOT / "src" / "assets" / "photos"
OUT.mkdir(parents=True, exist_ok=True)


def save(im: Image.Image, name: str) -> None:
    im.save(OUT / name, "JPEG", quality=90, optimize=True, progressive=True)
    print(f"{name}: {im.size[0]}x{im.size[1]}")


def lift_shadows(im: Image.Image, amount: float) -> Image.Image:
    """Brightens dark tones while leaving highlights alone."""
    lut = [round(255 * ((v / 255) ** (1 - amount))) for v in range(256)]
    return im.point(lut * 3)


# Night exterior: trim the empty sidewalk, open up the shadows, and sharpen lightly.
exterior = Image.open(SRC / "exterior-night.jpg").convert("RGB")
w, h = exterior.size
exterior = exterior.crop((0, 0, w, h - 28))
exterior = lift_shadows(exterior, 0.12)
exterior = ImageEnhance.Contrast(exterior).enhance(1.04)
exterior = exterior.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))
save(exterior, "exterior-night.jpg")

# Hero: the source has a green ring and leaf drawn over a circular photo on white.
# Crop a square inside the photo circle that stays clear of both; the site masks it
# to a circle and draws its own ring and leaf.
hero = Image.open(SRC / "hero-ring.jpg").convert("RGB")
cx, cy, radius = 471, 488, 332
hero = hero.crop((cx - radius, cy - radius, cx + radius, cy + radius))
# Fill the corners outside the circle with the photo's edge tone so stray ring or
# white pixels can never show, even if the mask is anti-aliased.
size = hero.size[0]
mask = Image.new("L", hero.size, 0)
ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
edge = Image.new("L", hero.size, 0)
ImageDraw.Draw(edge).ellipse((10, 10, size - 11, size - 11), fill=255)
ImageDraw.Draw(edge).ellipse((40, 40, size - 41, size - 41), fill=0)
pixels = [hero.getpixel((x, y)) for y in range(0, size, 4) for x in range(0, size, 4) if edge.getpixel((x, y))]
tone = tuple(sum(p[i] for p in pixels) // len(pixels) for i in range(3))
hero = Image.composite(hero, Image.new("RGB", hero.size, tone), mask)
hero = hero.filter(ImageFilter.UnsharpMask(radius=1, percent=40, threshold=2))
save(hero, "hero-shoulder.jpg")

# Intro: the source sits inside a white arch frame. Crop to the photo's bounding box;
# the site applies a slightly tighter arch mask so no white shows.
intro = Image.open(SRC / "intro-arch.jpg").convert("RGB")
intro = intro.crop((24, 44, 657, 979))
intro = intro.filter(ImageFilter.UnsharpMask(radius=1, percent=40, threshold=2))
save(intro, "intro-back.jpg")
