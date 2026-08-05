"use client";

// Client-only analytics components. These mount inside server-rendered pages
// to fire custom PostHog events without making the surrounding page a client
// component (SSR/SEO output is unaffected). All events here are IN ADDITION to
// autocapture + $pageview.
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { track } from "@/lib/track";
import {
  controlledTestRunFromSearch,
  hrefWithControlledTestRun,
} from "@/lib/controlled-journey.mjs";

function readControlledTestRun() {
  if (typeof window === "undefined") return false;
  return controlledTestRunFromSearch(window.location.search);
}

function useControlledTestRun() {
  const [testRun, setTestRun] = useState(false);

  useEffect(() => {
    setTestRun(readControlledTestRun());
  }, []);

  return testRun;
}

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
    track("species_page_viewed", {
      species,
      test_run: readControlledTestRun(),
    });
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

export function LocationsPageViewed({
  pageType = "index",
  slug = null,
  species = null,
  city = null,
}: {
  pageType?: "index" | "category" | "species_nearby" | "city";
  slug?: string | null;
  species?: string | null;
  city?: string | null;
} = {}) {
  useEffect(() => {
    track("locations_page_viewed", {
      page_type: pageType,
      slug,
      species,
      city,
    });
  }, [pageType, slug, species, city]);
  return null;
}

export function SeasonalGuidePageViewed() {
  useEffect(() => {
    track("seasonal_guide_page_viewed", {
      test_run: readControlledTestRun(),
    });
  }, []);
  return null;
}

export function ForagingMapPageViewed() {
  useEffect(() => {
    track("foraging_map_page_viewed");
  }, []);
  return null;
}

export function EdibleWildPlantsPageViewed() {
  useEffect(() => {
    track("edible_wild_plants_page_viewed");
  }, []);
  return null;
}

export function FaqPageViewed() {
  useEffect(() => {
    track("faq_page_viewed");
  }, []);
  return null;
}

// ---- CTA / link click trackers ----

// Named walking link on a tree page → Google Maps directions.
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
  children: ReactNode;
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
  children: ReactNode;
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

export function ControlledJourneyLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const testRun = useControlledTestRun();

  return (
    <Link
      className={className}
      href={hrefWithControlledTestRun(href, testRun)}
    >
      {children}
    </Link>
  );
}

type ToAppSource =
  | "tree"
  | "species"
  | "about"
  | "home"
  | "locations"
  | "foraging_map"
  | "edible_wild_plants"
  | "faq"
  | "seasonal_guide"
  | "portland_summer_guide"
  | "berkeley_fig_season_guide"
  | "nav_header"
  | "nav_footer";

const REFERRAL_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "ref",
] as const;

type ReferralParamKey = (typeof REFERRAL_PARAM_KEYS)[number];
type ReferralParams = Partial<Record<ReferralParamKey, string>>;

function cleanReferralValue(value: string | null) {
  if (!value) return null;
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
  return cleaned || null;
}

function readReferralParams(): ReferralParams {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return REFERRAL_PARAM_KEYS.reduce<ReferralParams>((acc, key) => {
    const value = cleanReferralValue(params.get(key));
    if (value) acc[key] = value;
    return acc;
  }, {});
}

function hasReferralParams(params: ReferralParams) {
  return REFERRAL_PARAM_KEYS.some((key) => !!params[key]);
}

function readInheritedMapSource(from: ToAppSource): ToAppSource {
  if (from !== "species" || typeof window === "undefined") return from;
  const inherited = new URLSearchParams(window.location.search).get("map_source");
  return inherited === "seasonal_guide" ? inherited : from;
}

function cleanSpeciesContext(value: string | null | undefined) {
  if (!value) return null;
  const cleaned = value.trim().replace(/\s+/g, " ").slice(0, 80);
  return cleaned || null;
}

function hrefWithMapSource(
  href: string,
  from: ToAppSource,
  referralParams: ReferralParams = {},
  speciesContext?: string | null,
  testRun = false,
) {
  const isAbsolute = /^https?:\/\//i.test(href);
  try {
    const url = new URL(href, "https://foragearound.com");
    url.searchParams.set("map_source", from);
    const context = cleanSpeciesContext(speciesContext);
    if (context) url.searchParams.set("species_context", context);
    REFERRAL_PARAM_KEYS.forEach((key) => {
      const value = referralParams[key];
      if (value) url.searchParams.set(key, value);
    });
    return hrefWithControlledTestRun(
      isAbsolute ? url.toString() : `${url.pathname}${url.search}${url.hash}`,
      testRun,
    );
  } catch {
    const params = new URLSearchParams({ map_source: from });
    const context = cleanSpeciesContext(speciesContext);
    if (context) params.set("species_context", context);
    REFERRAL_PARAM_KEYS.forEach((key) => {
      const value = referralParams[key];
      if (value) params.set(key, value);
    });
    const join = href.includes("?") ? "&" : "?";
    return hrefWithControlledTestRun(
      `${href}${join}${params.toString()}`,
      testRun,
    );
  }
}

// Any CTA pointing at the main app (foragearound.com / "Open the map").
export function ToAppLink({
  href,
  from,
  className,
  children,
  rel,
  speciesContext,
}: {
  href: string;
  from: ToAppSource;
  className?: string;
  children: ReactNode;
  rel?: string;
  speciesContext?: string;
}) {
  const [referralParams, setReferralParams] = useState<ReferralParams>({});
  const [effectiveFrom, setEffectiveFrom] = useState<ToAppSource>(from);
  const testRun = useControlledTestRun();

  useEffect(() => {
    const params = readReferralParams();
    if (hasReferralParams(params)) setReferralParams(params);
    setEffectiveFrom(readInheritedMapSource(from));
  }, [from]);

  const context = cleanSpeciesContext(speciesContext);

  return (
    <a
      className={className}
      href={hrefWithMapSource(
        href,
        effectiveFrom,
        referralParams,
        context,
        testRun,
      )}
      rel={rel}
      onClick={() =>
        track("to_app_clicked", {
          from: effectiveFrom,
          ...(context ? { species_context: context } : {}),
          ...referralParams,
          test_run: testRun,
        })
      }
    >
      {children}
    </a>
  );
}

export function SupportEmailLink({
  href,
  surface,
  className,
  children,
}: {
  href: string;
  surface: "site_footer";
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      className={className}
      href={href}
      onClick={() =>
        track("support_email_clicked", {
          source: surface,
          surface,
          path: window.location.pathname || "/",
        })
      }
    >
      {children}
    </a>
  );
}
