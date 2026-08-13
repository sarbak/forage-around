import type { Metadata } from "next";
import Link from "next/link";
import { LocationsPageViewed, ToAppLink } from "@/app/analytics";
import { APP_URL, Credits } from "@/app/components";
import { MONTHS } from "@/lib/data";

export const revalidate = 86400;

const PAGE_PATH = "/locations/oregon/fruit-in-season";
const MAP_URL = `${APP_URL}?${new URLSearchParams({
  ref: "oregon_fruit_in_season",
  location: "Portland, OR",
}).toString()}`;
const META_DESCRIPTION =
  "See what fruit is in season in Oregon right now, use a month-by-month harvest guide, then check reported fruit plants on the free map.";

export const metadata: Metadata = {
  title: "What fruit is in season in Oregon right now?",
  description: META_DESCRIPTION,
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    type: "article",
    title: "Oregon fruit season by month | Forage Around",
    description: META_DESCRIPTION,
    url: PAGE_PATH,
  },
  twitter: {
    title: "Oregon fruit season by month | Forage Around",
    description: META_DESCRIPTION,
  },
};

const FRUIT_WINDOWS = [
  ["Strawberry", "Late May through August", "June is the classic Willamette Valley harvest, though everbearing varieties can extend the season."],
  ["Cherry", "June through July", "A short early-summer window makes current condition especially important."],
  ["Raspberry", "June through August", "Some varieties can produce again later, but the main Oregon crop is a summer one."],
  ["Blackberry", "June through September", "Cultivated and wild types do not all ripen together; check the whole plant before identifying it."],
  ["Blueberry", "July through September", "Timing varies by variety, elevation, and part of the state."],
  ["Plum", "July through September", "Color alone is not a reliable ripeness test because Oregon plantings include many varieties."],
  ["Peach", "July through September", "Warmer Southern Oregon and Columbia Gorge sites can run ahead of cooler areas."],
  ["Apple", "August through November", "Early varieties start in August, while many storage apples mature in September and October."],
  ["Pear", "August through October", "Many pears are picked mature but firm, then allowed to ripen off the tree."],
] as const;

const MONTHLY_ANSWERS = [
  "Local tree fruit is usually between harvests. Stored Oregon apples and pears may still be available, but a map report does not mean outdoor fruit remains.",
  "Local tree fruit is usually between harvests. Stored apples and pears are more realistic than fresh outdoor fruit in most Oregon locations.",
  "Fresh local fruit is still limited. Use this quieter month to learn plants and check access rather than expecting ripe fruit at a report.",
  "Oregon fruit season is just beginning. A few early strawberries may appear in warmer sites late in spring, but broad availability is still limited.",
  "Strawberries are the first dependable signal, especially late in the month. Warm sites may lead cooler valleys, the coast, and higher elevations.",
  "Strawberries, cherries, raspberries, and early blackberries are the main possibilities. The exact handoff changes quickly with weather.",
  "Cherries, raspberries, blackberries, blueberries, plums, and peaches overlap. This is one of Oregon's broadest fresh-fruit months.",
  "Blackberries, blueberries, raspberries, plums, peaches, early apples, and pears can overlap. Check a current local source before making a special trip.",
  "Apples and pears take the lead while blackberries, blueberries, plums, and peaches taper. Cooler areas may trail warmer Oregon regions.",
  "Apples and pears are the most dependable fresh local fruit. Some late berries or stone fruit may persist, but treat them as local exceptions.",
  "Late apples and pears close the main outdoor fruit season. Stored fruit becomes more common as fresh tree and cane fruit fades.",
  "The main outdoor harvest is over in most of Oregon. Stored apples and pears may be available, while mapped plants are better saved for future planning.",
] as const;

