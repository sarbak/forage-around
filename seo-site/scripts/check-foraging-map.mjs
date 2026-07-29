import { readFile } from "node:fs/promises";

const appOutput = new URL("../.next/server/app/", import.meta.url);
const html = await readFile(new URL("foraging-map.html", appOutput), "utf8");

function decodeHtml(value) {
  return value
    .replaceAll("<!-- -->", "")
    .replace(/<[^>]+>/g, "")
    .replaceAll("&amp;", "&")
    .replaceAll("&apos;", "'")
    .replaceAll("&#x27;", "'")
    .replaceAll("&quot;", '"')
    .trim();
}

function assertIncludes(value, message) {
  if (!decodeHtml(html).includes(value)) throw new Error(message);
}

const title = decodeHtml(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
const description = html.match(/<meta name="description" content="([^"]+)"\s*\/>/)?.[1];
const canonical = html.match(/<link rel="canonical" href="([^"]+)"\s*\/>/)?.[1];
const h1 = decodeHtml(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "");

if (title !== "Urban foraging map: find edible plants near you · Forage Around") {
  throw new Error(`Foraging map title changed: ${title || "missing"}`);
}
if (
  description !==
  "Explore a free urban foraging map for reported berries, fruit trees, and nuts near you, with seasonal harvest windows and simple preservation ideas."
) {
  throw new Error("Foraging map description changed.");
}
if (canonical !== "https://foragearound.com/foraging-map") {
  throw new Error(`Foraging map canonical changed: ${canonical || "missing"}`);
}
if (
  h1 !==
  "Find berries, fruit trees, and nuts on the urban foraging map"
) {
  throw new Error(`Foraging map H1 changed: ${h1 || "missing"}`);
}

for (const cue of [
  "Reports are starting points, not permission to pick",
  "Seasonal harvest windows at a glance",
  "Blackberries, plums, figs, and mulberries",
  "Simple ways to preserve a small harvest",
  "Dry hazelnuts or walnuts",
  "What a reported location does not mean",
  "Confirm the species and edible part",
  "crowd-sourced location data from Falling Fruit",
]) {
  assertIncludes(cue, `Foraging map confidence or source cue is missing: ${cue}`);
}

const hrefs = [...html.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(
  ([, href, content]) => ({ href: decodeHtml(href), text: decodeHtml(content) }),
);
const mapLink = hrefs.find(({ text }) => text.includes("Open the free foraging map"));
if (!mapLink) throw new Error("Foraging map CTA is missing.");
const mapUrl = new URL(mapLink.href);
if (
  mapUrl.origin !== "https://foragearound.com" ||
  mapUrl.pathname !== "/" ||
  mapUrl.searchParams.get("map_source") !== "foraging_map"
) {
  throw new Error(`Foraging map CTA lost attribution: ${mapLink.href}`);
}

for (const internalPath of [
  "/seasonal-guide",
  "/locations",
  "/locations/seattle",
  "/locations/berkeley",
]) {
  if (!hrefs.some(({ href }) => href === internalPath)) {
    throw new Error(`Foraging map internal link is missing: ${internalPath}`);
  }
}

if (!html.includes('"@type":"FAQPage"')) {
  throw new Error("Foraging map FAQ structured data is missing.");
}

console.log(
  "Foraging map check passed: metadata, canonical, H1, attribution, confidence boundaries, FAQ schema, and internal links are intact.",
);
