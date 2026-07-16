import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const html = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const loader = readFileSync(
  new URL("../public/posthog-loader.js", import.meta.url),
  "utf8",
);

test("loads the managed analytics bootstrap in the exported web shell", () => {
  assert.match(html, /<script src="\/posthog-loader\.js" defer><\/script>/);
  assert.match(loader, /phc_skySfZa6o44oxwoGTC7dm95wRrL3VB6YV2EeXbJBbVec/);
  assert.match(loader, /https:\/\/us\.i\.posthog\.com/);
});
