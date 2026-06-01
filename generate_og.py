#!/usr/bin/env python3
"""Generate the 1200x630 OpenGraph social card for Scrump."""
from PIL import Image, ImageDraw, ImageFont
import os

ROOT = os.path.dirname(__file__)
FONT = os.path.join(ROOT, "app/node_modules/@expo-google-fonts/fraunces/600SemiBold/Fraunces_600SemiBold.ttf")
FONT_R = os.path.join(ROOT, "app/node_modules/@expo-google-fonts/fraunces/400Regular/Fraunces_400Regular.ttf")
OUT = os.path.join(ROOT, "scrump", "og.png")  # staging dir name unchanged; content rebranded

PAPER = (246, 241, 231)
INK = (31, 42, 32)
SOFT = (90, 101, 83)
FOREST = (46, 94, 58)
RIPE = (217, 118, 43)
BERRY = (122, 46, 74)

W, H = 1200, 630
img = Image.new("RGB", (W, H), PAPER)
d = ImageDraw.Draw(img)

# decorative "fruit" dots, top-right cluster
dots = [
    (1040, 120, 70, RIPE), (1120, 200, 46, FOREST), (980, 210, 38, BERRY),
    (1110, 90, 30, (110, 58, 20)), (1040, 250, 26, FOREST),
]
for x, y, r, col in dots:
    d.ellipse([x - r, y - r, x + r, y + r], fill=col)

kicker = ImageFont.truetype(FONT, 30)
title = ImageFont.truetype(FONT, 132)
tag = ImageFont.truetype(FONT_R, 44)
foot = ImageFont.truetype(FONT_R, 28)

d.text((90, 96), "FIELD GUIDE TO THE FREE HARVEST", font=kicker, fill=RIPE)
d.text((84, 140), "Forage", font=title, fill=FOREST)
d.text((84, 272), "Around", font=title, fill=FOREST)
d.text((90, 440), "Fruit, herbs & greens growing wild", font=tag, fill=INK)
d.text((90, 492), "around you, and how to keep them.", font=tag, fill=INK)
d.text((90, 555), "foragearound.com", font=foot, fill=SOFT)

img.save(OUT, "PNG")
print("wrote", OUT, img.size)
