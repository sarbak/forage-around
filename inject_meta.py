#!/usr/bin/env python3
"""Inject OpenGraph / Twitter / SEO meta into the exported index.html (idempotent)."""
import os

ROOT = os.path.dirname(__file__)
HTML = os.path.join(ROOT, "scrump", "index.html")
SITE = "https://foragearound.com"
TITLE = "Forage Around | Free urban foraging map"
DESC = ("Find fruit, herbs, and greens likely in season near you. "
        "Free open-source urban foraging map with Falling Fruit source notes "
        "and permission reminders.")

META = f"""
    <meta name="description" content="{DESC}" />
    <meta name="theme-color" content="#2E5E3A" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
    <link rel="canonical" href="{SITE}/" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Forage Around" />
    <meta property="og:title" content="{TITLE}" />
    <meta property="og:description" content="{DESC}" />
    <meta property="og:url" content="{SITE}/" />
    <meta property="og:image" content="{SITE}/og.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="{TITLE}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{TITLE}" />
    <meta name="twitter:description" content="{DESC}" />
    <meta name="twitter:image" content="{SITE}/og.png" />
    <meta name="apple-mobile-web-app-title" content="Forage Around" />
"""

# PostHog analytics loader. Keep this external so the deployed shell can use
# a real Content-Security-Policy without unsafe inline scripts.
POSTHOG = """
    <script src="/posthog-loader.js" defer></script>
"""

with open(HTML) as f:
    html = f.read()

if 'property="og:title"' in html:
    print("meta already present, skipping")
else:
    # Expo exports <title>Forage Around</title> (from app.json name).
    html = html.replace("<title>Forage Around</title>", f"<title>{TITLE}</title>" + META + POSTHOG, 1)
    with open(HTML, "w") as f:
        f.write(html)
    print("injected OG/Twitter/SEO meta + PostHog into", HTML)
