import type { Metadata } from "next";
import Link from "next/link";
import {
  allSpeciesNames,
  emojiForName,
  seasonLabel,
  slugify,
  species,
  trees,
} from "@/lib/data";
import { Credits, APP_URL } from "../components";
import { ToAppLink } from "../analytics";

export const metadata: Metadata = {
  title: "Find fruit and edible plants near you",
  description:
    "Find nearby fruit trees, herbs, and edible plants with Forage Around, a simple map of the urban harvest built on Falling Fruit open data.",
};

const edibleTrees = trees.filter((tree) => tree.edible !== false);

const topSpecies = Array.from(
  edibleTrees.reduce((counts, tree) => {
    if (!species[tree.type]?.edible) return counts;
    counts.set(tree.type, (counts.get(tree.type) ?? 0) + 1);
    return counts;
  }, new Map<string, number>()),
)
  .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  .slice(0, 8);

const featuredSpots = edibleTrees
  .filter((tree) => species[tree.type]?.edible)
  .slice(0, 6);

const edibleSpeciesCount = allSpeciesNames().filter(
  (name) => species[name]?.edible,
).length;

export default function LocationsPage() {
  return (
    <>
      <p className="kicker">Nearby harvests</p>
      <h1 className="title">Find fruit and edible plants near you</h1>
      <p className="lead">
        Forage Around helps you spot the fruit, herbs, and greens growing wild
        and unpicked nearby. Open the map, share your location, and start with
        what is closest.
      </p>

      <p style={{ margin: "22px 0" }}>
        <ToAppLink className="btn" href={APP_URL} from="locations">
          Open the live map →
        </ToAppLink>{" "}
        <Link className="btn-outline" href="/species/apple">
          See apple guide
        </Link>
      </p>

      <div className="card">
        <p style={{ marginTop: 0 }}>
          The map uses Falling Fruit locations as a starting point, then adds
          season windows and ways to use each plant. It currently has{" "}
          {edibleTrees.length.toLocaleString()} harvest points in the bundled
          starter dataset and guides for {edibleSpeciesCount.toLocaleString()} edible
          plants.
        </p>
        <p className="muted" style={{ marginBottom: 0 }}>
          Always confirm the plant, check whether you are allowed to pick, and
          take only what would otherwise go to waste.
        </p>
      </div>

      <h2 className="section">Common harvests to look for</h2>
      <p className="muted">
        Start with plants people often find in cities, then open the live map to
        check what is close to you.
      </p>
      <div className="species-grid">
        {topSpecies.map(([name, count]) => {
          const plant = species[name];
          const when = plant ? seasonLabel(plant) : null;
          return (
            <Link key={name} href={`/species/${slugify(name)}`}>
              <span>{emojiForName(name)}</span>
              <span>
                {name}
                <br />
                <small className="muted">
                  {count} spots{when ? `, ripe ${when}` : ""}
                </small>
              </span>
            </Link>
          );
        })}
      </div>

      <h2 className="section">Example spots</h2>
      <p className="muted">
        These are sample harvest points from the open dataset. The live map can
        find spots near your actual location.
      </p>
      <ul className="clean">
        {featuredSpots.map((tree) => (
          <li key={tree.id}>
            <Link href={`/tree/${tree.id}`}>{tree.type} spot</Link>{" "}
            <span className="muted">
              ({tree.lat.toFixed(3)}, {tree.lng.toFixed(3)})
            </span>
          </li>
        ))}
      </ul>

      <h2 className="section">How to use the map</h2>
      <ul className="clean">
        <li>Open the live map and share your location once.</li>
        <li>Check what is ripe now before walking over.</li>
        <li>Use the plant page to see the edible part and preservation ideas.</li>
        <li>Confirm the plant and picking rules before harvesting.</li>
      </ul>

      <p style={{ margin: "28px 0" }}>
        <ToAppLink className="btn" href={APP_URL} from="locations">
          Find nearby harvests →
        </ToAppLink>
      </p>

      <Credits />
    </>
  );
}
