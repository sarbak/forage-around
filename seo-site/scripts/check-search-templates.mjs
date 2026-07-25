import { readFile } from "node:fs/promises";

const appOutput = new URL("../.next/server/app/", import.meta.url);
const currentMonthName = new Intl.DateTimeFormat("en-US", {
  month: "long",
  timeZone: "UTC",
}).format(new Date());

const representatives = [
  {
    output: "locations/seattle.html",
    name: "Seattle",
    title: "Seattle foraging: fruit, nuts and a map · Forage Around",
    shareTitle: "Seattle foraging: fruit, nuts and a map | Forage Around",
    description:
      "Plan a Seattle foraging walk with usual seasons for plums, cherries, apples, nuts, and more, then search crowd-sourced reports near your address.",
    h1: "Foraging in Seattle: fruit, nuts, and a neighborhood map",
    canonical: "https://foragearound.com/locations/seattle",
    mapSource: "locations",
    mapRef: "nearby_harvest_seattle",
    mapLocation: "Seattle, WA",
    mapLabel: "Open the Seattle foraging map",
    seasonalGuideLabel: "seasonal foraging guide",
    confidenceCues: [
      "Map reports change and may be incomplete",
      "not a promise that fruit is present, accessible, or ripe today",
      "Local weather and neighborhood conditions can shift timing earlier or later",
      "no label confirms that a reported plant is ripe or available",
      "Reports are leads, not live availability or permission",
      "a pin does not show ownership or permission",
    ],
  },
  {
    output: "locations/berkeley.html",
    name: "Berkeley",
    title: "Find fruit and edible plants in Berkeley · Forage Around",
    shareTitle: `Typical ${currentMonthName} foraging in Berkeley | Forage Around`,
    description:
      "Explore usual harvest seasons for edible plants represented around Berkeley, then search the live Forage Around map near your address.",
    h1: "Find fruit and edible plants in Berkeley",
    canonical: "https://foragearound.com/locations/berkeley",
    mapSource: "locations",
    mapRef: "nearby_harvest_berkeley",
    mapLocation: "Berkeley, CA",
    mapLabel: "Open the map and search Berkeley",
    seasonalGuideLabel: "Open the seasonal foraging guide",
    confidenceCues: [
      "Map reports change and may be incomplete",
      "not a promise that fruit is present, accessible, or ripe today",
      "Local weather and neighborhood conditions can shift timing earlier or later",
      "no label confirms that a reported plant is ripe or available",
      "Confirm the plant, local rules, and permission before picking",
    ],
  },
  {
    output: "locations/portland.html",
    name: "Portland",
    title: "Portland foraging: berries, fruit and a map · Forage Around",
    shareTitle: "Portland foraging: berries, fruit and a map | Forage Around",
    description:
      "Plan a Portland foraging walk with usual seasons for cane berries, cherries, apples, pears, and more, then check crowd-sourced reports on the map.",
    h1: "Foraging in Portland: berries, fruit, and a city map",
    canonical: "https://foragearound.com/locations/portland",
    mapSource: "locations",
    mapRef: "nearby_harvest_portland",
    mapLocation: "Portland, OR",
    mapLabel: "Open the Portland foraging map",
    seasonalGuideLabel: "Open the seasonal foraging guide",
    confidenceCues: [
      "Map reports change and may be incomplete",
      "not a promise that fruit is present, accessible, or ripe today",
      "Local weather and neighborhood conditions can shift timing earlier or later",
      "no label confirms that a reported plant is ripe or available",
      "a report does not establish ownership, public access, or permission to pick",
      "Portland Parks rules",
      "prohibit removing plants and flowers from parks",
      "Reports are leads, not live availability or permission",
    ],
  },
  {
    output: "species/apple.html",
    name: "Apple",
    title: "Foraging Apple: typical season and guide notes · Forage Around",
    description:
      "See Apple's typical season around August–October, reported locations, and identification reminders before harvesting.",
    h1: "Foraging Apple",
    canonical: "https://foragearound.com/species/apple",
    mapSource: "species",
    speciesContext: "Apple",
    mapLabel: "Check reported Apple locations",
    seasonalGuideLabel: "Check Apple in the seasonal guide",
    confidenceCues: [
      "Confirm before eating",
      "starting point, not proof of identity or edibility",
      "Compare the plant with the linked Wikipedia description and a trusted local source",
      "If the details do not match or you are unsure, leave it",
    ],
  },
  {
    output: "species/plum.html",
    name: "Plum",
    title: "Foraging Plum: typical season and guide notes · Forage Around",
    description:
      "See Plum's typical season around June–August, reported locations, and identification reminders before harvesting.",
    h1: "Foraging Plum",
    canonical: "https://foragearound.com/species/plum",
    mapSource: "species",
    speciesContext: "Plum",
    mapLabel: "Check reported Plum locations",
    seasonalGuideLabel: "Check Plum in the seasonal guide",
    confidenceCues: [
      "Confirm before eating",
      "starting point, not proof of identity or edibility",
      "Compare the plant with the linked Wikipedia description and a trusted local source",
      "If the details do not match or you are unsure, leave it",
    ],
  },
];

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

