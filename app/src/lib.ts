// Pure logic — no React, no platform deps. Portable to React Native unchanged.
import treesRaw from "../assets/data/trees.json";
import speciesRaw from "../assets/data/species.json";
import typesRaw from "../assets/data/types.json";
import imagesRaw from "../assets/data/images.json";

export type Species = {
  edible: boolean;
  cat: string;
  emoji: string;
  part: string;
  season: number[]; // months 1-12 when ready
  peak?: number[];
  note: string;
  uses: string[];
  preserve: string[];
};

export type Tree = {
  id: string;
  type: string;
  lat: number;
  lng: number;
  desc: string;
  edible: boolean;
};

export type Find = {
  id: string;
  type: string; // display name
  lat: number;
  lng: number;
  desc: string;
  species: Species;
  images: string[];
  wiki: string; // Wikipedia page title for runtime photo + description
  seasonKnown: boolean; // false => curated season/use data unavailable
  distM: number;
  inSeason: boolean;
  atPeak: boolean;
};

export const TREES = treesRaw as Tree[];
export const SPECIES = speciesRaw as Record<string, Species>;
// type_id -> [common name, isForageable(0|1), wikipedia title]
const TYPES = typesRaw as unknown as Record<string, [string, number, string?]>;
const IMAGES = imagesRaw as Record<string, string[]>;

// Public API key shipped in Falling Fruit's own open-source web client.
const FF_KEY = "AKDJGHSD";
const FF_BASE = "https://fallingfruit.org/api/0.3";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const monthName = (m: number) => MONTHS[(m - 1 + 12) % 12];

const GENERIC: Species = {
  edible: true,
  cat: "other",
  emoji: "🌿",
  part: "Edible",
  season: [],
  note: "",
  uses: [],
  preserve: [],
};

// Map any Falling Fruit common name onto our curated species table. Exact match
// first, then keyword (the taxonomy is far more granular than our table, e.g.
// "Cherry plum", "Santa Rosa plum" all resolve to our Plum entry). Order matters:
// multi-word / specific keys must come before the generic ones.
const KEYWORDS: [string, string][] = [
  ["california bay laurel", "California bay"],
  ["california laurel", "California bay"],
  ["california bay", "California bay"],
  ["oregon myrtle", "California bay"],
  ["umbellularia", "California bay"],
  ["bay laurel", "Bay laurel"],
  ["sweet bay", "Bay laurel"],
  ["laurus nobilis", "Bay laurel"],
  ["strawberry tree", "Strawberry tree"],
  ["madrone", "Pacific madrone"],
  ["paper mulberry", "Paper mulberry"],
  ["mulberry", "Mulberry"],
  ["cherry plum", "Plum"],
  ["sour cherry", "Sour cherry"],
  ["cherry", "Cherry"],
  ["crab apple", "Crabapple"],
  ["crabapple", "Crabapple"],
  ["apple", "Apple"],
  ["loquat", "Loquat"],
  ["common fig", "Common fig"],
  ["fig", "Common fig"],
  ["pear", "Pear"],
  ["plum", "Plum"],
  ["apricot", "Apricot"],
  ["nectarine", "Nectarine"],
  ["peach", "Peach"],
  ["persimmon", "Persimmon"],
  ["pomegranate", "Pomegranate"],
  ["olive", "Olive"],
  ["walnut", "Walnut"],
  ["almond", "Almond"],
  ["pecan", "Pecan"],
  ["blackberry", "Blackberry"],
  ["raspberry", "Raspberry"],
  ["grape", "Grape"],
  ["kumquat", "Kumquat"],
  ["mandarin", "Orange"],
  ["tangerine", "Orange"],
  ["clementine", "Orange"],
  ["grapefruit", "Orange"],
  ["orange", "Orange"],
  ["lemon", "Lemon"],
  ["lime", "Lime"],
  ["pineapple guava", "Feijoa"],
  ["feijoa", "Feijoa"],
  ["guava", "Strawberry guava"],
  ["prickly pear", "Prickly pear"],
  ["rosemary", "Rosemary"],
  ["fennel", "Fennel"],
  ["nasturtium", "Nasturtium"],
  ["elderberry", "Elderberry"],
  ["elderflower", "Elderberry"],
  ["elder", "Elderberry"],
  ["quince", "Quince"],
  ["avocado", "Avocado"],
  ["kale", "Kale"],
];

