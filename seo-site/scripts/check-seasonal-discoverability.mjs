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

const [homepage, seasonalGuide, appleGuide] = await Promise.all([
  readOutput("index.html"),
  readOutput("seasonal-guide.html"),
  readOutput("species/apple.html"),
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

const orientationIndex = seasonalGuide.indexOf("Before you use the map");
const mapLinkIndex = seasonalGuide.indexOf(
  "https://foragearound.com/?map_source=seasonal_guide",
);

if (
  orientationIndex === -1 ||
  mapLinkIndex === -1 ||
  orientationIndex > mapLinkIndex
) {
  throw new Error(
    "Seasonal confidence cues must render before the attributed map handoff.",
  );
}

const orientationMarkup = seasonalGuide.match(
  /<div class="seasonal-orientation" aria-label="Before you use the map">([\s\S]*?)<\/div>/,
)?.[1];

if (!orientationMarkup) {
  throw new Error("Seasonal guide must render its first-time orientation.");
}

if (
  [...orientationMarkup.matchAll(/<p>/g)].length !== 1 ||
  orientationMarkup.includes("<strong>") ||
  orientationMarkup.includes("<a ")
) {
  throw new Error(
    "Seasonal first-time orientation must stay one plain paragraph without a competing action.",
  );
}

for (const expectedOrientationCue of [
  "See which plants are typically in season",
  "open the map to check reported locations near you",
  "Season labels do not confirm ripeness or plant identity",
  "reports do not establish ownership, public access, or permission to enter or pick",
  "Verify the plant and site before harvesting",
]) {
  if (!orientationMarkup.includes(expectedOrientationCue)) {
    throw new Error(
      `Seasonal orientation is missing first-time cue: ${expectedOrientationCue}`,
    );
  }
}

for (const expectedCue of [
  "tuned for temperate and Mediterranean climates",
  "Reports do not confirm ripeness, public access, or permission to pick",
]) {
  if (!seasonalGuide.includes(expectedCue)) {
    throw new Error(`Seasonal guide is missing confidence cue: ${expectedCue}`);
  }
}

for (const expectedPermissionCue of [
  "Species guides do not confirm access at a reported location",
  "a marker does not establish ownership, public access, or picking rights",
  "Before entering or picking, confirm land status, local rules, and permission",
]) {
  if (!seasonalGuide.includes(expectedPermissionCue)) {
    throw new Error(
      `Seasonal guide is missing permission cue: ${expectedPermissionCue}`,
    );
  }
}

for (const unsupportedAccessClaim of [
  "public locations",
  "public harvest locations",
  "free to pick",
  "permission granted",
]) {
  if (seasonalGuide.includes(unsupportedAccessClaim)) {
    throw new Error(
      `Seasonal guide still contains an unsupported access claim: ${unsupportedAccessClaim}`,
    );
  }
}

for (const expectedStatus of [
  "Typical peak in",
  "Broader season includes",
]) {
  if (!seasonalGuide.includes(`species-season-status\">${expectedStatus}`)) {
    throw new Error(
      `Current-month plant cards are missing status: ${expectedStatus}`,
    );
  }
}

for (const expectedFreshnessCue of [
  "marks the narrower peak window in the guide data",
  "without listing it as a peak",
  "Local timing may run earlier or later",
  "These are typical windows, not local forecasts",
  "not as a report that a mapped plant is ready",
]) {
  if (!seasonalGuide.includes(expectedFreshnessCue)) {
    throw new Error(
      `Seasonal guide is missing freshness cue: ${expectedFreshnessCue}`,
    );
  }
}

const canonical = seasonalGuide.match(
  /<link rel="canonical" href="([^"]+)"\/>/,
)?.[1];

if (canonical !== "https://foragearound.com/seasonal-guide") {
  throw new Error("Seasonal guide canonical URL changed unexpectedly.");
}

const expectedTitle = "What can I forage near me right now? | Forage Around";
const expectedDescription =
  "See which fruit, herbs, and greens may be in season nearby, then use the free Forage Around map to check reported plant locations near you.";

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

for (const expectedCue of [
  "do not confirm identity, edibility, or local ripeness",
  "verify the plant and edible part with a trusted local source",
  "If the details do not match or you are unsure, leave it",
]) {
  if (!seasonalGuide.includes(expectedCue)) {
    throw new Error(`Seasonal guide is missing species cue: ${expectedCue}`);
  }
}

for (const unsupportedClaim of [
  "Likely ripe",
  "reported edible plants",
  "edible plants in the guide",
  "edible guide",
  "Peaking now",
]) {
  if (seasonalGuide.includes(unsupportedClaim)) {
    throw new Error(
      `Seasonal guide still contains an unsupported certainty claim: ${unsupportedClaim}`,
    );
  }
}

for (const expectedCue of [
  "Confirm before eating",
  "starting point, not proof of identity or edibility",
  "Typical season:",
  "Typical peak:",
  "Part noted:",
  "Guide ideas after identification",
  "Check reported",
]) {
  if (!appleGuide.includes(expectedCue)) {
    throw new Error(`Species guide is missing confidence cue: ${expectedCue}`);
  }
}

for (const unsupportedClaim of ["Ripe:", "Eat the:", "Find Apple near you"]) {
  if (appleGuide.includes(unsupportedClaim)) {
    throw new Error(
      `Species guide still contains an unsupported certainty claim: ${unsupportedClaim}`,
    );
  }
}

console.log(
  "Seasonal discoverability check passed: confidence and permission cues precede the map handoff, species labels avoid unsupported certainty, navigation links render, and sharing metadata matches the near-me promise.",
);