function metaContent(html, attribute, value) {
  return html.match(
    new RegExp(`<meta ${attribute}="${value}" content="([^"]+)"\\s*\\/>`),
  )?.[1];
}

function canonicalHref(html) {
  return html.match(/<link rel="canonical" href="([^"]+)"\s*\/>/)?.[1];
}

function anchorHrefs(html) {
  return [...html.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map(
    ([, href, content]) => ({ href: decodeHtml(href), text: decodeHtml(content) }),
  );
}

function assertEqual(actual, expected, message) {
  if (decodeHtml(actual ?? "") !== expected) {
    throw new Error(`${message} Expected "${expected}", found "${actual ?? "missing"}".`);
  }
}

for (const representative of representatives) {
  const html = await readFile(new URL(representative.output, appOutput), "utf8");
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1];

  assertEqual(title, representative.title, `${representative.name} title changed.`);
  assertEqual(
    metaContent(html, "name", "description"),
    representative.description,
    `${representative.name} meta description changed.`,
  );
  if (representative.shareTitle) {
    assertEqual(
      metaContent(html, "property", "og:title"),
      representative.shareTitle,
      `${representative.name} Open Graph title changed.`,
    );
    assertEqual(
      metaContent(html, "name", "twitter:title"),
      representative.shareTitle,
      `${representative.name} Twitter title changed.`,
    );
    if (representative.shareTitle.length > 60) {
      throw new Error(
        `${representative.name} share title is too long for a compact link preview.`,
      );
    }
  }
  assertEqual(h1, representative.h1, `${representative.name} H1 changed.`);
  assertEqual(
    canonicalHref(html),
    representative.canonical,
    `${representative.name} canonical URL changed.`,
  );

  for (const cue of representative.confidenceCues) {
    if (!decodeHtml(html).includes(cue)) {
      throw new Error(`${representative.name} confidence language is missing: ${cue}`);
    }
  }

  const mapLink = anchorHrefs(html).find(({ text }) =>
    text.includes(representative.mapLabel),
  );
  if (!mapLink) {
    throw new Error(`${representative.name} map handoff is missing.`);
  }

  const seasonalGuideLink = anchorHrefs(html).find(
    ({ text }) => text === representative.seasonalGuideLabel,
  );
  if (!seasonalGuideLink || seasonalGuideLink.href !== "/seasonal-guide") {
    throw new Error(
      `${representative.name} must link back to the seasonal guide with descriptive text.`,
    );
  }

  const mapUrl = new URL(mapLink.href);
  if (
    mapUrl.origin !== "https://foragearound.com" ||
    mapUrl.pathname !== "/" ||
    mapUrl.searchParams.get("map_source") !== representative.mapSource ||
    (representative.speciesContext &&
      mapUrl.searchParams.get("species_context") !==
        representative.speciesContext) ||
    (representative.mapRef &&
      mapUrl.searchParams.get("ref") !== representative.mapRef) ||
    (representative.mapLocation &&
      mapUrl.searchParams.get("location") !== representative.mapLocation)
  ) {
    throw new Error(
      `${representative.name} map handoff lost its expected attribution: ${mapLink.href}`,
    );
  }
}

console.log(
  "Search template check passed for Seattle, Berkeley, Portland, Apple, and Plum: metadata, H1s, canonical URLs, confidence boundaries, named map handoffs, and reciprocal seasonal-guide links remain intact.",
);
