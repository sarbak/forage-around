import { readFile } from "node:fs/promises";

const appOutput = new URL("../.next/server/app/", import.meta.url);
const [page, locations] = await Promise.all([
  readFile(new URL("edible-wild-plants.html", appOutput), "utf8"),
  readFile(new URL("locations.html", appOutput), "utf8"),
]);

function decodeHtml(value) {
  return value
    .replaceAll("<!-- -->", "")
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&apos;", "'")
    .replaceAll("&#x27;", "'")
    .replaceAll("&quot;", '"')
    .replace(/\s+/g, " ")
    .trim();
}

function metaContent(attribute, value) {
  return page.match(
    new RegExp(`<meta ${attribute}="${value}" content="([^"]+)"\\s*\\/>`),
  )?.[1];
}

function assertIncludes(value, message) {
  if (!decodeHtml(page).includes(value)) throw new Error(message);
}

const title = decodeHtml(page.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
const description = metaContent("name", "description");
const canonical = page.match(/<link rel="canonical" href="([^"]+)"\s*\/>/)?.[1];
const h1 = decodeHtml(page.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "");

if (
  title !==
  "Edible wild plants: 12 common finds and a map · Forage Around"
) {
  throw new Error(`Edible wild plants title changed: ${title || "missing"}`);
}
if (
  description !==
  "Meet 12 common edible wild plants, see their typical seasons and edible parts, then use a free map to check reported plants near you."
) {
  throw new Error("Edible wild plants description changed.");
}
if (canonical !== "https://foragearound.com/edible-wild-plants") {
  throw new Error(
    `Edible wild plants canonical changed: ${canonical || "missing"}`,
  );
}
if (h1 !== "Edible wild plants: 12 common finds to learn") {
  throw new Error(`Edible wild plants H1 changed: ${h1 || "missing"}`);
}

const links = [
  ...page.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g),
].map(([, href, content]) => ({
  href: decodeHtml(href),
  text: decodeHtml(content),
}));

const mapLink = links.find(({ text }) =>
  text.includes("Find edible plants near me"),
);
if (!mapLink) throw new Error("Edible wild plants map CTA is missing.");

const mapUrl = new URL(mapLink.href);
if (
  mapUrl.origin !== "https://foragearound.com" ||
  mapUrl.pathname !== "/" ||
  mapUrl.searchParams.get("map_source") !== "edible_wild_plants"
) {
  throw new Error(`Edible wild plants CTA lost attribution: ${mapLink.href}`);
}

for (const internalPath of [
  "/seasonal-guide",
  "/locations",
  "/foraging-map",
]) {
  if (!links.some(({ href }) => href === internalPath)) {
    throw new Error(
      `Edible wild plants internal link is missing: ${internalPath}`,
    );
  }
}

for (const speciesPath of [
  "/species/blackberry",
  "/species/mulberry",
  "/species/common-fig",
  "/species/prickly-pear",
  "/species/dandelion",
  "/species/miners-lettuce",
  "/species/purslane",
  "/species/nasturtium",
  "/species/fennel",
  "/species/wild-mustard",
  "/species/wood-sorrel",
  "/species/walnut",
]) {
  if (!links.some(({ href }) => href === speciesPath)) {
    throw new Error(
      `Edible wild plants species link is missing: ${speciesPath}`,
    );
  }
}

for (const cue of [
  "Edible does not mean identifiable at a glance",
  "rule out dangerous look-alikes",
  "Confirm the edible part and preparation",
  "Check access and permission",
  "Inspect the site and current condition",
  "A report is a lead, not an identification",
]) {
  assertIncludes(
    cue,
    `Edible wild plants confidence boundary is missing: ${cue}`,
  );
}

for (const seasonCue of [
  "Usually December–May",
  "Usually November–May",
  "Usually Year-round",
]) {
  assertIncludes(
    seasonCue,
    `Edible wild plants season window is missing: ${seasonCue}`,
  );
}

for (const imageAlt of [
  "Ripe, ripening, and green blackberries on a cane",
  "Miner's lettuce with rounded leaves and small white flowers",
  "Whole walnuts, an opened shell, and a halved kernel",
]) {
  if (!page.includes(`alt="${imageAlt.replaceAll("'", "&#x27;")}"`)) {
    throw new Error(`Edible wild plants hero image alt is missing: ${imageAlt}`);
  }
}

if (!page.includes('"@type":"FAQPage"')) {
  throw new Error("Edible wild plants FAQ structured data is missing.");
}

const bodyText = decodeHtml(
  page.match(/<main[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? "",
);
const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
if (wordCount < 1500) {
  throw new Error(
    `Edible wild plants guide is too thin: ${wordCount} rendered words.`,
  );
}

const bodyButtonCount = [
  ...page.matchAll(/class="[^"]*\bbtn\b[^"]*"/g),
].length;
if (bodyButtonCount !== 1) {
  throw new Error(
    `Edible wild plants guide must keep one primary body action; found ${bodyButtonCount}.`,
  );
}

const locationsLinks = [
  ...locations.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g),
].map(([, href, content]) => ({
  href: decodeHtml(href),
  text: decodeHtml(content),
}));

if (
  !locationsLinks.some(
    ({ href, text }) =>
      href === "/edible-wild-plants" &&
      text.includes("12 edible wild plants") &&
      text.includes("Visual clues, usual seasons, and safety checks"),
  )
) {
  throw new Error(
    "The locations hub must link to the edible wild plants guide with descriptive text.",
  );
}

console.log(
  `Edible wild plants check passed: ${wordCount} words, metadata, 12 species guides, safety boundaries, structured data, one primary action, and hub link are intact.`,
);
