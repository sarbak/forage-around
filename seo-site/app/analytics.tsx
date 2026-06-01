"use client";

// Client-only analytics components. These mount inside server-rendered pages
// to fire custom PostHog events without making the surrounding page a client
// component (SSR/SEO output is unaffected). All events here are IN ADDITION to
// autocapture + $pageview.
import { useEffect } from "react";
import Link from "next/link";
import { track } from "@/lib/track";

// ---- page_viewed beacons (fire once on mount) ----

export function TreePageViewed({
  id,
  species,
  city,
}: {
  id: string;
  species: string | null;
  city: string | null;
}) {
  useEffect(() => {
    track("tree_page_viewed", { id, species, city });
  }, [id, species, city]);
  return null;
}

export function SpeciesPageViewed({ species }: { species: string }) {
  useEffect(() => {
    track("species_page_viewed", { species });
  }, [species]);
  return null;
}

export function AboutPageViewed() {
  useEffect(() => {
    track("about_page_viewed");
  }, []);
  return null;
}

export function SeoHomeViewed() {
  useEffect(() => {
    track("seo_home_viewed");
  }, []);
  return null;
}

// ---- CTA / link click trackers ----

// "Walk here" link on a tree page → Google Maps directions.
export function WalkHereLink({
  href,
  species,
  id,
  className,
  children,
}: {
  href: string;
  species: string | null;
  id: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      className={className}
      href={href}
      rel="noopener"
      onClick={() =>
        track("walk_here_clicked", { species, id, source: "seo_tree" })
      }
    >
      {children}
    </a>
  );
}

// "More about <species>" / any internal link to a /species page.
export function MoreAboutLink({
  href,
  species,
  className,
  children,
}: {
  href: string;
  species: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      className={className}
      href={href}
      onClick={() => track("more_about_clicked", { species })}
    >
      {children}
    </Link>
  );
}

// Any CTA pointing at the main app (foragearound.com / "Open the map").
export function ToAppLink({
  href,
  from,
  className,
  children,
  rel,
}: {
  href: string;
  from: "tree" | "species" | "about" | "home";
  className?: string;
  children: React.ReactNode;
  rel?: string;
}) {
  return (
    <a
      className={className}
      href={href}
      rel={rel}
      onClick={() => track("to_app_clicked", { from })}
    >
      {children}
    </a>
  );
}
