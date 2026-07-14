import { readFile } from "node:fs/promises";

const appOutput = new URL("../.next/server/app/", import.meta.url);
const expectedOrigin = new URL(
  process.env.EXPECTED_SITE_ORIGIN || "https://foragearound.com",
).origin;

async function readOutput(path) {
  return readFile(new URL(path, appOutput), "utf8");
}

function canonicalFrom(html, pageName) {
  const canonical = html.match(
    /<link rel="canonical" href="([^"]+)"\/>/,
  )?.[1];

  if (!canonical) {
    throw new Error(`${pageName} is missing its rendered canonical URL.`);
  }

  return new URL(canonical).href;
}

const [homepage, locationsPage, robots, sitemap] = await Promise.all([
  readOutput("index.html"),
  readOutput("locations.html"),
  readOutput("robots.txt.body"),
  readOutput("sitemap.xml.body"),
]);

const expectedHomepage = new URL("/", expectedOrigin).href;
const expectedLocations = new URL("/locations", expectedOrigin).href;

if (canonicalFrom(homepage, "Homepage") !== expectedHomepage) {
  throw new Error(`Homepage canonical must be ${expectedHomepage}.`);
}

if (canonicalFrom(locationsPage, "Locations page") !== expectedLocations) {
  throw new Error(`Locations canonical must be ${expectedLocations}.`);
}

const expectedSitemap = new URL("/sitemap.xml", expectedOrigin).href;
if (!robots.includes(`Sitemap: ${expectedSitemap}`)) {
  throw new Error(`Robots output must advertise ${expectedSitemap}.`);
}

const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
  ([, location]) => new URL(location),
);

if (sitemapUrls.length === 0) {
  throw new Error("The rendered sitemap has no URLs to validate.");
}

const wrongOrigins = sitemapUrls.filter(({ origin }) => origin !== expectedOrigin);
if (wrongOrigins.length > 0) {
  throw new Error(
    `${wrongOrigins.length} sitemap URLs do not use ${expectedOrigin}.`,
  );
}

console.log(
  `Search origin check passed: homepage, locations, robots, and all ${sitemapUrls.length} sitemap URLs use ${expectedOrigin}.`,
);
