# Forage Around 🍐

**Find likely-ripe wild food near you.**

Forage Around is an account-free map and field guide for reported edible plants.
Search a location, check what's likely in season, and learn how to use or preserve
what you find.

**[Open the live map](https://foragearound.com)** ·
[Explore a species guide](https://foragearound.com/species/plum)

## What it does
- Asks for your location once (no login, no account).
- Lists nearby edible plants, **in-season first, nearest first**, with distance,
  walking time, the edible part, and a one-line fermentation idea per species.
- "Walk here" opens turn-by-turn walking directions in your maps app.
- Toggle between *Likely in season* and *Everything edible* (see what's coming).

## Data — works anywhere
- Queries the **live [Falling Fruit](https://fallingfruit.org) API** by location
  (`/api/0.3/locations?center=lat,lng`), so it works in any city, not just the
  local area. The API is CORS-open and uses the public key from Falling Fruit's own
  open-source web client. No backend of our own.
- `types.json` maps Falling Fruit's 4,500+ numeric type IDs to names; live results
  resolve onto our curated species table by exact-then-keyword match (so "Cherry
  plum", "Santa Rosa plum", etc. all inherit the Plum season + ferment tip).
  Forageable types we haven't curated still show, badged "EDIBLE".
- Season windows, edible part, and fermentation tips are a curated table in
  `process_data.py` (Falling Fruit's own season fields are sparse), tuned for a
  temperate / Mediterranean climate.
- The bundled `data_raw.csv` (~500 points for one city) is kept only as an offline
  fallback if the API is unreachable.
- `python3 process_data.py` regenerates `app/assets/data/{trees,species,types}.json`.

## Stack — built to become a real mobile app
It's an **Expo (React Native) app**, so the *same codebase* runs three ways:
- **Web** (what's deployed): `npx expo export --platform web` → static `dist/`,
  hosted on Vercel.
- **iOS / Android**: `npx expo run:ios` / `run:android`, or `eas build`. The
  location permission strings and bundle IDs are already configured in `app.json`.

All business logic (distance, season, ranking, directions) lives in
`app/src/lib.ts` as pure, platform-free functions — UI is thin React Native on top.

## Layout
```
forage-app/
  data_raw.csv          Falling Fruit export (one city)
  process_data.py       CSV -> trees.json + species.json (the season/ferment brain)
  NAMING.md             naming history (was "Scrump")
  app/                  the Expo app
    App.tsx             screens (landing + results)
    src/lib.ts          pure logic (RN-portable)
    src/theme.ts        almanac palette + fonts
    assets/data/*.json  generated data
  scrump/               built static web bundle deployed to Vercel
```

## Run locally
```
cd app
npm install
npm run web      # or: npm run ios / npm run android
```

## SEO deployment environment

The SEO site reads `GOOGLE_SITE_VERIFICATION` during its production build. In
Vercel, set it to the token value Google Search Console provides, without the
surrounding meta tag. Leave it unset until a token is available; an empty or
missing value does not render a verification tag.

## Data, photos & credits
- **Tree & plant locations:** from [Falling Fruit](https://fallingfruit.org), a
  nonprofit, volunteer-run map of the urban harvest. Their data is licensed
  [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) and is used
  here under those terms. This project **modifies** it (adds season windows, uses,
  and preservation tips, and maps Falling Fruit type IDs to names). Locations are
  crowd-sourced and provided as-is — confirm before foraging. See
  [ATTRIBUTION.md](ATTRIBUTION.md).
- **Species photos & descriptions:** Wikipedia / Wikimedia Commons, fetched at
  build time and at runtime.
- **Maps:** OpenStreetMap tiles via Leaflet.

Forage Around is an independent, **non-commercial** project and is not affiliated
with or endorsed by Falling Fruit.

## Licensing
- The **code** in this repo is MIT (see [`LICENSE`](LICENSE)).
- The **bundled location data** (`app/assets/data/trees.json`, derived from Falling
  Fruit) stays under **CC BY-NC-SA 4.0**, © Falling Fruit contributors. If you reuse
  it, preserve that license and attribution and keep your use non-commercial.

## Forage responsibly
This is a discovery aid, not an identification authority. Always confirm a plant's
identity yourself before eating anything, only harvest from public land or with
permission, and take only what would otherwise go to waste.
