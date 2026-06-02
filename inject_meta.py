#!/usr/bin/env python3
"""Inject OpenGraph / Twitter / SEO meta into the exported index.html (idempotent)."""
import os

ROOT = os.path.dirname(__file__)
HTML = os.path.join(ROOT, "scrump", "index.html")
SITE = "https://foragearound.com"
TITLE = "Forage Around — field guide to the free harvest"
DESC = ("Find the fruit, herbs and greens growing wild and unpicked around you, "
        "what's in season right now, how to use them, and how to keep them. "
        "No login.")

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

# PostHog analytics loader (plain string — has braces, so NOT an f-string).
POSTHOG = """
    <script>
      !function(t,e){var o,n,p,r;e.__SV||(window.posthog&&window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug getPageViewId captureTraceFeedback captureTraceMetric".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
      posthog.init('phc_oD2VKZzyJbwhoS5RpHS7fysrCbYsxoyaNU75yx9dQC5v',{api_host:'https://us.i.posthog.com',person_profiles:'identified_only',capture_pageview:true,capture_pageleave:true,autocapture:true});
    </script>
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
