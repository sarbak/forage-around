import { readFile } from "node:fs/promises";

const appOutput = new URL("../.next/server/app/", import.meta.url);
const speciesUrl = new URL("../data/species.json", import.meta.url);

const month = new Date().getUTCMonth() + 1;
const monthName = new Intl.DateTimeFormat("en-US", {
  month: "long",
  timeZone: "UTC",
}).format(new Date(Date.UTC(2026, month - 1, 1)));

const cities = [
  {
    slug: "seattle",
    plantNames: [
      "Plum",
      "Crabapple",
      "Cherry",
      "Apple",
      "Strawberry tree",
      "Hawthorn",
      "Chestnut",
      "Walnut",
    ],
  },
  {
    slug: "berkeley",
    plantNames: [
      "Plum",
      "Apple",
      "Strawberry tree",
      "Loquat",
      "Olive",
      "Cherry",
      "Paper mulberry",
      "Common fig",
    ],
  },
  {
    slug: "portland",
    plantNames: [
      "Pear",
      "Apple",
      "Blackberry",
      "Hawthorn",
      "Walnut",
      "Plum",
      "Raspberry",
      "Cherry",
    ],
  },
];

const species = JSON.parse(await readFile(speciesUrl, "utf8"));

function count(html, text) {
  return html.split(text).length - 1;
}

for (const city of cities) {
  const html = await readFile(
    new URL(`locations/${city.slug}.html`, appOutput),
    "utf8",
  );

  for (const expectedCue of [
    `Typical peak in ${monthName}`,
    `Broader season includes ${monthName}`,
    "Local weather and neighborhood conditions can shift timing earlier or later",
    "no label confirms that a reported plant is ripe or available",
  ]) {
    if (!html.includes(expectedCue)) {
      throw new Error(
        `${city.slug} city guide is missing current-season cue: ${expectedCue}`,
      );
    }
  }

  const expectedPeakCount = city.plantNames.filter(
    (name) =>
      species[name]?.season.includes(month) &&
      species[name]?.peak?.includes(month),
  ).length;
  const expectedBroaderCount = city.plantNames.filter(
    (name) =>
      species[name]?.season.includes(month) &&
      !species[name]?.peak?.includes(month),
  ).length;

  const renderedPeakCount = count(
    html,
    `species-season-status">Typical peak in ${monthName}`,
  );
  const renderedBroaderCount = count(
    html,
    `species-season-status">Broader season includes ${monthName}`,
  );

  if (
    renderedPeakCount !== expectedPeakCount ||
    renderedBroaderCount !== expectedBroaderCount
  ) {
    throw new Error(
      `${city.slug} current-season cards changed: expected ${expectedPeakCount} peak and ${expectedBroaderCount} broader-season cues, rendered ${renderedPeakCount} and ${renderedBroaderCount}.`,
    );
  }

  const expectedTotal = expectedPeakCount + expectedBroaderCount;
  const renderedTotal = count(html, 'class="species-season-status"');
  if (renderedTotal !== expectedTotal) {
    throw new Error(
      `${city.slug} must render exactly one current-month cue for each in-season plant card.`,
    );
  }
}

console.log(
  `City season cue check passed for ${cities.map(({ slug }) => slug).join(" and ")} in ${monthName}.`,
);
