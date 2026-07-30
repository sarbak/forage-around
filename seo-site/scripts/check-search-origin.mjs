import { readFile } from "node:fs/promises";

const appOutput = new URL("../.next/server/app/", import.meta.url);
const vercelConfigPath = new URL("../../vercel.json", import.meta.url);
const expectedOrigin = new URL(
  process.env.EXPECTED_SITE_ORIGIN || "https://foragearound.com",
).origin;
const SEO_DEPLOYMENT_ORIGIN = "https://forage-around-seo.vercel.app";
const PRIORITY_ACQUISITION_ROUTES = [
  "/faq",
  "/locations",
  "/seasonal-guide",
  "/foraging-map",
  "/edible-wild-plants",
  "/locations/public-fruit-trees",
  "/locations/seattle",
  "/locations/berkeley",
  "/locations/portland",
  "/locations/los-angeles",
  "/locations/chicago",
  "/locations/new-york",
  "/locations/portland/summer",
];
const REQUIRED_SEO_REWRITES = new Map([
  ["/faq", `${SEO_DEPLOYMENT_ORIGIN}/faq`],
  ["/locations", `${SEO_DEPLOYMENT_ORIGIN}/locations`],
  ["/locations/:path*", `${SEO_DEPLOYMENT_ORIGIN}/locations/:path*`],
  ["/seasonal-guide", `${SEO_DEPLOYMENT_ORIGIN}/seasonal-guide`],
  ["/foraging-map", `${SEO_DEPLOYMENT_ORIGIN}/foraging-map`],
  [
    "/edible-wild-plants",
    `${SEO_DEPLOYMENT_ORIGIN}/edible-wild-plants`,
  ],
]);

async function readOutput(path) {
  return readFile(new URL(path, appOutput), "utf8");
}

function outputPathForRoute(route) {
  return `${route.slice(1)}.html`;
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

function wildcardRulesFrom(robots) {
  const rules = [];
  let userAgents = [];
  let groupHasRules = false;

  for (const rawLine of robots.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;

    const separator = line.indexOf(":");
    if (separator === -1) continue;

    const directive = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (directive === "user-agent") {
      if (groupHasRules) {
        userAgents = [];
        groupHasRules = false;
      }
      userAgents.push(value.toLowerCase());
      continue;
    }

    if (directive !== "allow" && directive !== "disallow") continue;
    groupHasRules = true;

    if (value && userAgents.includes("*")) {
      rules.push({ directive, path: value });
    }
  }

  return rules;
}

function isPermittedByRobots(path, rules) {
  const matchingRules = rules
    .filter((rule) => path.startsWith(rule.path))
    .sort(
      (first, second) =>
        second.path.length - first.path.length ||
        Number(second.directive === "allow") -
          Number(first.directive === "allow"),
    );

  return matchingRules.length === 0 || matchingRules[0].directive === "allow";
}

const [homepage, robots, sitemap, priorityPages, vercelConfigSource] =
  await Promise.all([
    readOutput("index.html"),
    readOutput("robots.txt.body"),
    readOutput("sitemap.xml.body"),
    Promise.all(
      PRIORITY_ACQUISITION_ROUTES.map(async (route) => ({
        route,
        html: await readOutput(outputPathForRoute(route)),
      })),
    ),
    readFile(vercelConfigPath, "utf8"),
  ]);

const vercelConfig = JSON.parse(vercelConfigSource);
const configuredRewrites = new Map(
  (vercelConfig.rewrites || []).map(({ source, destination }) => [
    source,
    destination,
  ]),
);

for (const [source, destination] of REQUIRED_SEO_REWRITES) {
  if (configuredRewrites.get(source) !== destination) {
    throw new Error(
      `Vercel rewrite ${source} must forward to ${destination}.`,
    );
  }
}

const expectedHomepage = new URL("/", expectedOrigin).href;

if (canonicalFrom(homepage, "Homepage") !== expectedHomepage) {
  throw new Error(`Homepage canonical must be ${expectedHomepage}.`);
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

const sitemapUrlSet = new Set(sitemapUrls.map(({ href }) => href));
const robotsRules = wildcardRulesFrom(robots);

for (const { route, html } of priorityPages) {
  const expectedUrl = new URL(route, expectedOrigin).href;
  const renderedCanonical = canonicalFrom(html, route);

  if (renderedCanonical !== expectedUrl) {
    throw new Error(`${route} canonical must be ${expectedUrl}.`);
  }

  if (!sitemapUrlSet.has(expectedUrl)) {
    throw new Error(`${route} must appear in the rendered sitemap.`);
  }

  if (!isPermittedByRobots(route, robotsRules)) {
    throw new Error(`${route} must be permitted by the rendered robots policy.`);
  }
}

console.log(
  `Search origin check passed: homepage and ${PRIORITY_ACQUISITION_ROUTES.length} priority acquisition routes use exact ${expectedOrigin} canonicals, appear in the sitemap, are permitted by robots, and have the required Vercel SEO rewrites; all ${sitemapUrls.length} sitemap URLs use the expected origin.`,
);
