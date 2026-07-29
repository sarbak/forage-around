import { readFile } from "node:fs/promises";

const appOutput = new URL("../.next/server/app/", import.meta.url);
const html = await readFile(new URL("faq.html", appOutput), "utf8");

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

const title = decodeHtml(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "");
const description = html.match(
  /<meta name="description" content="([^"]+)"\s*\/>/,
)?.[1];
const canonical = html.match(
  /<link rel="canonical" href="([^"]+)"\s*\/>/,
)?.[1];
const h1 = decodeHtml(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "");

if (title !== "What is Forage Around? Map FAQ and meaning · Forage Around") {
  throw new Error(`FAQ title changed: ${title || "missing"}`);
}
if (
  description !==
  "Forage Around is a free urban foraging map. Learn what the name means, how the map works, where its data comes from, and what to check before picking."
) {
  throw new Error("FAQ description changed.");
}
if (canonical !== "https://foragearound.com/faq") {
  throw new Error(`FAQ canonical changed: ${canonical || "missing"}`);
}
if (h1 !== "What is Forage Around?") {
  throw new Error(`FAQ H1 changed: ${h1 || "missing"}`);
}

const faqSchemaSource = html.match(
  /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
)?.[1];
if (!faqSchemaSource) {
  throw new Error("FAQPage structured data is missing.");
}

const faqSchema = JSON.parse(faqSchemaSource);
if (faqSchema["@type"] !== "FAQPage") {
  throw new Error("FAQ structured data is not typed as FAQPage.");
}
if (!Array.isArray(faqSchema.mainEntity) || faqSchema.mainEntity.length < 5) {
  throw new Error("FAQ structured data must contain at least 5 questions.");
}
for (const item of faqSchema.mainEntity) {
  if (
    item["@type"] !== "Question" ||
    !item.name ||
    item.acceptedAnswer?.["@type"] !== "Answer" ||
    !item.acceptedAnswer?.text
  ) {
    throw new Error("FAQ structured data has an incomplete Q&A entry.");
  }
}

const visibleQuestions = [...html.matchAll(/<article><h3>([\s\S]*?)<\/h3>/g)].map(
  ([, question]) => decodeHtml(question),
);
if (visibleQuestions.length !== faqSchema.mainEntity.length) {
  throw new Error("Visible FAQ answers and FAQPage schema are out of sync.");
}

for (const requiredCue of [
  'What does "forage around" mean?',
  "How do I use the Forage Around map?",
  "Where does Forage Around get its data?",
  "Does a map marker mean a plant is safe and available to pick?",
  "Can I add a plant or report a correction?",
]) {
  if (!visibleQuestions.includes(requiredCue)) {
    throw new Error(`FAQ is missing required question: ${requiredCue}`);
  }
}

console.log(
  `FAQ check passed: metadata, canonical, ${visibleQuestions.length} visible answers, and matching FAQPage structured data are intact.`,
);
