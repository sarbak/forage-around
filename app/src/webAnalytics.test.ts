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
  assert.match(loader, /phc_Ars7aCiAHXS5Lig9YAQaNtcXqXNAUqQx8zStDHr64d6X/);
  assert.match(loader, /https:\/\/us\.i\.posthog\.com/);
  assert.match(loader, /test_run/);
  assert.match(loader, /window\.__forageAroundQaRun/);
  assert.match(loader, /capture_pageview:!window\.__forageAroundQaRun/);
  assert.match(loader, /autocapture:!window\.__forageAroundQaRun/);
});
