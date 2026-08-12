import type { Metadata } from "next";
import Link from "next/link";
import { LocationsPageViewed, ToAppLink } from "@/app/analytics";
import { APP_URL, Credits } from "@/app/components";

export const revalidate = 86400;

const PAGE_PATH = "/locations/berkeley/plum-season";
const MAP_URL = `${APP_URL}?${new URLSearchParams({
  ref: "berkeley_plum_season",
  location: "Berkeley, CA",
}).toString()}`;
const META_DESCRIPTION =
  "Learn when plum season reaches Berkeley and California, how to check ripe fruit and old map reports, then plan a careful neighborhood plum walk.";

export const metadata: Metadata = {
  title: "Plum season in California: Berkeley field guide",
  description: META_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    type: "article",
    title: "Berkeley plum season guide | Forage Around",
    description: META_DESCRIPTION,
    url: PAGE_PATH,
  },
  twitter: {
    title: "Berkeley plum season guide | Forage Around",
    description: META_DESCRIPTION,
  },
};

const FAQS = [
  {
    question: "When is plum season in California?",
    answer:
      "California's broad commercial plum harvest runs from May into October. Around the Bay Area, many familiar neighborhood plums are a summer crop, but variety, weather, shade, and the individual tree can move the useful window.",
  },
  {
    question: "When should I check plum trees around Berkeley?",
    answer:
      "June through August is the practical first window in Forage Around's plant data, with July as the typical peak. Start checking before the peak so you can learn the tree, then judge each fruit rather than relying on the month alone.",
  },
  {
    question: "How can I tell when a plum is ripe?",
    answer:
      "UC Integrated Pest Management recommends using firmness and taste. A ripe plum should be beginning to soften and taste sweet and juicy. Skin color alone is unreliable because varieties mature in many colors.",
  },
  {
    question: "Does a Berkeley plum report mean I can pick there?",
    answer:
      "No. A crowd-sourced point does not establish ownership, public access, or permission. It also cannot confirm that the tree remains, the fruit is ripe, or the location is clean and safe today.",
  },
] as const;

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

const PLUM_SPOTS = [
  {
    href: "/tree/427",
    label: "South Berkeley plum report",
    note: "A central starting point for comparing a report with the current block.",
  },
  {
    href: "/tree/492",
    label: "East Berkeley plum report",
    note: "A reported green plum that makes color-only ripeness checks especially risky.",
  },
  {
    href: "/tree/519",
    label: "Derby Street area plum report",
    note: "One of several nearby reports that can support a short, walkable check.",
  },
] as const;

