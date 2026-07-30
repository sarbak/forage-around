import type { Metadata } from "next";
import Link from "next/link";
import {
  MONTHS,
  imagesForName,
  slugify,
  species,
  type Species,
} from "@/lib/data";
import { EdibleWildPlantsPageViewed, ToAppLink } from "../analytics";
import { APP_URL, Credits } from "../components";

export const revalidate = 86400;

const PAGE_PATH = "/edible-wild-plants";
const META_DESCRIPTION =
  "Meet 12 common edible wild plants, see their typical seasons and edible parts, then use a free map to check reported plants near you.";

export const metadata: Metadata = {
  title: "Edible wild plants: 12 common finds and a map",
  description: META_DESCRIPTION,
  alternates: {
    canonical: PAGE_PATH,
  },
  openGraph: {
    type: "article",
    title: "Edible wild plants: a practical visual field guide",
    description: META_DESCRIPTION,
    url: PAGE_PATH,
    images: [
      {
        url: imagesForName("Blackberry")[0],
        alt: "Ripe, ripening, and green blackberries on the same plant",
      },
    ],
  },
};

type PlantGuide = {
  name: string;
  clue: string;
  caution: string;
};

const GUIDE_GROUPS: Array<{
  title: string;
  intro: string;
  plants: PlantGuide[];
}> = [
  {
    title: "Wild fruit and berries",
    intro:
      "Fruit is often the easiest part to notice, but leaves, stems, thorns, flowers, and growth habit still matter for identification.",
    plants: [
      {
        name: "Blackberry",
        clue: "Look for arching, thorny canes and clusters that ripen from green to red to deep purple-black.",
        caution:
          "Several cane berries look similar. Confirm the full plant, not the berry color alone.",
      },
      {
        name: "Mulberry",
        clue: "Ripe berries are soft, easily detached, and often found staining the ground beneath a tree.",
        caution:
          "Fruit color varies by species and variety, so use leaves, bark, and tree form too.",
      },
      {
        name: "Common fig",
        clue: "The familiar lobed leaves and soft, drooping ripe fruit make a useful starting combination.",
        caution:
          "Milky sap can irritate skin. Avoid damaged fruit and confirm that the tree is a true edible fig.",
      },
      {
        name: "Prickly pear",
        clue: "Flat pads produce colorful fruit, while both pads and fruit can carry nearly invisible glochids.",
        caution:
          "Use proper tools and preparation. Tiny glochids can lodge painfully in skin and must be removed.",
      },
    ],
  },
  {
    title: "Wild greens, herbs, and flowers",
    intro:
      "Young leaves can look very different from mature plants. Flowers, seedpods, scent, stem shape, and habitat can supply the missing clues.",
    plants: [
      {
        name: "Dandelion",
        clue: "A basal rosette, deeply toothed leaves, hollow flower stalk, and one yellow flower head per stalk are useful clues.",
        caution:
          "Do not identify a rosette from leaf shape alone. Wait for more features when the plant is young.",
      },
      {
        name: "Miner's lettuce",
        clue: "Mature plants often carry a small white flower through a round, saucer-like leaf.",
        caution:
          "Leaf shape changes as it grows. Confirm multiple features and the plant's damp, shaded habitat.",
      },
      {
        name: "Purslane",
        clue: "Fleshy leaves and reddish, succulent stems grow close to the ground in warm weather.",
        caution:
          "Do not confuse it with spurges, which can release irritating milky sap when broken.",
      },
      {
        name: "Nasturtium",
        clue: "Round shield-like leaves and spurred orange, yellow, or red flowers are strong starting clues.",
        caution:
          "Confirm both leaf and flower. Avoid ornamental beds that may have been sprayed or treated.",
      },
      {
        name: "Fennel",
        clue: "Feathery leaves, yellow flower umbels, and a strong anise scent usually appear on tall stems.",
        caution:
          "The carrot family includes dangerously toxic plants. Never rely on feathery leaves or scent alone.",
      },
      {
        name: "Wild mustard",
        clue: "Cool-season plants often carry yellow four-petaled flowers and peppery leaves or flower buds.",
        caution:
          "Mustard relatives vary widely. Confirm flower structure, leaves, stem, and seedpods before use.",
      },
      {
        name: "Wood sorrel",
        clue: "Three heart-shaped leaflets and a bright sour taste are characteristic starting clues.",
        caution:
          "Use only after positive identification and in modest amounts. Sour flavor alone is not an identification test.",
      },
    ],
  },
  {
    title: "Wild nuts",
    intro:
      "A fallen nut is only one clue. Match it to the husk, shell, leaves, buds, bark, and the tree directly above it.",
    plants: [
      {
        name: "Walnut",
        clue: "Round green husks darken as they age, and the deeply ridged shell encloses a divided kernel.",
        caution:
          "Wear gloves around husks, which stain. Confirm the tree and let mature nuts dry before storage.",
      },
    ],
  },
];

