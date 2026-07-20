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
import {
  ControlledJourneyLink,
  SeasonalGuidePageViewed,
  ToAppLink,
} from "../analytics";
import { APP_URL, Credits } from "../components";

export const revalidate = 86400;

const META_TITLE = "What can I forage near me right now? | Forage Around";
const META_DESCRIPTION =
  "See which fruit, herbs, and greens may be in season nearby, then use the free Forage Around map to check reported plant locations near you.";

const FAQS = [
  {
    question: "Does an in-season label mean a nearby plant is ripe?",
    answer:
      "No. It means the month falls within a typical season window. Local weather and site conditions can shift timing, so check the plant itself before harvesting.",
  },
  {
    question: "Does a map report mean I can enter or pick there?",
    answer:
      "No. A report is a lead, not proof of ownership, public access, or permission. Confirm land status, local rules, and permission before entering or picking.",
  },
  {
    question: "How do I find reported plants near me?",
    answer:
      "Start with this month’s species guides, then open the map to check reported locations near you. You can also browse the Seattle and Berkeley location guides.",
  },
] as const;

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
};

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

function seasonalSpeciesHref(name: string) {
  return `/species/${slugify(name)}?map_source=seasonal_guide`;
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
        <ControlledJourneyLink key={name} href={seasonalSpeciesHref(name)}>
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
        </ControlledJourneyLink>
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
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
        <p>
          See which plants are typically in season, then open the map to check
          reported locations near you. Season labels do not confirm ripeness or
          plant identity, and reports do not establish ownership, public access,
          or permission to enter or pick. Verify the plant and site before
          harvesting.
        </p>
      </div>

      <div className="locations-actions">
        <ToAppLink className="btn" href={APP_URL} from="seasonal_guide">
          Open seasonal finds on the map →
        </ToAppLink>
        <small className="locations-availability-note muted">
          Reports do not confirm ripeness, public access, or permission to pick
        </small>
      </div>

      <h2 className="section">Likely in season in {currentMonthName}</h2>
      <p className="muted">
        <strong>Typical peak in {currentMonthName}</strong> marks the narrower
        peak window in the guide data. <strong>Broader season includes{" "}
        {currentMonthName}</strong> means the plant&apos;s usual season spans this
        month without listing it as a peak. These labels do not confirm identity,
        edibility, or local ripeness, so check the linked species information
        before harvesting. Species guides do not confirm access at a reported
        location.
      </p>
      <SpeciesGrid items={currentItems} statusMonth={currentMonth} />

      <p className="muted">
        Looking for a place to start? Read the{" "}
        <ControlledJourneyLink href={seasonalSpeciesHref("Plum")}>
          Plum guide
        </ControlledJourneyLink>{" "}
        or the{" "}
        <ControlledJourneyLink href={seasonalSpeciesHref("Apple")}>
          Apple guide
        </ControlledJourneyLink>
        {", then try the "}
        <Link href="/locations/seattle">Seattle guide</Link> or the{" "}
        <Link href="/locations/berkeley">Berkeley guide</Link>. You can also
        browse all <Link href="/locations">nearby location guides</Link>.
      </p>

      <section className="faq-block" aria-labelledby="seasonal-faq-heading">
        <h2 className="section" id="seasonal-faq-heading">
          Questions before you forage
        </h2>
        <div className="faq-list">
          {FAQS.map(({ question, answer }) => (
            <div key={question}>
              <h3>{question}</h3>
              <p>{answer}</p>
            </div>
          ))}
        </div>
      </section>

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
        <li>
          Open the live map when you are ready to check nearby reports; a marker
          does not establish ownership, public access, or picking rights.
        </li>
        <li>
          Before entering or picking, confirm land status, local rules, and
          permission from whoever controls the site.
        </li>
      </ul>

      <Credits />
    </>
  );
}
