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

  const currentMonthName = MONTHS[new Date().getUTCMonth()];
  let title = `Find fruit and edible plants in ${city.name}`;
  let description = `Explore usual harvest seasons for edible plants represented around ${city.name}, then search the live Forage Around map near your address.`;
  let shareTitle = `Typical ${currentMonthName} foraging in ${city.name} | Forage Around`;

  if (city.slug === "seattle") {
    title = "Seattle foraging: fruit, nuts and a map";
    description =
      "Plan a Seattle foraging walk with usual seasons for plums, cherries, apples, nuts, and more, then search crowd-sourced reports near your address.";
    shareTitle = "Seattle foraging: fruit, nuts and a map | Forage Around";
  }

  if (city.slug === "portland") {
    title = "Portland foraging: berries, fruit and a map";
    description =
      "Plan a Portland foraging walk with usual seasons for cane berries, cherries, apples, pears, and more, then check crowd-sourced reports on the map.";
    shareTitle = "Portland foraging: berries, fruit and a map | Forage Around";
  }

  if (city.slug === "los-angeles") {
    title = "Los Angeles foraging: fruit and a map";
    description =
      "Plan a Los Angeles foraging walk with usual seasons for loquats, figs, pomegranates, citrus, and more, then check reported plants on the map.";
    shareTitle = "Los Angeles foraging: fruit and a map | Forage Around";
  }

  if (city.slug === "chicago") {
    title = "Chicago foraging: fruit, berries and a map";
    description =
      "Plan a Chicago foraging walk with usual seasons for mulberries, elderberries, apples, nuts, and more, then check reported edible plants on the map.";
    shareTitle = "Chicago foraging: fruit, berries and a map | Forage Around";
  }

  if (city.slug === "new-york") {
    title = "New York foraging: fruit, nuts and a map";
    description =
      "Plan a New York foraging walk with usual seasons for mulberries, plums, apples, haws, nuts, and more, then check reported plants on the map.";
    shareTitle = "New York foraging: fruit, nuts and a map | Forage Around";
  }

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

function PortlandSeasonGuide() {
  return (
    <>
      <h2 className="section">What to forage in Portland by season</h2>
      <p>
        Portland&apos;s wet winters and dry summers support a long sequence of
        neighborhood fruit and berry seasons. These broad windows help with
        planning, but they do not confirm what is ripe on one block. Weather,
        shade, irrigation, variety, and the condition of an individual plant can
        move the timing.
      </p>
      <div className="city-season-grid">
        <section className="card">
          <p className="kicker">Late spring into midsummer</p>
          <h3>Cherries, then raspberries</h3>
          <p>
            <Link href="/species/cherry">Cherries</Link> usually run from May
            through July in this guide.{" "}
            <Link href="/species/raspberry">Raspberries</Link> usually follow
            from June into September, with July as their typical peak. Treat
            color as a clue, not proof of identity or ripeness.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Midsummer into early fall</p>
          <h3>Plums and blackberries</h3>
          <p>
            <Link href="/species/plum">Plums</Link> usually span June through
            August. <Link href="/species/blackberry">Blackberries</Link> usually
            span July through September. Check the whole plant and the site
            before relying on fruit alone.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Late summer into fall</p>
          <h3>Apples and pears</h3>
          <p>
            <Link href="/species/apple">Apples</Link> and{" "}
            <Link href="/species/pear">pears</Link> usually run from August
            through October, with September as the typical peak. Fallen fruit
            can signal timing, but it can also be damaged or contaminated.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Fall</p>
          <h3>Walnuts extend the season</h3>
          <p>
            <Link href="/species/walnut">Walnuts</Link> usually span September
            through November in this guide. Confirm the tree, inspect the nut,
            and use gloves around fresh hulls, which can stain skin and clothing.
          </p>
        </section>
      </div>
    </>
  );
}

