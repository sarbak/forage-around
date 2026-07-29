import type { MetadataRoute } from "next";
import { cityHarvests } from "@/lib/city-harvests";
import { allSpeciesNames, species, slugify, trees } from "@/lib/data";
import { SITE_ORIGIN } from "@/lib/site-origin";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_ORIGIN}/`, priority: 1 },
    { url: `${SITE_ORIGIN}/foraging-map`, priority: 0.9 },
    { url: `${SITE_ORIGIN}/locations`, priority: 0.9 },
    {
      url: `${SITE_ORIGIN}/locations/strawberry-tree`,
      priority: 0.85,
    },
    {
      url: `${SITE_ORIGIN}/locations/public-fruit-trees`,
      priority: 0.85,
    },
    { url: `${SITE_ORIGIN}/about`, priority: 0.8 },
    { url: `${SITE_ORIGIN}/faq`, priority: 0.85 },
    { url: `${SITE_ORIGIN}/seasonal-guide`, priority: 0.85 },
    {
      url: `${SITE_ORIGIN}/locations/portland/summer`,
      priority: 0.85,
    },
  ];

  const speciesPages: MetadataRoute.Sitemap = allSpeciesNames()
    .filter((n) => species[n]?.edible)
    .map((n) => ({
      url: `${SITE_ORIGIN}/species/${slugify(n)}`,
      priority: 0.7,
    }));

  const cityPages: MetadataRoute.Sitemap = cityHarvests.map((city) => ({
    url: `${SITE_ORIGIN}/locations/${city.slug}`,
    priority: 0.8,
  }));

  const treePages: MetadataRoute.Sitemap = trees.map((t) => ({
    url: `${SITE_ORIGIN}/tree/${t.id}`,
    priority: 0.6,
  }));

  return [...staticPages, ...cityPages, ...speciesPages, ...treePages];
}