const ALL_GUIDES = GUIDE_GROUPS.flatMap(({ plants }) => plants);

function guideSeasonLabel(details: Species) {
  const months = [...new Set(details.season)].sort((a, b) => a - b);
  if (months.length === 0) return "Season varies";
  if (months.length === 12) return "Year-round";
  if (months.length === 1) return MONTHS[months[0] - 1];

  let largestGapIndex = 0;
  let largestGap = 0;
  months.forEach((month, index) => {
    const next = months[(index + 1) % months.length];
    const gap = (next - month + 12) % 12;
    if (gap > largestGap) {
      largestGap = gap;
      largestGapIndex = index;
    }
  });

  const firstMonth = months[(largestGapIndex + 1) % months.length];
  const lastMonth = months[largestGapIndex];
  return `${MONTHS[firstMonth - 1]}–${MONTHS[lastMonth - 1]}`;
}

const HERO_IMAGES = [
  {
    name: "Blackberry",
    alt: "Ripe, ripening, and green blackberries on a cane",
  },
  {
    name: "Miner's lettuce",
    alt: "Miner's lettuce with rounded leaves and small white flowers",
  },
  {
    name: "Walnut",
    alt: "Whole walnuts, an opened shell, and a halved kernel",
  },
] as const;

const FAQS = [
  {
    question: "What are the easiest edible wild plants for beginners?",
    answer:
      "Start with a small number of locally common plants that have several clear features, a good regional guide, and no dangerous look-alikes you could confuse at your current skill level. Ease depends on your region and experience, so a guided local walk is safer than a universal beginner list.",
  },
  {
    question: "How do I know whether a wild plant is safe to eat?",
    answer:
      "Confirm the species and edible part with more than one reliable source, rule out dangerous look-alikes, inspect the plant's condition and surroundings, and check access and local rules. If any part of that check is uncertain, do not eat it.",
  },
  {
    question: "Can I pick edible plants in a public park?",
    answer:
      "Not automatically. Public access does not always include permission to remove plants. Check posted rules and the land manager's policy, and ask when the rule is unclear.",
  },
  {
    question: "Does a map marker mean a plant is still there and ready?",
    answer:
      "No. Crowd-sourced reports can be old, imprecise, or incomplete. Use a marker to plan a visit, then confirm the plant, current condition, ownership, access, and permission on site.",
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

export default function EdibleWildPlantsPage() {
  return (
    <>
      <EdibleWildPlantsPageViewed />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />

      <section className="wild-plants-hero">
        <div>
          <p className="kicker">Visual field guide</p>
          <h1 className="title">
            Edible wild plants: 12 common finds to learn
          </h1>
          <p className="lead">
            Meet familiar berries, greens, flowers, herbs, and nuts. See the
            usual edible part and season, open a detailed plant guide, then
            check crowd-sourced reports near you.
          </p>
          <div className="wild-plants-primary-action">
            <ToAppLink
              className="btn"
              href={APP_URL}
              from="edible_wild_plants"
            >
              Find edible plants near me →
            </ToAppLink>
            <small className="muted">
              Free, no account needed. A report is a lead, not an identification.
            </small>
          </div>
        </div>

        <figure className="wild-plants-collage">
          {HERO_IMAGES.map(({ name, alt }, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={index === 0 ? "wild-plants-collage-main" : undefined}
              key={name}
              src={imagesForName(name)[0]}
              alt={alt}
              loading={index === 0 ? "eager" : "lazy"}
            />
          ))}
          <figcaption>
            Blackberry, miner&apos;s lettuce, and walnut. Photos from Wikimedia
            Commons.
          </figcaption>
        </figure>
      </section>

      <div className="seasonal-orientation" aria-label="Identification warning">
        <strong>Edible does not mean identifiable at a glance</strong>
        <p>
          This guide helps you decide what to study next. It cannot confirm a
          plant from one photo, a common name, or a map pin. Use several
          features and trusted local sources, rule out dangerous look-alikes,
          and leave anything uncertain.
        </p>
      </div>

      <h2 className="section">What counts as an edible wild plant?</h2>
      <p>
        An edible wild plant is a plant growing without your cultivation that
        has one or more parts people can eat when correctly identified and
        prepared. It may be native, introduced, naturalized, escaped from a
        garden, or growing as a weed. “Wild” describes how it is growing. It
        does not guarantee that every part is edible, that the plant is safe
        raw, or that you have permission to harvest it.
      </p>
      <p>
        That distinction matters in cities. A fig tree can grow from a dropped
        seed beside a trail, fennel can spread along a roadside, and purslane
        can volunteer in a garden bed. Each may be uncultivated, but each site
        brings different questions about ownership, spraying, traffic, pets,
        soil, and local picking rules.
      </p>
      <p>
        Use the entries below as a study list, not a plate. Every plant links to
        a focused Forage Around species guide with typical season notes, edible
        parts, use ideas, preservation ideas, photos, and source attribution.
        For a month-first view, start with the{" "}
        <Link href="/seasonal-guide">seasonal foraging guide</Link>.
      </p>

      {GUIDE_GROUPS.map(({ title, intro, plants }) => (
        <section key={title}>
          <h2 className="section">{title}</h2>
          <p>{intro}</p>
          <div className="wild-plant-guide-list">
            {plants.map(({ name, clue, caution }) => {
              const details = species[name];
              const image = imagesForName(name)[0];
              const season = guideSeasonLabel(details);

              return (
                <article className="wild-plant-guide-card" key={name}>
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={`${name} plant guide photograph`}
                      loading="lazy"
                    />
                  ) : null}
                  <div>
                    <p className="wild-plant-guide-meta">
                      {details.part}
                      {season ? ` · Usually ${season}` : ""}
                    </p>
                    <h3>
                      <Link href={`/species/${slugify(name)}`}>{name}</Link>
                    </h3>
                    <p>
                      <strong>Notice:</strong> {clue}
                    </p>
                    <p className="muted">
                      <strong>Check:</strong> {caution}
                    </p>
                    <Link
                      className="wild-plant-guide-link"
                      href={`/species/${slugify(name)}`}
                    >
                      See the {name.toLowerCase()} guide →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      <h2 className="section">When these edible wild plants are in season</h2>
      <p>
        Season is a planning clue, not a local availability report. The windows
        below come from Forage Around&apos;s broad guide data. Latitude,
        elevation, rainfall, heat, variety, and the year&apos;s weather can move
        growth and ripening by weeks or months.
      </p>
      <div className="wild-plants-season-list">
        {ALL_GUIDES.map(({ name }) => {
          const details = species[name];
          return (
            <div key={name}>
              <Link href={`/species/${slugify(name)}`}>{name}</Link>
              <span>{guideSeasonLabel(details)}</span>
            </div>
          );
        })}
      </div>
      <p className="muted">
        Some plants offer different edible parts at different times. Prickly
        pear pads and fruit, fennel fronds and seeds, and dandelion leaves,
        flowers, and roots do not share one ideal harvest moment. Check the
        species guide and a local source for the particular part you intend to
        use.
      </p>

      <h2 className="section">A four-part check before you harvest</h2>
      <p>
        A confident identification is necessary, but it is not the entire
        decision. Check the plant, the part, the place, and the condition
        separately.
      </p>
      <ol className="wild-plants-checklist">
        <li>
          <span>1</span>
          <div>
            <strong>Confirm the plant with several features.</strong>
            <p>
              Compare leaf arrangement, stem, flower, fruit, bark, scent,
              habitat, and growth form where relevant. Use at least two
              trustworthy sources suited to your region. One photograph or an
              app suggestion is not enough.
            </p>
          </div>
        </li>
        <li>
          <span>2</span>
          <div>
            <strong>Confirm the edible part and preparation.</strong>
            <p>
              A plant can have edible and inedible parts. Some foods are used
              only at a certain stage or after cooking, peeling, drying, or
              another preparation. Match the instructions to the exact species
              and part.
            </p>
          </div>
        </li>
        <li>
          <span>3</span>
          <div>
            <strong>Check access and permission.</strong>
            <p>
              A plant beside a sidewalk, in a park, or on a map is not
              automatically free to pick. Check property boundaries, posted
              rules, and the land manager&apos;s policy. Ask on private land and
              leave it when ownership is unclear.
            </p>
          </div>
        </li>
        <li>
          <span>4</span>
          <div>
            <strong>Inspect the site and current condition.</strong>
            <p>
              Avoid plants exposed to obvious spraying, polluted runoff,
              heavy traffic residue, pet waste, or contaminated soil. Skip
              moldy, damaged, or unhealthy material. Wash harvests appropriately
              and follow local health guidance.
            </p>
          </div>
        </li>
      </ol>

      <h2 className="section">How to turn the guide into a short field walk</h2>
      <p>
        Learning one or two plants deeply is more useful than carrying a list of
        fifty names. Pick a plant that is common in your region and likely in
        season. Study its full life cycle and its dangerous look-alikes before
        you search for a location.
      </p>
      <ol className="clean">
        <li>
          Open its species guide and write down three features you expect to
          confirm in the field.
        </li>
        <li>
          Check the{" "}
          <Link href="/locations">nearby harvest guide</Link> or the{" "}
          <Link href="/foraging-map">free foraging map guide</Link>, then search
          a small area you can walk.
        </li>
        <li>
          Choose two or three reports close together. Crowd-sourced locations
          can be old or imprecise, so do not plan a long trip around one marker.
        </li>
        <li>
          Photograph and observe the plant without tasting it. Compare your
          notes and sources after the walk.
        </li>
        <li>
          Harvest only after identity, edible part, site condition, access, and
          permission are all clear.
        </li>
      </ol>
      <p>
        If you are new to wild food, a local walk led by an experienced
        instructor can help you see which features actually separate similar
        plants. Regional field guides and local extension resources are more
        useful for final identification than a universal list.
      </p>

      <h2 className="section">Using and preserving a small harvest</h2>
      <p>
        Take only what you can identify, use, and carry without damaging the
        plant or depriving wildlife and other people. Start with a small amount,
        especially with a food you have not eaten before. Personal allergies,
        medicines, health conditions, and individual sensitivity can matter
        even when a species is commonly eaten.
      </p>
      <p>
        The species guides offer practical ideas after identification.
        Blackberries and mulberries can become jam or be frozen whole. Purslane
        stems and green nasturtium seedpods are often pickled. Fennel seeds and
        walnut kernels can be dried for storage. These are ideas, not
        preparation instructions; use a tested recipe and the correct edible
        part.
      </p>
      <p>
        Record the place, date, plant features, and preparation in a field
        notebook. That habit makes it easier to compare seasons, revisit a plant
        responsibly, and notice when a crowd-sourced report or your earlier
        assumption was wrong.
      </p>

      <h2 className="section">Frequently asked questions</h2>
      <div className="faq-list">
        {FAQS.map(({ question, answer }) => (
          <div key={question}>
            <h3>{question}</h3>
            <p>{answer}</p>
          </div>
        ))}
      </div>

      <div className="wild-plants-next-step">
        <p className="kicker">Next step</p>
        <h2>Choose one plant, then check the map</h2>
        <p>
          Start with the season guide, learn the plant&apos;s identifying
          features, and use a nearby report only as a place to begin looking.
        </p>
        <Link href="/seasonal-guide">
          See what is typically in season now →
        </Link>
      </div>

      <Credits />
    </>
  );
}
