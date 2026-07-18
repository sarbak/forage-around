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
  "See which fruit, herbs, and greens may be in season nearby, then use the free Forage Around map to check reported plant locations near you.";

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

function SpeciesGrid({
  items,
  statusMonth,
}: {
  items: SeasonalItem[];
  statusMonth?: number;
}) {
  return (
    <div className="species-grid">
      {items.map(({ name, details }) => (
        <Link key={name} href={`/species/${slugify(name)}`}>
          <span aria-hidden="true">{details.emoji ?? "🌿"}</span>
          <span className="species-grid-label">
            <span>{name}</span>
            {statusMonth ? (
              <small className="species-season-status">
                {details.peak?.includes(statusMonth)
                  ? `Typical peak in ${MONTHS[statusMonth - 1]}`
                  : `Broader season includes ${MONTHS[statusMonth - 1]}`}
              </small>
            ) : null}
          </span>
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
      <p className="kicker">
        Seasonal foraging guide · {currentMonthName}
      </p>
      <h1 className="title">What can I forage near me right now?</h1>
      <p className="lead">
        Start with plants whose typical season includes {currentMonthName}, then
        open the live map to check reported locations near you. This calendar is
        tuned for temperate and Mediterranean climates; weather and neighborhood
        conditions can move a season earlier or later.
      </p>

      <div className="seasonal-orientation" aria-label="Before you use the map">
        <strong>Before you use the map</strong>
        <p>
          Locations are reported leads, and season windows are typical. A month
          or peak label is not a local ripeness guarantee. Confirm the
          plant&apos;s identity and public access or permission before harvesting.
        </p>
      </div>

      <div className="locations-actions">
        <ToAppLink className="btn" href={APP_URL} from="seasonal_guide">
          Open seasonal finds on the map →
        </ToAppLink>
        <small className="locations-availability-note muted">
          Reported locations do not confirm ripeness
        </small>
      </div>

      <h2 className="section">Likely in season in {currentMonthName}</h2>
      <p className="muted">
        <strong>Typical peak in {currentMonthName}</strong> marks the narrower
        peak window in the guide data. <strong>Broader season includes{" "}
        {currentMonthName}</strong> means the plant&apos;s usual season spans this
        month without listing it as a peak. These labels do not confirm identity,
        edibility, or local ripeness, so check the linked species information
        before harvesting.
      </p>
      <SpeciesGrid items={currentItems} statusMonth={currentMonth} />

      <p className="muted">
        Looking for a place to start? Read the{" "}
        <Link href="/species/plum">Plum guide</Link> or the{" "}
        <Link href="/species/apple">Apple guide</Link>, then browse all{" "}
        <Link href="/locations">nearby harvest guides</Link>.
      </p>

      {peakNow.length > 0 ? (
        <>
          <h2 className="section">Typical peak this month</h2>
          <p className="muted">
            These entries list {currentMonthName} as a typical peak month in the
            climate-tuned calendar. Local timing may run earlier or later, so
            use the species page to learn more before opening the map.
          </p>
          <SpeciesGrid items={peakNow} />
        </>
      ) : null}

      <h2 className="section">Month-by-month guide</h2>
      <p className="muted">
        Use the full calendar when you are planning ahead or checking whether a
        tree is likely early, late, or out of season. These are typical windows,
        not local forecasts.
      </p>

      {MONTHS.map((month, index) => {
        const monthItems = allItems.filter(({ details }) =>
          details.season.includes(index + 1),
        );

        return (
          <section className="card" key={month}>
            <h3 style={{ margin: "0 0 4px" }}>{month}</h3>
            <p className="muted" style={{ marginTop: 0 }}>
              {monthItems.length} guide
              {monthItems.length === 1 ? " entry" : " entries"} are usually in
              season.
            </p>
            <SpeciesGrid items={monthItems} />
          </section>
        );
      })}

      <h2 className="section">How to use this responsibly</h2>
      <ul className="clean">
        <li>
          Use the season window to decide what is worth checking today, not as a
          report that a mapped plant is ready.
        </li>
        <li>
          Use the linked description and photo as a starting point, then verify
          the plant and edible part with a trusted local source.
        </li>
        <li>If the details do not match or you are unsure, leave it.</li>
        <li>Open the live map when you are ready to check nearby locations.</li>
        <li>Confirm local rules and whether you are welcome to pick.</li>
      </ul>

      <Credits />
    </>
  );
}
