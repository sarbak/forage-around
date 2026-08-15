import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  speciesNameFromSlug,
  getSpecies,
  wikiTitleForName,
  imagesForName,
  seasonLabel,
  peakLabel,
  allSpeciesNames,
  slugify,
  species as allSpecies,
} from "@/lib/data";
import { getWikipedia } from "@/lib/wikipedia";
import { submissionsForSpecies } from "@/lib/submissions";
import { cityHarvestFromSlug } from "@/lib/city-harvests";
import { MONTH_SEASON_PROFILES } from "@/lib/monthly-season-pages";
import { Credits, APP_URL } from "../../components";
import { SubmissionList } from "../../Submissions";
import { SpeciesPageViewed, ToAppLink } from "../../analytics";

export const revalidate = 3600;
export const dynamicParams = true;

const BLACKBERRY_NAME = "Blackberry";
const BLACKBERRY_TITLE =
  "Blackberry foraging guide: season, identification and map";
const BLACKBERRY_DESCRIPTION =
  "Learn blackberry identification cues, typical July–September timing, how to judge crowd-sourced reports, and where picking is allowed before opening the map.";

function BlackberryGuide() {
  return (
    <>
      <h2 className="section">How to identify a blackberry patch</h2>
      <p>
        <strong>Look beyond berry color.</strong> Blackberry is a broad common
        name for several <em>Rubus</em> species and hybrids. Match the fruit to
        the leaves, flowers, canes, and growth habit instead of identifying a
        plant from one dark berry.
      </p>
      <ul className="clean">
        <li>
          Follow a fruit cluster back to its cane. Wild types may trail, stand
          upright, or form high arching thickets. Many have prickles, but some
          cultivated and escaped blackberries are thornless.
        </li>
        <li>
          Check the whole leaf and stem. Himalayan blackberry commonly has
          large toothed leaflets, often in groups of five, on thick, ridged,
          arching canes with curved prickles.
        </li>
        <li>
          Notice the ripening sequence. Berries commonly change from green to
          red and then deep purple-black, but color alone does not confirm the
          species or that the fruit is ready to eat.
        </li>
        <li>
          If you pick a confirmed ripe fruit, the pale core stays with a
          blackberry. A raspberry usually leaves that core on the plant. Use
          this as one supporting clue, not a complete identification.
        </li>
      </ul>
      <p className="muted">
        Blackberry species vary by region. Compare your plant with a trusted
        local field guide. In the Pacific Northwest, see the{" "}
        <a
          href="https://extension.oregonstate.edu/catalog/pub/ec-1617-blackberry-cultivars-oregon"
          rel="external noopener"
        >
          Oregon State University guide to blackberry types
        </a>{" "}
        and{" "}
        <a
          href="https://kingcounty.gov/en/dept/dnrp/nature-recreation/environment-ecology-conservation/noxious-weeds/identification-control/himalayan-blackberry"
          rel="external noopener"
        >
          King County&apos;s Himalayan blackberry description
        </a>
        .
      </p>

      <h2 className="section">When blackberry season usually starts</h2>
      <p>
        Forage Around uses <strong>July through September</strong> as a broad
        planning window, with August as the typical peak. Some trailing types
        in the Pacific Northwest begin in June, while later cultivars can
        continue into October. Sun, elevation, weather, and variety can shift
        the timing by weeks.
      </p>
      <p>
        Treat the calendar as a reason to check, not as evidence that a mapped
        patch has ripe fruit. Look for berries at several color stages on the
        plant and leave hard, red, damaged, moldy, or contaminated fruit alone.
      </p>

      <h2 className="section">How to judge a reported find</h2>
      <p>
        <strong>A pin is a lead, not proof.</strong> Forage Around shows
        crowd-sourced locations from Falling Fruit. A report does not confirm
        that the plant is still present, correctly named, ripe today, publicly
        accessible, or available to pick.
      </p>
      <ol className="clean">
        <li>
          Check whether the coordinates point to a plausible growing space,
          not a roadway, building, or fenced private yard.
        </li>
        <li>
          Compare any report note with what is visible at the site. Do not
          stretch the marker to a different nearby plant.
        </li>
        <li>
          Confirm several plant features with trusted local sources before
          treating the report as credible.
        </li>
        <li>
          Recheck fruit condition, land status, posted rules, and permission
          when you arrive. All of those can change after a report is added.
        </li>
      </ol>

      <h2 className="section">Before you pick</h2>
      <p>
        <strong>Public access does not automatically allow harvest.</strong>{" "}
        Check the land manager&apos;s rules for parks, trails, roadsides, and
        natural areas. On private land, get permission from the owner before
        entering or reaching across a boundary. Leave the patch alone when
        ownership or the rule is unclear.
      </p>
      <p>
        Avoid plants that may have been sprayed or exposed to unsafe roadside,
        industrial, or polluted conditions. Wear clothing that protects you
        from prickles, take only a modest amount, and leave plenty for wildlife
        and other people.
      </p>
    </>
  );
}

