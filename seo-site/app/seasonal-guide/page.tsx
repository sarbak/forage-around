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

export const metadata: Metadata = {
  title: "What can I forage near me right now? | Forage Around",
  description:
    "See what fruit, herbs, and greens are likely in season this month, then open the Forage Around map to check nearby Falling Fruit locations.",
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

function MonthLink({
  month,
  current,
}: {
  month: string;
  current: boolean;
}) {
  return (
    <a className={current ? "pill active-pill" : "pill"} href={`#${month.toLowerCase()}`}>
      {month}
    </a>
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
      <p className="kicker">Foraging near me</p>
      <h1 className="title">What can I forage near me right now?</h1>
      <p className="lead">
        Start with what is usually in season in {currentMonthName}, then open
        the live map to check nearby crowd-sourced locations. Seasons vary by
        weather, access, and neighborhood, so use this page as a careful
        starting point, not a guarantee.
      </p>

      <p style={{ margin: "22px 0" }}>
        <ToAppLink className="btn" href={APP_URL} from="seasonal_guide">
          Check the live map near me →
        </ToAppLink>
      </p>

      <div className="card">
        <p style={{ marginTop: 0 }}>
          The map locations come from Falling Fruit and are crowd-sourced,
          provided as-is, and used under CC BY-NC-SA. Forage Around adds a
          curated season window and plant guide on top.
        </p>
        <p className="muted" style={{ marginBottom: 0 }}>
          Before picking, confirm the plant yourself and make sure the spot is
          public or you have permission.
        </p>
      </div>

      <h2 className="section">Likely ripe in {currentMonthName}</h2>
      <p className="muted">
        These are the edible plants in the guide with {currentMonthName} in
        their usual season window. Open the map when you are ready to check
        which reported locations are actually near you.
      </p>
      <SpeciesGrid items={currentItems} />

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

      <h2 className="section">How this answers “foraging near me”</h2>
      <ul className="clean">
        <li>Use the month to narrow the plants worth looking for today.</li>
        <li>Open the map to search your location or use your device location.</li>
        <li>Open a nearby plant detail to check distance, season, and source.</li>
        <li>Use walking directions only after confirming access and identity.</li>
      </ul>

      <p style={{ margin: "22px 0" }}>
        <ToAppLink className="btn" href={APP_URL} from="seasonal_guide">
          Find what is near me →
        </ToAppLink>{" "}
        <Link className="btn-outline" href="/about">
          Where the data comes from
        </Link>
      </p>

      <h2 className="section">Month-by-month guide</h2>
      <p className="muted">
        Use the full calendar when you are planning ahead or checking whether a
        tree is likely early, late, or out of season.
      </p>
      <p>
        {MONTHS.map((month, index) => (
          <MonthLink
            key={month}
            month={month}
            current={index + 1 === currentMonth}
          />
        ))}
      </p>

      {MONTHS.map((month, index) => {
        const monthItems = allItems.filter(({ details }) =>
          details.season.includes(index + 1),
        );

        return (
          <section className="card" key={month} id={month.toLowerCase()}>
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
