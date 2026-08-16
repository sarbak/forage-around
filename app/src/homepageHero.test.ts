import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const landingSource = appSource.slice(
  appSource.indexOf("function Landing("),
  appSource.indexOf("function FooterLink("),
);

test("leads first-time visitors with the nearby wild-food promise", () => {
  assert.match(landingSource, /Find likely-ripe wild food near you/);
  assert.match(landingSource, /No account required\./);
  assert.match(landingSource, /<Text style=\{styles\.ctaText\}>Use my location<\/Text>/);
});

test("keeps address search visually secondary to the location action", () => {
  assert.match(landingSource, /<Text style=\{styles\.addrGoText\}>Search<\/Text>/);
  assert.match(appSource, /cta: \{\s+backgroundColor: C\.ripe,/);
  assert.match(
    appSource,
    /addrGo: \{ backgroundColor: C\.white, borderWidth: 1, borderColor: C\.forest,/,
  );
});
