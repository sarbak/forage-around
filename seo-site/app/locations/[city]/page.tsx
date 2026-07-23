import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Credits, APP_URL } from "@/app/components";
import { LocationsPageViewed, ToAppLink } from "@/app/analytics";
import {
  cityHarvestFromSlug,
  cityHarvests,
  type CityHarvest,
} from "@/lib/city-harvests";
import {
  MONTHS,
  emojiForName,
  peakLabel,
  seasonLabel,
  slugify,
  species,
} from "@/lib/data";

export const revalidate = 86400;

type PageProps = {
  params: Promise<{ city: string }>;
};

const SEATTLE_FAQS = [
  {
    question: "What can you forage in Seattle?",
    answer:
      "Forage Around's Seattle data includes reports for plums, cherries, apples, crabapples, strawberry tree fruit, hawthorn, chestnuts, and walnuts. The wider map also includes other edible plants, but every report needs an on-site identity, ripeness, access, and permission check.",
  },
  {
    question: "When is the best time to forage in Seattle?",
    answer:
      "The broadest fruit-and-nut window in this guide runs from early summer into fall. Cherries and plums usually lead, apples and crabapples follow, and nuts and late fruit extend the season into autumn and early winter. Weather and individual trees can shift those windows.",
  },
  {
    question: "Does a map point mean I am allowed to pick there?",
    answer:
      "No. A crowd-sourced report does not establish ownership, public access, or permission to harvest. Check property boundaries, posted rules, and the current land manager's guidance, and ask the owner before picking on private property.",
  },
  {
    question: "Does Forage Around identify mushrooms?",
    answer:
      "No. This Seattle guide focuses on edible fruit, nuts, and other plants represented in the map data. Mushroom identification carries different risks and should be learned through an experienced local guide or a trusted regional resource.",
  },
  {
    question: "Are the Seattle reports live availability?",
    answer:
      "No. Reports may be old, incomplete, inaccessible, or out of season. Use them as leads for a walk, then verify the plant, current fruit, site access, and local rules when you arrive.",
  },
] as const;

const SEATTLE_FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: SEATTLE_FAQS.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: {
      "@type": "Answer",
      text: answer,
    },
  })),
};

