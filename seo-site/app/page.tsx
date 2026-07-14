import type { Metadata } from "next";
import Link from "next/link";
import { allSpeciesNames, species, slugify } from "@/lib/data";
import { Credits, APP_URL } from "./components";
import { SeoHomeViewed, ToAppLink } from "./analytics";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://foragearound.com/",
  },
};

export default function Home() {
  const names = allSpeciesNames()
    .filter((n) => species[n]?.edible)
    .sort((a, b) => a.localeCompare(b));

  return (
    <>
      <SeoHomeViewed />
      <p className="kicker">Urban foraging map</p>
      <h1 className="title">Find nearby edible plants and open the free map</h1>
      <p className="lead">
        Forage Around shows nearby fruit, herbs, and greens likely in season.
        Open the free urban foraging map, start with{" "}
        <a href="https://fallingfruit.org" rel="noopener">
          Falling Fruit&apos;s
        </a>{" "}
        crowd-sourced locations, then verify the plant and public access or
        permission before picking.
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

      <section className="faq-block" aria-labelledby="homepage-faq-heading">
        <h2 id="homepage-faq-heading" className="section">
          Before you pick
        </h2>
        <div className="faq-list">
          <div>
            <h3>Is Forage Around free?</h3>
            <p>
              Yes. It is a free, open-source map built to make public food
              data easier to use.
            </p>
          </div>
          <div>
            <h3>Where do the locations come from?</h3>
            <p>
              The map starts with crowd-sourced locations from{" "}
              <a href="https://fallingfruit.org" rel="noopener">
                Falling Fruit
              </a>
              , then adds season context and plant pages.
            </p>
          </div>
          <div>
            <h3>Are the locations guaranteed?</h3>
            <p>
              No. Treat every marker as a starting point, then confirm the
              plant, ripeness, and current conditions yourself.
            </p>
          </div>
          <div>
            <h3>Can I pick from every spot?</h3>
            <p>
              Only pick where public access is clear or you have permission.
              When in doubt, leave it alone.
            </p>
          </div>
        </div>
      </section>

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
