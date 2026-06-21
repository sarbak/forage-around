import Link from "next/link";

export const APP_URL = "https://foragearound.com";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="brand">
          <span>🍐</span> Forage Around
        </Link>
        <a className="header-cta" href={APP_URL}>
          Open the map
        </a>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        Forage Around — a quiet map of the urban harvest.{" "}
        <a href={APP_URL}>Open the live map</a> ·{" "}
        <Link href="/about">Where the data comes from</Link>
      </div>
    </footer>
  );
}

// Credits + license, required on every page.
export function Credits() {
  return (
    <div className="credit">
      <p>
        Tree and plant locations come from{" "}
        <a href="https://fallingfruit.org" rel="noopener">
          Falling Fruit
        </a>
        , a volunteer-run map of the urban harvest, used under{" "}
        <a
          href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
          rel="license noopener"
        >
          CC BY-NC-SA 4.0
        </a>
        . This project is non-commercial. Locations are crowd-sourced and
        provided as-is — always confirm a plant&apos;s identity and that
        you&apos;re welcome to pick before foraging.
      </p>
      <p>
        Photos and descriptions from{" "}
        <a href="https://en.wikipedia.org" rel="noopener">
          Wikipedia
        </a>{" "}
        / Wikimedia Commons. Maps ©{" "}
        <a href="https://www.openstreetmap.org/copyright" rel="noopener">
          OpenStreetMap
        </a>{" "}
        contributors. Not affiliated with Falling Fruit, Wikimedia, or
        OpenStreetMap.
      </p>
    </div>
  );
}
