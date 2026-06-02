import type { Metadata } from "next";
import { Credits, APP_URL } from "../components";
import { AboutPageViewed, ToAppLink } from "../analytics";

export const metadata: Metadata = {
  title: "Where the data comes from",
  description:
    "The data behind Forage Around: tree locations from Falling Fruit, plant photos and descriptions from Wikipedia, and maps from OpenStreetMap.",
};

export default function About() {
  return (
    <>
      <AboutPageViewed />
      <p className="kicker">About the data</p>
      <h1 className="title">Where the data comes from</h1>

      <p className="lead">
        Forage Around is a map of the fruit growing wild and unpicked near you.
        None of the underlying data is ours, so here is exactly where each piece
        comes from.
      </p>

      <p>
        The map of trees comes from{" "}
        <a href="https://fallingfruit.org" rel="noopener">
          Falling Fruit
        </a>
        , a nonprofit, volunteer-run map of the urban harvest, used here under
        the{" "}
        <a
          href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
          rel="license noopener"
        >
          CC BY-NC-SA 4.0 license
        </a>
        . The season windows, the ways to use each plant, and the preservation
        ideas are added on top; the locations themselves are theirs and are
        crowd-sourced, so treat them as a starting point, not gospel.
      </p>
      <p>
        Plant photos and descriptions come from{" "}
        <a href="https://en.wikipedia.org" rel="noopener">
          Wikipedia
        </a>{" "}
        / Wikimedia Commons. The map uses{" "}
        <a href="https://www.openstreetmap.org/copyright" rel="noopener">
          OpenStreetMap
        </a>
        . Forage Around is free and non-commercial, and it&apos;s{" "}
        <a href="https://github.com/sarbak/forage-around" rel="noopener">
          open-source on GitHub
        </a>
        .
      </p>

      <p style={{ margin: "22px 0" }}>
        <ToAppLink className="btn" href={APP_URL} from="about">
          Open the live map →
        </ToAppLink>
      </p>

      <Credits />
    </>
  );
}
