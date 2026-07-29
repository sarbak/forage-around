import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { coverageRadius, Find } from "./lib";

function findAt(distM: number): Find {
  return {
    id: String(distM),
    type: "Apple",
    lat: 0,
    lng: 0,
    desc: "",
    species: {
      edible: true,
      cat: "fruit",
      emoji: "🍎",
      part: "Fruit",
      season: [7],
      note: "",
      uses: [],
      preserve: [],
    },
    images: [],
    wiki: "Apple",
    seasonKnown: true,
    distM,
    inSeason: true,
    atPeak: false,
  };
}

test("names the result radius from the farthest displayed location", () => {
  assert.equal(coverageRadius([findAt(240), findAt(1840), findAt(810)]), "1.8 km");
  assert.equal(coverageRadius([findAt(120), findAt(844)]), "840 m");
  assert.equal(coverageRadius([]), null);
});

test("keeps list counts while naming the list radius and 10-minute map scope", () => {
  const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");

  assert.match(
    appSource,
    /`\$\{inSeasonCount\} likely in season\$\{listRadius \? ` within \$\{listRadius\}` : ""\}`/,
  );
  assert.match(
    appSource,
    /`\$\{edibleCount\} edible\$\{listRadius \? ` within \$\{listRadius\}` : ""\} · \$\{inSeasonCount\} likely in season`/,
  );
  assert.match(appSource, /`\$\{mapFinds\.length\} within a 10-minute walk`/);
});
