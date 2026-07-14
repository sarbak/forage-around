import type { MetadataRoute } from "next";
import { cityHarvests } from "@/lib/city-harvests";
import { allSpeciesNames, species, slugify, trees } from "@/lib/data";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL || "https://forage-around-seo.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, priority: 1 },
    { url: `${SITE}/locations`, priority: 0.9 },
    {
      url: `${SITE}/locations/strawberry-tree`,
      priority: 0.85,
    },
    { url: `${SITE}/about`, priority: 0.8 },
    { url: `${SITE}/seasonal-guide`, priority: 0.85 },
  ];

  const speciesPages: MetadataRoute.Sitemap = allSpeciesNames()
    .filter((n) => species[n]?.edible)
    .map((n) => ({
      url: `${SITE}/species/${slugify(n)}`,
      priority: 0.7,
    }));

  const cityPages: MetadataRoute.Sitemap = cityHarvests.map((city) => ({
    url: `${SITE}/locations/${city.slug}`,
    priority: 0.8,
  }));

  const treePages: MetadataRoute.Sitemap = trees.map((t) => ({
    url: `${SITE}/tree/${t.id}`,
    priority: 0.6,
  }));

  return [...staticPages, ...cityPages, ...speciesPages, ...treePages];
}
