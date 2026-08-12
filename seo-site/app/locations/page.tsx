import type { Metadata } from "next";
import Link from "next/link";
import {
  MONTHS,
  allSpeciesNames,
  emojiForName,
  peakLabel,
  seasonLabel,
  slugify,
  species,
  trees,
  type Species,
} from "@/lib/data";
import { LocationsPageViewed, ToAppLink } from "../analytics";
import { APP_URL, Credits } from "../components";
import { cityHarvests } from "@/lib/city-harvests";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Fruit near me: what's usually ripe nearby",
  description:
    "See what fruit and edible plants may be ripe near you this month, browse practical plant guides, and open the free Forage Around map.",
  alternates: {
    canonical: "/locations",
  },
};

type HarvestItem = {
  name: string;
  details: Species;
  reportCount: number;
  isPeak: boolean;
};

const edibleTrees = trees.filter((tree) => tree.edible !== false);

const reportCounts = edibleTrees.reduce((counts, tree) => {
  if (!species[tree.type]?.edible) return counts;
  counts.set(tree.type, (counts.get(tree.type) ?? 0) + 1);
  return counts;
}, new Map<string, number>());

const edibleSpeciesCount = allSpeciesNames().filter(
  (name) => species[name]?.edible,
).length;

function currentMonthNumber() {
  return new Date().getUTCMonth() + 1;
}

function inSeasonHarvests(month: number): HarvestItem[] {
  return allSpeciesNames()
    .filter(
      (name) =>
        species[name]?.edible &&
        species[name].season.includes(month) &&
        reportCounts.has(name),
    )
    .map((name) => ({
      name,
      details: species[name],
      reportCount: reportCounts.get(name) ?? 0,
      isPeak: species[name].peak?.includes(month) ?? false,
    }))
    .sort(
      (a, b) =>
        Number(b.isPeak) - Number(a.isPeak) ||
        b.reportCount - a.reportCount ||
        a.name.localeCompare(b.name),
    );
}

