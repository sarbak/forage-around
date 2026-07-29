import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { walkingDestinationLabel } from "../lib/walking-destination.mjs";

assert.equal(
  walkingDestinationLabel("Blackberry"),
  "Walk to reported Blackberry location",
);
assert.equal(
  walkingDestinationLabel(null),
  "Walk to reported plant location",
);

const html = await readFile(
  new URL("../.next/server/app/tree/411.html", import.meta.url),
  "utf8",
);
const decoded = html
  .replaceAll("<!-- -->", "")
  .replaceAll("&amp;", "&")
  .replaceAll("&#x27;", "'");
const links = [
  ...decoded.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g),
].map(([, href, content]) => ({
  href,
  text: content.replace(/<[^>]+>/g, "").trim(),
}));
const walkingLink = links.find(({ href }) =>
  href.startsWith("https://www.google.com/maps/dir/"),
);

assert.ok(walkingLink, "The rendered tree page must include walking directions.");
assert.match(
  walkingLink.text,
  /^Walk to reported .+ location →$/,
  "The rendered walking action must name the reported destination.",
);
const directionsUrl = new URL(walkingLink.href);
assert.equal(directionsUrl.searchParams.get("api"), "1");
assert.match(
  directionsUrl.searchParams.get("destination") ?? "",
  /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/,
  "The walking action must keep the coordinate destination.",
);
assert.match(
  decoded,
  /Conditions can change\. Verify the plant, access, and current conditions before harvesting\./,
  "The freshness, permission, and identification reminder must stay beside the action.",
);

console.log(
  "Walking destination check passed: the rendered tree action names its reported destination and preserves coordinates plus freshness and safety guidance.",
);
