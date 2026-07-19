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

function textContent(markup) {
  return markup
    .replaceAll("<!-- -->", "")
    .replace(/<[^>]+>/g, "")
    .replaceAll("&amp;", "&")
    .replaceAll("&apos;", "'")
    .trim();
}

function anchorLinks(html) {
  return [...html.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(
    ([, href, content]) => ({
      href: href.replaceAll("&amp;", "&"),
      text: textContent(content),
    }),
  );
}

function headings(html) {
  return [...html.matchAll(/<(h[1-3])[^>]*>([\s\S]*?)<\/\1>/g)].map(
    ([, tag, content]) => ({ level: Number(tag[1]), text: textContent(content) }),
  );
}

function jsonLdObjects(html) {
  return [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    ),
  ].map(([, content]) => JSON.parse(content));
}

const [homepage, seasonalGuide, appleGuide] = await Promise.all([
  readOutput("index.html"),
  readOutput("seasonal-guide.html"),
  readOutput("species/apple.html"),
]);

const currentSpeciesStart = seasonalGuide.indexOf(
  '<h2 class="section">Likely in season in',
);
const currentSpeciesEnd = seasonalGuide.indexOf(
  "Looking for a place to start?",
  currentSpeciesStart,
);
const currentSpeciesSection =
  currentSpeciesStart >= 0 && currentSpeciesEnd > currentSpeciesStart
    ? seasonalGuide.slice(currentSpeciesStart, currentSpeciesEnd)
    : null;

if (!currentSpeciesSection) {
  throw new Error("Seasonal guide must render the current-month species grid.");
}

const currentSpeciesHrefs = [
  ...currentSpeciesSection.matchAll(/<a[^>]*href="([^"]+)"/g),
].map(([, href]) => href.replaceAll("&amp;", "&"));

if (
  currentSpeciesHrefs.length === 0 ||
  currentSpeciesHrefs.some((href) => {
    const url = new URL(href, "https://foragearound.com");
    return (
      !url.pathname.startsWith("/species/") ||
      url.searchParams.get("map_source") !== "seasonal_guide"
    );
  })
) {
  throw new Error(
    "Every current-month species link must preserve seasonal-guide acquisition origin.",
  );
}

for (const speciesPath of ["/species/plum", "/species/apple"]) {
  const attributedPath = `${speciesPath}?map_source=seasonal_guide`;
  if (!seasonalGuide.includes(`href="${attributedPath}"`)) {
    throw new Error(
      `${speciesPath} starting link lost seasonal-guide attribution.`,
    );
  }
}

const seasonalLinks = anchorLinks(seasonalGuide);
for (const { href, label } of [
  {
    href: "/species/plum?map_source=seasonal_guide",
    label: "Plum guide",
  },
  {
    href: "/species/apple?map_source=seasonal_guide",
    label: "Apple guide",
  },
  { href: "/locations/seattle", label: "Seattle guide" },
  { href: "/locations/berkeley", label: "Berkeley guide" },
]) {
  if (!seasonalLinks.some((link) => link.href === href && link.text === label)) {
    throw new Error(
      `Seasonal guide must link directly to ${label} with descriptive text.`,
    );
  }
}

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

const expectedFaqs = [
  {
    question: "Does an in-season label mean a nearby plant is ripe?",
    answer:
      "No. It means the month falls within a typical season window. Local weather and site conditions can shift timing, so check the plant itself before harvesting.",
  },
  {
    question: "Does a map report mean I can enter or pick there?",
    answer:
      "No. A report is a lead, not proof of ownership, public access, or permission. Confirm land status, local rules, and permission before entering or picking.",
  },
  {
    question: "How do I find reported plants near me?",
    answer:
      "Start with this month’s species guides, then open the map to check reported locations near you. You can also browse the Seattle and Berkeley location guides.",
  },
];

for (const { question, answer } of expectedFaqs) {
  if (!seasonalGuide.includes(question) || !seasonalGuide.includes(answer)) {
    throw new Error(`Seasonal guide is missing FAQ content: ${question}`);
  }
}

const faqSchema = jsonLdObjects(seasonalGuide).find(
  (object) => object["@type"] === "FAQPage",
);

if (!faqSchema || faqSchema["@context"] !== "https://schema.org") {
  throw new Error("Seasonal guide must render valid FAQPage JSON-LD.");
}

const renderedFaqs = faqSchema.mainEntity?.map((entity) => ({
  question: entity.name,
  answer: entity.acceptedAnswer?.text,
  questionType: entity["@type"],
  answerType: entity.acceptedAnswer?.["@type"],
}));

const expectedSchemaFaqs = expectedFaqs.map(({ question, answer }) => ({
  question,
  answer,
  questionType: "Question",
  answerType: "Answer",
}));

if (JSON.stringify(renderedFaqs) !== JSON.stringify(expectedSchemaFaqs)) {
  throw new Error(
    "Seasonal FAQPage JSON-LD must match all three visible questions and answers.",
  );
}

for (const cityPath of ["/locations/seattle", "/locations/berkeley"]) {
  if (countLinks(seasonalGuide, cityPath) !== 1) {
    throw new Error(`Seasonal guide must link directly to ${cityPath}.`);
  }
}

const canonical = seasonalGuide.match(
  /<link rel="canonical" href="([^"]+)"\/>/,
)?.[1];

if (canonical !== "https://foragearound.com/seasonal-guide") {
  throw new Error("Seasonal guide canonical URL changed unexpectedly.");
}

const expectedTitle = "What can I forage near me right now? | Forage Around";
const expectedTitleTag =
  "What can I forage near me right now? · Forage Around";
const expectedDescription =
  "See which fruit, herbs, and greens may be in season nearby, then use the free Forage Around map to check reported plant locations near you.";

const titleTag = seasonalGuide.match(/<title>([^<]+)<\/title>/)?.[1];

if (titleTag !== expectedTitleTag) {
  throw new Error(
    "Seasonal guide title tag no longer matches the near-me intent.",
  );
}

if (
  metaContent(seasonalGuide, "name", "description") !== expectedDescription
) {
  throw new Error(
    "Seasonal guide meta description no longer explains the seasonal guide and map handoff.",
  );
}

const currentMonth = new Intl.DateTimeFormat("en", {
  month: "long",
  timeZone: "UTC",
}).format(new Date());
const expectedHeadings = [
  { level: 1, text: "What can I forage near me right now?" },
  { level: 2, text: `Likely in season in ${currentMonth}` },
  { level: 2, text: "Questions before you forage" },
  { level: 3, text: "Does an in-season label mean a nearby plant is ripe?" },
  { level: 3, text: "Does a map report mean I can enter or pick there?" },
  { level: 3, text: "How do I find reported plants near me?" },
  { level: 2, text: "Typical peak this month" },
  { level: 2, text: "Month-by-month guide" },
  ...[
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ].map((text) => ({ level: 3, text })),
  { level: 2, text: "How to use this responsibly" },
];

if (
  JSON.stringify(headings(seasonalGuide)) !== JSON.stringify(expectedHeadings)
) {
  throw new Error(
    "Seasonal guide heading hierarchy no longer moves cleanly from the near-me H1 through current, calendar, and responsible-use sections.",
  );
}

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
  "Seasonal discoverability check passed: the near-me promise, confidence cues, three visible FAQ answers, matching FAQPage schema, direct Seattle and Berkeley links, navigation, and sharing metadata remain intact.",
);
