import { readFile } from "node:fs/promises";

const appOutput = new URL("../.next/server/app/", import.meta.url);

const expectedPages = [
  { slug: "august", name: "August", count: 34, peaks: 8, cue: "Common fig" },
  { slug: "september", name: "September", count: 41, peaks: 14, cue: "Hazelnut" },
  { slug: "october", name: "October", count: 43, peaks: 14, cue: "Chestnut" },
  { slug: "november", name: "November", count: 33, peaks: 6, cue: "Feijoa" },
  { slug: "december", name: "December", count: 22, peaks: 3, cue: "Magenta lilly pilly" },
  { slug: "january", name: "January", count: 18, peaks: 4, cue: "Kumquat" },
];

function textContent(markup) {
  return markup
    .replaceAll("<!-- -->", "")
    .replace(/<[^>]+>/g, "")
    .replaceAll("&amp;", "&")
    .replaceAll("&apos;", "'")
    .replaceAll("&#x27;", "'")
    .trim();
}

function jsonLdObjects(html) {
  return [
    ...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g),
  ].flatMap(([, content]) => {
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : [parsed];
  });
}

const hub = await readFile(new URL("seasonal-guide.html", appOutput), "utf8");

for (const expected of expectedPages) {
  const html = await readFile(
    new URL(`seasonal-guide/${expected.slug}.html`, appOutput),
    "utf8",
  );
  const text = textContent(html);
  const canonical = `https://foragearound.com/seasonal-guide/${expected.slug}`;
  const jsonLd = jsonLdObjects(html);
  const collection = jsonLd.find((item) => item["@type"] === "CollectionPage");
  const faq = jsonLd.find((item) => item["@type"] === "FAQPage");

  if (!html.includes(`<link rel="canonical" href="${canonical}"`)) {
    throw new Error(`${expected.name} is missing its canonical URL.`);
  }

  if (!text.includes(`What is ripe in ${expected.name}?`)) {
    throw new Error(`${expected.name} is missing its month-specific answer.`);
  }

  if (
    !text.includes(`${expected.count} guides include ${expected.name}`) ||
    !text.includes(`${expected.peaks} mark it as a typical peak`)
  ) {
    throw new Error(`${expected.name} no longer matches the species calendar.`);
  }

  if (!text.includes(expected.cue)) {
    throw new Error(`${expected.name} lost its distinctive seasonal cue.`);
  }

  if (
    !html.includes(
      `href="https://foragearound.com/?ref=monthly_season_${expected.slug}&amp;map_source=seasonal_guide"`,
    ) ||
    !text.includes("Reports do not confirm ripeness, access, or permission to pick")
  ) {
    throw new Error(`${expected.name} lost its safe map handoff.`);
  }

  if (
    !collection ||
    collection.mainEntity?.numberOfItems !== expected.count ||
    !faq ||
    faq.mainEntity?.length !== 3
  ) {
    throw new Error(`${expected.name} has incomplete structured data.`);
  }

  if (!hub.includes(`href="/seasonal-guide/${expected.slug}"`)) {
    throw new Error(`The seasonal hub does not link to ${expected.name}.`);
  }
}

console.log(
  `Monthly season checks passed: ${expectedPages.length} distinct pages with canonical metadata, structured data, guide links, and safe map handoffs.`,
);
