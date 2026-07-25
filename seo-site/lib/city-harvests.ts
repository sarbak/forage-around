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
];

export function cityHarvestFromSlug(slug: string): CityHarvest | null {
  return cityHarvests.find((city) => city.slug === slug) ?? null;
}
