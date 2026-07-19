import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Credits, APP_URL } from "@/app/components";
import { LocationsPageViewed, ToAppLink } from "@/app/analytics";
import {
  cityHarvestFromSlug,
  cityHarvests,
  type CityHarvest,
} from "@/lib/city-harvests";
import {
  MONTHS,
  emojiForName,
  peakLabel,
  seasonLabel,
  slugify,
  species,
} from "@/lib/data";

export const revalidate = 86400;

type PageProps = {
  params: Promise<{ city: string }>;
};

export function generateStaticParams() {
  return cityHarvests.map(({ slug }) => ({ city: slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: slug } = await params;
  const city = cityHarvestFromSlug(slug);
  if (!city) return {};

  const title = `Find fruit and edible plants in ${city.name}`;
  const description = `Explore usual harvest seasons for edible plants represented around ${city.name}, then search the live Forage Around map near your address.`;

  return {
    title,
    description,
    alternates: { canonical: `/locations/${city.slug}` },
    openGraph: {
      title,
      description,
      url: `/locations/${city.slug}`,
    },
  };
}

function plantsForCity(city: CityHarvest, month: number) {
  return city.plantNames
    .map((name) => ({ name, details: species[name] }))
    .filter((plant) => plant.details?.edible)
    .sort((a, b) => {
      const aInSeason = a.details.season.includes(month) ? 0 : 1;
      const bInSeason = b.details.season.includes(month) ? 0 : 1;
      const aAtPeak = a.details.peak?.includes(month) ? 0 : 1;
      const bAtPeak = b.details.peak?.includes(month) ? 0 : 1;
      return aInSeason - bInSeason || aAtPeak - bAtPeak;
    });
}

export default async function CityHarvestPage({ params }: PageProps) {
  const { city: slug } = await params;
  const city = cityHarvestFromSlug(slug);
  if (!city) notFound();

  const currentMonth = new Date().getUTCMonth() + 1;
  const currentMonthName = MONTHS[currentMonth - 1];
  const plants = plantsForCity(city, currentMonth);
  const mapHref = `${APP_URL}?ref=nearby_harvest_${city.slug}`;
  const mapActionLabel =
    city.slug === "seattle"
      ? "Open the Seattle foraging map"
      : `Open the map and search ${city.name} →`;

  return (
    <>
      <LocationsPageViewed
        pageType="city"
        slug={city.slug}
        city={city.name}
      />
      <p className="kicker">{city.name} harvest guide</p>
      <h1 className="title">
        Find fruit and edible plants in {city.name}
      </h1>
      <p className="lead">
        Learn the usual ripening windows for plants represented around {city.name},
        then use the live map to check crowd-sourced reports near your address.
      </p>

      <p style={{ margin: "22px 0" }}>
        <ToAppLink className="btn" href={mapHref} from="locations">
          {mapActionLabel}
        </ToAppLink>{" "}
        <Link className="btn-outline" href="/seasonal-guide">
          Check the seasonal guide
        </Link>
      </p>

      <div className="card">
        <p style={{ marginTop: 0 }}>{city.localContext}</p>
        <p className="muted" style={{ marginBottom: 0 }}>
          Map reports change and may be incomplete. A listed plant is not a
          promise that fruit is present, accessible, or ripe today.
        </p>
      </div>

      <h2 className="section">Plant guides for {city.name}</h2>
      <p className="muted">
        These edible plants are represented in current Falling Fruit map data
        around {city.name}. Use their usual seasons to plan, then check the live
        report before making a trip.
      </p>
      <p className="muted">
        <strong>Typical peak in {currentMonthName}</strong> marks the narrower
        peak window in the guide data. <strong>Broader season includes{" "}
        {currentMonthName}</strong> means the usual season includes this month
        without listing it as a peak. Local weather and neighborhood conditions
        can shift timing earlier or later, and no label confirms that a reported
        plant is ripe or available.
      </p>
      <div className="species-grid">
        {plants.map(({ name, details }) => {
          const season = seasonLabel(details);
          const peak = peakLabel(details);
          const inSeasonNow = details.season.includes(currentMonth);
          return (
            <Link key={name} href={`/species/${slugify(name)}`}>
              <span aria-hidden="true">{emojiForName(name)}</span>
              <span className="species-grid-label">
                <span>{name}</span>
                {inSeasonNow ? (
                  <small className="species-season-status">
                    {details.peak?.includes(currentMonth)
                      ? `Typical peak in ${currentMonthName}`
                      : `Broader season includes ${currentMonthName}`}
                  </small>
                ) : null}
                <small className="muted">
                  {season ? `Usually ${season}` : "Season varies"}
                  {peak ? ` · Peak ${peak}` : ""}
                </small>
              </span>
            </Link>
          );
        })}
      </div>

      <h2 className="section">How to look nearby</h2>
      <ol className="clean">
        <li>Open the map and search {city.searchLabel} or a nearby address.</li>
        <li>Open a report to check the plant guide and usual season.</li>
        <li>Use the walking-directions action only after checking access.</li>
        <li>Confirm the plant, local rules, and permission before picking.</li>
      </ol>
      <p>
        Searching somewhere else? Start again from the{" "}
        <Link href="/">Forage Around homepage search</Link>.
      </p>

      <p style={{ margin: "28px 0" }}>
        <ToAppLink className="btn" href={mapHref} from="locations">
          Search the live map →
        </ToAppLink>{" "}
        <Link className="btn-outline" href="/locations">
          Browse all nearby harvests
        </Link>
      </p>

      <Credits />
    </>
  );
}
