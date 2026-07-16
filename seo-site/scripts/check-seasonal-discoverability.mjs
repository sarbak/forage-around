import { readFile } from "node:fs/promises";

const appOutput = new URL("../.next/server/app/", import.meta.url);

async function readOutput(path) {
  return readFile(new URL(path, appOutput), "utf8");
}

function countLinks(html, href) {
  return [...html.matchAll(new RegExp(`href="${href}"`, "g"))].length;
}

function metaContent(html, attribute, value) {
  const pattern = new RegExp(
    `<meta ${attribute}="${value}" content="([^"]+)"\\s*\\/>`,
  );
  return html.match(pattern)?.[1];
}

const [homepage, seasonalGuide] = await Promise.all([
  readOutput("index.html"),
  readOutput("seasonal-guide.html"),
]);

if (countLinks(homepage, "/seasonal-guide") < 3) {
  throw new Error(
    "Homepage must link to the seasonal guide from the shared header, primary actions, and shared footer.",
  );
}

if (countLinks(seasonalGuide, "/seasonal-guide") < 2) {
  throw new Error(
    "Shared header and footer must expose the seasonal guide on every rendered page.",
  );
}

const canonical = seasonalGuide.match(
  /<link rel="canonical" href="([^"]+)"\/>/,
)?.[1];

if (canonical !== "https://foragearound.com/seasonal-guide") {
  throw new Error("Seasonal guide canonical URL changed unexpectedly.");
}

const expectedTitle = "What can I forage near me right now? | Forage Around";
const expectedDescription =
  "See which fruit, herbs, and greens may be in season nearby, then use the free Forage Around map to check reported edible plants near you.";

if (metaContent(seasonalGuide, "property", "og:title") !== expectedTitle) {
  throw new Error("Seasonal guide Open Graph title is missing or incorrect.");
}

if (
  metaContent(seasonalGuide, "property", "og:description") !==
  expectedDescription
) {
  throw new Error(
    "Seasonal guide Open Graph description is missing or incorrect.",
  );
}

if (metaContent(seasonalGuide, "name", "twitter:title") !== expectedTitle) {
  throw new Error("Seasonal guide Twitter title is missing or incorrect.");
}

if (
  metaContent(seasonalGuide, "name", "twitter:description") !==
  expectedDescription
) {
  throw new Error("Seasonal guide Twitter description is missing or incorrect.");
}

console.log(
  "Seasonal discoverability check passed: homepage and shared navigation links render, canonical is preserved, and sharing metadata matches the near-me promise.",
);