export async function generateStaticParams() {
  return allSpeciesNames()
    .filter((n) => allSpecies[n]?.edible)
    .map((n) => ({ slug: slugify(n) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const name = speciesNameFromSlug(slug);
  if (!name) return { title: "Not found" };
  const s = getSpecies(name);
  const when = s ? seasonLabel(s) : null;
  if (name === BLACKBERRY_NAME) {
    return {
      title: BLACKBERRY_TITLE,
      description: BLACKBERRY_DESCRIPTION,
      alternates: {
        canonical: "/species/" + slug,
      },
    };
  }
  return {
    title: `Foraging ${name}: typical season and guide notes`,
    description:
      `See ${name}${when ? `'s typical season around ${when}` : " guide notes"}, ` +
      "reported locations, and identification reminders before harvesting.",
    alternates: {
      canonical: `/species/${slug}`,
    },
  };
}

export default async function SpeciesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const name = speciesNameFromSlug(slug);
  if (!name) notFound();
  const s = getSpecies(name);
  if (!s) notFound();

  const wikiTitle = wikiTitleForName(name);
  const curated = imagesForName(name);
  const [wiki, subs] = await Promise.all([
    getWikipedia(wikiTitle),
    submissionsForSpecies(name),
  ]);

  const photo = curated[0] || wiki?.image || null;
  const photoAlt =
    name === "Plum"
      ? "Whole, halved, and sliced red plums"
      : name === BLACKBERRY_NAME
        ? "Ripe, red, and green blackberries on the same cane"
        : name;
  const when = seasonLabel(s);
  const peak = peakLabel(s);
  const isBlackberry = name === BLACKBERRY_NAME;
  const monthGuides = MONTH_SEASON_PROFILES.filter(({ month }) =>
    s.season.includes(month),
  );
  const oaklandGuide = cityHarvestFromSlug("oakland");
  const appearsInOakland = oaklandGuide?.plantNames.includes(name) ?? false;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Thing",
    name,
    description: s.note || undefined,
    image: photo || undefined,
    url: `/species/${slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SpeciesPageViewed species={name} />
      <Link className="back-link" href="/">
        ← All plants
      </Link>

      <span className="emoji-big">{s.emoji}</span>
      <p className="kicker">{s.cat}</p>
      <h1 className="title">
        {isBlackberry ? "Blackberry foraging guide" : "Foraging " + name}
      </h1>
      {isBlackberry ? (
        <p className="lead">
          Use season, cane, leaf, flower, and fruit clues together before
          following a crowd-sourced blackberry report. This guide helps you
          decide whether a mapped patch is worth checking, not whether any
          berry is safe or available.
        </p>
      ) : s.note ? (
        <p className="lead">{s.note}</p>
      ) : null}

      <div className="seasonal-orientation" aria-label="Identification reminder">
        <strong>Confirm before eating</strong>
        <p>
          This page is a starting point, not proof of identity or edibility.
          Compare the plant with the linked Wikipedia description and a trusted
          local source. If the details do not match or you are unsure, leave it.
        </p>
      </div>

      {photo ? (
        <div style={{ margin: "20px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="photo" src={photo} alt={photoAlt} loading="lazy" />
        </div>
      ) : null}

      <div style={{ margin: "18px 0" }}>
        {when ? <span className="pill">Typical season: {when}</span> : null}
        {peak ? <span className="pill">Typical peak: {peak}</span> : null}
        {s.part && s.part !== "—" ? (
          <span className="pill">Part noted: {s.part}</span>
        ) : null}
      </div>

      {monthGuides.length > 0 || appearsInOakland ? (
        <nav
          id="species-cluster-links"
          className="species-cluster-links"
          aria-labelledby="species-cluster-links-heading"
        >
          <p className="kicker">Plan the next check</p>
          <h2 id="species-cluster-links-heading">
            Keep planning with {name}
          </h2>
          <p>
            These paths appear only where Forage Around&apos;s season calendar or
            Oakland starter records include this plant.
          </p>
          {monthGuides.length > 0 ? (
            <div className="species-cluster-link-group">
              <strong>Published month guides</strong>
              <div className="species-cluster-link-list">
                {monthGuides.map((profile) => (
                  <Link
                    href={`/seasonal-guide/${profile.slug}`}
                    key={profile.slug}
                  >
                    See {name} in the {profile.name} guide
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          {appearsInOakland ? (
            <div className="species-cluster-link-group">
              <strong>Local report guide</strong>
              <div className="species-cluster-link-list">
                <Link href="/locations/oakland">
                  See {name} in the Oakland foraging guide
                </Link>
              </div>
            </div>
          ) : null}
        </nav>
      ) : null}

      {isBlackberry ? <BlackberryGuide /> : null}

      {s.uses && s.uses.length > 0 ? (
        <>
          <h2 className="section">Guide ideas after identification</h2>
          <p className="muted">
            Use these ideas only after confirming the species and edible part.
          </p>
          <ul className="clean">
            {s.uses.map((u, i) => (
              <li key={i}>{u}</li>
            ))}
          </ul>
        </>
      ) : null}

      {s.preserve && s.preserve.length > 0 ? (
        <>
          <h2 className="section">Ways to keep it</h2>
          <ul className="clean">
            {s.preserve.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </>
      ) : null}

      {wiki?.extract ? (
        <>
          <h2 className="section">About {name}</h2>
          <p>{wiki.extract}</p>
          {wiki.url ? (
            <p className="muted" style={{ fontSize: 14 }}>
              From{" "}
              <a href={wiki.url} rel="noopener">
                Wikipedia
              </a>
              .
            </p>
          ) : null}
        </>
      ) : null}

      <SubmissionList items={subs} />

      <p style={{ margin: "28px 0" }}>
        <ToAppLink
          className="btn"
          href={APP_URL}
          from="species"
          speciesContext={name}
        >
          Check reported {name} locations →
        </ToAppLink>
        {" "}
        <Link className="btn-outline" href="/seasonal-guide">
          Check {name} in the seasonal guide
        </Link>
      </p>

      <Credits />
    </>
  );
}
