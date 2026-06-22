import type { MetadataRoute } from "next";
import { allSpeciesNames, species, slugify, trees } from "@/lib/data";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL || "https://forage-around-seo.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, priority: 1 },
    { url: `${SITE}/locations`, lastModified: now, priority: 0.9 },
    { url: `${SITE}/about`, lastModified: now, priority: 0.8 },
  ];

  const speciesPages: MetadataRoute.Sitemap = allSpeciesNames()
    .filter((n) => species[n]?.edible)
    .map((n) => ({
      url: `${SITE}/species/${slugify(n)}`,
      lastModified: now,
      priority: 0.7,
    }));

  const treePages: MetadataRoute.Sitemap = trees.map((t) => ({
    url: `${SITE}/tree/${t.id}`,
    lastModified: now,
    priority: 0.6,
  }));

  return [...staticPages, ...speciesPages, ...treePages];
}