// Returns the curated species key for a Falling Fruit common name, or null.
function resolveKey(name: string): string | null {
  if (SPECIES[name]) return name;
  const l = name.toLowerCase();
  for (const [kw, canon] of KEYWORDS) {
    if (l.includes(kw)) return SPECIES[canon] ? canon : null;
  }
  return null;
}

// Haversine distance in meters.
export function distanceM(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function fmtDist(m: number): string {
  if (m < 950) return `${Math.round(m / 10) * 10} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

// Average walking pace ~1.35 m/s.
export function walkMins(m: number): number {
  return Math.max(1, Math.round(m / 1.35 / 60));
}

function makeFind(
  id: string,
  name: string,
  lat: number,
  lng: number,
  desc: string,
  distM: number,
  month: number,
  wiki: string
): Find | null {
  const key = resolveKey(name);
  const known = !!key;
  const species = key ? SPECIES[key] : GENERIC;
  const inSeason = known && species.season.includes(month);
  return {
    id,
    type: name,
    lat,
    lng,
    desc,
    species,
    images: key ? IMAGES[key] || [] : [],
    wiki: wiki || name,
    seasonKnown: known,
    distM,
    inSeason,
    atPeak: known && !!species.peak && species.peak.includes(month),
  };
}

type RawLoc = { id: number; lat: number; lng: number; type_ids?: number[]; distance?: number };

// Fetch forageable plants near a point from the live Falling Fruit API (works
// anywhere, CORS-open). Falls back to the bundled seed dataset on failure.
export async function fetchNearby(
  lat: number,
  lng: number,
  month: number
): Promise<Find[]> {
  let raw: RawLoc[];
  try {
    const url = `${FF_BASE}/locations?api_key=${FF_KEY}&center=${lat},${lng}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(String(res.status));
    raw = (await res.json()) as RawLoc[];
  } catch {
    return fallbackNearby(lat, lng, month);
  }

  const finds: Find[] = [];
  for (const loc of raw) {
    for (const tid of loc.type_ids || []) {
      const entry = TYPES[String(tid)];
      if (!entry) continue;
      const [name, forageFlag, wiki] = entry;
      const key = resolveKey(name);
      const forageable = forageFlag === 1 || (key ? SPECIES[key].edible : false);
      if (!forageable) continue;
      const distM =
        typeof loc.distance === "number" ? loc.distance : distanceM(lat, lng, loc.lat, loc.lng);
      const f = makeFind(`${loc.id}-${tid}`, name, loc.lat, loc.lng, "", distM, month, wiki || "");
      if (f) finds.push(f);
    }
  }
  finds.sort((a, b) => a.distM - b.distM);
  return finds;
}

// Offline / API-down fallback: the bundled seed dataset.
function fallbackNearby(lat: number, lng: number, month: number): Find[] {
  const finds: Find[] = [];
  for (const t of TREES) {
    const f = makeFind(
      t.id,
      t.type,
      t.lat,
      t.lng,
      t.desc,
      distanceM(lat, lng, t.lat, t.lng),
      month,
      ""
    );
    if (f && f.species.edible) finds.push(f);
  }
  finds.sort((a, b) => a.distM - b.distM);
  return finds;
}

// Apply the in-season toggle and rank: ripe (peak first) -> unknown-season ->
// out of season, nearest within each. Cap for a light list.
export function applyView(finds: Find[], onlyInSeason: boolean, cap = 1000): Find[] {
  const filtered = onlyInSeason ? finds.filter((f) => f.inSeason) : finds;
  const rank = (f: Find) => (f.inSeason ? 0 : !f.seasonKnown ? 1 : 2);
  return filtered
    .slice()
    .sort((a, b) => {
      if (rank(a) !== rank(b)) return rank(a) - rank(b);
      return a.distM - b.distM;
    })
    .slice(0, cap);
}

