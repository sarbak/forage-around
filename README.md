# Forage Around 🍐

**The field guide to the free harvest.** Tell Forage Around where you are; it shows the
fruit, herbs and greens growing wild and unpicked around you that are **in season
right now** — and what to ferment them into.

Live (web): **https://foragearound.com**

## What it does
- Asks for your location once (no login, no account).
- Lists nearby edible plants, **in-season first, nearest first**, with distance,
  walking time, the edible part, and a one-line fermentation idea per species.
- "Walk here" opens turn-by-turn walking directions in your maps app.
- Toggle between *Ripe now* and *Everything edible* (see what's coming).

## Data — works anywhere
- Queries the **live [Falling Fruit](https://fallingfruit.org) API** by location
  (`/api/0.3/locations?center=lat,lng`), so it works in any city, not just
  Berkeley. The API is CORS-open and uses the public key from Falling Fruit's own
  open-source web client. No backend of our own.
- `types.json` maps Falling Fruit's 4,500+ numeric type IDs to names; live results
  resolve onto our curated species table by exact-then-keyword match (so "Cherry
  plum", "Santa Rosa plum", etc. all inherit the Plum season + ferment tip).
  Forageable types we haven't curated still show, badged "EDIBLE".
- Season windows, edible part, and fermentation tips are a curated table in
  `process_data.py` (Falling Fruit's own season fields are sparse), tuned for a
  temperate / Mediterranean climate.
- The bundled `data_raw.csv` (~500 Berkeley points) is kept only as an offline
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
  data_raw.csv          Falling Fruit export (Berkeley)
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

## Credits & data
- **Tree & plant locations:** the [Falling Fruit](https://fallingfruit.org) open
  dataset and API (a nonprofit urban-foraging map). Forage Around is an independent
  project built on top of their public API and is not affiliated with Falling Fruit.
- **Species photos & descriptions:** Wikipedia / Wikimedia Commons, fetched at
  build time and at runtime.
- **Maps:** OpenStreetMap tiles via Leaflet.

The code is MIT licensed (see `LICENSE`). Please respect the terms of the
underlying data sources above.

## Forage responsibly
This is a discovery aid, not an identification authority. Always confirm a plant's
identity yourself before eating anything, only harvest from public land or with
permission, and take only what would otherwise go to waste.
