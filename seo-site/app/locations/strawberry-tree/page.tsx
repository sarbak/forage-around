import type { Metadata } from "next";
import Link from "next/link";
import {
  getSpecies,
  imagesForName,
  peakLabel,
  seasonLabel,
  trees,
} from "@/lib/data";
import { LocationsPageViewed, ToAppLink } from "../../analytics";
import { APP_URL, Credits } from "../../components";

const SPECIES_NAME = "Strawberry tree";
const PAGE_PATH = "/locations/strawberry-tree";
const MAP_URL = `${APP_URL}?ref=nearby_strawberry_tree`;

export const metadata: Metadata = {
  title: "Find Strawberry trees near you",
  description:
    "Find reported Strawberry tree spots, learn when Arbutus unedo fruit is usually ripe, and open the free Forage Around map to search near you.",
  alternates: {
    canonical: PAGE_PATH,
  },
};

const plant = getSpecies(SPECIES_NAME);
const strawberryTreeReports = trees.filter(
  (tree) => tree.type === SPECIES_NAME && tree.edible !== false,
);
const exampleReports = strawberryTreeReports.slice(0, 5);
const photo = imagesForName(SPECIES_NAME)[0] ?? null;

export default function StrawberryTreeLocationsPage() {
  if (!plant) return null;

  const usualSeason = seasonLabel(plant);
  const peak = peakLabel(plant);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Find Strawberry trees near you",
    description: metadata.description,
    url: PAGE_PATH,
    about: {
      "@type": "Thing",
      name: SPECIES_NAME,
      alternateName: "Arbutus unedo",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LocationsPageViewed
        pageType="species_nearby"
        slug="strawberry-tree"
        species={SPECIES_NAME}
      />

      <Link className="back-link" href="/locations">
        ← Nearby harvests
      </Link>
      <p className="kicker">Nearby Strawberry trees</p>
      <h1 className="title">Find Strawberry trees near you</h1>
      <p className="lead">
        Use reported spots as starting points, then search the live map near
        your address. A report does not guarantee that a tree is still there or
        that its fruit is ripe today.
      </p>

      <p style={{ margin: "22px 0" }}>
        <ToAppLink className="btn" href={MAP_URL} from="locations">
          Search the live map →
        </ToAppLink>{" "}
        <Link className="btn-outline" href="/species/strawberry-tree">
          Read the plant guide
        </Link>
      </p>

      {photo ? (
        <div style={{ margin: "20px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="photo"
            src={photo}
            alt="Strawberry tree with red Arbutus unedo fruit"
          />
        </div>
      ) : null}

      <h2 className="section">What to look for</h2>
      <p>{plant.note}</p>
      <div style={{ margin: "18px 0" }}>
        {usualSeason ? <span className="pill">Usually ripe: {usualSeason}</span> : null}
        {peak ? <span className="pill">Typical peak: {peak}</span> : null}
        {plant.part ? <span className="pill">Edible part: {plant.part}</span> : null}
      </div>
      <p className="muted">
        Seasons shift with weather and neighborhood conditions. Check the fruit
        and the report when you arrive instead of relying on the calendar alone.
      </p>

      <h2 className="section">Reported Strawberry tree spots</h2>
      <div className="card">
        <p style={{ marginTop: 0 }}>
          The bundled starter dataset contains{" "}
          <strong>{strawberryTreeReports.length} Strawberry tree reports</strong>.
          This is a full-dataset count, not a promise that one is close to you.
        </p>
        <p className="muted" style={{ marginBottom: 0 }}>
          Open a sample report to see its exact coordinates and a walking
          directions link, or use the live map to search around your address.
        </p>
      </div>
      <ul className="clean">
        {exampleReports.map((tree) => (
          <li key={tree.id}>
            <Link href={`/tree/${tree.id}`}>Strawberry tree report #{tree.id}</Link>{" "}
            <span className="muted">
              ({tree.lat.toFixed(3)}, {tree.lng.toFixed(3)})
            </span>
          </li>
        ))}
      </ul>

      <h2 className="section">How to find one near you</h2>
      <ol className="clean">
        <li>Open the map and search an address or share your location.</li>
        <li>Open a nearby report and check its date, notes, and exact position.</li>
        <li>Use walking directions only after confirming access is allowed.</li>
      </ol>
      <p>
        Prefer to start over? Go to the{" "}
        <Link href="/">Forage Around homepage</Link> and open the map from there.
      </p>

      {plant.uses.length > 0 || plant.preserve.length > 0 ? (
        <>
          <h2 className="section">Ways to use the fruit</h2>
          <ul className="clean">
            {plant.uses.slice(0, 2).map((use) => (
              <li key={use}>{use}</li>
            ))}
            {plant.preserve.slice(0, 1).map((method) => (
              <li key={method}>Preserve as: {method.toLowerCase()}</li>
            ))}
          </ul>
          <p>
            See the{" "}
            <Link href="/species/strawberry-tree">full Strawberry tree guide</Link>{" "}
            for the complete list.
          </p>
        </>
      ) : null}

      <h2 className="section">Before picking</h2>
      <p>
        Confirm the plant&apos;s identity, make sure public access is clear or you
        have permission, and follow local rules. Leave anything you cannot
        identify with confidence.
      </p>

      <p style={{ margin: "28px 0" }}>
        <ToAppLink className="btn" href={MAP_URL} from="locations">
          Find Strawberry tree reports →
        </ToAppLink>
      </p>

      <Credits />
    </>
  );
}