// What's ripe right now, with a photo for each (for the landing image strip).
export function inSeasonWithImages(
  month: number,
  limit = 8
): { name: string; image?: string; emoji: string }[] {
  const names = Object.keys(SPECIES)
    .filter((n) => {
      const s = SPECIES[n];
      return s.edible && s.season.includes(month) && s.cat !== "herb" && s.cat !== "other";
    })
    .sort((a, b) => {
      const pa = SPECIES[a].peak?.includes(month) ? 0 : 1;
      const pb = SPECIES[b].peak?.includes(month) ? 0 : 1;
      return pa - pb;
    });
  return names.slice(0, limit).map((n) => ({
    name: n,
    image: (IMAGES[n] && IMAGES[n][0]) || undefined,
    emoji: SPECIES[n].emoji,
  }));
}

// What's ripe right now, as a friendly teaser line (distinct species names).
export function inSeasonNames(month: number, limit = 4): string[] {
  const names = new Set<string>();
  for (const [name, s] of Object.entries(SPECIES)) {
    if (s.edible && s.season.includes(month) && s.cat !== "herb" && s.cat !== "other")
      names.add(name);
  }
  const arr = Array.from(names).sort((a, b) => {
    const pa = SPECIES[a].peak?.includes(month) ? 0 : 1;
    const pb = SPECIES[b].peak?.includes(month) ? 0 : 1;
    return pa - pb;
  });
  return arr.slice(0, limit).map((n) => n.toLowerCase());
}

export type GeoPoint = { lat: number; lng: number; label: string };

// Geocode a typed address via OpenStreetMap Nominatim (free, no API key, works
// on web + native). Biased toward the data region via the viewbox below.
export async function geocode(query: string): Promise<GeoPoint | null> {
  const q = query.trim();
  if (!q) return null;
  const enriched = q;
  const params = [
    `q=${encodeURIComponent(enriched)}`,
    "format=json",
    "limit=1",
    "countrycodes=us",
    "viewbox=-122.33,37.91,-122.23,37.83",
  ].join("&");
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as Array<{ lat: string; lon: string; display_name?: string }>;
  if (!Array.isArray(data) || !data.length) return null;
  const top = data[0];
  const lat = parseFloat(top.lat);
  const lng = parseFloat(top.lon);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  const label = (top.display_name || enriched).split(",").slice(0, 2).join(",").trim();
  return { lat, lng, label };
}

// Fetch a photo + short description for any species from Wikipedia at runtime.
// Uses the action API with origin=* (CORS-safe). Covers species we haven't
// hand-curated (carob, and the long tail of the Falling Fruit taxonomy).
export async function fetchWikiInfo(
  title: string
): Promise<{ image?: string; about?: string }> {
  const t = (title || "").trim();
  if (!t) return {};
  const params = [
    "format=json",
    "origin=*",
    "action=query",
    "redirects=1",
    "prop=extracts|pageimages",
    "exintro=1",
    "explaintext=1",
    "piprop=original|thumbnail",
    "pithumbsize=900",
    `titles=${encodeURIComponent(t)}`,
  ].join("&");
  try {
    const res = await fetch(`https://en.wikipedia.org/w/api.php?${params}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return {};
    const data = await res.json();
    const pages = data?.query?.pages || {};
    const page: any = Object.values(pages)[0];
    if (!page || page.missing !== undefined) return {};
    const image: string | undefined = page.original?.source || page.thumbnail?.source;
    let about: string = (page.extract || "").trim();
    if (about.length > 280) about = about.slice(0, 277).replace(/\s+\S*$/, "") + "…";
    return { image, about: about || undefined };
  } catch {
    return {};
  }
}

// Build a maps directions URL that opens the native app on iOS/Android and the
// web map on desktop. Walking directions to the tree.
export function directionsUrl(lat: number, lng: number, label: string): string {
  const q = encodeURIComponent(label);
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking&query=${q}`;
}