const FAQS = [
  {
    question: "What fruit is in season in Oregon right now?",
    answer: "The answer changes by month and region. In summer, Oregon's sequence moves from strawberries and cherries into raspberries, blackberries, blueberries, plums, and peaches, then toward apples and pears. Check the current-month answer on this page and confirm locally before traveling.",
  },
  {
    question: "When is berry season in Oregon?",
    answer: "Strawberries usually begin in late spring, raspberries and blackberries follow in summer, and blueberries commonly run through late summer. Variety, elevation, coast-versus-inland climate, and weather can shift those windows.",
  },
  {
    question: "When are Oregon apples and pears in season?",
    answer: "Early apples and pears can begin in August, with many varieties maturing in September and October. Some fruit remains available from storage beyond the outdoor harvest. Pears often need to ripen off the tree after harvest.",
  },
  {
    question: "Does the map show fruit that is ripe today?",
    answer: "No. Forage Around shows crowd-sourced plant reports and usual season context, not live inventory. A report does not confirm identity, current fruit, ownership, access, or permission to harvest.",
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

export default function OregonFruitInSeasonPage() {
  const monthNumber = new Date().getUTCMonth() + 1;
  const monthName = MONTHS[monthNumber - 1];
  const currentAnswer = MONTHLY_ANSWERS[monthNumber - 1];

  return (
    <>
      <LocationsPageViewed pageType="category" slug="oregon-fruit-in-season" city="Oregon" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />

      <p className="kicker">Oregon fruit season</p>
      <h1 className="title">What fruit is in season in Oregon right now?</h1>
      <p className="lead">
        In {monthName}, {currentAnswer.charAt(0).toLowerCase()}
        {currentAnswer.slice(1)} Oregon&apos;s harvest dates vary by region and
        weather, so use this as a planning guide, then confirm the fruit and
        site when you arrive.
      </p>

      <div className="seasonal-orientation" aria-label={`Oregon fruit in ${monthName}`}>
        <p className="kicker">The short answer for {monthName}</p>
        <p><strong>{currentAnswer}</strong></p>
        <p>
          The Oregon Health Authority notes that availability varies by
          location. A Portland market list, an orchard calendar, and a
          crowd-sourced plant report answer different questions, so verify the
          one that matters before you go.
        </p>
      </div>

      <div className="locations-actions">
        <ToAppLink className="btn" href={MAP_URL} from="oregon_fruit_season_guide">
          Check fruit reports around Portland
        </ToAppLink>
        <small className="locations-availability-note muted">
          Reports are leads, not live fruit or permission
        </small>
        <Link className="btn-outline" href="/locations/portland">
          Open the Portland foraging guide
        </Link>
      </div>

      <h2 className="section">Oregon fruit season at a glance</h2>
      <p>
        Oregon does not have one statewide harvest clock. The Rogue Valley,
        Columbia Gorge, Willamette Valley, coast, and high desert can reach the
        same fruit at different times. Oregon State University Extension notes
        that apples and pears in early regions can mature about 10 days ahead of
        midseason regions, while coastal and high-elevation areas can run about
        10 days later. Variety and that year&apos;s bloom date add more movement.
      </p>
      <p>
        These broad windows are for trip planning, not promises about a
        particular tree. They combine Oregon public season guidance with the
        practical species context used by Forage Around.
      </p>

      <div className="city-season-grid">
        {FRUIT_WINDOWS.map(([fruit, months, note]) => (
          <section className="card" key={fruit}>
            <p className="kicker">{months}</p>
            <h3><Link href={`/species/${fruit.toLowerCase()}`}>{fruit}</Link></h3>
            <p>{note}</p>
          </section>
        ))}
      </div>

      <h2 className="section">How Oregon&apos;s fruit calendar unfolds</h2>
      <div className="city-season-grid">
        <section className="card">
          <p className="kicker">Late spring</p>
          <h3>Strawberries start the fresh-fruit year</h3>
          <p>
            OSU Extension describes June-bearing strawberries as a June crop in
            the Willamette Valley, with eastern Oregon sometimes reaching
            harvest in July. Everbearing types can stretch longer. That makes
            strawberries a useful first signal, not a statewide same-day forecast.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Early summer</p>
          <h3>Cherries and raspberries arrive quickly</h3>
          <p>
            June and July bring the shortest, fastest-moving part of the Oregon
            calendar. Cherries can pass their best window quickly, while
            raspberries may continue after them. Check a report&apos;s age and
            keep a backup location rather than relying on one pin.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Midsummer</p>
          <h3>Berries and stone fruit overlap</h3>
          <p>
            July and August are the broadest months. Blackberries, blueberries,
            raspberries, plums, and peaches can overlap, with timing shaped by
            irrigation, shade, slope, variety, and weather. This is the best
            stretch for a mixed-fruit walk rather than one species.
          </p>
        </section>
        <section className="card">
          <p className="kicker">Late summer into fall</p>
          <h3>Apples and pears take over</h3>
          <p>
            Early apples and pears begin in August, then more varieties mature
            in September and October. OSU Extension lists August through October
            maturity dates for many common varieties. Unlike apples, many pears
            should be harvested mature but firm and ripened afterward.
          </p>
        </section>
      </div>

      <h2 className="section">Fresh harvest, market availability, and map reports differ</h2>
      <p>
        A seasonal market page tells you what vendors have brought to market.
        That is the best source for deciding what to buy this week, but it may
        include fruit grown elsewhere in Oregon and transported to Portland. A
        farm calendar tells you what one grower expects on its own land. A
        neighborhood map report only says someone recorded a plant there,
        sometimes years ago.
      </p>
      <p>
        Forage Around is designed for the last of those jobs. It combines
        crowd-sourced plant locations from Falling Fruit with species guides and
        usual season windows. It does not confirm that fruit is present now, and
        it does not turn a reported plant into public property. Use the map to
        form a short list, not to skip the on-site checks.
      </p>

      <h2 className="section">Plan a responsible fruit walk in five steps</h2>
      <ol className="clean">
        <li>
          <strong>Choose one seasonal group.</strong> In June, start with
          strawberries, cherries, and raspberries. In September, start with
          apples and pears, then treat remaining berries or stone fruit as a bonus.
        </li>
        <li>
          <strong>Search where you can actually walk.</strong> Open the map near
          your address and compare several reports instead of building a trip
          around one old record.
        </li>
        <li>
          <strong>Read the species guide first.</strong> Learn whole-plant
          features, the edible part, usual season, and cautions before you leave.
          A fruit color or phone photo is not enough for identification.
        </li>
        <li>
          <strong>Check land status and permission.</strong> A plant visible
          from a sidewalk may still be private. Portland Parks rules prohibit
          removing plants and flowers from parks, and other Oregon land managers
          set their own rules.
        </li>
        <li>
          <strong>Check current condition.</strong> Skip fruit exposed to
          obvious spraying, heavy roadside pollution, pet waste, mold, or other
          contamination. Take only what you can identify, use, and lawfully harvest.
        </li>
      </ol>

      <h2 className="section">Reliable sources for a current Oregon check</h2>
      <p>
        For what vendors have now, use the regularly updated{" "}
        <a href="https://www.portlandfarmersmarket.org/whats-in-season/" rel="noopener">
          Portland Farmers Market season list
        </a>
        . It warns that weather and weekly availability change. For a public
        calendar, use the{" "}
        <a
          href="https://www.oregon.gov/oha/ph/healthypeoplefamilies/wic/fdnp/pages/wic-farm-direct-participants.aspx"
          rel="noopener"
        >
          Oregon Health Authority seasonality chart
        </a>
        , which covers common Oregon fruits and notes regional variation.
      </p>
      <p>
        For technique and regional timing, OSU Extension&apos;s{" "}
        <a href="https://extension.oregonstate.edu/catalog/fs-147-picking-storing-apples-pears" rel="noopener">
          apple and pear harvest guide
        </a>{" "}
        explains maturity dates and regional differences. Its{" "}
        <a href="https://extension.oregonstate.edu/catalog/ec-1307-growing-strawberries-your-home-garden" rel="noopener">
          strawberry guide
        </a>{" "}
        explains how crop type and region change the berry season.
      </p>

      <section className="faq-block" aria-labelledby="oregon-fruit-faq">
        <h2 className="section" id="oregon-fruit-faq">Oregon fruit season questions</h2>
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
        <ToAppLink className="btn" href={MAP_URL} from="oregon_fruit_season_guide">
          Search reported fruit plants near Portland
        </ToAppLink>
        <Link className="btn-outline" href="/seasonal-guide">
          Browse the year-round season guide
        </Link>
      </div>

      <Credits />
    </>
  );
}
