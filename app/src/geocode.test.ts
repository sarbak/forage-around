import assert from "node:assert/strict";
import test from "node:test";
import { broadLocalityFromAddress } from "./lib";

test("builds a broad city and region without using street-level fields", () => {
  assert.equal(
    broadLocalityFromAddress({
      city: "Portland",
      county: "Multnomah County",
      state: "Oregon",
    }),
    "Portland, Oregon"
  );
});

test("uses another structured locality or region when a city is absent", () => {
  assert.equal(
    broadLocalityFromAddress({ town: "Friday Harbor", state: "Washington" }),
    "Friday Harbor, Washington"
  );
  assert.equal(
    broadLocalityFromAddress({ county: "Ada County", state: "Idaho" }),
    "Ada County, Idaho"
  );
  assert.equal(broadLocalityFromAddress({ state: "Alaska" }), "Alaska");
});

test("omits locality when structured broad context is unavailable", () => {
  assert.equal(broadLocalityFromAddress(undefined), null);
  assert.equal(broadLocalityFromAddress({}), null);
});
