import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const homepageDocument = readFileSync(
  new URL("../public/index.html", import.meta.url),
  "utf8",
);
const vercelConfig = JSON.parse(
  readFileSync(new URL("../../vercel.json", import.meta.url), "utf8"),
) as { rewrites: { source: string; destination: string }[] };
const landingSource = appSource.slice(
  appSource.indexOf("function Landing("),
  appSource.indexOf("function FooterLink("),
);

test("leads first-time visitors with the nearby wild-food promise", () => {
  assert.match(landingSource, /Find likely-ripe wild food near you/);
  assert.match(landingSource, /No account required\./);
  assert.match(landingSource, /<Text style=\{styles\.ctaText\}>Use my location<\/Text>/);
});

test("describes the nearby wild-food map in homepage search metadata", () => {
  const title = "Find nearby wild food on the map | Forage Around";
  const description =
    "Find nearby wild food on an interactive map, see what is likely in season, and explore plant guides with Forage Around. No account required.";

  assert.equal(homepageDocument.match(/<title>/g)?.length, 1);
  assert.ok(homepageDocument.includes(`<title>${title}</title>`));
  assert.equal(homepageDocument.match(/name="description"/g)?.length, 1);
  assert.ok(homepageDocument.includes(`content="${description}"`));
});

test("keeps address search visually secondary to the location action", () => {
  assert.match(landingSource, /<Text style=\{styles\.addrGoText\}>Search<\/Text>/);
  assert.match(appSource, /cta: \{\s+backgroundColor: C\.ripe,/);
  assert.match(
    appSource,
    /addrGo: \{ backgroundColor: C\.white, borderWidth: 1, borderColor: C\.forest,/,
  );
});

test("shows a truthful map preview before a visitor searches", () => {
  assert.match(landingSource, /Map preview/);
  assert.match(landingSource, /Search to see reported plants near you/);
  assert.match(landingSource, /finds=\{\[\]\}/);
  assert.match(landingSource, /showCenterMarker=\{false\}/);
});

test("connects the homepage to each monthly guide and the Oakland guide", () => {
  const guides = [
    ["/seasonal-guide/august", "What to forage in August"],
    ["/seasonal-guide/september", "What to forage in September"],
    ["/seasonal-guide/october", "What to forage in October"],
    ["/seasonal-guide/november", "What to forage in November"],
    ["/seasonal-guide/december", "What to forage in December"],
    ["/seasonal-guide/january", "What to forage in January"],
    ["/locations/oakland", "Foraging around Oakland"],
  ];

  for (const [path, label] of guides) {
    assert.ok(appSource.includes(`path: "${path}"`), `${path} is missing from the homepage`);
    assert.ok(appSource.includes(`label: "${label}"`), `${path} needs a descriptive label`);
  }

  assert.ok(
    landingSource.indexOf("styles.discoverySection") > landingSource.indexOf("styles.seasonCard"),
    "discovery links must sit below the primary map journey",
  );
});

test("keeps nested seasonal guides reachable through the homepage deployment", () => {
  assert.deepEqual(
    vercelConfig.rewrites.find(({ source }) => source === "/seasonal-guide/:path*"),
    {
      source: "/seasonal-guide/:path*",
      destination: "https://forage-around-seo.vercel.app/seasonal-guide/:path*",
    },
  );
});

test("keeps discovery links tertiary to the orange location action", () => {
  assert.match(appSource, /discoveryLinkText: \{\s+color: C\.forest,/);
  assert.match(appSource, /discoveryPlaceLinkText: \{ color: C\.forest,/);
  assert.doesNotMatch(appSource, /discovery(?:Link|PlaceLink)(?:Text)?: \{[^}]*C\.ripe/);
});
