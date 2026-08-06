import type { Metadata } from "next";
import Link from "next/link";
import { LocationsPageViewed, ToAppLink } from "@/app/analytics";
import { APP_URL, Credits } from "@/app/components";

export const revalidate = 86400;

const PAGE_PATH = "/locations/pawpaw-fruit-map";
const MAP_URL = APP_URL + "?ref=pawpaw_fruit_map";
const META_DESCRIPTION =
  "Find reported pawpaw fruit trees near you, learn the native range, season and ripe-fruit clues, then check access and permission before you pick.";

export const metadata: Metadata = {
  title: "Pawpaw fruit map: find reported trees",
  description: META_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    type: "article",
    title: "Pawpaw fruit map and field guide | Forage Around",
    description: META_DESCRIPTION,
    url: PAGE_PATH,
  },
  twitter: {
    title: "Pawpaw fruit map and field guide | Forage Around",
    description: META_DESCRIPTION,
  },
};

const FAQS = [
  {
    question: "Where do pawpaw trees grow in the United States?",
    answer:
      "Common pawpaw, Asimina triloba, is native across much of the eastern and central United States. Its broad range reaches from parts of New York and Ontario west to Iowa and Nebraska, south to eastern Texas and the Florida Panhandle, and through much of the Ohio and Mississippi river regions.",
  },
  {
    question: "When is pawpaw fruit usually ripe?",
    answer:
      "Pawpaw fruit usually ripens from late summer into early fall. The exact window shifts with latitude, weather, shade and the individual tree. A local report and the fruit itself are more useful than a national calendar date.",
  },
  {
    question: "How can you tell when a pawpaw is ripe?",
    answer:
      "A ripe pawpaw yields slightly to gentle pressure and develops a strong fruity aroma. Skin may stay green or turn yellowish with dark flecks, so color alone is not enough. Fruit that is rock hard is not ready.",
  },
  {
    question: "Does the map prove a pawpaw tree is public and ready to pick?",
    answer:
      "No. A crowd-sourced point is only a lead. It does not confirm the tree is still present, correctly identified, bearing fruit, ripe, publicly accessible or available to harvest. Check the plant, property boundary, posted rules and permission on every visit.",
  },
  {
    question: "Which part of a pawpaw do people eat?",
    answer:
      "People eat the soft ripe pulp. Remove the skin and large dark seeds before eating or cooking. Try a small serving first because some people are sensitive to pawpaw fruit, and leave any fruit you cannot identify with confidence.",
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

export default function PawpawFruitMapPage() {
  return (
    <>
      <LocationsPageViewed
        pageType="species_nearby"
        slug="pawpaw-fruit-map"
        species="Pawpaw"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />

      <Link className="back-link" href="/locations">
        ← Nearby harvests
      </Link>
      <p className="kicker">Pawpaw map and field guide</p>
      <h1 className="title">Pawpaw fruit map: where and when to look</h1>
      <p className="lead">
        A pawpaw range map shows where <em>Asimina triloba</em> can grow. A
        fruit map should help you check where someone has actually reported a
        tree. Use the live map for local leads, then verify the plant, fruit,
        access and permission when you arrive.
      </p>

      <div
        className="seasonal-orientation"
        aria-label="Before you use the pawpaw fruit map"
      >
        <p>
          <strong>A map report is not a harvest promise.</strong> It may be old,
          misplaced or on land where picking is not allowed. It also cannot
          confirm identity, fruit, ripeness or current conditions.
        </p>
      </div>

      <div className="locations-actions">
        <ToAppLink
          className="btn"
          href={MAP_URL}
          from="pawpaw_fruit_map_guide"
          speciesContext="Pawpaw"
        >
          Search reported pawpaw spots
        </ToAppLink>
        <small className="locations-availability-note muted">
          Search an address, then choose “Everything edible”
        </small>
        <Link className="btn-outline" href="/locations/public-fruit-trees">
          Read the public fruit tree guide
        </Link>
      </div>

      <figure className="pawpaw-hero-photo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="photo"
          src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Asimina_triloba3.jpg?width=1200"
          alt="Cluster of oblong green pawpaw fruit hanging beneath broad leaves"
        />
        <figcaption>
          Pawpaw fruit on <em>Asimina triloba</em>. USDA Agricultural Research
          Service image, public domain, via Wikimedia Commons.
        </figcaption>
      </figure>

      <h2 className="section">Two maps answer two different questions</h2>
      <div className="city-season-grid">
        <section className="card">
          <p className="kicker">Native range</p>
          <h3>Could pawpaw grow here?</h3>
          <p>
            The{" "}
            <a
              href="https://research.fs.usda.gov/feis/species-reviews/asitri"
              rel="noopener"
            >
              U.S. Forest Service range description
            </a>{" "}
            places common pawpaw across much of the eastern United States. That
            is ecological context, not the location of one fruiting tree.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Reported spots</p>
          <h3>Has someone mapped a tree nearby?</h3>
          <p>
            Forage Around searches crowd-sourced Falling Fruit reports around
            an address. These points are practical leads, but they are not a
            complete census and they can become stale.
          </p>
        </section>
      </div>
      <p>
        Use both views together. The native range tells you whether a wild
        search is plausible. The report map helps you plan a short walk. Neither
        one proves that fruit will be present when you arrive.
      </p>

      <h2 className="section">Where wild pawpaw usually grows</h2>
      <p>
        Common pawpaw is a deciduous understory tree native to eastern North
        America. The U.S. Forest Service describes a range from western New York
        and southern Ontario through Michigan, Illinois and Iowa, south toward
        eastern Nebraska, Oklahoma and Texas, then east through the Appalachians
        and Florida Panhandle. It is especially familiar in the Ohio and
        Mississippi river regions.
      </p>
      <p>
        Within that broad range, habitat matters. Pawpaw often grows in rich,
        moist deciduous woods, along streams, on floodplains and on ravine
        slopes. It can spread by root suckers into a patch or thicket. Several
        trunks close together may therefore be one clonal colony, and a patch
        of leaves does not guarantee a crop.
      </p>
      <p>
        A shaded patch can survive without producing much fruit. Fruit set also
        depends on pollination, and wildlife often reaches ripe fruit quickly.
        That is why a regional range map can look generous while usable local
        reports remain scarce.
      </p>

      <h2 className="section">When pawpaw season reaches the map</h2>
      <p>
        Pawpaw is a late-summer and early-fall fruit, but the practical window
        changes across its range. The U.S. Forest Service reports fruit ripening
        from July through September in its species review.{" "}
        <a
          href="https://plants.ces.ncsu.edu/plants/asimina-triloba/"
          rel="noopener"
        >
          North Carolina State Extension
        </a>{" "}
        gives a wider August-to-October display window. Latitude, temperature,
        rainfall, shade and the individual tree explain part of that spread.
      </p>
      <div className="city-season-grid">
        <section className="card">
          <p className="kicker">Mid to late summer</p>
          <h3>Scout likely habitat</h3>
          <p>
            Learn the leaves and growth habit, then check reports without
            expecting ripe fruit. Hard green fruit may still need weeks, and a
            leafy patch may have no fruit at all.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Late summer</p>
          <h3>Check local fruit, not a national date</h3>
          <p>
            Warm locations may ripen first. Search a short cluster and inspect
            several fruit rather than relying on one report or one tree.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Early fall</p>
          <h3>Expect a short finish</h3>
          <p>
            Ripe pawpaws soften quickly and wildlife competes for them. A useful
            report one week may be finished the next, so take only what you can
            use promptly.
          </p>
        </section>
      </div>

      <h2 className="section">How to recognize a common pawpaw</h2>
      <p>
        Identification should use the whole plant. North Carolina State
        Extension describes a small understory tree with large, alternate,
        simple leaves. The leaves are roughly oblong to obovate, hang from the
        branches and can reach 6 to 12 inches long. Bark on younger growth is
        smooth with conspicuous lenticels. Burgundy six-petaled flowers appear
        in spring before the fruit.
      </p>
      <ul className="clean">
        <li>
          <strong>Leaves:</strong> large, simple and alternate, with smooth
          margins and a drooping habit along the twig.
        </li>
        <li>
          <strong>Growth:</strong> a small tree or large shrub that may form a
          patch through root suckers, often under taller woodland trees.
        </li>
        <li>
          <strong>Fruit:</strong> oblong green berries that may hang singly or
          in clusters and contain several large, dark seeds.
        </li>
        <li>
          <strong>Context:</strong> moist woods and stream corridors are more
          plausible than an exposed dry field, though cultivated trees can grow
          outside typical wild habitat.
        </li>
      </ul>
      <p>
        Do not identify pawpaw from fruit shape or a phone app alone. Compare
        leaves, branching, bark, fruit attachment and habitat with a trusted
        regional source. Leave it if any important feature does not fit.
      </p>

      <h2 className="section">How to tell whether pawpaw fruit is ripe</h2>
      <p>
        Skin color is a weak test. A ripe pawpaw can remain mostly green, turn
        yellowish or develop brown flecks.{" "}
        <a
          href="https://extension.psu.edu/pawpaw-fruit-in-the-garden-and-the-kitchen"
          rel="noopener"
        >
          Penn State Extension
        </a>{" "}
        recommends looking for fruit that yields slightly to gentle pressure,
        much like a peach. A strong fruity aroma is another clue. Rock-hard
        fruit is not ready.
      </p>
      <p>
        Fruit on the ground is not automatically good. Skip anything split,
        moldy, fermented, heavily bruised, insect-damaged or exposed to obvious
        contamination. Never shake, strike or climb a tree to force a harvest.
        If picking is allowed, take reachable ripe fruit without damaging the
        branch.
      </p>

      <h2 className="section">How to use the pawpaw fruit map</h2>
      <ol className="clean">
        <li>
          Open the map and enter an address inside or near the native range. A
          city, park entrance or trailhead is more useful than a whole state.
        </li>
        <li>
          Choose <strong>Everything edible</strong>. Pawpaw reports may not have
          enough season data to appear in the likely-ripe view.
        </li>
        <li>
          Look for Pawpaw in the nearby list, then compare two or three reports
          within walking distance. One old point is a fragile plan.
        </li>
        <li>
          Open the detail before directions. Check the exact point, source and
          any available note, then compare it with the apparent land boundary.
        </li>
        <li>
          At the site, verify the entire plant, current fruit, access and
          permission. Walk away if any one of those checks fails.
        </li>
      </ol>
      <p>
        No Pawpaw result nearby does not prove the species is absent. It means
        the current report set has no matching point in the searched area. Try
        another access point, consult a local park or extension source, or plan
        a habitat walk without assuming there will be fruit.
      </p>

      <h2 className="section">Check ownership before you pick</h2>
      <p>
        A point near a road, trail or park is not automatically public fruit.
        Coordinates can fall on the wrong side of a parcel line, and public
        access does not always include permission to harvest. Check signs,
        current park rules and the land manager. Ask the owner before picking
        from private property or any tree whose status is unclear.
      </p>
      <p>
        When harvest is clearly allowed, take a modest amount, avoid breaking
        branches and leave fruit for wildlife and other people. Pawpaw patches
        support local ecosystems, including zebra swallowtail caterpillars, so
        the goal is a careful visit rather than the biggest possible haul.
      </p>

      <h2 className="section">Eating and storing ripe pawpaw</h2>
      <p>
        Eat the soft pulp and remove the skin and large dark seeds. The U.S.
        Forest Service notes that seeds contain an alkaloid reported to have
        emetic properties.{" "}
        <a
          href="https://www.kysu.edu/academics/college-ahnr/school-of-anr/pawpaw/pawpaw-description-and-nutritional-information.php/"
          rel="noopener"
        >
          Kentucky State University
        </a>{" "}
        recommends pureeing ripe flesh only after the skin and seeds are
        removed. That pulp can be frozen for later use.
      </p>
      <p>
        Try a small serving first. Some people are sensitive to pawpaw fruit or
        handling the plant. North Carolina State Extension notes reports of
        contact dermatitis and recommends gloves when harvesting. If you have a
        reaction, stop eating or handling it and seek appropriate medical
        advice.
      </p>

      <h2 className="section">Where these pawpaw reports come from</h2>
      <p>
        Forage Around searches crowd-sourced locations from{" "}
        <a href="https://fallingfruit.org" rel="noopener">
          Falling Fruit
        </a>
        , then adds a nearby list, map, plant context and walking directions.
        Reports can be incomplete, duplicated, imprecise or out of date. They
        do not establish ownership, public access, plant identity, fruit,
        ripeness or permission to harvest.
      </p>
      <p>
        For the general workflow, read the{" "}
        <Link href="/foraging-map">foraging map guide</Link>. The{" "}
        <Link href="/locations/public-fruit-trees">
          public fruit tree guide
        </Link>{" "}
        goes deeper on ownership and access, while the{" "}
        <Link href="/seasonal-guide">seasonal foraging guide</Link> helps you
        plan for other fruit if the local pawpaw window has passed.
      </p>

      <section className="faq-block" aria-labelledby="pawpaw-map-faq">
        <h2 className="section" id="pawpaw-map-faq">
          Pawpaw fruit map questions
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

      <div className="pawpaw-next-step">
        <p className="kicker">Start with one address</p>
        <h2>Turn the range into a walkable search</h2>
        <p>
          Check reported plants near a place you can reach, switch to everything
          edible, and treat each pawpaw point as a lead to verify.
        </p>
        <ToAppLink
          className="btn"
          href={MAP_URL}
          from="pawpaw_fruit_map_guide"
          speciesContext="Pawpaw"
        >
          Open the pawpaw fruit map
        </ToAppLink>
      </div>

      <Credits />
    </>
  );
}
