import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ControlledJourneyLink,
  SeasonalGuidePageViewed,
  ToAppLink,
} from "@/app/analytics";
import { APP_URL, Credits } from "@/app/components";
import { imagesForName, slugify } from "@/lib/data";
import {
  MONTH_SEASON_PROFILES,
  monthProfileFromSlug,
  monthlySpecies,
  type MonthlySpeciesItem,
} from "@/lib/monthly-season-pages";

export const revalidate = 86400;
export const dynamicParams = false;

type PageProps = { params: Promise<{ month: string }> };

const GROUPS = [
  {
    title: "Fruit and berries",
    categories: ["fruit", "citrus"],
  },
  {
    title: "Nuts and seeds",
    categories: ["nut"],
  },
  {
    title: "Greens, herbs, and flowers",
    categories: ["green", "herb", "flower"],
  },
  {
    title: "Garden volunteers",
    categories: ["veg"],
  },
] satisfies Array<{ title: string; categories: string[] }>;

function monthArticle(name: string) {
  return /^[aeiou]/i.test(name) ? "an" : "a";
}

function speciesHref(name: string, month: string) {
  return `/species/${slugify(name)}?map_source=seasonal_guide&utm_campaign=${month}_season`;
}

function pagePath(month: string) {
  return `/seasonal-guide/${month}`;
}

