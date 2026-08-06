import type { Metadata } from "next";
import Link from "next/link";
import { LocationsPageViewed, ToAppLink } from "@/app/analytics";
import { APP_URL, Credits } from "@/app/components";

export const revalidate = 86400;

const PAGE_PATH = "/locations/berkeley/loquat-season";
const MAP_URL = `${APP_URL}?${new URLSearchParams({
  ref: "berkeley_loquat_season",
  location: "Berkeley, CA",
}).toString()}`;
const META_DESCRIPTION =
  "Learn when loquat season reaches Berkeley and coastal California, how to check the fruit and old reports, then plan a careful spring walk.";

export const metadata: Metadata = {
  title: "Loquat season in California: Berkeley guide",
  description: META_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    type: "article",
    title: "Berkeley loquat season guide | Forage Around",
    description: META_DESCRIPTION,
    url: PAGE_PATH,
  },
  twitter: {
    title: "Berkeley loquat season guide | Forage Around",
    description: META_DESCRIPTION,
  },
};

const FAQS = [
  {
    question: "When is loquat season in California?",
    answer:
      "UC Agriculture and Natural Resources says selected loquat varieties mature in spring and early summer. Named varieties can range from February into July, while local weather and the individual tree shift the useful window.",
  },
  {
    question: "When should I check loquat trees around Berkeley?",
    answer:
      "Forage Around's plant data uses April through June, with May as the typical peak. Berkeley's cool marine influence can slow sugar development, so treat that window as a reason to inspect fruit, not proof that it will be sweet or ready.",
  },
  {
    question: "How can I tell when a loquat is ripe?",
    answer:
      "UC Master Gardeners recommend vibrant color and a soft-firm feel. Fruit varies by cultivar, so compare several loquats on the same cluster and leave hard, green, damaged, or spoiled fruit alone.",
  },
  {
    question: "Does a Berkeley loquat report mean the fruit is public?",
    answer:
      "No. A report does not establish ownership, access, or permission, even when a tree grows near a sidewalk. Check the property boundary, posted rules, and the current site before picking anything.",
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

const LOQUAT_SPOTS = [
  {
    href: "/tree/423",
    label: "South Berkeley loquat report",
    note: "A central report page for comparing the mapped point with current conditions.",
  },
  {
    href: "/tree/461",
    label: "West Berkeley loquat report",
    note: "A spring-season note that still needs an on-site freshness and access check.",
  },
  {
    href: "/tree/480",
    label: "North-central Berkeley loquat report",
    note: "A second neighborhood lead for building a short route instead of relying on one point.",
  },
] as const;

export default function BerkeleyLoquatSeasonPage() {
  return (
    <>
      <LocationsPageViewed
        pageType="category"
        slug="berkeley-loquat-season"
        species="Loquat"
        city="Berkeley"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />

      <p className="kicker">Berkeley loquat season guide</p>
      <h1 className="title">Loquat season in California: a Berkeley guide</h1>
      <p className="lead">
        Loquats flower while many fruit trees are dormant, then ripen from
        spring into early summer. Around Berkeley, April through June is a useful
        starting window, with May as the typical peak in Forage Around&apos;s plant
        data. The fruit and the current site still get the final say.
      </p>

      <div
        className="seasonal-orientation"
        aria-label="Before you use the Berkeley loquat map"
      >
        <p>
          <strong>A mapped tree is not a harvest promise.</strong> A report can
          be old, misplaced, private, or no longer present. Confirm the whole
          plant, ripe fruit, property boundary, current rules, and permission
          before taking anything.
        </p>
      </div>

      <div className="locations-actions">
        <ToAppLink
          className="btn"
          href={MAP_URL}
          from="berkeley_loquat_season_guide"
          speciesContext="Loquat"
        >
          Check loquat reports on the Berkeley map
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
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Loquat-0.jpg/1280px-Loquat-0.jpg"
          alt="Clusters of orange loquats among large dark green leaves"
        />
        <figcaption>
          Loquat fruit ripens in clusters among broad evergreen leaves. Fanghong
          image, CC BY-SA 3.0, via Wikimedia Commons.
        </figcaption>
      </figure>

      <h2 className="section">Why loquat starts the Berkeley fruit calendar</h2>
      <p>
        Loquat follows a different rhythm from plums, apples, and figs. The{" "}
        <a
          href="https://ucanr.edu/site/fruit-nut-research-information-center/loquat-fact-sheet"
          rel="noopener"
        >
          UC Agriculture and Natural Resources loquat fact sheet
        </a>{" "}
        says the trees blossom and set fruit from October to February, then
        selected varieties mature in spring and early summer. Named cultivar
        windows in that guide stretch from February into July.
      </p>
      <p>
        That wide range is a reminder to learn the individual tree. Berkeley is
        near the central California coast, where the same UC fact sheet warns
        that fruit may struggle to develop strong color, flavor, or sugar. A
        heavy orange cluster can look ready and still taste disappointing. Use
        color, texture, aroma, and a permitted taste together.
      </p>

      <div className="city-season-grid">
        <section className="card">
          <p className="kicker">Winter</p>
          <h3>Flowers and small fruit set the clue</h3>
          <p>
            Loquats can flower in cool weather. Winter clusters help distinguish
            the tree&apos;s unusual calendar, but they do not guarantee a strong
            crop or useful spring fruit.
          </p>
        </section>
        <section className="card">
          <p className="kicker">April through June</p>
          <h3>The practical Berkeley window</h3>
          <p>
            This is the season in the Forage Around plant data, with May as the
            typical peak. Check several fruit on the same cluster and expect
            shade, weather, and cultivar to shift the date.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Early summer</p>
          <h3>Catch the finish without rushing it</h3>
          <p>
            Late fruit may overlap the start of plum season. Soft or bruised
            loquats do not keep well, so collect only a modest amount you can use
            quickly when picking is clearly allowed.
          </p>
        </section>
      </div>

      <h2 className="section">How to recognize and check ripe loquat fruit</h2>
      <p>
        UC Master Gardeners of Sonoma County describe loquat as an evergreen
        tree with thick, deeply veined leaves and clustered yellow-to-orange
        fruit. Their{" "}
        <a href="https://ucanr.edu/site/mg-sonoma/loquats" rel="noopener">
          loquat guide
        </a>{" "}
        recommends harvesting fruit when it is soft-firm and vividly colored.
        Fruit can be round or slightly pear-shaped and usually contains several
        large seeds.
      </p>
      <ul className="clean">
        <li>
          <strong>Start with the whole tree.</strong> Look for dense evergreen
          foliage, large leathery leaves with pronounced veins, and fruit held
          in clusters. Do not identify from an orange fruit alone.
        </li>
        <li>
          <strong>Compare a cluster.</strong> Look for a consistent shift from
          green toward yellow or orange and a soft-firm feel. Hard green fruit
          needs more time.
        </li>
        <li>
          <strong>Use only the fruit flesh.</strong> Remove the large seeds and
          any stem or damaged tissue. Leave moldy, split, leaking, or fermented
          fruit behind.
        </li>
        <li>
          <strong>Open the plant guide first.</strong> The{" "}
          <Link href="/species/loquat">loquat species guide</Link> covers the
          edible part, typical season, use ideas, and preservation options.
        </li>
      </ul>

      <h2 className="section">Three loquat report pages to compare</h2>
      <p>
        A small group of reports gives you alternatives when one point is stale,
        inaccessible, or finished. These spot pages are current URLs for old
        crowd-sourced records, not confirmations of today&apos;s fruit or access.
      </p>
      <div className="season-spot-list">
        {LOQUAT_SPOTS.map(({ href, label, note }) => (
          <article key={href}>
            <h3>
              <Link href={href}>{label}</Link>
            </h3>
            <p>{note}</p>
            <small>Open the report, then verify the site before traveling.</small>
          </article>
        ))}
      </div>

      <h2 className="section">Plan a spring loquat walk</h2>
      <ol className="clean">
        <li>
          Search a Berkeley neighborhood or address you already visit. Compare
          two or three nearby loquat points rather than choosing one distant
          marker.
        </li>
        <li>
          Read the species guide and individual report pages. Treat every note
          as historical context because trees, fences, land use, and access can
          change.
        </li>
        <li>
          Stay on public routes while checking the point. Do not enter a yard,
          reach over a fence, or assume that a planting strip settles ownership.
        </li>
        <li>
          Verify the whole plant, fruit condition, site cleanliness, and
          permission. Take only what you can use promptly and leave uncertain
          fruit alone.
        </li>
      </ol>

      <h2 className="section">Follow the fruit sequence into summer</h2>
      <p>
        Loquat is the early member of this Berkeley cluster. As its season winds
        down, compare the{" "}
        <Link href="/locations/berkeley/plum-season">
          Berkeley plum season guide
        </Link>{" "}
        for summer fruit and the{" "}
        <Link href="/locations/berkeley/fig-season">
          Berkeley fig season guide
        </Link>{" "}
        for the longer late-summer and fall window. The{" "}
        <Link href="/locations/berkeley">full Berkeley guide</Link> connects all
        three to other edible plants represented in the city data.
        The <Link href="/seasonal-guide">year-round seasonal foraging guide</Link>{" "}
        shows how those local windows fit the wider calendar.
      </p>

      <section className="faq-block" aria-labelledby="berkeley-loquat-faq">
        <h2 className="section" id="berkeley-loquat-faq">
          Berkeley loquat season questions
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
          from="berkeley_loquat_season_guide"
          speciesContext="Loquat"
        >
          Search the Berkeley loquat map
        </ToAppLink>
        <Link className="btn-outline" href="/species/loquat">
          Read the loquat field guide
        </Link>
      </div>

      <Credits />
    </>
  );
}
