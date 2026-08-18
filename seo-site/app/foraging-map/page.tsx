import type { Metadata } from "next";
import Link from "next/link";
import { allSpeciesNames, species, trees } from "@/lib/data";
import { ForagingMapPageViewed, ToAppLink } from "../analytics";
import { APP_URL, Credits } from "../components";

export const revalidate = 86400;

const PAGE_PATH = "/foraging-map";
const META_DESCRIPTION =
  "Explore a free urban foraging map for reported berries, fruit trees, and nuts near you, with seasonal harvest windows and simple preservation ideas.";

export const metadata: Metadata = {
  title: "Urban foraging map: find edible plants near you",
  description: META_DESCRIPTION,
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    type: "website",
    title: "Urban foraging map for edible plants near you",
    description: META_DESCRIPTION,
    url: PAGE_PATH,
  },
};

const FAQS = [
  {
    question: "What is a foraging map?",
    answer:
      "A foraging map collects reported locations of edible plants so you can explore possible finds near an address. A marker is a starting point, not a live inventory or permission to harvest.",
  },
  {
    question: "Is this urban foraging map free?",
    answer:
      "Yes. Forage Around is free to use and does not require an account to search the map, open a report, or get walking directions.",
  },
  {
    question: "Does every marker show a plant I can pick?",
    answer:
      "No. Reports can be old, incomplete, or on land where access is restricted. Confirm the plant, current conditions, land status, local rules, and permission before entering or picking.",
  },
  {
    question: "Where do the reported locations come from?",
    answer:
      "The starter map uses crowd-sourced plant locations from Falling Fruit, then adds season context and plant guides. Forage Around is an independent project and is not affiliated with Falling Fruit.",
  },
  {
    question: "What can I preserve after an urban foraging walk?",
    answer:
      "It depends on the plant and your confidence in its identity. Common ideas include freezing blackberries, cooking apples or plums into sauce or jam, drying figs, and drying hazelnuts or walnuts before storing them.",
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

const edibleReportCount = trees.filter(
  (tree) => tree.edible !== false && species[tree.type]?.edible,
).length;
const representedSpeciesCount = new Set(
  trees
    .filter((tree) => tree.edible !== false && species[tree.type]?.edible)
    .map((tree) => tree.type),
).size;

const STARTER_GUIDES = [
  { name: "Blackberry", note: "Summer berry · freeze or make jam" },
  { name: "Apple", note: "Late-summer fruit tree · sauce or dry" },
  { name: "Common fig", note: "Warm-season fruit tree · dry or preserve" },
  { name: "Plum", note: "Summer fruit tree · jam or dry" },
  { name: "Hazelnut", note: "Early-fall nut · dry in the shell" },
  { name: "Walnut", note: "Fall nut · dry before cracking" },
] as const;

const SEASONAL_WINDOWS = [
  {
    season: "Spring",
    window: "March–May",
    examples: "Tender greens, herbs, and early blossoms",
  },
  {
    season: "Summer",
    window: "June–August",
    examples: "Blackberries, plums, figs, and mulberries",
  },
  {
    season: "Fall",
    window: "September–November",
    examples: "Apples, hazelnuts, walnuts, and late figs",
  },
  {
    season: "Winter",
    window: "December–February",
    examples: "Citrus in mild climates and a planning reset",
  },
] as const;

export default function ForagingMapPage() {
  const edibleGuideCount = allSpeciesNames().filter(
    (name) => species[name]?.edible,
  ).length;

  return (
    <>
      <ForagingMapPageViewed />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />

      <section className="map-guide-hero">
        <p className="kicker">Free urban foraging map</p>
        <h1 className="title">
          Find berries, fruit trees, and nuts on the urban foraging map
        </h1>
        <p className="lead">
          Search an address to explore reported edible plants nearby. Then use
          seasonal windows and plant guides to plan a short walk before you
          check the site in person.
        </p>

        <div className="locations-actions">
          <ToAppLink className="btn" href={APP_URL} from="foraging_map">
            Open the free foraging map →
          </ToAppLink>
          <small className="locations-availability-note muted">
            No account required. Reports are starting points, not permission to
            pick.
          </small>
        </div>

        <div className="map-guide-route" aria-label="How the map helps">
          <div>
            <span aria-hidden="true">1</span>
            <strong>Search a place</strong>
          </div>
          <span className="route-line" aria-hidden="true" />
          <div>
            <span aria-hidden="true">2</span>
            <strong>Compare reports</strong>
          </div>
          <span className="route-line" aria-hidden="true" />
          <div>
            <span aria-hidden="true">3</span>
            <strong>Plan a walk</strong>
          </div>
        </div>
      </section>

      <div className="card">
        <p style={{ marginTop: 0 }}>
          The bundled starter dataset has{" "}
          <strong>{edibleReportCount.toLocaleString()} edible-plant reports</strong>{" "}
          across {representedSpeciesCount.toLocaleString()} represented species.
          The site also has guides for {edibleGuideCount.toLocaleString()} edible
          plants.
        </p>
        <p className="muted" style={{ marginBottom: 0 }}>
          The count describes the whole starter dataset. It does not promise a
          report near every address, or that a reported plant is still present
          and ready to harvest.
        </p>
      </div>

      <h2 className="section">What this foraging map helps you do</h2>
      <p>
        A useful foraging map should do more than place pins on a screen. It
        should help you narrow a walk to a few plausible stops while keeping the
        limits of crowd-sourced data clear. Forage Around is built around that
        small decision: is this reported plant worth checking today?
      </p>
      <ul className="clean">
        <li>
          <strong>Search near an address.</strong> Start where you actually plan
          to walk instead of browsing a national directory.
        </li>
        <li>
          <strong>Compare nearby reports.</strong> Open a marker to see the plant
          name, distance, report details, and a route to the location.
        </li>
        <li>
          <strong>Check usual season timing.</strong> Use the calendar as a clue,
          then check the plant itself because weather and local conditions move
          ripening dates.
        </li>
        <li>
          <strong>Read before you pick.</strong> Plant guides point you toward
          identification notes and edible parts without treating a map report as
          proof of identity.
        </li>
      </ul>

      <h2 className="section">How to use the map for a short foraging walk</h2>
      <ol className="clean">
        <li>
          Open the map and search your starting address, neighborhood, or park.
        </li>
        <li>
          Switch to the map view and open two or three reports close enough to
          check on one walk.
        </li>
        <li>
          Read the linked plant guide and the{" "}
          <Link href="/seasonal-guide">current seasonal foraging guide</Link>.
          A typical season is useful for planning, but it cannot confirm local
          ripeness.
        </li>
        <li>
          Before walking onto a site, check whether it is public and whether
          local rules allow picking. Ask permission on private land.
        </li>
        <li>
          At the report, confirm the plant with a trusted local source. If the
          details do not match or you are unsure, leave it.
        </li>
      </ol>
      <p>
        This approach works best when the map is treated as a walk-planning
        tool, not a guarantee. Crowd-sourced reports change. Plants get removed,
        fruiting varies by year, and a location visible from the sidewalk may
        still be private.
      </p>

      <section aria-labelledby="seasonal-harvest-windows">
        <h2 className="section" id="seasonal-harvest-windows">
          Seasonal harvest windows at a glance
        </h2>
        <p>
          The same neighborhood can look completely different from one season
          to the next. Use these broad windows to choose what to search for,
          then open a plant guide for the usual months in your area.
        </p>
        <div className="harvest-calendar">
          {SEASONAL_WINDOWS.map(({ season, window, examples }) => (
            <article key={season}>
              <p>{window}</p>
              <h3>{season}</h3>
              <span>{examples}</span>
            </article>
          ))}
        </div>
        <p className="muted seasonal-caveat">
          Timing varies by climate, weather, elevation, and the individual
          plant. A calendar is a planning clue, never proof that a report is
          ready.
        </p>
      </section>

      <h2 className="section">Plants to look up before you go</h2>
      <p className="muted">
        Start with a named guide for a berry, fruit tree, or nut. Each guide
        connects usual season timing with edible-part notes and practical ways
        to use or keep what you find.
      </p>
      <div className="species-grid">
        {STARTER_GUIDES.map(({ name, note }) => (
          <Link
            key={name}
            href={`/species/${name.toLowerCase().replaceAll(" ", "-")}`}
          >
            <span aria-hidden="true">{species[name]?.emoji ?? "🌿"}</span>
            <span>
              {name}
              <br />
              <small className="muted">{note}</small>
            </span>
          </Link>
        ))}
      </div>

      <section aria-labelledby="preserve-the-harvest">
        <h2 className="section" id="preserve-the-harvest">
          Simple ways to preserve a small harvest
        </h2>
        <p>
          Bring home only what you can identify, use, and process promptly.
          Preservation is most useful for ripe fruit that would otherwise spoil
          and for sound nuts that have been dried correctly.
        </p>
        <div className="preservation-grid">
          <article>
            <span aria-hidden="true">⬛</span>
            <div>
              <h3>Berries</h3>
              <p>
                Freeze blackberries in a single layer, or cook them into jam,
                syrup, or a drinking shrub.
              </p>
            </div>
          </article>
          <article>
            <span aria-hidden="true">🍏</span>
            <div>
              <h3>Fruit trees</h3>
              <p>
                Turn apples into sauce, plums into jam, and figs into dried
                fruit. Refrigerate damaged fruit and use it first.
              </p>
            </div>
          </article>
          <article>
            <span aria-hidden="true">🌰</span>
            <div>
              <h3>Nuts</h3>
              <p>
                Dry hazelnuts or walnuts in a well-ventilated place before
                storing them in the shell. Discard moldy or rancid nuts.
              </p>
            </div>
          </article>
        </div>
      </section>

      <h2 className="section">What a reported location does not mean</h2>
      <p>
        A map marker does not establish that a plant is correctly identified,
        ripe, edible, accessible, or available to harvest. It also does not show
        who owns the land or replace local rules. Treat every report as a lead
        that needs an on-site check.
      </p>
      <div className="seasonal-orientation" aria-label="Before harvesting">
        <strong>Check four things before harvesting</strong>
        <p>
          Confirm the species and edible part, inspect current condition, verify
          public access or get permission, and follow local picking rules. When
          any one of those is unclear, leave the plant alone.
        </p>
      </div>

      <h2 className="section">Where the map data comes from</h2>
      <p>
        Forage Around begins with crowd-sourced location data from{" "}
        <a href="https://fallingfruit.org" rel="noopener">
          Falling Fruit
        </a>
        , a volunteer-run map of the urban harvest. Forage Around presents a
        focused way to search those reports, adds its own season and plant-guide
        context, and keeps the source visible. It is an independent,
        non-commercial project and is not affiliated with Falling Fruit.
      </p>
      <p>
        Want a place-specific starting point? Browse the{" "}
        <Link href="/locations/seattle">Seattle foraging guide</Link>, the{" "}
        <Link href="/locations/berkeley">Berkeley foraging guide</Link>, or the{" "}
        <Link href="/locations">nearby harvest guide</Link>. Each route leads
        back to the same map search with a little more local or seasonal context.
      </p>

      <section className="faq-block" aria-labelledby="foraging-map-faq">
        <h2 className="section" id="foraging-map-faq">
          Foraging map questions
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
        <ToAppLink className="btn" href={APP_URL} from="foraging_map">
          Search the foraging map near me →
        </ToAppLink>
      </p>

      <Credits />
    </>
  );
}