export default function BerkeleyPlumSeasonPage() {
  return (
    <>
      <LocationsPageViewed
        pageType="category"
        slug="berkeley-plum-season"
        species="Plum"
        city="Berkeley"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />

      <p className="kicker">Berkeley plum season guide</p>
      <h1 className="title">Plum season in California: a Berkeley field guide</h1>
      <p className="lead">
        California&apos;s plum harvest can stretch from May into October, but
        Berkeley&apos;s neighborhood trees do not share one calendar. Use June
        through August as the practical first window, then let the variety,
        fruit, and current site conditions decide whether a report is worth a
        closer look.
      </p>

      <div
        className="seasonal-orientation"
        aria-label="Before you use the Berkeley plum map"
      >
        <p>
          <strong>A report is a lead, not a picking invitation.</strong> Confirm
          the whole plant, current fruit, property boundary, posted rules, and
          permission. Leave fruit alone when identity, access, spraying, or site
          cleanliness is uncertain.
        </p>
      </div>

      <div className="locations-actions">
        <ToAppLink
          className="btn"
          href={MAP_URL}
          from="berkeley_plum_season_guide"
          speciesContext="Plum"
        >
          Check plum reports on the Berkeley map
        </ToAppLink>
        <small className="locations-availability-note muted">
          Reports are not live fruit, access, or permission
        </small>
        <Link className="btn-outline" href="/locations/berkeley">
          Open the Berkeley foraging guide
        </Link>
      </div>

      <figure className="season-cluster-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="photo"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Plums_African_Rose_-_whole%2C_halved_and_slice.jpg/1280px-Plums_African_Rose_-_whole%2C_halved_and_slice.jpg"
          alt="Whole, halved, and sliced red plums showing several ripeness cues"
        />
        <figcaption>
          Color varies widely by cultivar, so firmness and taste matter more
          than a red or purple skin. Marco Schmidt image, CC BY-SA 2.5, via
          Wikimedia Commons.
        </figcaption>
      </figure>

      <h2 className="section">The California window is broad</h2>
      <p>
        The broad calendar answers when a plum might be possible, not when one
        Berkeley tree is ready. The University of California&apos;s{" "}
        <a
          href="https://ucanr.edu/site/fruit-nut-research-information-center/fresh-plum"
          rel="noopener"
        >
          Fresh Plum guide
        </a>{" "}
        places California&apos;s typical harvest from May through October. Early
        varieties can mature in mid-May, while later ones can continue into
        September or early October.
      </p>
      <p>
        Closer to the Bay, the UC Master Gardeners of Santa Clara County give a
        June-to-October home-orchard window, depending on variety. Forage
        Around&apos;s own plum guide uses June through August, with July as the
        typical peak. These windows overlap, but they describe different mixes
        of trees. A neighborhood ornamental, Japanese plum, European plum, or
        hybrid can land in a different part of the range.
      </p>

      <div className="city-season-grid">
        <section className="card">
          <p className="kicker">Late spring</p>
          <h3>Learn the tree before the rush</h3>
          <p>
            Green fruit can help confirm that a reported tree is still present,
            but it is not a reason to harvest. Note access, shade, fruit load,
            and whether the point appears to sit on private or managed land.
          </p>
        </section>
        <section className="card">
          <p className="kicker">June through August</p>
          <h3>Check fruit, not the date</h3>
          <p>
            This is the useful Berkeley starting window in the guide data.
            Trees within a few blocks can run weeks apart, and several fruits
            on one tree may not ripen together.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Late summer into fall</p>
          <h3>Expect the variety to matter</h3>
          <p>
            A later cultivar may still be developing when an early tree is
            finished. Old fallen fruit can also mark a season that has already
            passed, so inspect the canopy and sound fruit together.
          </p>
        </section>
      </div>

      <h2 className="section">How to check whether a plum is ripe</h2>
      <p>
        The{" "}
        <a
          href="https://ipm.ucanr.edu/home-and-landscape/harvesting-and-storing-plums-and-prunes/"
          rel="noopener"
        >
          UC Integrated Pest Management harvest guide
        </a>{" "}
        recommends using firmness and taste. Plums should be starting to soften
        and taste sweet and juicy. Japanese plums may be picked firm-ripe and can
        need several passes because fruit on the same tree does not always
        mature at once.
      </p>
      <ul className="clean">
        <li>
          <strong>Use a gentle touch.</strong> Rock-hard fruit probably needs
          more time. Split, leaking, moldy, fermented-smelling, or badly bruised
          fruit is a reason to leave it.
        </li>
        <li>
          <strong>Do not use color alone.</strong> Mature plums can be green,
          yellow, red, purple, or nearly black. The pale dusty coating called
          wax bloom is natural and can rub off.
        </li>
        <li>
          <strong>Compare several fruit.</strong> One soft fruit can be damaged
          while the rest of the tree is weeks away. Look at fruit across the
          canopy and return later if the pattern is unclear.
        </li>
        <li>
          <strong>Confirm the plant first.</strong> Read the{" "}
          <Link href="/species/plum">plum species guide</Link>, then verify the
          leaves, branches, fruit attachment, and whole tree with a trusted
          local source.
        </li>
      </ul>

      <h2 className="section">Three report pages to assess before a walk</h2>
      <p>
        These are individual crowd-sourced records from the bundled Berkeley
        dataset. They are useful for comparing location, species, and walking
        distance. They do not confirm that a tree or fruit is still present.
      </p>
      <div className="season-spot-list">
        {PLUM_SPOTS.map(({ href, label, note }) => (
          <article key={href}>
            <h3>
              <Link href={href}>{label}</Link>
            </h3>
            <p>{note}</p>
            <small>Open the report, then verify the site before traveling.</small>
          </article>
        ))}
      </div>

      <h2 className="section">Turn reports into one careful route</h2>
      <ol className="clean">
        <li>
          Search a Berkeley address you can reach easily and compare several
          plum points within a short walk instead of crossing town for one old
          record.
        </li>
        <li>
          Open the species and spot pages before leaving. Note that the spot
          coordinates can be approximate and a description can be years old.
        </li>
        <li>
          At each point, check the property boundary and current rules before
          inspecting the plant. Seeing branches from the sidewalk does not make
          the fruit public.
        </li>
        <li>
          Confirm the whole tree and sound fruit. Take a modest amount only
          when identity, access, permission, and site conditions are clear.
        </li>
      </ol>

      <h2 className="section">Continue through the Berkeley season</h2>
      <p>
        Plum is one part of a longer neighborhood sequence. Loquats tend to
        start earlier, while figs often continue later. Compare the{" "}
        <Link href="/locations/berkeley/loquat-season">
          Berkeley loquat season guide
        </Link>{" "}
        and the{" "}
        <Link href="/locations/berkeley/fig-season">
          Berkeley fig season guide
        </Link>
        , return to the{" "}
        <Link href="/locations/berkeley">full Berkeley foraging guide</Link>.
        The <Link href="/seasonal-guide">year-round seasonal foraging guide</Link>{" "}
        gives the wider fruit calendar.
      </p>

      <section className="faq-block" aria-labelledby="berkeley-plum-faq">
        <h2 className="section" id="berkeley-plum-faq">
          Berkeley plum season questions
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
          from="berkeley_plum_season_guide"
          speciesContext="Plum"
        >
          Search the Berkeley plum map
        </ToAppLink>
        <Link className="btn-outline" href="/species/plum">
          Read the plum field guide
        </Link>
      </div>

      <Credits />
    </>
  );
}