export function generateStaticParams() {
  return MONTH_SEASON_PROFILES.map(({ slug }) => ({ month: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { month } = await params;
  const profile = monthProfileFromSlug(month);
  if (!profile) return { title: "Not found" };

  const title = `What is ripe in ${profile.name}? Seasonal foraging guide`;
  const items = monthlySpecies(profile.month);
  const featured = profile.featuredNames.slice(0, 3).join(", ");
  const description = `See ${items.length} edible plant guides for ${profile.name}, led by ${featured}, with typical peaks, safety notes, and reported locations near you.`;

  return {
    title,
    description,
    alternates: { canonical: pagePath(profile.slug) },
    openGraph: {
      type: "article",
      title: `${title} | Forage Around`,
      description,
      url: pagePath(profile.slug),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Forage Around`,
      description,
    },
  };
}

function MonthPhotoStrip({ names }: { names: string[] }) {
  return (
    <figure className="monthly-photo-strip">
      {names.map((name) => {
        const photo = imagesForName(name)[0];
        if (!photo) return null;

        return (
          <div key={name}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt={`${name} in its typical season`} loading="eager" />
            <span>{name}</span>
          </div>
        );
      })}
      <figcaption>
        Guide photos help with orientation, not identification. Match the whole
        plant with a trusted local source.
      </figcaption>
    </figure>
  );
}

function FeaturedGuide({
  item,
  month,
}: {
  item: MonthlySpeciesItem;
  month: string;
}) {
  const photo = imagesForName(item.name)[0];

  return (
    <article className="monthly-featured-guide">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" loading="lazy" />
      ) : (
        <span className="monthly-featured-emoji" aria-hidden="true">
          {item.details.emoji ?? "🌿"}
        </span>
      )}
      <div>
        <p className="monthly-peak-label">Typical {month} peak</p>
        <h3>
          <ControlledJourneyLink href={speciesHref(item.name, month.toLowerCase())}>
            {item.name}
          </ControlledJourneyLink>
        </h3>
        <p>{item.details.note}</p>
      </div>
    </article>
  );
}

export default async function MonthlySeasonPage({ params }: PageProps) {
  const { month } = await params;
  const profile = monthProfileFromSlug(month);
  if (!profile) notFound();

  const items = monthlySpecies(profile.month);
  const peakItems = items.filter(({ isPeak }) => isPeak);
  const featuredItems = profile.featuredNames
    .map((name) => items.find((item) => item.name === name))
    .filter((item): item is MonthlySpeciesItem => !!item);
  const mapUrl = `${APP_URL}?${new URLSearchParams({
    ref: `monthly_season_${profile.slug}`,
  }).toString()}`;
  const faqs = [
    {
      question: `What can I forage in ${profile.name}?`,
      answer: `${profile.shortAnswer} The page lists ${items.length} edible guides whose broad season includes ${profile.name}, including ${peakItems.length} narrower typical peaks.`,
    },
    {
      question: `Does ${monthArticle(profile.name)} ${profile.name} season label mean a plant is ripe?`,
      answer:
        "No. It means the month falls inside a typical season window in the guide data. Weather, variety, elevation, shade, and local conditions can shift ripening.",
    },
    {
      question: "Does a map report mean I can enter or pick there?",
      answer:
        "No. A report is a lead, not proof of identity, fruit, ownership, public access, or permission. Check the plant, site, rules, and permission when you arrive.",
    },
  ];
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `What is ripe in ${profile.name}?`,
      description: profile.shortAnswer,
      url: pagePath(profile.slug),
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: items.length,
        itemListElement: items.map(({ name }, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name,
          url: `/species/${slugify(name)}`,
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ];

  return (
    <>
      <SeasonalGuidePageViewed />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link className="back-link" href="/seasonal-guide">
        ← Full seasonal calendar
      </Link>

      <div className="monthly-season-hero">
        <div>
          <p className="kicker">{profile.name} field guide</p>
          <h1 className="title">What is ripe in {profile.name}?</h1>
          <p className="lead">{profile.shortAnswer}</p>
          <div className="monthly-primary-action">
            <ToAppLink className="btn" href={mapUrl} from="seasonal_guide">
              Check reported plants near me
            </ToAppLink>
            <small className="muted">
              Reports do not confirm ripeness, access, or permission to pick.
            </small>
          </div>
        </div>
        <MonthPhotoStrip names={profile.photoNames} />
      </div>

      <section className="monthly-short-answer" aria-labelledby="short-answer-heading">
        <p className="kicker">The short answer</p>
        <h2 id="short-answer-heading">
          {items.length} guides include {profile.name}; {peakItems.length} mark it as a
          typical peak
        </h2>
        <p>{profile.lead}</p>
        <p className="monthly-climate-note">
          These are broad temperate and Mediterranean season windows from Forage
          Around&apos;s guide data, not a forecast for every climate.
        </p>
      </section>

      <h2 className="section">What changes in {profile.name}</h2>
      <div className="monthly-field-notes">
        <article>
          <span aria-hidden="true">01</span>
          <div>
            <h3>The seasonal shift</h3>
            <p>{profile.shift}</p>
          </div>
        </article>
        <article>
          <span aria-hidden="true">02</span>
          <div>
            <h3>What to check in the field</h3>
            <p>{profile.fieldNote}</p>
          </div>
        </article>
        <article>
          <span aria-hidden="true">03</span>
          <div>
            <h3>What to do with a small harvest</h3>
            <p>{profile.preserveNote}</p>
          </div>
        </article>
      </div>

      <h2 className="section">Typical peaks in {profile.name}</h2>
      <p className="muted monthly-section-intro">
        These featured guides use the narrower peak field in Forage Around&apos;s
        season data. A peak is still a planning cue, not a live ripeness report.
      </p>
      <div className="monthly-featured-grid">
        {featuredItems.map((item) => (
          <FeaturedGuide key={item.name} item={item} month={profile.name} />
        ))}
      </div>

      <h2 className="section">Every guide in season in {profile.name}</h2>
      <p className="muted monthly-section-intro">
        The directory below is derived from the existing species calendar. Peak
        entries appear first inside each group.
      </p>
      <div className="monthly-guide-groups">
        {GROUPS.map((group) => {
          const groupedItems = items.filter(({ details }) =>
            group.categories.includes(details.cat),
          );
          if (groupedItems.length === 0) return null;

          return (
            <section key={group.title}>
              <h3>{group.title}</h3>
              <div className="monthly-guide-links">
                {groupedItems.map(({ name, details, isPeak }) => (
                  <ControlledJourneyLink
                    href={speciesHref(name, profile.slug)}
                    key={name}
                  >
                    <span aria-hidden="true">{details.emoji ?? "🌿"}</span>
                    <span>
                      <strong>{name}</strong>
                      <small>{isPeak ? `Typical ${profile.name} peak` : `Season includes ${profile.name}`}</small>
                    </span>
                  </ControlledJourneyLink>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="faq-block" aria-labelledby="monthly-faq-heading">
        <h2 className="section" id="monthly-faq-heading">
          Questions before {monthArticle(profile.name)} {profile.name} walk
        </h2>
        <div className="faq-list">
          {faqs.map(({ question, answer }) => (
            <div key={question}>
              <h3>{question}</h3>
              <p>{answer}</p>
            </div>
          ))}
        </div>
      </section>

      <h2 className="section">Use the calendar as a reason to check</h2>
      <ol className="clean monthly-safety-list">
        <li>
          Read the species guide, then match more than one plant feature with a
          trusted local source. A photo or fruit color is not enough.
        </li>
        <li>
          Check the actual plant for ripeness, damage, mold, spraying, roadside
          exposure, and other contamination.
        </li>
        <li>
          Confirm land status, local rules, and permission before entering or
          picking. A crowd-sourced marker establishes none of those.
        </li>
        <li>Leave the plant alone when any part of the identification or site is uncertain.</li>
      </ol>

      <nav className="monthly-calendar-nav" aria-label="Published monthly guides">
        <span>More monthly guides</span>
        <div>
          {MONTH_SEASON_PROFILES.filter(({ slug }) => slug !== profile.slug).map(
            ({ name, slug }) => (
              <Link href={pagePath(slug)} key={slug}>
                {name}
              </Link>
            ),
          )}
        </div>
      </nav>

      <Credits />
    </>
  );
}