function LosAngelesSeasonGuide() {
  return (
    <>
      <h2 className="section">What to forage in Los Angeles by season</h2>
      <p>
        Los Angeles does not follow one citywide harvest calendar. Coastal air,
        basin heat, foothill elevation, irrigation, and variety can put the same
        fruit weeks apart in different neighborhoods. Use these broad windows to
        choose what to look for, then check the plant and fruit on site.
      </p>
      <div className="city-season-grid">
        <section className="card">
          <p className="kicker">Winter into spring</p>
          <h3>Citrus carries the cool season</h3>
          <p>
            <Link href="/species/lemon">Lemons</Link> can appear throughout the
            year in this guide, while <Link href="/species/orange">oranges</Link>{" "}
            usually run from winter into spring. A colored fruit is not proof
            that the tree is accessible, untreated, or ready to pick.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Spring into early summer</p>
          <h3>Loquats, then apricots</h3>
          <p>
            <Link href="/species/loquat">Loquats</Link> usually span April
            through June, with May as their typical peak.{" "}
            <Link href="/species/apricot">Apricots</Link> usually follow from May
            through July. Confirm the whole plant rather than relying on fruit
            color alone.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Summer</p>
          <h3>Peaches and figs</h3>
          <p>
            <Link href="/species/peach">Peaches</Link> usually span June through
            August. <Link href="/species/common-fig">Figs</Link> usually begin in
            June and continue into fall, often with an early and a later crop.
            Heat, shade, and irrigation can move both windows.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Late summer into fall</p>
          <h3>Pomegranates extend the season</h3>
          <p>
            <Link href="/species/pomegranate">Pomegranates</Link> usually span
            September through November, with October as their typical peak.{" "}
            <Link href="/species/avocado">Avocados</Link> can have a much broader
            cultivar-dependent window, so a nearby report needs an on-site
            timing check.
          </p>
        </section>
      </div>
    </>
  );
}

function ChicagoSeasonGuide() {
  return (
    <>
      <h2 className="section">What to forage in Chicago by season</h2>
      <p>
        Chicago&apos;s useful fruit-and-nut window is shorter than in the West
        Coast guides, and hard winters or a late spring can move it sharply.
        Live reports also cluster unevenly across the city. Treat this as a
        calendar for reported edible plants, not a promise of broad neighborhood
        coverage.
      </p>
      <div className="city-season-grid">
        <section className="card">
          <p className="kicker">Late spring into early summer</p>
          <h3>Cherries and mulberries begin</h3>
          <p>
            <Link href="/species/cherry">Cherries</Link> and{" "}
            <Link href="/species/mulberry">mulberries</Link> usually begin in May
            and run into July in this guide. Mulberries can stain pavement and
            clothing, but fallen fruit alone does not confirm a safe or
            accessible picking site.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Midsummer</p>
          <h3>Plums take the July window</h3>
          <p>
            <Link href="/species/plum">Plums</Link> usually span June through
            August, with July as their typical peak. Year-to-year heat and rain
            can compress that window, so check several nearby reports before
            making a trip.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Late summer into early fall</p>
          <h3>Elderberries, apples, and pears</h3>
          <p>
            <Link href="/species/elderberry">Elderberries</Link> usually span
            August and September and must be cooked before use.{" "}
            <Link href="/species/apple">Apples</Link> and{" "}
            <Link href="/species/pear">pears</Link> usually follow from August
            through October.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Fall</p>
          <h3>Crabapples and walnuts close the season</h3>
          <p>
            <Link href="/species/crabapple">Crabapples</Link> usually span
            September and October. <Link href="/species/walnut">Walnuts</Link>{" "}
            can continue through November. Verify the tree and edible part, and
            check site rules before collecting.
          </p>
        </section>
      </div>
    </>
  );
}