export default function LocationsPage() {
  const currentMonth = currentMonthNumber();
  const currentMonthName = MONTHS[currentMonth - 1];
  const currentHarvests = inSeasonHarvests(currentMonth);

  return (
    <>
      <LocationsPageViewed />
      <p className="kicker">Nearby harvests</p>
      <h1 className="title">Find fruit and edible plants near you</h1>
      <p className="lead">
        Start with what may be ripe this month, learn how to identify and use
        each plant, then open the map to search around your address.
      </p>

      <div className="locations-actions">
        <ToAppLink className="btn" href={APP_URL} from="locations">
          Search the live map →
        </ToAppLink>
        <small className="locations-availability-note muted">
          Reports are a starting point, not live availability
        </small>
        <Link className="btn-outline" href="/seasonal-guide">
          See the full season guide
        </Link>
      </div>

      <div className="card">
        <p style={{ marginTop: 0 }}>
          Forage Around combines {edibleTrees.length.toLocaleString()} reported
          harvest points in its bundled starter dataset with season notes and
          guides for {edibleSpeciesCount.toLocaleString()} edible plants.
        </p>
        <p className="muted" style={{ marginBottom: 0 }}>
          Reports are starting points, not live inventory. Confirm the plant,
          current conditions, and permission to pick when you arrive.
        </p>
      </div>

      <h2 className="section">Explore a nearby harvest guide</h2>
      <p className="muted">
        Start with a city guide or a focused plant page, then use your address
        on the live map to narrow the search.
      </p>
      <div className="species-grid">
        {cityHarvests.map((city) => (
          <Link key={city.slug} href={`/locations/${city.slug}`}>
            <span aria-hidden="true">📍</span>
            <span>
              {city.slug === "seattle"
                ? "Foraging in Seattle"
                : `${city.name} harvest guide`}
              <br />
              <small className="muted">
                {city.slug === "seattle"
                  ? "Fruit, nuts, usual seasons, and the local map"
                  : `Fruit and edible plants in ${city.region}`}
              </small>
            </span>
          </Link>
        ))}
        <Link href="/locations/berkeley/fig-season">
          <span aria-hidden="true">🌿</span>
          <span>
            Fig tree season near Berkeley
            <br />
            <small className="muted">
              Timing, ripeness checks, and the local fig map
            </small>
          </span>
        </Link>
        <Link href="/locations/berkeley/plum-season">
          <span aria-hidden="true">🌿</span>
          <span>
            Plum season in Berkeley
            <br />
            <small className="muted">
              California timing, ripe-fruit checks, and local reports
            </small>
          </span>
        </Link>
        <Link href="/locations/berkeley/loquat-season">
          <span aria-hidden="true">🌿</span>
          <span>
            Loquat season in Berkeley
            <br />
            <small className="muted">
              Spring timing, field clues, and local reports
            </small>
          </span>
        </Link>
        <Link href="/locations/pawpaw-fruit-map">
          <span aria-hidden="true">🌿</span>
          <span>
            Pawpaw fruit map
            <br />
            <small className="muted">
              Native range, season, and reported tree checks
            </small>
          </span>
        </Link>
        <Link href="/locations/strawberry-tree">
          <span aria-hidden="true">🍓</span>
          <span>
            Strawberry trees near you
            <br />
            <small className="muted">Season timing and starter reports</small>
          </span>
        </Link>
        <Link href="/locations/public-fruit-trees">
          <span aria-hidden="true">🌳</span>
          <span>
            Public fruit trees near you
            <br />
            <small className="muted">
              Map reports, ownership checks, and picking guidance
            </small>
          </span>
        </Link>
        <Link href="/edible-wild-plants">
          <span aria-hidden="true">🌿</span>
          <span>
            12 edible wild plants
            <br />
            <small className="muted">
              Visual clues, usual seasons, and safety checks
            </small>
          </span>
        </Link>
      </div>

      <h2 className="section">What may be ripe in {currentMonthName}</h2>
      <p className="muted">
        These plants include {currentMonthName} in their usual season window and
        have at least one report in the starter dataset. Weather and local
        conditions can move a season earlier or later.
      </p>

      {currentHarvests.length > 0 ? (
        <div className="species-grid">
          {currentHarvests.map(({ name, details, reportCount, isPeak }) => {
            const usualSeason = seasonLabel(details);
            const typicalPeak = peakLabel(details);

            return (
              <Link key={name} href={`/species/${slugify(name)}`}>
                <span>{emojiForName(name)}</span>
                <span>
                  {name}
                  <br />
                  <small className="muted">
                    {reportCount.toLocaleString()} starter
                    {reportCount === 1 ? " report" : " reports"}
                    {isPeak && typicalPeak
                      ? ` · peak ${typicalPeak}`
                      : usualSeason
                        ? ` · usually ${usualSeason}`
                        : ""}
                  </small>
                </span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <p style={{ margin: 0 }}>
            The starter dataset does not have an in-season match for this month.
            Use the full season guide to plan ahead, or open the map to explore
            nearby reports.
          </p>
        </div>
      )}

      <h2 className="section">How to use a reported spot</h2>
      <ol className="clean">
        <li>Open the map and search an address or share your location.</li>
        <li>Choose a nearby report and read its plant guide.</li>
        <li>Check the report, access rules, and ripeness when you arrive.</li>
        <li>Take only what you can identify and use.</li>
      </ol>

      <p>
        Looking ahead? The <Link href="/seasonal-guide">seasonal guide</Link>{" "}
        shows the full year month by month.
      </p>

      <p style={{ margin: "28px 0" }}>
        <ToAppLink className="btn" href={APP_URL} from="locations">
          Find nearby harvests →
        </ToAppLink>
      </p>

      <Credits />
    </>
  );
}
