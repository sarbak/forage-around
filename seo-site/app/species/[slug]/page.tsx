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
import { Credits, APP_URL } from "../../components";
import { SubmissionList } from "../../Submissions";
import { SpeciesPageViewed, ToAppLink } from "../../analytics";

export const revalidate = 3600;
export const dynamicParams = true;

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
  return {
    title: `Foraging ${name}: when it's ripe and what to make`,
    description:
      `${name}${when ? ` is ripe around ${when}.` : "."} ` +
      (s?.note || "When to pick it, what part to eat, and ways to keep it."),
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
  const when = seasonLabel(s);
  const peak = peakLabel(s);

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
      <h1 className="title">Foraging {name}</h1>
      {s.note ? <p className="lead">{s.note}</p> : null}

      {photo ? (
        <div style={{ margin: "20px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="photo" src={photo} alt={name} loading="lazy" />
        </div>
      ) : null}

      <div style={{ margin: "18px 0" }}>
        {when ? <span className="pill">Ripe: {when}</span> : null}
        {peak ? <span className="pill">Peak: {peak}</span> : null}
        {s.part && s.part !== "—" ? (
          <span className="pill">Eat the: {s.part}</span>
        ) : null}
      </div>

      {s.uses && s.uses.length > 0 ? (
        <>
          <h2 className="section">What to do with it</h2>
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
        <ToAppLink className="btn" href={APP_URL} from="species">
          Find {name} near you →
        </ToAppLink>
      </p>

      <Credits />
    </>
  );
}