export function generateStaticParams() {
  return cityHarvests.map(({ slug }) => ({ city: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: slug } = await params;
  const city = cityHarvestFromSlug(slug);
  if (!city) return {};

  const title =
    city.slug === "seattle"
      ? "Seattle foraging: fruit, nuts and a map"
      : `Find fruit and edible plants in ${city.name}`;
  const description =
    city.slug === "seattle"
      ? "Plan a Seattle foraging walk with usual seasons for plums, cherries, apples, nuts, and more, then search crowd-sourced reports near your address."
      : `Explore usual harvest seasons for edible plants represented around ${city.name}, then search the live Forage Around map near your address.`;
  const currentMonthName = MONTHS[new Date().getUTCMonth()];
  const shareTitle =
    city.slug === "seattle"
      ? "Seattle foraging: fruit, nuts and a map | Forage Around"
      : `Typical ${currentMonthName} foraging in ${city.name} | Forage Around`;

  return {
    title,
    description,
    alternates: { canonical: `/locations/${city.slug}` },
    openGraph: {
      title: shareTitle,
      description,
      url: `/locations/${city.slug}`,
    },
    twitter: {
      title: shareTitle,
      description,
    },
  };
}

function plantsForCity(city: CityHarvest, month: number) {
  return city.plantNames
    .map((name) => ({ name, details: species[name] }))
    .filter((plant) => plant.details?.edible)
    .sort((a, b) => {
      const aInSeason = a.details.season.includes(month) ? 0 : 1;
      const bInSeason = b.details.season.includes(month) ? 0 : 1;
      const aAtPeak = a.details.peak?.includes(month) ? 0 : 1;
      const bAtPeak = b.details.peak?.includes(month) ? 0 : 1;
      return aInSeason - bInSeason || aAtPeak - bAtPeak;
    });
}

function SeattleSeasonGuide() {
  return (
    <>
      <h2 className="section">A practical Seattle foraging starting point</h2>
      <p>
        Seattle foraging does not have to begin with a remote trail or a
        specialist trip. Fruit trees, nut trees, and edible landscape plants can
        turn an ordinary neighborhood walk into a useful seasonal check. Forage
        Around helps with that first planning step: search an address, review
        crowd-sourced plant reports nearby, read the linked plant guide, and
        decide which leads are worth checking on foot.
      </p>
      <p>
        This guide is deliberately focused on fruit, nuts, and other edible
        plants represented in Forage Around. It is not a mushroom-identification
        guide, a promise that food is available today, or a substitute for
        permission. If you are looking for a guided mushroom or shellfish
        experience, a local expert is a better fit. If you want to plan a
        self-guided walk around reported urban plants, start here.
      </p>

      <h2 className="section">Seattle fruit and nut calendar</h2>
      <p className="muted">
        These are broad planning windows from the plant-guide data, not a local
        forecast. A cool spring, a hot spell, elevation, shade, and the condition
        of one tree can all move the date. Open each plant guide for edible parts,
        use ideas, and preservation notes.
      </p>
      <div className="city-season-grid">
        <section className="card">
          <p className="kicker">Late spring to midsummer</p>
          <h3>Cherries, then plums</h3>
          <p>
            <Link href="/species/cherry">Cherries</Link> usually run from May
            through July, with June as the typical peak in this guide.{" "}
            <Link href="/species/plum">Plums</Link> usually follow from June
            through August, peaking in July. Color alone does not confirm
            ripeness, so check the fruit&apos;s texture and the linked guide.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Late summer into fall</p>
          <h3>Apples take over</h3>
          <p>
            <Link href="/species/apple">Apples</Link> usually span August through
            October, with September as the typical peak. Fallen fruit can be a
            useful timing clue, but it can also be damaged or contaminated. Check
            the tree, the site, and whether the fruit is sound.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Early to late fall</p>
          <h3>Crabapples, haws, and nuts</h3>
          <p>
            <Link href="/species/crabapple">Crabapples</Link> usually arrive in
            September and October. <Link href="/species/hawthorn">Hawthorn</Link>
            , <Link href="/species/walnut">walnuts</Link>, and{" "}
            <Link href="/species/chestnut">chestnuts</Link> carry the guide into
            fall. Read the species guidance carefully: edible parts and
            preparation differ, and chestnuts should be cooked.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Late fall to early winter</p>
          <h3>Strawberry tree fruit</h3>
          <p>
            <Link href="/species/strawberry-tree">Strawberry tree</Link> usually
            spans October through December, with November as the typical peak.
            The fruit is best when fully red and soft. Confirm the plant as
            Arbutus unedo rather than relying on the fruit alone.
          </p>
        </section>
      </div>
    </>
  );
}

function SeattlePlanningGuide({
  mapHref,
}: {
  mapHref: string;
}) {
  return (
    <>
      <h2 className="section">How to plan a Seattle foraging walk</h2>
      <ol className="clean">
        <li>
          <strong>Start close to where you will actually walk.</strong> Search a
          neighborhood, street, or Seattle address instead of scanning the whole
          city.
        </li>
        <li>
          <strong>Treat every report as a lead.</strong> Open a marker, check the
          reported plant and usual season, and read the species guide before
          deciding to visit.
        </li>
        <li>
          <strong>Compare a few nearby reports.</strong> One stale or inaccessible
          point should not define the outing. A short cluster gives you useful
          alternatives.
        </li>
        <li>
          <strong>Check access before directions.</strong> A coordinate can sit
          on private property or land with its own harvest rules. Confirm the site
          before you start walking.
        </li>
        <li>
          <strong>Verify again when you arrive.</strong> Match the plant, edible
          part, current ripeness, and site conditions. If anything is uncertain,
          leave it.
        </li>
      </ol>
      <p>
        The map opens Google Maps for walking directions only after you choose a
        report. It does not calculate a multi-stop foraging route or save places,
        so keep the outing small and use the report list as your planning notes.
      </p>

      <h2 className="section">Before you harvest in Seattle</h2>
      <div className="seasonal-orientation">
        <p>
          <strong>Identity:</strong> common names and photos are a starting point,
          not proof. Confirm the species and edible part with a trusted local
          source. If you are unsure, do not eat it.
        </p>
        <p>
          <strong>Access:</strong> a pin does not show ownership or permission.
          Check property boundaries, posted signs, and current rules from the
          person or agency responsible for the site. Ask before picking on private
          property.
        </p>
        <p>
          <strong>Site conditions:</strong> skip plants exposed to obvious
          spraying, heavy roadside pollution, pet waste, or other contamination.
          Wash what you collect and take only what you can use.
        </p>
      </div>
      <p>
        Want the month-by-month view before choosing a plant? Use the{" "}
        <Link href="/seasonal-guide">seasonal foraging guide</Link>. To compare
        with another local page or return to the broader index, browse{" "}
        <Link href="/locations">nearby harvest guides</Link>. You can also read{" "}
        <Link href="/about">how Forage Around sources its reports</Link>.
      </p>

      <section className="faq-block" aria-labelledby="seattle-faq-heading">
        <h2 className="section" id="seattle-faq-heading">
          Seattle foraging questions
        </h2>
        <div className="faq-list">
          {SEATTLE_FAQS.map(({ question, answer }) => (
            <div key={question}>
              <h3>{question}</h3>
              <p>{answer}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="locations-actions">
        <ToAppLink className="btn" href={mapHref} from="locations">
          Open the Seattle foraging map
        </ToAppLink>
        <small className="locations-availability-note muted">
          Reports are leads, not live availability or permission
        </small>
      </div>
    </>
  );
}

export default async function CityHarvestPage({ params }: PageProps) {
  const { city: slug } = await params;
  const city = cityHarvestFromSlug(slug);
  if (!city) notFound();

  const currentMonth = new Date().getUTCMonth() + 1;
  const currentMonthName = MONTHS[currentMonth - 1];
  const plants = plantsForCity(city, currentMonth);
  const mapParams = new URLSearchParams({
    ref: `nearby_harvest_${city.slug}`,
    location: city.searchLabel,
  });
  const mapHref = `${APP_URL}?${mapParams.toString()}`;
  const mapActionLabel =
    city.slug === "seattle"
      ? "Open the Seattle foraging map"
      : `Open the map and search ${city.name} →`;
  const isSeattle = city.slug === "seattle";

  return (
    <>
      <LocationsPageViewed
        pageType="city"
        slug={city.slug}
        city={city.name}
      />
      {isSeattle ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(SEATTLE_FAQ_SCHEMA) }}
        />
      ) : null}
      <p className="kicker">
        {isSeattle ? "Seattle foraging guide" : `${city.name} harvest guide`}
      </p>
      <h1 className="title">
        {isSeattle
          ? "Foraging in Seattle: fruit, nuts, and a neighborhood map"
          : `Find fruit and edible plants in ${city.name}`}
      </h1>
      <p className="lead">
        {isSeattle
          ? "Plan a self-guided Seattle foraging walk with usual seasons for cherries, plums, apples, crabapples, nuts, and late fruit, then search crowd-sourced reports near your address."
          : `Learn the usual ripening windows for plants represented around ${city.name}, then use the live map to check crowd-sourced reports near your address.`}
      </p>

      <div className="locations-actions">
        <ToAppLink className="btn" href={mapHref} from="locations">
          {mapActionLabel}
        </ToAppLink>
        <small className="locations-availability-note muted">
          Reports are leads, not live availability or permission
        </small>
        {!isSeattle ? (
          <Link className="btn-outline" href="/seasonal-guide">
            Open the seasonal foraging guide
          </Link>
        ) : null}
      </div>

      <div className="card">
        <p style={{ marginTop: 0 }}>{city.localContext}</p>
        <p className="muted" style={{ marginBottom: 0 }}>
          Map reports change and may be incomplete. A listed plant is not a
          promise that fruit is present, accessible, or ripe today.
        </p>
      </div>

      {isSeattle ? <SeattleSeasonGuide /> : null}

      <h2 className="section">Plant guides for {city.name}</h2>
      <p className="muted">
        These edible plants are represented in current Falling Fruit map data
        around {city.name}. Use their usual seasons to plan, then check the live
        report before making a trip.
      </p>
      <p className="muted">
        <strong>Typical peak in {currentMonthName}</strong> marks the narrower
        peak window in the guide data. <strong>Broader season includes{" "}
        {currentMonthName}</strong> means the usual season includes this month
        without listing it as a peak. Local weather and neighborhood conditions
        can shift timing earlier or later, and no label confirms that a reported
        plant is ripe or available.
      </p>
      <div className="species-grid">
        {plants.map(({ name, details }) => {
          const season = seasonLabel(details);
          const peak = peakLabel(details);
          const inSeasonNow = details.season.includes(currentMonth);
          return (
            <Link key={name} href={`/species/${slugify(name)}`}>
              <span aria-hidden="true">{emojiForName(name)}</span>
              <span className="species-grid-label">
                <span>{name}</span>
                {inSeasonNow ? (
                  <small className="species-season-status">
                    {details.peak?.includes(currentMonth)
                      ? `Typical peak in ${currentMonthName}`
                      : `Broader season includes ${currentMonthName}`}
                  </small>
                ) : null}
                <small className="muted">
                  {season ? `Usually ${season}` : "Season varies"}
                  {peak ? ` · Peak ${peak}` : ""}
                </small>
              </span>
            </Link>
          );
        })}
      </div>

      {isSeattle ? (
        <SeattlePlanningGuide mapHref={mapHref} />
      ) : (
        <>
          <h2 className="section">How to look nearby</h2>
          <ol className="clean">
            <li>Open the map and search {city.searchLabel} or a nearby address.</li>
            <li>Open a report to check the plant guide and usual season.</li>
            <li>Use the walking-directions action only after checking access.</li>
            <li>Confirm the plant, local rules, and permission before picking.</li>
          </ol>
          <p>
            Searching somewhere else? Start again from the{" "}
            <Link href="/">Forage Around homepage search</Link>.
          </p>

          <p style={{ margin: "28px 0" }}>
            <ToAppLink className="btn" href={mapHref} from="locations">
              Search the live map →
            </ToAppLink>{" "}
            <Link className="btn-outline" href="/locations">
              Browse all nearby harvests
            </Link>
          </p>
        </>
      )}

      <Credits />
    </>
  );
}
