import type { Metadata } from "next";
import Link from "next/link";
import { LocationsPageViewed, ToAppLink } from "@/app/analytics";
import { APP_URL, Credits } from "@/app/components";

export const revalidate = 86400;

const PAGE_PATH = "/locations/berkeley/fig-season";
const MAP_URL = `${APP_URL}?${new URLSearchParams({
  ref: "berkeley_fig_season",
  location: "Berkeley, CA",
}).toString()}`;
const META_DESCRIPTION =
  "Learn when fig tree season reaches Berkeley and the Bay Area, how to check ripeness and a crowd-sourced report, then open the local fig map.";

export const metadata: Metadata = {
  title: "Fig tree season near Berkeley: field guide",
  description: META_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    type: "article",
    title: "Berkeley fig season guide | Forage Around",
    description: META_DESCRIPTION,
    url: PAGE_PATH,
  },
  twitter: {
    title: "Berkeley fig season guide | Forage Around",
    description: META_DESCRIPTION,
  },
};

const FAQS = [
  {
    question: "When is fig tree season in California?",
    answer:
      "California's commercial fresh-fig season generally runs from mid-May through November. A neighborhood tree can follow a narrower or later schedule because variety, pruning, coastal weather, shade, irrigation, and the individual tree all affect timing.",
  },
  {
    question: "When are figs usually ripe around Berkeley?",
    answer:
      "Some trees produce a small early crop in June or July, while the main crop usually ripens from late summer into fall. Berkeley's cool marine influence and warm inland edges can put nearby trees weeks apart, so check the fruit rather than relying on the month alone.",
  },
  {
    question: "How can you tell when a fig is ripe?",
    answer:
      "UC Integrated Pest Management says a fully ripe fig is soft, starts to droop on its stem, and comes away easily when lifted and bent toward the branch. Milky latex from the cut stem indicates that the fruit is not fully ripe.",
  },
  {
    question: "Does the Berkeley map show ripe figs today?",
    answer:
      "No. The map shows crowd-sourced reports, not live fruit or ripeness. A report may be old, on inaccessible land, or no longer present, so verify the tree, fruit, site, and permission when you arrive.",
  },
  {
    question: "Can you pick figs from a tree beside a sidewalk?",
    answer:
      "A tree that can be seen from a sidewalk is not automatically public or available to harvest. Check the property boundary and current site rules, and ask the owner before picking from private property or any tree whose ownership is unclear.",
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

export default function BerkeleyFigSeasonPage() {
  return (
    <>
      <LocationsPageViewed
        pageType="category"
        slug="berkeley-fig-season"
        species="Common fig"
        city="Berkeley"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />

      <p className="kicker">Berkeley fig season guide</p>
      <h1 className="title">
        Fig tree season near Berkeley: when and where to look
      </h1>
      <p className="lead">
        Fig tree season in California can stretch from late spring into fall,
        but Berkeley&apos;s neighborhood trees do not ripen on one statewide
        calendar. Some trees carry a small early crop in June or July, while
        many reach their main crop from late summer into fall. Use the calendar
        to choose when to check a report, then let the tree and fruit answer
        whether the timing is right.
      </p>

      <div
        className="seasonal-orientation"
        aria-label="Before you use the Berkeley fig map"
      >
        <p>
          <strong>A map point is a lead, not a harvest promise.</strong> It does
          not confirm that the tree is still there, the fruit is ripe, the site
          is public, or picking is allowed. Confirm the whole plant, current
          fruit, land status, and permission before taking anything.
        </p>
      </div>

      <div className="locations-actions">
        <ToAppLink
          className="btn"
          href={MAP_URL}
          from="berkeley_fig_season_guide"
          speciesContext="Common fig"
        >
          Check fig reports on the Berkeley map
        </ToAppLink>
        <small className="locations-availability-note muted">
          Reports are leads, not live ripeness or permission
        </small>
        <Link className="btn-outline" href="/locations/berkeley">
          Open the full Berkeley foraging guide
        </Link>
      </div>

      <h2 className="section">When fig tree season usually starts</h2>
      <p>
        The broad California window is useful for orientation, not precision.
        The{" "}
        <a href="https://californiafigs.com/faq/" rel="noopener">
          California Fig Advisory Board
        </a>{" "}
        describes the commercial fresh-fig season as mid-May through November,
        with availability varying by weather and variety. That statewide window
        includes orchards and several cultivars. A single Berkeley tree can have
        a much shorter run.
      </p>
      <p>
        Some fig trees can produce two crops. The smaller <em>breba</em> crop
        grows on wood from the previous year and may ripen in early summer. The
        larger main crop grows on the current season&apos;s wood and often ripens
        from late summer into early fall.{" "}
        <a
          href="https://ucanr.edu/site/uc-master-gardeners-san-luis-obispo-county/figs"
          rel="noopener"
        >
          UC Cooperative Extension
        </a>{" "}
        notes that the exact pattern depends on the fig type and cultivar, so
        the absence of an early crop does not mean a tree will have no figs
        later.
      </p>

      <div className="city-season-grid">
        <section className="card">
          <p className="kicker">Late spring to early summer</p>
          <h3>Watch, but do not assume</h3>
          <p>
            Fruit may be forming while it is still hard, upright, and months
            from useful ripeness. A warm site or early cultivar can run ahead of
            a shaded tree near the Bay, so compare several fruit on the same tree
            instead of judging from one calendar date.
          </p>
        </section>
        <section className="card">
          <p className="kicker">June and July</p>
          <h3>An early crop may appear</h3>
          <p>
            A tree with a breba crop may offer a short early-summer window.
            Other trees will have only small, firm main-crop figs at this point.
            Check for softening and droop, and leave hard fruit to mature on the
            tree.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Late summer into fall</p>
          <h3>The main crop is the better bet</h3>
          <p>
            August through October is the practical window to check most
            Berkeley reports, though a cool site may run later and a hot inland
            pocket may run earlier. Revisit a promising report rather than
            stripping fruit that is not ready.
          </p>
        </section>
      </div>

      <h2 className="section">How to tell whether a fig is ripe</h2>
      <p>
        Color is unreliable on its own because ripe figs can be green, bronze,
        purple, brown, or nearly black depending on the variety. Use several
        clues on the same fruit.{" "}
        <a
          href="https://ipm.ucanr.edu/home-and-landscape/harvesting-and-storing-figs/"
          rel="noopener"
        >
          UC Integrated Pest Management
        </a>{" "}
        says fully ripe figs are soft, begin to droop on their stems, and come
        away easily when lifted and bent back toward the branch. If milky latex
        comes from the cut stem, the fig is not fully ripe.
      </p>
      <ul className="clean">
        <li>
          <strong>Look for a relaxed neck.</strong> A ripe fig hangs downward
          instead of pointing outward like a firm green fruit.
        </li>
        <li>
          <strong>Press very gently.</strong> The fruit should have some give,
          not feel hard. Leave split, leaking, moldy, sour-smelling, or
          insect-damaged fruit alone.
        </li>
        <li>
          <strong>Check more than color.</strong> A dark fig can still be firm,
          and a green-skinned variety can be ripe.
        </li>
        <li>
          <strong>Do not pick to finish ripening at home.</strong> UC Cooperative
          Extension notes that figs ripen on the tree. Take only fruit you can
          use promptly and only when picking is allowed.
        </li>
      </ul>
      <p>
        <a href="https://ucanr.edu/node/124994/printable/print" rel="noopener">
          UC Cooperative Extension
        </a>{" "}
        warns that fig latex can irritate skin. Avoid touching sap, consider
        gloves and long sleeves, and wash exposed skin. The map cannot identify
        the tree or assess an individual&apos;s allergy or sensitivity, so use a
        trusted local identification source and leave uncertain fruit alone.
      </p>

      <h2 className="section">How to judge a Berkeley fig report</h2>
      <p>
        A useful report gets you to a place worth checking. It does not tell you
        whether a crop survived pruning, drought, construction, animals, or
        another picker. Before opening directions, compare the location with
        the map and ask four questions:
      </p>
      <ol className="clean">
        <li>
          <strong>Does the point make sense?</strong> A marker well inside a
          residential parcel is more likely private than a point beside a
          clearly managed public garden or community orchard.
        </li>
        <li>
          <strong>Is there a useful cluster?</strong> Two or three reports within
          walking distance give you alternatives if one tree is gone, unripe,
          inaccessible, or already picked over.
        </li>
        <li>
          <strong>Can you verify the plant before the trip?</strong> Read the{" "}
          <Link href="/species/common-fig">common fig guide</Link>, then compare
          the leaves, bark, branching, fruit attachment, and the entire plant on
          site. A fruit photo alone is not enough.
        </li>
        <li>
          <strong>Can you verify access?</strong> A sidewalk view does not make a
          tree public. Check the parcel, posted rules, and the current land
          manager&apos;s guidance. Ask before picking on private property.
        </li>
      </ol>

      <h2 className="section">Plan one useful fig walk</h2>
      <ol className="clean">
        <li>
          Start with a Berkeley neighborhood or address you can reach easily,
          then filter your attention to common fig reports.
        </li>
        <li>
          Choose a short cluster of reports rather than crossing the city for
          one old marker.
        </li>
        <li>
          Read the plant guide and note the ripeness cues before you leave. Bring
          a small container only if the site clearly allows harvest.
        </li>
        <li>
          On arrival, confirm the location, whole plant, fruit condition,
          property boundary, and permission. Do not reach across a fence or
          enter a yard because a map point appears nearby.
        </li>
        <li>
          Take a modest amount, leave unripe and damaged fruit, and abandon the
          plan if identity, access, spraying, roadside exposure, or site
          cleanliness is uncertain.
        </li>
      </ol>
      <p>
        If figs are not ready, use the{" "}
        <Link href="/locations/berkeley">Berkeley foraging guide</Link> to check
        other plants in season. The{" "}
        <Link href="/seasonal-guide">year-round seasonal foraging guide</Link>{" "}
        gives a broader month-by-month view, and the{" "}
        <Link href="/locations/public-fruit-trees">
          public fruit tree guide
        </Link>{" "}
        explains why ownership and permission still need a separate check.
      </p>

      <h2 className="section">Where the Berkeley reports come from</h2>
      <p>
        Forage Around begins with crowd-sourced plant locations from{" "}
        <a href="https://fallingfruit.org" rel="noopener">
          Falling Fruit
        </a>
        , then adds season context, plant guides, and a map handoff. Reports can
        be old, incomplete, or no longer present. They do not establish
        ownership, public access, plant identity, ripeness, or permission to
        harvest.
      </p>
      <p>
        Want the map workflow without the seasonal detail? The{" "}
        <Link href="/foraging-map">foraging map guide</Link> explains how to
        search, compare reports, check a plant, and open walking directions.
      </p>

      <section className="faq-block" aria-labelledby="berkeley-fig-faq">
        <h2 className="section" id="berkeley-fig-faq">
          Berkeley fig season questions
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
          from="berkeley_fig_season_guide"
          speciesContext="Common fig"
        >
          Search the Berkeley fig map
        </ToAppLink>
        <Link className="btn-outline" href="/locations/berkeley">
          Read the Berkeley city guide
        </Link>
      </div>

      <Credits />
    </>
  );
}
