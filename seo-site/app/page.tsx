import Link from "next/link";
import { allSpeciesNames, species, slugify } from "@/lib/data";
import { Credits, APP_URL } from "./components";

export default function Home() {
  const names = allSpeciesNames()
    .filter((n) => species[n]?.edible)
    .sort((a, b) => a.localeCompare(b));

  return (
    <>
      <p className="kicker">A quiet map of the urban harvest</p>
      <h1 className="title">
        See what fruit is ripe near you — and what to make with it.
      </h1>
      <p className="lead">
        So much fruit grows wild and unpicked right on the sidewalk: loquats,
        plums, figs, lemons. Forage Around is a simple map of what&apos;s out
        there, built on{" "}
        <a href="https://fallingfruit.org" rel="noopener">
          Falling Fruit&apos;s
        </a>{" "}
        open data.
      </p>

      <p style={{ margin: "22px 0" }}>
        <a className="btn" href={APP_URL}>
          Open the live map →
        </a>{" "}
        <Link className="btn-outline" href="/about">
          About this project
        </Link>
      </p>

      <h2 className="section">Fruits &amp; plants to forage</h2>
      <p className="muted">
        Each plant has its own page: when it&apos;s ripe, what part to eat, and
        ways to keep it.
      </p>
      <div className="species-grid">
        {names.map((n) => (
          <Link key={n} href={`/species/${slugify(n)}`}>
            <span>{species[n]?.emoji ?? "🌿"}</span>
            <span>{n}</span>
          </Link>
        ))}
      </div>

      <Credits />
    </>
  );
}
