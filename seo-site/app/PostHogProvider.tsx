"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

const POSTHOG_KEY = "phc_oD2VKZzyJbwhoS5RpHS7fysrCbYsxoyaNU75yx9dQC5v";
const POSTHOG_HOST = "https://us.i.posthog.com";

function initPostHog() {
  if (typeof window === "undefined") return;
  if ((window as unknown as { posthog?: unknown }).posthog && posthog.__loaded) return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: "identified_only",
    // We capture pageviews manually on route change (below) so the initial
    // automatic one isn't double-counted on client-side navigation.
    capture_pageview: false,
    capture_pageleave: true,
    autocapture: true,
  });
  // Expose for the lightweight lib/track.ts helper and for live verification.
  (window as unknown as { posthog?: typeof posthog }).posthog = posthog;
}

// App Router does a single full load then client-side route changes; the SDK's
// built-in capture_pageview only fires once, so we capture $pageview ourselves
// on every pathname/search change.
function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    let url = window.origin + pathname;
    const qs = searchParams?.toString();
    if (qs) url += "?" + qs;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      {children}
    </PHProvider>
  );
}
