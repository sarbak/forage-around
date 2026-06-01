import speciesRaw from "@/data/species.json";
import typesRaw from "@/data/types.json";
import imagesRaw from "@/data/images.json";
import treesRaw from "@/data/trees.json";

export type Species = {
  edible: boolean;
  cat: string;
  emoji: string;
  part: string;
  season: number[];
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
  desc?: string;
  edible?: boolean;
};

// types.json: { "<ff_type_id>": ["<common name>", <forageable 0|1>, "<wikipedia title>"] }
type TypeEntry = [string, number, string];

export const species = speciesRaw as unknown as Record<string, Species>;
export const types = typesRaw as unknown as Record<string, TypeEntry>;
export const images = imagesRaw as unknown as Record<string, string[]>;
export const trees = treesRaw as unknown as Tree[];

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Map of slug -> canonical species name
const _slugMap: Record<string, string> = {};
for (const name of Object.keys(species)) {
  _slugMap[slugify(name)] = name;
}
export function speciesNameFromSlug(slug: string): string | null {
  return _slugMap[slug] ?? null;
}

export function allSpeciesNames(): string[] {
  return Object.keys(species);
}

export function getSpecies(name: string): Species | null {
  return species[name] ?? null;
}

// Resolve a Falling Fruit type_id to a common name (preferring one we have curated data for)
export function nameFromTypeId(typeId: number | string): string | null {
  const e = types[String(typeId)];
  if (!e) return null;
  return e[0] ?? null;
}

// Resolve the best common name from an array of FF type_ids
export function nameFromTypeIds(typeIds: (number | string)[]): string | null {
  if (!typeIds || typeIds.length === 0) return null;
  // Prefer a type that maps to a species we have curated data for
  for (const id of typeIds) {
    const n = nameFromTypeId(id);
    if (n && species[n]) return n;
  }
  // Otherwise first resolvable name
  for (const id of typeIds) {
    const n = nameFromTypeId(id);
    if (n) return n;
  }
  return null;
}

// Wikipedia title for a species name (from types.json 3rd element, else the name)
export function wikiTitleForName(name: string): string {
  for (const e of Object.values(types)) {
    if (e[0] === name && e[2]) return e[2];
  }
  return name;
}

export function imagesForName(name: string): string[] {
  return images[name] ?? [];
}

export function seasonLabel(s: Species): string | null {
  if (!s.season || s.season.length === 0) return null;
  const sorted = [...s.season].sort((a, b) => a - b);
  // detect contiguous range
  const labels = sorted.map((m) => MONTHS[m - 1]);
  if (labels.length === 1) return labels[0];
  return `${labels[0]}–${labels[labels.length - 1]}`;
}

export function peakLabel(s: Species): string | null {
  if (!s.peak || s.peak.length === 0) return null;
  return s.peak.map((m) => MONTHS[m - 1]).join(", ");
}

export function getTree(id: string): Tree | null {
  return trees.find((t) => String(t.id) === String(id)) ?? null;
}

export function emojiForName(name: string | null): string {
  if (!name) return "🌿";
  return species[name]?.emoji ?? "🌿";
}
