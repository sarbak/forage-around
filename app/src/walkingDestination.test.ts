import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  walkingDestinationAccessibilityLabel,
  walkingDestinationLabel,
} from "./walkingDestination";

test("names the reported plant without claiming its identity", () => {
  assert.equal(
    walkingDestinationLabel("Apple"),
    "Walk to reported Apple location",
  );
  assert.equal(
    walkingDestinationAccessibilityLabel("Apple"),
    "Open walking directions to reported Apple location",
  );
});

test("falls back to a clear reported plant location", () => {
  assert.equal(
    walkingDestinationLabel("   "),
    "Walk to reported plant location",
  );
  assert.equal(
    walkingDestinationAccessibilityLabel(null),
    "Open walking directions to reported plant location",
  );
});

test("the detail action keeps its existing route, event, and safety boundary", () => {
  const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");

  assert.match(appSource, /walkingDestinationLabel\(find\.type\)/);
  assert.match(
    appSource,
    /walkingDestinationAccessibilityLabel\(find\.type\)/,
  );
  assert.match(appSource, /"walk_here_clicked"/);
  assert.match(
    appSource,
    /Linking\.openURL\(directionsUrl\(find\.lat, find\.lng, find\.type\)\)/,
  );
  assert.match(
    appSource,
    /confirm the ID yourself, take only from public land or with permission/,
  );
});
