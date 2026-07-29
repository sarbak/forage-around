import Link from "next/link";
import { SupportEmailLink, ToAppLink } from "./analytics";

export const APP_URL = "https://foragearound.com";
export const SUPPORT_EMAIL = "foragearound@mail.tin.computer";
export const GITHUB_URL = "https://github.com/sarbak/forage-around";
export const LICENSE_URL = `${GITHUB_URL}/blob/main/LICENSE`;

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="brand">
          <span>🍐</span> Forage Around
        </Link>
        <div className="header-actions">
          <Link className="header-link" href="/seasonal-guide">
            In season now
          </Link>
          <Link className="header-link" href="/locations">
            Find nearby
          </Link>
          <ToAppLink className="header-cta" href={APP_URL} from="nav_header">
            Open the map
          </ToAppLink>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <p className="site-footer-intro">
          Forage Around, a quiet map of the urban harvest.
        </p>
        <nav className="site-footer-nav" aria-label="Footer">
          <Link href="/foraging-map">Foraging map</Link>
          <Link href="/seasonal-guide">What&apos;s in season</Link>
          <Link href="/locations">Find nearby harvests</Link>
          <ToAppLink href={APP_URL} from="nav_footer">
            Open the live map
          </ToAppLink>
          <Link href="/faq">FAQ</Link>
          <Link href="/about">About</Link>
          <a href={GITHUB_URL} rel="external noopener">
            GitHub
          </a>
          <SupportEmailLink
            href={`mailto:${SUPPORT_EMAIL}`}
            surface="site_footer"
          >
            Email Forage Around
          </SupportEmailLink>
        </nav>
        <div className="site-footer-meta">
          <span>© 2026 Emre Sarbak</span>
          <span aria-hidden="true">·</span>
          <a href={LICENSE_URL} rel="license noopener">
            MIT license
          </a>
          <span aria-hidden="true">·</span>
          <a className="tin-credit" href="https://tin.computer" rel="noopener">
            <span className="tin-mark" aria-hidden="true" />
            Growth by Tin
          </a>
        </div>
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
