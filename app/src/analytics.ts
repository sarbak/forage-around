// Thin PostHog wrapper. The loader script is injected into index.html (web build),
// so we talk to window.posthog. No-ops on native / before load — safe everywhere.
import {
  analyticsEventName,
  controlledTestRunFromHref,
} from "./webAttribution";

type Props = Record<string, unknown>;

function ph(): any | null {
  if (typeof window === "undefined") return null;
  const p = (window as any).posthog;
  return p && typeof p.capture === "function" ? p : null;
}

export function track(event: string, props?: Props): void {
  const p = ph();
  if (!p) return;
  try {
    const testRun =
      (window as Window & { __forageAroundQaRun?: boolean })
        .__forageAroundQaRun === true ||
      props?.test_run === true ||
      controlledTestRunFromHref(window.location.href);
    p.capture(analyticsEventName(event, testRun), props);
  } catch {}
}

export function identify(id: string, props?: Props): void {
  const p = ph();
  if (!p) return;
  try {
    p.identify(id, props);
  } catch {}
}
