import assert from "node:assert/strict";
import test from "node:test";
import {
  cleanInitialLocationQuery,
  initialLocationQueryFromHref,
} from "./webEntry";

test("reads the named city from a web app handoff", () => {
  assert.equal(
    initialLocationQueryFromHref(
      "https://foragearound.com/?ref=nearby_harvest_seattle&location=Seattle%2C+WA&map_source=locations",
    ),
    "Seattle, WA",
  );
  assert.equal(
    initialLocationQueryFromHref(
      "https://foragearound.com/?location=Berkeley%2C+CA&map_source=locations",
    ),
    "Berkeley, CA",
  );
});

test("leaves generic app entry unchanged", () => {
  assert.equal(initialLocationQueryFromHref("https://foragearound.com/"), null);
  assert.equal(
    initialLocationQueryFromHref("https://foragearound.com/?map_source=home"),
    null,
  );
});

test("rejects empty, oversized, and unsafe location values", () => {
  assert.equal(cleanInitialLocationQuery("   "), null);
  assert.equal(cleanInitialLocationQuery("x".repeat(121)), null);
  assert.equal(cleanInitialLocationQuery("https://example.com"), null);
  assert.equal(cleanInitialLocationQuery("Seattle<script>"), null);
});
