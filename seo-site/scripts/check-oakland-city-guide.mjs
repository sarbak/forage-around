import { readFile } from "node:fs/promises";

const appOutput = new URL("../.next/server/app/", import.meta.url);
const html = await readFile(new URL("locations/oakland.html", appOutput), "utf8");

for (const expected of [
  "Oakland foraging: 6 fruit-tree reports and a map · Forage Around",
  "Foraging in Oakland: six fruit-tree reports to check",
  "https://foragearound.com/locations/oakland",
  "Open the Oakland foraging map",
  "ref=nearby_harvest_oakland&amp;location=Oakland%2C+CA",
  "The bundled starter data has six Oakland records",
  "These are the complete ",
  " records in the bundled starter dataset",
  '"@type":"CollectionPage"',
  '"numberOfItems":6',
]) {
  if (!html.includes(expected)) {
    throw new Error(`Oakland city guide is missing: ${expected}`);
  }
}

for (const speciesSlug of [
  "common-fig",
  "plum",
  "loquat",
  "european-pear",
]) {
  if (!html.includes(`href="/species/${speciesSlug}"`)) {
    throw new Error(`Oakland city guide must link to ${speciesSlug}.`);
  }
}

for (const spotId of ["464", "479", "494", "500", "505", "510"]) {
  if (!html.includes(`href="/tree/${spotId}"`)) {
    throw new Error(`Oakland city guide must link to report ${spotId}.`);
  }
}

const sitemap = await readFile(
  new URL("sitemap.xml.body", appOutput),
  "utf8",
);
if (!sitemap.includes("https://foragearound.com/locations/oakland")) {
  throw new Error("The sitemap must expose the Oakland city guide.");
}

console.log(
  "Oakland city guide check passed: 4 species, 6 spot records, canonical metadata, structured data, map handoff, and sitemap coverage.",
);
