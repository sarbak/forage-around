import assert from "node:assert/strict";
import test from "node:test";
import {
  analyticsEventName,
  cleanSpeciesContext,
  controlledTestRunFromHref,
  isControlledTestRun,
  speciesContextForEntry,
  speciesContextFromHref,
  withWebAttribution,
} from "./webAttribution";

test("reads species page context from a seasonal guide handoff", () => {
  assert.equal(
    speciesContextFromHref(
      "https://foragearound.com/?map_source=seasonal_guide&species_context=Apple",
    ),
    "Apple",
  );
  assert.equal(
    speciesContextFromHref(
      "https://foragearound.com/?map_source=species&species_context=Miner%27s+lettuce",
    ),
    "Miner's lettuce",
  );
});

test("leaves direct app entry without species page context", () => {
  assert.equal(speciesContextFromHref("https://foragearound.com/"), null);
  assert.equal(
    speciesContextFromHref("https://foragearound.com/?map_source=species"),
    null,
  );
  assert.equal(
    speciesContextForEntry(
      "https://foragearound.com/?map_source=seasonal_guide",
      "Apple",
    ),
    null,
  );
  assert.equal(
    speciesContextForEntry("https://foragearound.com/?map_source=home", "Apple"),
    null,
  );
});

test("rejects empty, oversized, and unsafe species context values", () => {
  assert.equal(cleanSpeciesContext("   "), null);
  assert.equal(cleanSpeciesContext("x".repeat(81)), null);
  assert.equal(cleanSpeciesContext("Apple<script>"), null);
});

test("keeps acquisition origin and species page context separate from the selected find", () => {
  assert.deepEqual(
    withWebAttribution(
      "seasonal_guide",
      "Apple",
      { species: "Crabapple", ff_location_id: "123" },
      { ref: "seasonal_card" },
      true,
    ),
    {
      species: "Crabapple",
      ff_location_id: "123",
      map_source: "seasonal_guide",
      species_context: "Apple",
      ref: "seasonal_card",
      test_run: true,
    },
  );
});

test("keeps Portland summer acquisition origin on downstream events", () => {
  assert.deepEqual(
    withWebAttribution(
      "portland_summer_guide",
      null,
      { species: "Blackberry", ff_location_id: "456" },
      { ref: "portland_summer_foraging" },
    ),
    {
      species: "Blackberry",
      ff_location_id: "456",
      map_source: "portland_summer_guide",
      ref: "portland_summer_foraging",
      test_run: false,
    },
  );
});

test("leaves generic app attribution unchanged", () => {
  assert.deepEqual(withWebAttribution(null, null, { method: "geolocation" }), {
    method: "geolocation",
    test_run: false,
  });
});

test("marks only an explicit controlled journey", () => {
  assert.equal(isControlledTestRun("true"), true);
  assert.equal(isControlledTestRun("TRUE"), false);
  assert.equal(isControlledTestRun("1"), false);
  assert.equal(isControlledTestRun(null), false);
  assert.equal(
    controlledTestRunFromHref(
      "https://foragearound.com/?map_source=seasonal_guide&test_run=true",
    ),
    true,
  );
  assert.equal(
    controlledTestRunFromHref(
      "https://foragearound.com/?map_source=seasonal_guide",
    ),
    false,
  );
});

test("keeps visitor event names and isolates controlled event names", () => {
  assert.equal(analyticsEventName("location_resolved", false), "location_resolved");
  assert.equal(analyticsEventName("location_resolved", true), "qa_location_resolved");
  assert.equal(analyticsEventName("qa_location_resolved", true), "qa_location_resolved");
});
