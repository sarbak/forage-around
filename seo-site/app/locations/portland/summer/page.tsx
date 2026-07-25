import type { Metadata } from "next";
import Link from "next/link";
import { LocationsPageViewed, ToAppLink } from "@/app/analytics";
import { APP_URL, Credits } from "@/app/components";

export const revalidate = 86400;

const PAGE_PATH = "/locations/portland/summer";
const MAP_URL = `${APP_URL}?${new URLSearchParams({
  ref: "portland_summer_foraging",
  location: "Portland, OR",
}).toString()}`;
const META_DESCRIPTION =
  "See what to forage in Portland in summer, from cherries and cane berries to plums, apples, and pears, then check reported plants on the city map.";

export const metadata: Metadata = {
  title: "What to forage in Portland in summer",
  description: META_DESCRIPTION,
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    type: "article",
    title: "Portland summer foraging guide | Forage Around",
    description: META_DESCRIPTION,
    url: PAGE_PATH,
  },
  twitter: {
    title: "Portland summer foraging guide | Forage Around",
    description: META_DESCRIPTION,
  },
};

const FAQS = [
  {
    question: "What can you forage in Portland in summer?",
    answer:
      "Typical summer possibilities in this guide include cherries, raspberries, plums, blackberries, apples, and pears. Their seasons overlap, but weather, shade, irrigation, variety, and the individual plant can move the timing.",
  },
  {
    question: "Does the map show what is ripe in Portland today?",
    answer:
      "No. The map shows crowd-sourced plant reports, not live ripeness or availability. Use the season windows to choose what to check, then confirm the plant, fruit, and site when you arrive.",
  },
  {
    question: "Can you forage in Portland parks?",
    answer:
      "Do not treat a park marker as permission to pick. Portland Parks rules prohibit removing plants and flowers, and other public, community, and private sites can have their own rules.",
  },
  {
    question: "How should a beginner plan a Portland foraging walk?",
    answer:
      "Search a neighborhood or address, compare a few nearby reports, read the plant guides, and choose a short route. Before harvesting, verify identity, current condition, land status, local rules, and permission.",
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

export default function PortlandSummerForagingPage() {
  return (
    <>
      <LocationsPageViewed
        pageType="category"
        slug="portland-summer"
        city="Portland"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />

      <p className="kicker">Portland summer foraging guide</p>
      <h1 className="title">What to forage in Portland in summer</h1>
      <p className="lead">
        Portland&apos;s summer sequence usually starts with cherries and
        raspberries, moves through plums and blackberries, then reaches apples
        and pears as late summer turns toward fall. Use these windows to plan
        what to look for, not as proof that a mapped plant is ready today.
      </p>

      <div
        className="seasonal-orientation"
        aria-label="Before you use the Portland map"
      >
        <p>
          Season is only a planning clue. Crowd-sourced reports do not confirm
          plant identity, ripeness, ownership, public access, or permission to
          pick. Check the whole plant and the site before harvesting, and leave
          anything uncertain alone.
        </p>
      </div>

      <div className="locations-actions">
        <ToAppLink
          className="btn"
          href={MAP_URL}
          from="portland_summer_guide"
        >
          Check summer reports on the Portland map
        </ToAppLink>
        <small className="locations-availability-note muted">
          Reports are leads, not live availability or permission
        </small>
        <Link className="btn-outline" href="/locations/portland">
          Open the full Portland foraging guide
        </Link>
      </div>

      <h2 className="section">A simple Portland summer sequence</h2>
      <p>
        Portland&apos;s wet winters and dry summers create a useful progression,
        but no two blocks follow the same calendar. A cool spring can delay the
        start, while a sunny wall, irrigation, variety, or neighborhood heat can
        move one plant ahead of another.
      </p>

      <div className="city-season-grid">
        <section className="card">
          <p className="kicker">Early summer</p>
          <h3>Cherries lead, raspberries begin</h3>
          <p>
            <Link href="/species/cherry">Cherries</Link> usually run from May
            through July in this guide.{" "}
            <Link href="/species/raspberry">Raspberries</Link> usually span June
            through September, with July as their typical peak. Color and
            softness can help with an on-site check, but neither confirms the
            species or permission to pick.
          </p>
        </section>

        <section className="card">
          <p className="kicker">Midsummer</p>
          <h3>Plums and cane berries overlap</h3>
          <p>
            <Link href="/species/plum">Plums</Link> usually span June through
            August. <Link href="/species/blackberry">Blackberries</Link> usually
            run from July through September, while raspberries can continue
            through the same stretch. Check the entire plant, not the fruit
            alone, and avoid sprayed or contaminated sites.
          </p>
        </section>

        <section className="card">
          <p className="kicker">Late summer</p>
          <h3>Apples and pears start the fall handoff</h3>
          <p>
            <Link href="/species/apple">Apples</Link> and{" "}
            <Link href="/species/pear">pears</Link> usually run from August
            through October, with September as the typical peak in this guide.
            Fallen fruit can suggest timing, but it can also be damaged,
            contaminated, or outside an accessible site.
          </p>
        </section>
      </div>

      <h2 className="section">How to plan one useful summer walk</h2>
      <ol className="clean">
        <li>
          Pick one part of the summer sequence instead of searching for every
          plant at once.
        </li>
        <li>
          Open the map near the Portland neighborhood, street, or address where
          you can actually walk.
        </li>
        <li>
          Compare two or three nearby reports and read each linked plant guide
          before choosing a route.
        </li>
        <li>
          Check land status and site rules before opening directions, then
          confirm the plant, edible part, current condition, and permission when
          you arrive.
        </li>
      </ol>
      <p>
        Need the broader city calendar? The{" "}
        <Link href="/locations/portland">Portland foraging guide</Link> covers
        the seasons around summer as well. For a month-aware list across all
        locations, use the{" "}
        <Link href="/seasonal-guide">year-round seasonal foraging guide</Link>.
      </p>

      <h2 className="section">Before you harvest in Portland</h2>
      <div className="seasonal-orientation">
        <p>
          <strong>Confirm identity and condition.</strong> Match the whole plant
          and edible part with a trusted local source. A common name, photo, map
          marker, or usual season is not enough on its own.
        </p>
        <p>
          <strong>Confirm access and permission.</strong> A report does not show
          who owns the land or whether picking is allowed.{" "}
          <a href="https://www.portland.gov/parks/rules" rel="noopener">
            Portland Parks rules
          </a>{" "}
          prohibit removing plants and flowers from parks. Other sites can have
          different rules, so check the current land manager&apos;s guidance and
          ask before picking on private property.
        </p>
        <p>
          <strong>Check the site.</strong> Skip plants exposed to obvious
          spraying, heavy roadside pollution, pet waste, or other contamination.
          Wash what you collect and take only what you can use.
        </p>
      </div>

      <h2 className="section">Where the reports come from</h2>
      <p>
        Forage Around begins with crowd-sourced plant locations from{" "}
        <a href="https://fallingfruit.org" rel="noopener">
          Falling Fruit
        </a>
        , including community and public-data contributions around Portland.
        Forage Around adds its own season and plant-guide context. A report is a
        starting point, not a live inventory, and it may be old, incomplete, or
        no longer present.
      </p>

      <section className="faq-block" aria-labelledby="portland-summer-faq">
        <h2 className="section" id="portland-summer-faq">
          Portland summer foraging questions
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

      <div className="locations-actions">
        <ToAppLink
          className="btn"
          href={MAP_URL}
          from="portland_summer_guide"
        >
          Search the Portland summer foraging map
        </ToAppLink>
        <Link className="btn-outline" href="/locations/portland">
          Read the Portland city guide
        </Link>
      </div>

      <Credits />
    </>
  );
}
