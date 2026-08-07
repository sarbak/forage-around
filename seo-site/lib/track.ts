"use client";

import {
  analyticsEventName,
  controlledTestRunFromSearch,
} from "@/lib/controlled-journey.mjs";

// Tiny client-side analytics helper. Calls into the PostHog browser SDK
// (initialized in app/PostHogProvider.tsx) if it's present. Safe to call
// during SSR or before PostHog has loaded — it just no-ops.
export function track(event: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  // posthog-js attaches the active instance to window.posthog.
  const ph = (window as unknown as { posthog?: { capture?: (e: string, p?: Record<string, unknown>) => void } }).posthog;
  const testRun =
    (window as Window & { __forageAroundQaRun?: boolean })
      .__forageAroundQaRun === true ||
    props?.test_run === true ||
    controlledTestRunFromSearch(window.location.search);
  ph?.capture?.(analyticsEventName(event, testRun), props);
}
