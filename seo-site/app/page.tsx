import Link from "next/link";
import { allSpeciesNames, species, slugify } from "@/lib/data";
import { Credits, APP_URL } from "./components";
import { SeoHomeViewed, ToAppLink } from "./analytics";

export default function Home() {
  const names = allSpeciesNames()
    .filter((n) => species[n]?.edible)
    .sort((a, b) => a.localeCompare(b));

  return (
    <>
      <SeoHomeViewed />
      <p className="kicker">Urban foraging map</p>
      <h1 className="title">Find fruit growing near you</h1>
      <p className="lead">
        Open the live map to see nearby fruit, herbs, and greens that are wild,
        unpicked, and in season. Forage Around adds plant guides and
        preservation ideas on top of{" "}
        <a href="https://fallingfruit.org" rel="noopener">
          Falling Fruit&apos;s
        </a>{" "}
        open data.
      </p>

      <p style={{ margin: "22px 0" }}>
        <ToAppLink className="btn" href={APP_URL} from="home">
          Open the map near me →
        </ToAppLink>{" "}
        <Link className="btn-outline" href="/locations">
          Find nearby harvests
        </Link>{" "}
        <Link className="btn-outline" href="/about">
          Where the data comes from
        </Link>
      </p>
      <p className="muted">
        Locations are crowd-sourced starting points. Confirm the plant and
        picking rules before harvesting.
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