function NewYorkSeasonGuide() {
  return (
    <>
      <h2 className="section">What to forage in New York by season</h2>
      <p>
        New York&apos;s boroughs, waterfront exposure, shade, and site management
        can move timing from one block to the next. Street-tree density is not
        the same as harvest availability, so use these broad windows to plan a
        walk and verify every report when you arrive.
      </p>
      <div className="city-season-grid">
        <section className="card">
          <p className="kicker">Late spring into early summer</p>
          <h3>Cherries and mulberries begin</h3>
          <p>
            <Link href="/species/cherry">Cherries</Link> and{" "}
            <Link href="/species/mulberry">mulberries</Link> usually span May
            through July in this guide. Heat, shade, and pruning can shift a
            street tree or park planting away from the broad city window.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Summer</p>
          <h3>Plums, then peaches</h3>
          <p>
            <Link href="/species/plum">Plums</Link> usually span June through
            August, with July as their typical peak.{" "}
            <Link href="/species/peach">Peaches</Link> share that broad summer
            window. Check the fruit, the site, and the map report rather than
            assuming a borough-wide date.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Late summer into fall</p>
          <h3>Apples and haws follow</h3>
          <p>
            <Link href="/species/apple">Apples</Link> usually span August through
            October. <Link href="/species/hawthorn">Hawthorn haws</Link> usually
            begin in September and continue into November. Do not eat hawthorn
            seeds, and confirm the species before using the fruit.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Fall</p>
          <h3>Walnuts and acorns extend the walk</h3>
          <p>
            <Link href="/species/walnut">Walnuts</Link> and{" "}
            <Link href="/species/oak">oak acorns</Link> usually span September
            through November. Acorns must be correctly identified and leached of
            tannins before eating; neither a street-tree record nor a park marker
            grants permission to collect.
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

function PortlandPlanningGuide({ mapHref }: { mapHref: string }) {
  return (
    <>
      <h2 className="section">How to plan a Portland foraging walk</h2>
      <ol className="clean">
        <li>
          Search a Portland neighborhood, street, or address instead of scanning
          the whole city.
        </li>
        <li>
          Compare a few nearby reports, then read each plant guide before
          choosing a walk.
        </li>
        <li>
          Check property boundaries and site rules before opening walking
          directions.
        </li>
        <li>
          Confirm the plant, edible part, current ripeness, and permission when
          you arrive.
        </li>
      </ol>

      <h2 className="section">Before you harvest in Portland</h2>
      <div className="seasonal-orientation">
        <p>
          <strong>Identity:</strong> a common name, photo, or map marker is only
          a starting point. Match the plant and edible part with a trusted local
          source. If you are unsure, leave it.
        </p>
        <p>
          <strong>Access:</strong> a report does not establish ownership, public
          access, or permission to pick.{" "}
          <a href="https://www.portland.gov/parks/rules" rel="noopener">
            Portland Parks rules
          </a>{" "}
          prohibit removing plants and flowers from parks. Other public,
          community, and private sites can have their own rules.
        </p>
        <p>
          <strong>Site conditions:</strong> skip plants exposed to obvious
          spraying, heavy roadside pollution, pet waste, or other contamination.
          Wash what you collect and take only what you can use.
        </p>
      </div>
      <p>
        Want a broader calendar before choosing a plant? Use the{" "}
        <Link href="/seasonal-guide">seasonal foraging guide</Link>. You can also
        browse the <Link href="/locations">nearby harvest guides</Link> or read{" "}
        <Link href="/about">how Forage Around sources its reports</Link>.
      </p>

      <div className="locations-actions">
        <ToAppLink className="btn" href={mapHref} from="locations">
          Open the Portland foraging map
        </ToAppLink>
        <small className="locations-availability-note muted">
          Reports are leads, not live availability or permission
        </small>
      </div>
    </>
  );
}

function LosAngelesPlanningGuide({ mapHref }: { mapHref: string }) {
  return (
    <>
      <h2 className="section">How to plan a Los Angeles foraging walk</h2>
      <ol className="clean">
        <li>
          Search the neighborhood or address where you will actually walk. A
          city-center search hides the distance between Los Angeles
          microclimates.
        </li>
        <li>
          Compare a few nearby reports and their plant guides before choosing a
          route.
        </li>
        <li>
          Check ownership, site rules, and permission before opening walking
          directions.
        </li>
        <li>
          Confirm the plant, edible part, current fruit, and site conditions when
          you arrive.
        </li>
      </ol>

      <h2 className="section">Before you harvest in Los Angeles</h2>
      <div className="seasonal-orientation">
        <p>
          <strong>Identity:</strong> a fruit photo or common name is only a
          starting point. Match the whole plant and edible part with a trusted
          local source. If you are unsure, leave it.
        </p>
        <p>
          <strong>Access:</strong> a public-tree or community-map record does not
          establish current ownership, public access, or permission to pick.
          Check the boundary and current site rules, and ask before entering or
          harvesting on private property.
        </p>
        <p>
          <strong>Site conditions:</strong> irrigation, roadside exposure,
          spraying, pet waste, and heat damage can affect one tree even when the
          species is usually in season. Inspect the site and wash what you
          collect.
        </p>
      </div>
      <p>
        Want a broader calendar before choosing a plant? Use the{" "}
        <Link href="/seasonal-guide">seasonal foraging guide</Link>. You can also
        browse the <Link href="/locations">nearby harvest guides</Link> or read{" "}
        <Link href="/about">how Forage Around sources its reports</Link>.
      </p>

      <div className="locations-actions">
        <ToAppLink className="btn" href={mapHref} from="locations">
          Open the Los Angeles foraging map
        </ToAppLink>
        <small className="locations-availability-note muted">
          Reports are leads, not live availability or permission
        </small>
      </div>
    </>
  );
}

function ChicagoPlanningGuide({ mapHref }: { mapHref: string }) {
  return (
    <>
      <h2 className="section">How to plan a Chicago foraging walk</h2>
      <ol className="clean">
        <li>
          Search a north, west, or south-side neighborhood or address instead of
          assuming the reports cover Chicago evenly.
        </li>
        <li>
          Compare a few reported edible plants nearby and read each plant guide
          before choosing a walk.
        </li>
        <li>
          Check whether the marker sits on a street, park, preserve, community
          site, or private property, then find the current rules.
        </li>
        <li>
          Confirm the plant, edible part, current ripeness, and permission when
          you arrive.
        </li>
      </ol>

      <h2 className="section">Before you harvest in Chicago</h2>
      <div className="seasonal-orientation">
        <p>
          <strong>Identity:</strong> map labels can be broad or outdated. Match
          the whole plant and edible part with a trusted local source. If you are
          unsure, leave it.
        </p>
        <p>
          <strong>Access:</strong> a park, preserve, street-tree, or
          community-map marker does not establish permission to enter or pick.
          Check current property boundaries, posted rules, and land-manager
          guidance before collecting.
        </p>
        <p>
          <strong>Coverage:</strong> the live reports are clustered, so an empty
          result near one address does not describe the whole city, and a dense
          result elsewhere does not guarantee an accessible plant. Search close
          to your route and keep alternatives.
        </p>
      </div>
      <p>
        Want a broader calendar before choosing a plant? Use the{" "}
        <Link href="/seasonal-guide">seasonal foraging guide</Link>. You can also
        browse the <Link href="/locations">nearby harvest guides</Link> or read{" "}
        <Link href="/about">how Forage Around sources its reports</Link>.
      </p>

      <div className="locations-actions">
        <ToAppLink className="btn" href={mapHref} from="locations">
          Open the Chicago foraging map
        </ToAppLink>
        <small className="locations-availability-note muted">
          Reports are leads, not live availability or permission
        </small>
      </div>
    </>
  );
}

function NewYorkPlanningGuide({ mapHref }: { mapHref: string }) {
  return (
    <>
      <h2 className="section">How to plan a New York foraging walk</h2>
      <ol className="clean">
        <li>
          Search the borough, neighborhood, or address where you will walk
          rather than scanning all five boroughs at once.
        </li>
        <li>
          Compare a few reports and distinguish street trees, parks, community
          gardens, and designated edible landscapes.
        </li>
        <li>
          Check the current site rules and permission before opening walking
          directions.
        </li>
        <li>
          Confirm the plant, edible part, current ripeness, and site conditions
          when you arrive.
        </li>
      </ol>

      <h2 className="section">Before you harvest in New York</h2>
      <div className="seasonal-orientation">
        <p>
          <strong>Identity:</strong> an inventory label or map photo is not proof
          of identity or edibility. Match the whole plant and edible part with a
          trusted local source. If you are unsure, leave it.
        </p>
        <p>
          <strong>Access:</strong> inventory density is not harvest permission.
          A tree can be ornamental, inaccessible, treated, removed, or covered
          by site-specific rules. Ask before collecting on private or managed
          property.
        </p>
        <p>
          <strong>Place:</strong> a designated edible landscape such as the{" "}
          <a href="https://bronxriver.org/post/greenway/foodway" rel="noopener">
            Bronx River Foodway
          </a>{" "}
          has its own purpose and guidance. Do not apply one site&apos;s rules to
          street trees, parks, gardens, or another borough.
        </p>
      </div>
      <p>
        Want a broader calendar before choosing a plant? Use the{" "}
        <Link href="/seasonal-guide">seasonal foraging guide</Link>. You can also
        browse the <Link href="/locations">nearby harvest guides</Link> or read{" "}
        <Link href="/about">how Forage Around sources its reports</Link>.
      </p>

      <div className="locations-actions">
        <ToAppLink className="btn" href={mapHref} from="locations">
          Open the New York foraging map
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
  const isSeattle = city.slug === "seattle";
  const isPortland = city.slug === "portland";
  const isLosAngeles = city.slug === "los-angeles";
  const isChicago = city.slug === "chicago";
  const isNewYork = city.slug === "new-york";
  let kicker = `${city.name} harvest guide`;
  let heading = `Find fruit and edible plants in ${city.name}`;
  let lead = `Learn the usual ripening windows for plants represented around ${city.name}, then use the live map to check crowd-sourced reports near your address.`;
  let mapActionLabel = `Open the map and search ${city.name} →`;

  if (isSeattle) {
    kicker = "Seattle foraging guide";
    heading = "Foraging in Seattle: fruit, nuts, and a neighborhood map";
    lead =
      "Plan a self-guided Seattle foraging walk with usual seasons for cherries, plums, apples, crabapples, nuts, and late fruit, then search crowd-sourced reports near your address.";
    mapActionLabel = "Open the Seattle foraging map";
  } else if (isPortland) {
    kicker = "Portland foraging guide";
    heading = "Foraging in Portland: berries, fruit, and a city map";
    lead =
      "Plan a Portland foraging walk around typical berry and fruit seasons, then search crowd-sourced reports near your address.";
    mapActionLabel = "Open the Portland foraging map";
  } else if (isLosAngeles) {
    kicker = "Los Angeles foraging guide";
    heading = "Foraging in Los Angeles: fruit across city microclimates";
    lead =
      "Plan a Los Angeles foraging walk around typical citrus, loquat, fig, stone-fruit, and pomegranate seasons, then check reports near the neighborhood you can actually visit.";
    mapActionLabel = "Open the Los Angeles foraging map";
  } else if (isChicago) {
    kicker = "Chicago foraging guide";
    heading = "Foraging in Chicago: reported fruit, berries, and nuts";
    lead =
      "Use Chicago's shorter seasonal calendar to choose what to look for, then search the live map for reported edible plants near a specific neighborhood or address.";
    mapActionLabel = "Open the Chicago foraging map";
  } else if (isNewYork) {
    kicker = "New York foraging guide";
    heading = "Foraging in New York: fruit, nuts, and a city map";
    lead =
      "Plan a New York foraging walk around typical fruit and nut seasons, then search crowd-sourced reports near a specific borough, neighborhood, or address.";
    mapActionLabel = "Open the New York foraging map";
  }

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
      <p className="kicker">{kicker}</p>
      <h1 className="title">{heading}</h1>
      <p className="lead">{lead}</p>

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
        {isPortland ? (
          <Link className="btn-outline" href="/locations/portland/summer">
            What to forage in Portland this summer
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
      {isPortland ? <PortlandSeasonGuide /> : null}
      {isLosAngeles ? <LosAngelesSeasonGuide /> : null}
      {isChicago ? <ChicagoSeasonGuide /> : null}
      {isNewYork ? <NewYorkSeasonGuide /> : null}

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
      ) : isPortland ? (
        <PortlandPlanningGuide mapHref={mapHref} />
      ) : isLosAngeles ? (
        <LosAngelesPlanningGuide mapHref={mapHref} />
      ) : isChicago ? (
        <ChicagoPlanningGuide mapHref={mapHref} />
      ) : isNewYork ? (
        <NewYorkPlanningGuide mapHref={mapHref} />
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
