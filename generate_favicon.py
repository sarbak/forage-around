#!/usr/bin/env python3
"""Generate Forage Around app icons + favicon: a cream pear on a forest rounded square."""
from PIL import Image, ImageDraw
import os

ROOT = os.path.dirname(__file__)
PAPER = (246, 241, 231, 255)
FOREST = (46, 94, 58, 255)
CREAM = (246, 241, 231, 255)
RIPE = (217, 118, 43, 255)


def draw_icon(size, bleed=True):
    """Render at high res then downscale for crisp edges."""
    S = 1024
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    m = 0 if bleed else int(S * 0.06)
    # forest rounded-square background
    d.rounded_rectangle([m, m, S - m, S - m], radius=int(S * 0.22), fill=FOREST)

    # pear: two overlapping ellipses (cream)
    # bulb (lower, wider)
    d.ellipse([S * 0.27, S * 0.42, S * 0.73, S * 0.84], fill=CREAM)
    # neck (upper, narrower)
    d.ellipse([S * 0.36, S * 0.24, S * 0.64, S * 0.60], fill=CREAM)

    # stem
    d.rounded_rectangle([S * 0.485, S * 0.20, S * 0.525, S * 0.31], radius=int(S * 0.02), fill=FOREST)
    # leaf (ripe orange), to the right of the stem
    leaf = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ld = ImageDraw.Draw(leaf)
    ld.ellipse([S * 0.52, S * 0.18, S * 0.70, S * 0.27], fill=RIPE)
    leaf = leaf.rotate(-20, center=(S * 0.55, S * 0.22), resample=Image.BICUBIC)
    img = Image.alpha_composite(img, leaf)

    return img.resize((size, size), Image.LANCZOS)


def main():
    # Native app icon (1024, bleed) + web favicon source (512)
    draw_icon(1024).save(os.path.join(ROOT, "app/assets/icon.png"))
    draw_icon(512).save(os.path.join(ROOT, "app/assets/favicon.png"))
    # Post-build extras dropped into the deploy dir
    out = os.path.join(ROOT, "scrump")
    draw_icon(180).save(os.path.join(out, "apple-touch-icon.png"))
    draw_icon(32).save(os.path.join(out, "favicon-32.png"))
    # multi-size .ico
    ico = draw_icon(256)
    ico.save(os.path.join(out, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
    # also refresh the android adaptive foreground (pear on transparent, no bg square)
    print("wrote icons: app/assets/icon.png, favicon.png; scrump/apple-touch-icon.png, favicon-32.png, favicon.ico")


if __name__ == "__main__":
    main()
