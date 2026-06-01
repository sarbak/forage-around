import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getFFLocation,
  type FFLocation,
} from "@/lib/fallingfruit";
import {
  nameFromTypeIds,
  getSpecies,
  getTree,
  wikiTitleForName,
  imagesForName,
  seasonLabel,
  peakLabel,
  emojiForName,
  slugify,
  species as allSpecies,
} from "@/lib/data";
import { getWikipedia } from "@/lib/wikipedia";
import { reverseGeocodeCity } from "@/lib/geocode";
import { submissionsForTree } from "@/lib/submissions";
import { Credits, APP_URL } from "../../components";
import { SubmissionList } from "../../Submissions";
import { StaticMap } from "../../StaticMap";

export const revalidate = 3600;
export const dynamicParams = true;

// Resolve a location from FF API; fall back to the bundled Berkeley seed.
async function resolve(id: string): Promise<{
  lat: number;
  lng: number;
  name: string | null;
  city: string | null;
  desc: string | null;
  author: string | null;
} | null> {
  const ff: FFLocation | null = await getFFLocation(id);
  const seed = getTree(id);

  if (ff) {
    let name = nameFromTypeIds(ff.type_ids || []);
    if (!name && seed) name = seed.type;
    let city = ff.city || null;
    if (!city) city = await reverseGeocodeCity(ff.lat, ff.lng);
    return {
      lat: ff.lat,
      lng: ff.lng,
      name,
      city,
      desc: ff.description || seed?.desc || null,
      author: ff.author || null,
    };
  }

  if (seed) {
    const city = await reverseGeocodeCity(seed.lat, seed.lng);
    return {
      lat: seed.lat,
      lng: seed.lng,
      name: seed.type,
      city,
      desc: seed.desc || null,
      author: null,
    };
  }

  return null;
}

export async function generateStaticParams() {
  // Seed the Berkeley fallback ids at build; any other id renders on demand (ISR).
  const { trees } = await import("@/lib/data");
  return trees.slice(0, 60).map((t) => ({ id: String(t.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const r = await resolve(id);
  if (!r) return { title: "Tree not found" };
  const speciesName = r.name || "Fruit tree";
  const place = r.city || `${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}`;
  const title = r.city
    ? `${speciesName} tree in ${place}`
    : `${speciesName} tree near ${place}`;
  return {
    title,
    description:
      `A ${speciesName.toLowerCase()} mapped at ${r.lat.toFixed(5)}, ${r.lng.toFixed(
        5
      )}` +
      `${r.city ? ` in ${r.city}` : ""}. ${r.desc || "From the Falling Fruit foraging map."}`,
  };
}

export default async function TreePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const r = await resolve(id);
  if (!r) notFound();

  const speciesName = r.name;
  const s = speciesName ? getSpecies(speciesName) : null;
  const emoji = emojiForName(speciesName);
  const place = r.city || `${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}`;
  const title = r.city
    ? `${speciesName || "Fruit tree"} tree in ${place}`
    : `${speciesName || "Fruit tree"} tree near ${place}`;

  const wikiTitle = speciesName ? wikiTitleForName(speciesName) : null;
  const curated = speciesName ? imagesForName(speciesName) : [];
  const [wiki, subs] = await Promise.all([
    wikiTitle ? getWikipedia(wikiTitle) : Promise.resolve(null),
    submissionsForTree(id),
  ]);
  const photo = curated[0] || wiki?.image || null;

  const when = s ? seasonLabel(s) : null;
  const peak = s ? peakLabel(s) : null;
  const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: title,
    description: r.desc || undefined,
    geo: {
      "@type": "GeoCoordinates",
      latitude: r.lat,
      longitude: r.lng,
    },
    ...(r.city
      ? {
          address: {
            "@type": "PostalAddress",
            addressLocality: r.city,
          },
        }
      : {}),
    url: `/tree/${id}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link className="back-link" href="/">
        ← Forage Around
      </Link>

      <span className="emoji-big">{emoji}</span>
      <p className="kicker">Foraging spot</p>
      <h1 className="title">{title}</h1>
      {r.desc ? <p className="lead">{r.desc}</p> : null}

      <p style={{ margin: "14px 0" }}>
        <span className="coords">
          Coordinates: {r.lat.toFixed(6)}, {r.lng.toFixed(6)}
        </span>
      </p>

      <StaticMap lat={r.lat} lng={r.lng} alt={title} />

      <p style={{ margin: "16px 0" }}>
        <a className="btn" href={gmaps} rel="noopener">
          Walk here →
        </a>
        {speciesName && allSpecies[speciesName] ? (
          <>
            {" "}
            <Link
              className="btn-outline"
              href={`/species/${slugify(speciesName)}`}
            >
              More about {speciesName}
            </Link>
          </>
        ) : null}
      </p>

      {r.author ? (
        <p className="muted" style={{ fontSize: 14 }}>
          Mapped by {r.author} on Falling Fruit.
        </p>
      ) : null}

      {photo ? (
        <div style={{ margin: "20px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="photo"
            src={photo}
            alt={speciesName || "Plant"}
            loading="lazy"
          />
        </div>
      ) : null}

      {s ? (
        <>
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
        </>
      ) : null}

      {wiki?.extract ? (
        <>
          <h2 className="section">About {speciesName}</h2>
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

      <Credits />
    </>
  );
}
