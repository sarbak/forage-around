export type CityHarvest = {
  slug: string;
  name: string;
  region: string;
  searchLabel: string;
  localContext: string;
  plantNames: string[];
};

// These guides are limited to curated edible plants represented in current
// Falling Fruit results around each city. Counts are intentionally omitted:
// the live map changes, and a city page should never imply current inventory.
export const cityHarvests: CityHarvest[] = [
  {
    slug: "seattle",
    name: "Seattle",
    region: "Washington",
    searchLabel: "Seattle, WA",
    localContext:
      "Seattle covers a wide area, so a neighborhood or street address gives the map a more useful starting point than the city name alone.",
    plantNames: [
      "Plum",
      "Crabapple",
      "Cherry",
      "Apple",
      "Strawberry tree",
      "Hawthorn",
      "Chestnut",
      "Walnut",
    ],
  },
  {
    slug: "berkeley",
    name: "Berkeley",
    region: "California",
    searchLabel: "Berkeley, CA",
    localContext:
      "A neighborhood or street address helps keep a Berkeley search close to where you can actually walk, especially near the Oakland, Emeryville, and Albany edges.",
    plantNames: [
      "Plum",
      "Apple",
      "Strawberry tree",
      "Loquat",
      "Olive",
      "Cherry",
      "Paper mulberry",
      "Common fig",
    ],
  },
  {
    slug: "portland",
    name: "Portland",
    region: "Oregon",
    searchLabel: "Portland, OR",
    localContext:
      "Portland's wet winters and dry summers create broad seasonal shifts across neighborhood fruit trees and cane berries. Search a street or neighborhood to keep the map close to the walk you can actually take.",
    plantNames: [
      "Pear",
      "Apple",
      "Blackberry",
      "Hawthorn",
      "Walnut",
      "Plum",
      "Raspberry",
      "Cherry",
    ],
  },
  {
    slug: "los-angeles",
    name: "Los Angeles",
    region: "California",
    searchLabel: "Los Angeles, CA",
    localContext:
      "Los Angeles is a patchwork of coastal, basin, foothill, and irrigated neighborhood microclimates. Search a street or neighborhood because the same plant can be ready weeks apart across the city.",
    plantNames: [
      "Lemon",
      "Loquat",
      "Orange",
      "Avocado",
      "Common fig",
      "Peach",
      "Pomegranate",
      "Apricot",
    ],
  },
  {
    slug: "chicago",
    name: "Chicago",
    region: "Illinois",
    searchLabel: "Chicago, IL",
    localContext:
      "Chicago has a shorter harvest season than the West Coast guides, and the live reports are uneven across neighborhoods. Search a north, west, or south-side address to check the reported edible plants close to your actual walk.",
    plantNames: [
      "Mulberry",
      "Apple",
      "Crabapple",
      "Cherry",
      "Pear",
      "Elderberry",
      "Plum",
      "Walnut",
    ],
  },
  {
    slug: "new-york",
    name: "New York",
    region: "New York",
    searchLabel: "New York, NY",
    localContext:
      "New York's boroughs, waterfronts, shade, and managed landscapes can shift timing from one site to the next. Search a specific neighborhood or address and distinguish street trees, parks, gardens, and designated edible landscapes before planning a walk.",
    plantNames: [
      "Apple",
      "Plum",
      "Mulberry",
      "Hawthorn",
      "Peach",
      "Cherry",
      "Walnut",
      "Oak",
    ],
  },
];

export function cityHarvestFromSlug(slug: string): CityHarvest | null {
  return cityHarvests.find((city) => city.slug === slug) ?? null;
}
