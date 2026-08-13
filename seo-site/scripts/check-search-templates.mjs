import { readFile } from "node:fs/promises";

const appOutput = new URL("../.next/server/app/", import.meta.url);

const representatives = [
  {
    output: "locations/seattle.html",
    name: "Seattle",
    title: "Seattle foraging: fruit, nuts and a map · Forage Around",
    shareTitle: "Seattle foraging: fruit, nuts and a map | Forage Around",
    description:
      "Plan a Seattle foraging walk with usual seasons for plums, cherries, apples, nuts, and more, then check crowd-sourced reports on the free map.",
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
    title: "Berkeley foraging: fruit and a map · Forage Around",
    shareTitle: "Berkeley foraging: fruit and a map | Forage Around",
    description:
      "Plan a Berkeley foraging walk with usual seasons for plums, apples, loquats, figs, and more, then search crowd-sourced reports near your address.",
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
    reciprocalLinkLabel: "When figs are in season near Berkeley",
    reciprocalLinkHref: "/locations/berkeley/fig-season",
  },
  {
    output: "locations/berkeley/fig-season.html",
    name: "Berkeley fig season",
    title: "Fig tree season near Berkeley: field guide · Forage Around",
    shareTitle: "Berkeley fig season guide | Forage Around",
    description:
      "Learn when fig tree season reaches Berkeley and the Bay Area, how to check ripeness and a crowd-sourced report, then open the local fig map.",
    h1: "Fig tree season near Berkeley: when and where to look",
    canonical: "https://foragearound.com/locations/berkeley/fig-season",
    mapSource: "berkeley_fig_season_guide",
    mapRef: "berkeley_fig_season",
    mapLocation: "Berkeley, CA",
    speciesContext: "Common fig",
    mapLabel: "Check fig reports on the Berkeley map",
    seasonalGuideLabel: "year-round seasonal foraging guide",
    confidenceCues: [
      "A map point is a lead, not a harvest promise",
      "mid-May through November",
      "fully ripe figs are soft, begin to droop on their stems",
      "A sidewalk view does not make a tree public",
      "Reports are leads, not live ripeness or permission",
      "crowd-sourced plant locations from Falling Fruit",
    ],
    confidenceBeforeMap: "A map point is a lead, not a harvest promise",
    reciprocalLinkLabel: "Open the full Berkeley foraging guide",
    reciprocalLinkHref: "/locations/berkeley",
  },
  {
    output: "locations/berkeley/plum-season.html",
    name: "Berkeley plum season",
    imageAlt:
      "Whole, halved, and sliced red plums showing several ripeness cues",
    title: "Plum season in California: Berkeley field guide · Forage Around",
    shareTitle: "Berkeley plum season guide | Forage Around",
    description:
      "Learn when plum season reaches Berkeley and California, how to check ripe fruit and old map reports, then plan a careful neighborhood plum walk.",
    h1: "Plum season in California: a Berkeley field guide",
    canonical: "https://foragearound.com/locations/berkeley/plum-season",
    mapSource: "berkeley_plum_season_guide",
    mapRef: "berkeley_plum_season",
    mapLocation: "Berkeley, CA",
    speciesContext: "Plum",
    mapLabel: "Check plum reports on the Berkeley map",
    seasonalGuideLabel: "year-round seasonal foraging guide",
    confidenceCues: [
      "A report is a lead, not a picking invitation",
      "May through October",
      "starting to soften and taste sweet and juicy",
      "South Berkeley plum report",
      "Berkeley loquat season guide",
      "Berkeley fig season guide",
    ],
    confidenceBeforeMap: "A report is a lead, not a picking invitation",
    reciprocalLinkLabel: "Open the Berkeley foraging guide",
    reciprocalLinkHref: "/locations/berkeley",
  },
  {
    output: "locations/berkeley/loquat-season.html",
    name: "Berkeley loquat season",
    imageAlt: "Clusters of orange loquats among large dark green leaves",
    title: "Loquat season in California: Berkeley guide · Forage Around",
    shareTitle: "Berkeley loquat season guide | Forage Around",
    description:
      "Learn when loquat season reaches Berkeley and coastal California, how to check the fruit and old reports, then plan a careful spring walk.",
    h1: "Loquat season in California: a Berkeley guide",
    canonical: "https://foragearound.com/locations/berkeley/loquat-season",
    mapSource: "berkeley_loquat_season_guide",
    mapRef: "berkeley_loquat_season",
    mapLocation: "Berkeley, CA",
    speciesContext: "Loquat",
    mapLabel: "Check loquat reports on the Berkeley map",
    seasonalGuideLabel: "year-round seasonal foraging guide",
    confidenceCues: [
      "A mapped tree is not a harvest promise",
      "spring and early summer",
      "soft-firm and vividly colored",
      "South Berkeley loquat report",
      "Berkeley plum season guide",
      "Berkeley fig season guide",
    ],
    confidenceBeforeMap: "A mapped tree is not a harvest promise",
    reciprocalLinkLabel: "Open the Berkeley foraging guide",
    reciprocalLinkHref: "/locations/berkeley",
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
    reciprocalLinkLabel: "What to forage in Portland this summer",
    reciprocalLinkHref: "/locations/portland/summer",
  },
  {
    output: "locations/portland/summer.html",
    name: "Portland summer",
    title: "What to forage in Portland in summer · Forage Around",
    shareTitle: "Portland summer foraging guide | Forage Around",
    description:
      "See what to forage in Portland in summer, from cherries and cane berries to plums, apples, and pears, then check reported plants on the city map.",
    h1: "What to forage in Portland in summer",
    canonical: "https://foragearound.com/locations/portland/summer",
    mapSource: "portland_summer_guide",
    mapRef: "portland_summer_foraging",
    mapLocation: "Portland, OR",
    mapLabel: "Check summer reports on the Portland map",
    seasonalGuideLabel: "year-round seasonal foraging guide",
    confidenceCues: [
      "Season is only a planning clue",
      "Crowd-sourced reports do not confirm plant identity, ripeness, ownership, public access, or permission to pick",
      "A report does not show who owns the land or whether picking is allowed",
      "Portland Parks rules",
      "prohibit removing plants and flowers from parks",
      "A report is a starting point, not a live inventory",
    ],
    confidenceBeforeMap: "Season is only a planning clue",
    reciprocalLinkLabel: "Open the full Portland foraging guide",
    reciprocalLinkHref: "/locations/portland",
  },
  {
    output: "locations/oregon/fruit-in-season.html",
    name: "Oregon fruit season",
    title: "What fruit is in season in Oregon right now? · Forage Around",
    shareTitle: "Oregon fruit season by month | Forage Around",
    description:
      "See what fruit is in season in Oregon right now, use a month-by-month harvest guide, then check reported fruit plants on the free map.",
    h1: "What fruit is in season in Oregon right now?",
    canonical: "https://foragearound.com/locations/oregon/fruit-in-season",
    mapSource: "oregon_fruit_season_guide",
    mapRef: "oregon_fruit_in_season",
    mapLocation: "Portland, OR",
    mapLabel: "Check fruit reports around Portland",
    seasonalGuideLabel: "Browse the year-round season guide",
    confidenceCues: [
      "availability varies by location",
      "broad windows are for trip planning, not promises",
      "does not confirm that fruit is present now",
      "does not turn a reported plant into public property",
      "Reports are leads, not live fruit or permission",
      "Check land status and permission",
    ],
    confidenceBeforeMap: "availability varies by location",
    reciprocalLinkLabel: "Open the Portland foraging guide",
    reciprocalLinkHref: "/locations/portland",
  },
  {
    output: "locations/los-angeles.html",
    name: "Los Angeles",
    title: "Los Angeles foraging: fruit and a map · Forage Around",
    shareTitle: "Los Angeles foraging: fruit and a map | Forage Around",
    description:
      "Plan a Los Angeles foraging walk with usual seasons for loquats, figs, pomegranates, citrus, and more, then check reported plants on the map.",
    h1: "Foraging in Los Angeles: fruit across city microclimates",
    canonical: "https://foragearound.com/locations/los-angeles",
    mapSource: "locations",
    mapRef: "nearby_harvest_los-angeles",
    mapLocation: "Los Angeles, CA",
    mapLabel: "Open the Los Angeles foraging map",
    seasonalGuideLabel: "Open the seasonal foraging guide",
    confidenceCues: [
      "Map reports change and may be incomplete",
      "not a promise that fruit is present, accessible, or ripe today",
      "Local weather and neighborhood conditions can shift timing earlier or later",
      "no label confirms that a reported plant is ripe or available",
      "a public-tree or community-map record does not establish current ownership, public access, or permission to pick",
      "Reports are leads, not live availability or permission",
    ],
  },
  {
    output: "locations/chicago.html",
    name: "Chicago",
    title: "Chicago foraging: fruit, berries and a map · Forage Around",
    shareTitle: "Chicago foraging: fruit, berries and a map | Forage Around",
    description:
      "Plan a Chicago foraging walk with usual seasons for mulberries, elderberries, apples, nuts, and more, then check reported edible plants on the map.",
    h1: "Foraging in Chicago: reported fruit, berries, and nuts",
    canonical: "https://foragearound.com/locations/chicago",
    mapSource: "locations",
    mapRef: "nearby_harvest_chicago",
    mapLocation: "Chicago, IL",
    mapLabel: "Open the Chicago foraging map",
    seasonalGuideLabel: "Open the seasonal foraging guide",
    confidenceCues: [
      "Map reports change and may be incomplete",
      "not a promise that fruit is present, accessible, or ripe today",
      "Live reports also cluster unevenly across the city",
      "calendar for reported edible plants, not a promise of broad neighborhood coverage",
      "the live reports are clustered",
      "a park, preserve, street-tree, or community-map marker does not establish permission to enter or pick",
      "Reports are leads, not live availability or permission",
    ],
  },
  {
    output: "locations/new-york.html",
    name: "New York",
    title: "New York foraging: fruit, nuts and a map · Forage Around",
    shareTitle: "New York foraging: fruit, nuts and a map | Forage Around",
    description:
      "Plan a New York foraging walk with usual seasons for mulberries, plums, apples, haws, nuts, and more, then check reported plants on the map.",
    h1: "Foraging in New York: fruit, nuts, and a city map",
    canonical: "https://foragearound.com/locations/new-york",
    mapSource: "locations",
    mapRef: "nearby_harvest_new-york",
    mapLocation: "New York, NY",
    mapLabel: "Open the New York foraging map",
    seasonalGuideLabel: "Open the seasonal foraging guide",
    confidenceCues: [
      "Map reports change and may be incomplete",
      "not a promise that fruit is present, accessible, or ripe today",
      "Street-tree density is not the same as harvest availability",
      "inventory density is not harvest permission",
      "a designated edible landscape",
      "Do not apply one site",
      "Reports are leads, not live availability or permission",
    ],
  },
  {
    output: "locations/pawpaw-fruit-map.html",
    name: "Pawpaw fruit map",
    imageAlt:
      "Cluster of oblong green pawpaw fruit hanging beneath broad leaves",
    title: "Pawpaw fruit map: find reported trees · Forage Around",
    shareTitle: "Pawpaw fruit map and field guide | Forage Around",
    description:
      "Find reported pawpaw fruit trees near you, learn the native range, season and ripe-fruit clues, then check access and permission before you pick.",
    h1: "Pawpaw fruit map: where and when to look",
    canonical: "https://foragearound.com/locations/pawpaw-fruit-map",
    mapSource: "pawpaw_fruit_map_guide",
    mapRef: "pawpaw_fruit_map",
    speciesContext: "Pawpaw",
    mapLabel: "Search reported pawpaw spots",
    seasonalGuideLabel: "seasonal foraging guide",
    confidenceCues: [
      "A map report is not a harvest promise",
      "Two maps answer two different questions",
      "Choose Everything edible",
      "remove the skin and large dark seeds",
      "Reports can be incomplete, duplicated, imprecise or out of date",
    ],
    confidenceBeforeMap: "A map report is not a harvest promise",
    reciprocalLinkLabel: "public fruit tree guide",
    reciprocalLinkHref: "/locations/public-fruit-trees",
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
    imageAlt: "Whole, halved, and sliced red plums",
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
  {
    output: "species/blackberry.html",
    name: "Blackberry",
    imageAlt: "Ripe, red, and green blackberries on the same cane",
    title:
      "Blackberry foraging guide: season, identification and map · Forage Around",
    description:
      "Learn blackberry identification cues, typical July–September timing, how to judge crowd-sourced reports, and where picking is allowed before opening the map.",
    h1: "Blackberry foraging guide",
    canonical: "https://foragearound.com/species/blackberry",
    mapSource: "species",
    speciesContext: "Blackberry",
    mapLabel: "Check reported Blackberry locations",
    seasonalGuideLabel: "Check Blackberry in the seasonal guide",
    confidenceCues: [
      "Confirm before eating",
      "Look beyond berry color",
      "July through September",
      "A pin is a lead, not proof",
      "Public access does not automatically allow harvest",
      "the pale core stays with a blackberry",
      "crowd-sourced locations from Falling Fruit",
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

const auditedGuides = representatives.slice(0, 10);
const auditedTitles = new Map();
const auditedDescriptions = new Map();

for (const representative of representatives) {
  const html = await readFile(new URL(representative.output, appOutput), "utf8");
  const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  const description = metaContent(html, "name", "description");
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1];

  assertEqual(title, representative.title, `${representative.name} title changed.`);
  assertEqual(
    description,
    representative.description,
    `${representative.name} meta description changed.`,
  );
  if (auditedGuides.includes(representative)) {
    const decodedTitle = decodeHtml(title ?? "");
    const decodedDescription = decodeHtml(description ?? "");
    const cityName =
      representative.name === "Oregon fruit season"
        ? "Oregon"
        : representative.name === "Portland summer"
        ? "Portland"
        : representative.name.startsWith("Berkeley ")
          ? "Berkeley"
          : representative.name;

    if (
      !decodedTitle.includes(cityName) ||
      !decodedDescription.includes(cityName)
    ) {
      throw new Error(
        `${representative.name} title and description must both name ${cityName}.`,
      );
    }
    if (
      representative.name === "Oregon fruit season"
        ? !decodedTitle.toLowerCase().includes("fruit") ||
          !decodedDescription.toLowerCase().includes("season")
        : representative.name === "Portland summer"
        ? !decodedTitle.toLowerCase().includes("summer") ||
          !decodedDescription.toLowerCase().includes("summer")
        : representative.name.startsWith("Berkeley ")
          ? !decodedTitle.toLowerCase().includes("season") ||
            !decodedDescription.toLowerCase().includes("season")
        : !decodedTitle.toLowerCase().includes("foraging") ||
          !decodedDescription.toLowerCase().includes("season")
    ) {
      throw new Error(
        `${representative.name} metadata is missing its relevant season signal.`,
      );
    }
    if (auditedTitles.has(decodedTitle)) {
      throw new Error(
        `${representative.name} duplicates the title for ${auditedTitles.get(decodedTitle)}.`,
      );
    }
    if (auditedDescriptions.has(decodedDescription)) {
      throw new Error(
        `${representative.name} duplicates the description for ${auditedDescriptions.get(decodedDescription)}.`,
      );
    }
    auditedTitles.set(decodedTitle, representative.name);
    auditedDescriptions.set(decodedDescription, representative.name);
  }
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
  if (representative.imageAlt) {
    const imageAlt = html.match(
      /<img class="photo"[^>]* alt="([^"]+)"[^>]*>/,
    )?.[1];
    assertEqual(
      imageAlt,
      representative.imageAlt,
      `${representative.name} image description changed.`,
    );
  }

  for (const cue of representative.confidenceCues) {
    if (!decodeHtml(html).includes(cue)) {
      throw new Error(`${representative.name} confidence language is missing: ${cue}`);
    }
  }

  if (
    representative.confidenceBeforeMap &&
    decodeHtml(html).indexOf(representative.confidenceBeforeMap) >
      decodeHtml(html).indexOf(representative.mapLabel)
  ) {
    throw new Error(
      `${representative.name} confidence boundary must appear before its map handoff.`,
    );
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

  if (representative.reciprocalLinkLabel) {
    const reciprocalLink = anchorHrefs(html).find(
      ({ text }) => text === representative.reciprocalLinkLabel,
    );
    if (
      !reciprocalLink ||
      reciprocalLink.href !== representative.reciprocalLinkHref
    ) {
      throw new Error(
        `${representative.name} reciprocal guide link changed.`,
      );
    }
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

const berkeleyCluster = [
  {
    output: "locations/berkeley.html",
    name: "Berkeley city guide",
    requiredLinks: [
      "/locations/berkeley/loquat-season",
      "/locations/berkeley/plum-season",
      "/locations/berkeley/fig-season",
      "/species/loquat",
      "/species/plum",
      "/species/common-fig",
      "/tree/423",
      "/tree/427",
      "/tree/414",
    ],
  },
  {
    output: "locations/berkeley/loquat-season.html",
    name: "Berkeley loquat season",
    requiredLinks: [
      "/locations/berkeley",
      "/locations/berkeley/plum-season",
      "/locations/berkeley/fig-season",
      "/species/loquat",
      "/tree/423",
      "/tree/461",
      "/tree/480",
    ],
  },
  {
    output: "locations/berkeley/plum-season.html",
    name: "Berkeley plum season",
    requiredLinks: [
      "/locations/berkeley",
      "/locations/berkeley/loquat-season",
      "/locations/berkeley/fig-season",
      "/species/plum",
      "/tree/427",
      "/tree/492",
      "/tree/519",
    ],
  },
  {
    output: "locations/berkeley/fig-season.html",
    name: "Berkeley fig season",
    requiredLinks: [
      "/locations/berkeley",
      "/locations/berkeley/loquat-season",
      "/locations/berkeley/plum-season",
      "/species/common-fig",
      "/tree/414",
      "/tree/434",
      "/tree/470",
    ],
  },
];

for (const page of berkeleyCluster) {
  const html = await readFile(new URL(page.output, appOutput), "utf8");
  const hrefs = new Set(anchorHrefs(html).map(({ href }) => href));
  for (const href of page.requiredLinks) {
    if (!hrefs.has(href)) {
      throw new Error(`${page.name} must preserve cluster link ${href}.`);
    }
  }
}

const pawpawInboundSources = await Promise.all([
  readFile(new URL("locations.html", appOutput), "utf8"),
  readFile(new URL("locations/public-fruit-trees.html", appOutput), "utf8"),
]);
for (const [index, html] of pawpawInboundSources.entries()) {
  if (!anchorHrefs(html).some(({ href }) => href === "/locations/pawpaw-fruit-map")) {
    const pageName =
      index === 0 ? "Locations index" : "Public fruit tree guide";
    throw new Error(
      pageName + " must link to the pawpaw fruit map guide.",
    );
  }
}

const oregonFruitInboundSources = await Promise.all([
  readFile(new URL("locations.html", appOutput), "utf8"),
  readFile(new URL("locations/portland/summer.html", appOutput), "utf8"),
]);
for (const [index, html] of oregonFruitInboundSources.entries()) {
  if (
    !anchorHrefs(html).some(
      ({ href }) => href === "/locations/oregon/fruit-in-season",
    )
  ) {
    const pageName = index === 0 ? "Locations index" : "Portland summer guide";
    throw new Error(pageName + " must link to the Oregon fruit season guide.");
  }
}

console.log(
  "Search template check passed for city, Berkeley seasonal-cluster, focused location, and species pages: metadata, H1s, canonical URLs, confidence boundaries, named map handoffs, reciprocal and inbound guide links, and image descriptions remain intact.",
);
