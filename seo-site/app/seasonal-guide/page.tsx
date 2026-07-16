import type { Metadata } from "next";
import Link from "next/link";
import {
  allSpeciesNames,
  MONTHS,
  peakLabel,
  seasonLabel,
  slugify,
  species,
  type Species,
} from "@/lib/data";
import { SeasonalGuidePageViewed, ToAppLink } from "../analytics";
import { APP_URL, Credits } from "../components";

export const revalidate = 86400;

const META_TITLE = "What can I forage near me right now? | Forage Around";
const META_DESCRIPTION =
  "See which fruit, herbs, and greens may be in season nearby, then use the free Forage Around map to check reported edible plants near you.";

export const metadata: Metadata = {
  title: "What can I forage near me right now?",
  description: META_DESCRIPTION,
  alternates: {
    canonical: "/seasonal-guide",
  },
  openGraph: {
    type: "website",
    title: META_TITLE,
    description: META_DESCRIPTION,
    url: "/seasonal-guide",
  },
  twitter: {
    card: "summary",
    title: META_TITLE,
    description: META_DESCRIPTION,
  },
};

type SeasonalItem = {
  name: string;
  details: Species;
  season: string | null;
  peak: string | null;
};

function seasonalSpecies(): SeasonalItem[] {
  return allSpeciesNames()
    .filter((name) => species[name]?.edible && species[name]?.season.length > 0)
    .map((name) => ({
      name,
      details: species[name],
      season: seasonLabel(species[name]),
      peak: peakLabel(species[name]),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function monthNumber() {
  return new Date().getUTCMonth() + 1;
}

function SpeciesGrid({ items }: { items: SeasonalItem[] }) {
  return (
    <div className="species-grid">
      {items.map(({ name, details }) => (
        <Link key={name} href={`/species/${slugify(name)}`}>
          <span>{details.emoji ?? "🌿"}</span>
          <span>{name}</span>
        </Link>
      ))}
    </div>
  );
}

export default function SeasonalGuide() {
  const currentMonth = monthNumber();
  const currentMonthName = MONTHS[currentMonth - 1];
  const allItems = seasonalSpecies();
  const currentItems = allItems.filter(({ details }) =>
    details.season.includes(currentMonth),
  );
  const peakNow = currentItems.filter(({ details }) =>
    details.peak?.includes(currentMonth),
  );

  return (
    <>
      <SeasonalGuidePageViewed />
      <p className="kicker">Seasonal foraging guide</p>
      <h1 className="title">What can I forage near me right now?</h1>
      <p className="lead">
        Start with the plants that are usually in season this month, then open
        the live map to see what may be growing near you. Seasons vary by
        weather and neighborhood, so treat this as a useful starting point.
      </p>

      <div className="locations-actions">
        <ToAppLink className="btn" href={APP_URL} from="seasonal_guide">
          Open seasonal finds on the map →
        </ToAppLink>
        <small className="locations-availability-note muted">
          Season windows are typical, not a ripeness check
        </small>
      </div>

      <h2 className="section">Likely ripe in {currentMonthName}</h2>
      <p className="muted">
        These are the edible plants in the guide with {currentMonthName} in
        their usual season window. Confirm the plant and picking rules before
        harvesting.
      </p>
      <SpeciesGrid items={currentItems} />

      <p className="muted">
        Looking for a place to start? Read the{" "}
        <Link href="/species/plum">Plum guide</Link> or the{" "}
        <Link href="/species/apple">Apple guide</Link>, then browse all{" "}
        <Link href="/locations">nearby harvest guides</Link>.
      </p>

      {peakNow.length > 0 ? (
        <>
          <h2 className="section">Peaking now</h2>
          <p className="muted">
            These entries list {currentMonthName} as a peak month, so they are
            especially good pages to check before opening the map.
          </p>
          <SpeciesGrid items={peakNow} />
        </>
      ) : null}

      <h2 className="section">Month-by-month guide</h2>
      <p className="muted">
        Use the full calendar when you are planning ahead or checking whether a
        tree is likely early, late, or out of season.
      </p>

      {MONTHS.map((month, index) => {
        const monthItems = allItems.filter(({ details }) =>
          details.season.includes(index + 1),
        );

        return (
          <section className="card" key={month}>
            <h3 style={{ margin: "0 0 4px" }}>{month}</h3>
            <p className="muted" style={{ marginTop: 0 }}>
              {monthItems.length} edible guide
              {monthItems.length === 1 ? " entry" : " entries"} are usually in
              season.
            </p>
            <SpeciesGrid items={monthItems} />
          </section>
        );
      })}

      <h2 className="section">How to use this responsibly</h2>
      <ul className="clean">
        <li>Use the season window to decide what is worth looking for today.</li>
        <li>Open the live map when you are ready to check nearby locations.</li>
        <li>Confirm the plant, local rules, and whether you are welcome to pick.</li>
      </ul>

      <Credits />
    </>
  );
}
