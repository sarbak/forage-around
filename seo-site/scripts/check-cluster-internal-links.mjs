import { readdir, readFile } from "node:fs/promises";

const appOutput = new URL("../.next/server/app/", import.meta.url);
const monthSlugs = [
  "august",
  "september",
  "october",
  "november",
  "december",
  "january",
];

function speciesSlugs(html) {
  return [
    ...new Set(
      [...html.matchAll(/href="\/species\/([a-z0-9-]+)(?:\?[^\"]*)?"/g)].map(
        ([, slug]) => slug,
      ),
    ),
  ];
}

function routeHref(path) {
  return `href="${path}"`;
}

function textContent(markup) {
  return markup
    .replaceAll("<!-- -->", "")
    .replace(/<[^>]+>/g, "")
    .replaceAll("&amp;", "&")
    .replaceAll("&apos;", "'")
    .replaceAll("&#x27;", "'");
}

let monthPairs = 0;

for (const month of monthSlugs) {
  const monthHtml = await readFile(
    new URL(`seasonal-guide/${month}.html`, appOutput),
    "utf8",
  );
  const linkedSpecies = speciesSlugs(monthHtml);

  if (linkedSpecies.length === 0) {
    throw new Error(`${month} must link to at least one species guide.`);
  }

  for (const speciesSlug of linkedSpecies) {
    const speciesHtml = await readFile(
      new URL(`species/${speciesSlug}.html`, appOutput),
      "utf8",
    );
    const speciesText = textContent(speciesHtml);
    if (!speciesHtml.includes(routeHref(`/seasonal-guide/${month}`))) {
      throw new Error(
        `${speciesSlug} must link back to the ${month} seasonal guide.`,
      );
    }
    const monthName = `${month[0].toUpperCase()}${month.slice(1)}`;
    if (!speciesText.includes(`in the ${monthName} guide`)) {
      throw new Error(`${speciesSlug} needs a descriptive ${month} link label.`);
    }
    monthPairs += 1;
  }
}

const oaklandHtml = await readFile(
  new URL("locations/oakland.html", appOutput),
  "utf8",
);
const oaklandSpecies = speciesSlugs(oaklandHtml);

if (oaklandSpecies.length !== 4) {
  throw new Error(
    `Oakland must connect exactly 4 represented species, found ${oaklandSpecies.length}.`,
  );
}

for (const speciesSlug of oaklandSpecies) {
  const speciesHtml = await readFile(
    new URL(`species/${speciesSlug}.html`, appOutput),
    "utf8",
  );
  const speciesText = textContent(speciesHtml);
  if (!speciesHtml.includes(routeHref("/locations/oakland"))) {
    throw new Error(`${speciesSlug} must link back to the Oakland city guide.`);
  }
  if (!speciesText.includes("in the Oakland foraging guide")) {
    throw new Error(`${speciesSlug} needs a descriptive Oakland link label.`);
  }
}

const speciesFiles = (await readdir(new URL("species/", appOutput))).filter(
  (file) => file.endsWith(".html"),
);
const oaklandSpeciesSet = new Set(oaklandSpecies);

for (const file of speciesFiles) {
  const speciesSlug = file.slice(0, -5);
  const speciesHtml = await readFile(new URL(`species/${file}`, appOutput), "utf8");
  const hasOaklandLink = speciesHtml.includes(routeHref("/locations/oakland"));

  if (hasOaklandLink !== oaklandSpeciesSet.has(speciesSlug)) {
    throw new Error(
      `${speciesSlug} has an Oakland link that does not match the city dataset.`,
    );
  }

  for (const [, target] of speciesHtml.matchAll(
    /href="\/(seasonal-guide\/[a-z-]+|locations\/oakland)"/g,
  )) {
    await readFile(new URL(`${target}.html`, appOutput), "utf8");
  }
}

console.log(
  `Cluster internal-link check passed: ${monthPairs} reciprocal month/species pairs, ${oaklandSpecies.length} reciprocal Oakland/species pairs, descriptive labels, and no missing generated targets.`,
);
