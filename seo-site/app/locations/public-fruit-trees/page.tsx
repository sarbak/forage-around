import type { Metadata } from "next";
import Link from "next/link";
import { LocationsPageViewed, ToAppLink } from "../../analytics";
import { APP_URL, Credits } from "../../components";

export const revalidate = 86400;

const PAGE_PATH = "/locations/public-fruit-trees";
const META_DESCRIPTION =
  "Find reported public fruit trees near you with a free map, then check ownership, local rules, plant identity, season, and permission before picking.";

export const metadata: Metadata = {
  title: "Public fruit trees near me: map and picking guide",
  description: META_DESCRIPTION,
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    type: "website",
    title: "Find public fruit trees near you",
    description: META_DESCRIPTION,
    url: PAGE_PATH,
  },
};

const FAQS = [
  {
    question: "How can I find public fruit trees near me?",
    answer:
      "Open the free Forage Around map, search your address, and compare nearby fruit-tree reports. Treat each marker as a lead. Check the tree, the property boundary, posted rules, and local picking rules when you arrive.",
  },
  {
    question: "Can I pick fruit from a tree in a public park?",
    answer:
      "Not automatically. Rules differ between parks, cities, and land managers. A park may be open to visitors while still limiting plant removal. Check signs and local rules, or ask the agency that manages the site before picking.",
  },
  {
    question: "Is fruit hanging over a sidewalk free to pick?",
    answer:
      "Do not assume so. A branch can extend over a public walkway while the tree remains privately owned, and local rules vary. Confirm the property boundary and permission before taking fruit.",
  },
  {
    question: "Does a map marker prove a fruit tree is public?",
    answer:
      "No. Crowd-sourced reports can be old, imprecise, or missing ownership details. The marker helps you plan a visit, but you still need to confirm access, ownership, local rules, plant identity, and current condition.",
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

const TREE_GUIDES = [
  {
    name: "Mulberry",
    href: "/species/mulberry",
    timing: "Usually late spring into summer",
    note: "Soft fruit can ripen unevenly on one tree.",
  },
  {
    name: "Plum",
    href: "/species/plum",
    timing: "Usually summer",
    note: "Color alone does not confirm ripeness or variety.",
  },
  {
    name: "Common fig",
    href: "/species/common-fig",
    timing: "Usually warm months into fall",
    note: "Some climates produce more than one crop.",
  },
  {
    name: "Apple",
    href: "/species/apple",
    timing: "Usually late summer into fall",
    note: "Ornamental crabapples and eating apples need different checks.",
  },
  {
    name: "Pear",
    href: "/species/pear",
    timing: "Usually late summer into fall",
    note: "Many pears finish ripening after they are picked.",
  },
  {
    name: "Persimmon",
    href: "/species/persimmon",
    timing: "Usually fall into early winter",
    note: "Astringent kinds need to soften fully before eating.",
  },
] as const;

export default function PublicFruitTreesPage() {
  return (
    <>
      <LocationsPageViewed
        pageType="category"
        slug="public-fruit-trees"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />

      <p className="kicker">Public fruit tree map</p>
      <h1 className="title">
        Find public fruit trees near you, then check before you pick
      </h1>
      <p className="lead">
        Search a free map for reported apples, plums, figs, mulberries, pears,
        and other fruit trees near your address. A marker can help you plan a
        walk, but it cannot prove that a tree is public, ripe, correctly
        identified, or available to harvest.
      </p>

      <div className="locations-actions">
        <ToAppLink className="btn" href={APP_URL} from="locations">
          Search for fruit trees near me →
        </ToAppLink>
        <small className="locations-availability-note muted">
          Free, no account needed. Confirm access and local rules before picking.
        </small>
      </div>

      <div className="seasonal-orientation" aria-label="Before using a report">
        <strong>A public-looking tree is not always a public tree</strong>
        <p>
          Street trees, park trees, community orchards, and branches over a
          sidewalk can all have different owners and rules. Use the map to find
          a possible tree, then verify the site instead of treating the pin as
          permission.
        </p>
      </div>

      <h2 className="section">How to find public fruit trees near you</h2>
      <p>
        Start with a small search area you can actually walk. A national map is
        most useful after it is narrowed to an address, a neighborhood, a park,
        or a transit stop. Forage Around begins with crowd-sourced reports from{" "}
        <a href="https://fallingfruit.org" rel="noopener">
          Falling Fruit
        </a>{" "}
        and adds season context and plant guides. Forage Around is independent
        and is not affiliated with Falling Fruit.
      </p>
      <ol className="clean">
        <li>
          <strong>Search an address.</strong> Open the map near home, work, a
          park, or the start of a planned walk.
        </li>
        <li>
          <strong>Compare a few reports.</strong> Choose two or three fruit-tree
          markers close enough to check in one outing. A single old report is a
          weak reason for a long trip.
        </li>
        <li>
          <strong>Read the plant guide.</strong> Check the usual season, edible
          part, and basic identification notes before you leave.
        </li>
        <li>
          <strong>Verify the site in person.</strong> Look for property
          boundaries, signs, fences, park rules, and anything that shows who
          manages the tree.
        </li>
        <li>
          <strong>Leave it when the answer is unclear.</strong> A missed piece
          of fruit is better than trespassing, breaking a local rule, or eating
          a plant you cannot identify.
        </li>
      </ol>
      <p>
        If you want the broader map workflow first, read{" "}
        <Link href="/foraging-map">how to use the urban foraging map</Link>. For
        a month-by-month planning view, use the{" "}
        <Link href="/seasonal-guide">seasonal foraging guide</Link>.
      </p>

      <h2 className="section">
        What &quot;public&quot; can mean on a fruit-tree map
      </h2>
      <p>
        Search results often use &quot;public fruit tree&quot; as shorthand for
        a tree that can be seen or reached from public space. That is not the
        same as a verified right to harvest. The practical question has several
        parts: who owns the tree, whether you may enter the site, whether the
        land manager allows picking, and whether a local rule limits removal of
        plants or fruit.
      </p>
      <div className="city-season-grid">
        <div className="card">
          <p className="kicker">Street and sidewalk trees</p>
          <h3>Visible does not settle ownership</h3>
          <p>
            A trunk may stand in a planting strip, on private property, or near
            an uncertain boundary. Fruit hanging over a sidewalk is not
            automatic permission to pick. Check the boundary and local rules.
          </p>
        </div>
        <div className="card">
          <p className="kicker">Parks and civic land</p>
          <h3>Open access can still have harvest rules</h3>
          <p>
            A park can welcome visitors while limiting cutting, climbing, or
            removal of plants. Read posted signs and check the land manager&apos;s
            rules when the policy is not clear.
          </p>
        </div>
        <div className="card">
          <p className="kicker">Community orchards</p>
          <h3>Harvest may be organized</h3>
          <p>
            Some orchards invite picking, while others reserve fruit for
            scheduled harvests, food banks, volunteers, or members. Follow the
            orchard&apos;s instructions instead of assuming an open gate means an
            open harvest.
          </p>
        </div>
        <div className="card">
          <p className="kicker">Private yards and lots</p>
          <h3>Ask before entering or picking</h3>
          <p>
            A crowd-sourced report can be misplaced or out of date. Do not
            cross a fence, enter a yard, or pick from a privately owned tree
            without the owner&apos;s permission.
          </p>
        </div>
      </div>

      <h2 className="section">Fruit trees to look for by season</h2>
      <p>
        Season timing helps decide which reports are worth checking, but it is
        not a local forecast. Climate, variety, elevation, irrigation, pruning,
        and the year&apos;s weather can move harvest timing by weeks. One tree can
        also hold unripe, ripe, and overripe fruit at the same time.
      </p>
      <div className="species-grid">
        {TREE_GUIDES.map(({ name, href, timing, note }) => (
          <Link key={name} href={href}>
            <span aria-hidden="true">🌳</span>
            <span>
              <strong>{name}</strong>
              <br />
              <small className="muted">
                {timing}. {note}
              </small>
            </span>
          </Link>
        ))}
      </div>
      <p className="muted">
        These are broad planning windows, not proof that a mapped tree is ready
        now. Open the linked guide, inspect the fruit itself, and use a trusted
        local identification source before eating anything.
      </p>

      <h2 className="section">How to check a reported tree when you arrive</h2>
      <p>
        A good visit separates four questions that maps tend to blur together.
        Answer each one before harvesting.
      </p>
      <ol className="clean">
        <li>
          <strong>Is this the reported tree?</strong> Coordinates can drift, and
          several similar trees may stand close together. Match the report to
          the actual trunk and site rather than choosing the nearest fruit.
        </li>
        <li>
          <strong>Can you identify it?</strong> Compare leaves, fruit, bark,
          growth habit, and any important look-alikes. A common name on a pin is
          not an identification.
        </li>
        <li>
          <strong>Is it in usable condition?</strong> Check ripeness, mold,
          insects, traffic exposure, spraying notices, and obvious pollution.
          Do not eat damaged or contaminated fruit.
        </li>
        <li>
          <strong>Are you welcome to pick?</strong> Confirm ownership, public
          access, the land manager&apos;s policy, and local rules. Ask when the
          answer is not posted or obvious.
        </li>
      </ol>
      <p>
        The answer can change between visits. A tree may be removed, a site may
        close, or a harvest program may reserve fruit that was previously
        available. Crowd-sourced maps work best when treated as current leads to
        verify, not permanent promises.
      </p>

      <h2 className="section">Pick carefully when harvesting is allowed</h2>
      <ul className="clean">
        <li>
          Take a small amount and leave plenty for other people, wildlife, and
          the people who care for the tree.
        </li>
        <li>
          Pick reachable fruit without climbing, breaking branches, shaking the
          tree, or entering planted areas.
        </li>
        <li>
          Prefer sound fruit. Leave anything you cannot identify or that shows
          rot, contamination, or chemical-treatment warnings.
        </li>
        <li>
          Bring a container and clean up dropped fruit or debris you create.
        </li>
        <li>
          Thank or support community orchard stewards when a local program made
          the harvest possible.
        </li>
      </ul>
      <p>
        A careful harvest protects more than one outing. It keeps the site
        usable, reduces conflict with neighbors and land managers, and makes it
        more likely that public fruit projects stay open.
      </p>

      <h2 className="section">Start with a local guide</h2>
      <p>
        City pages add broad seasonal context before you open the same live map.
        Try the <Link href="/locations/seattle">Seattle foraging guide</Link>,{" "}
        <Link href="/locations/berkeley">Berkeley harvest guide</Link>,{" "}
        <Link href="/locations/portland">Portland foraging guide</Link>, or{" "}
        <Link href="/locations/los-angeles">Los Angeles foraging guide</Link>.
        The <Link href="/locations">nearby harvest index</Link> lists every
        available city and plant route.
      </p>

      <section className="faq-block" aria-labelledby="public-fruit-tree-faq">
        <h2 className="section" id="public-fruit-tree-faq">
          Public fruit tree questions
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

      <p style={{ margin: "28px 0" }}>
        <ToAppLink className="btn" href={APP_URL} from="locations">
          Open the public fruit tree map →
        </ToAppLink>
      </p>

      <Credits />
    </>
  );
}
