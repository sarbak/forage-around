#!/usr/bin/env python3
"""Inject OpenGraph / Twitter / SEO meta into the exported index.html (idempotent)."""
import os

ROOT = os.path.dirname(__file__)
HTML = os.path.join(ROOT, "scrump", "index.html")
SITE = "https://scrump-five.vercel.app"
DESC = ("Find the fruit, herbs and greens growing wild and unpicked around you, "
        "what's in season right now, how to use them, and how to keep them. "
        "No login.")

META = f"""
    <meta name="description" content="{DESC}" />
    <meta name="theme-color" content="#2E5E3A" />
    <link rel="canonical" href="{SITE}/" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Scrump" />
    <meta property="og:title" content="Scrump — field guide to the free harvest" />
    <meta property="og:description" content="{DESC}" />
    <meta property="og:url" content="{SITE}/" />
    <meta property="og:image" content="{SITE}/og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Scrump — field guide to the free harvest" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Scrump — field guide to the free harvest" />
    <meta name="twitter:description" content="{DESC}" />
    <meta name="twitter:image" content="{SITE}/og.png" />
    <meta name="apple-mobile-web-app-title" content="Scrump" />
"""

with open(HTML) as f:
    html = f.read()

if 'property="og:title"' in html:
    print("meta already present, skipping")
else:
    html = html.replace("<title>Scrump</title>", "<title>Scrump — field guide to the free harvest</title>" + META, 1)
    with open(HTML, "w") as f:
        f.write(html)
    print("injected OG/Twitter/SEO meta into", HTML)
