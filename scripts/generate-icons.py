"""Draws the Prava app icons (green tile, cream speech bubble, green "P").

Needs Pillow:  python -m pip install pillow
Run from the project root:  python scripts/generate-icons.py
Writes the PNGs under public/icons/ and assets/images/favicon.png.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
GREEN = (30, 90, 69)
CREAM = (245, 240, 232)
SIZE = 1024
FONT_CANDIDATES = [
    "C:/Windows/Fonts/segoeuib.ttf",
    "/System/Library/Fonts/SFNS.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]


def load_font(size: int) -> ImageFont.FreeTypeFont:
    for candidate in FONT_CANDIDATES:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size)
    raise SystemExit("No bold font found; add one to FONT_CANDIDATES.")


def draw_icon(scale: float, rounded: bool) -> Image.Image:
    """scale shrinks the bubble towards the centre (maskable icons need a safe zone)."""
    image = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    if rounded:
        draw.rounded_rectangle((0, 0, SIZE - 1, SIZE - 1), radius=230, fill=GREEN)
    else:
        draw.rectangle((0, 0, SIZE, SIZE), fill=GREEN)

    def s(x: float, y: float) -> tuple[float, float]:
        cx = cy = SIZE / 2
        return (cx + (x - cx) * scale, cy + (y - cy) * scale)

    left, top = s(196, 196)
    right, bottom = s(828, 748)
    draw.rounded_rectangle((left, top, right, bottom), radius=170 * scale, fill=CREAM)
    draw.polygon([s(300, 690), s(232, 872), s(462, 742)], fill=CREAM)

    font = load_font(int(430 * scale))
    centre_x, centre_y = s(512, 472)
    draw.text((centre_x, centre_y), "P", font=font, fill=GREEN, anchor="mm")
    return image


def save(image: Image.Image, size: int, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    image.resize((size, size), Image.LANCZOS).save(path, optimize=True)
    print(f"wrote {path.relative_to(ROOT)}")


def main() -> None:
    full = draw_icon(scale=1.0, rounded=False)
    maskable = draw_icon(scale=0.78, rounded=False)
    favicon = draw_icon(scale=1.0, rounded=True)

    icons = ROOT / "public" / "icons"
    save(full.convert("RGB"), 180, icons / "apple-touch-icon.png")
    save(full.convert("RGB"), 192, icons / "icon-192.png")
    save(full.convert("RGB"), 512, icons / "icon-512.png")
    save(maskable.convert("RGB"), 512, icons / "maskable-512.png")
    save(favicon, 64, ROOT / "assets" / "images" / "favicon.png")


if __name__ == "__main__":
    main()
