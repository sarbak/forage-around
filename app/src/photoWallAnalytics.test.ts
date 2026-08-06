import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { photoWallAnalytics } from "./photoWallAnalytics";

test("records an empty wall without increasing real photo views", () => {
  assert.deepEqual(photoWallAnalytics([]), {
    event: "photo_wall_empty",
    properties: { count: 0, submission_count: 0 },
  });
});

test("treats approved text-only submissions as a wall without real photos", () => {
  assert.deepEqual(
    photoWallAnalytics([{ photo_url: null }, { photo_url: "   " }]),
    {
      event: "photo_wall_empty",
      properties: { count: 0, submission_count: 2 },
    },
  );
});

test("records a populated wall using its real photo count", () => {
  assert.deepEqual(
    photoWallAnalytics([
      { photo_url: "https://example.com/one.jpg" },
      { photo_url: null },
      { photo_url: "https://example.com/two.jpg" },
    ]),
    {
      event: "photo_wall_viewed",
      properties: { count: 2, submission_count: 3 },
    },
  );
});

test("routes loaded photo-wall submissions through the event classifier", () => {
  const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
  const wallSource = appSource.slice(
    appSource.indexOf("function PhotoWall("),
    appSource.indexOf("function SubmitModal("),
  );

  assert.match(wallSource, /const analytics = photoWallAnalytics\(r\);/);
  assert.match(wallSource, /track\(analytics\.event, analytics\.properties\);/);
  assert.doesNotMatch(wallSource, /track\("photo_wall_viewed"/);
});
