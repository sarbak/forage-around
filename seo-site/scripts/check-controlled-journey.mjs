import assert from "node:assert/strict";
import {
  analyticsEventName,
  controlledTestRunFromSearch,
  hrefWithControlledTestRun,
  isControlledTestRun,
} from "../lib/controlled-journey.mjs";

assert.equal(isControlledTestRun("true"), true);
assert.equal(isControlledTestRun("TRUE"), false);
assert.equal(isControlledTestRun("1"), false);
assert.equal(isControlledTestRun(null), false);

assert.equal(controlledTestRunFromSearch("?test_run=true"), true);
assert.equal(controlledTestRunFromSearch("?test_run=false"), false);
assert.equal(controlledTestRunFromSearch("?map_source=seasonal_guide"), false);
assert.equal(analyticsEventName("tree_page_viewed", false), "tree_page_viewed");
assert.equal(analyticsEventName("tree_page_viewed", true), "qa_tree_page_viewed");
assert.equal(analyticsEventName("qa_tree_page_viewed", true), "qa_tree_page_viewed");

const controlledSpeciesHref = hrefWithControlledTestRun(
  "/species/apple?map_source=seasonal_guide",
  true,
);
assert.equal(
  controlledSpeciesHref,
  "/species/apple?map_source=seasonal_guide&test_run=true",
);

const controlledAppHref = hrefWithControlledTestRun(
  "https://foragearound.com/?map_source=seasonal_guide&species_context=Apple&ref=seasonal_card",
  true,
);
const controlledAppUrl = new URL(controlledAppHref);
assert.equal(controlledAppUrl.searchParams.get("map_source"), "seasonal_guide");
assert.equal(controlledAppUrl.searchParams.get("species_context"), "Apple");
assert.equal(controlledAppUrl.searchParams.get("ref"), "seasonal_card");
assert.equal(controlledAppUrl.searchParams.get("test_run"), "true");

const ordinaryHref =
  "https://foragearound.com/?map_source=seasonal_guide&species_context=Apple";
assert.equal(hrefWithControlledTestRun(ordinaryHref, false), ordinaryHref);

console.log("Controlled journey checks passed.");
