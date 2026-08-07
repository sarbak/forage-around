export const CONTROLLED_TEST_PARAM = "test_run";

export function isControlledTestRun(value) {
  return value === "true";
}

export function controlledTestRunFromSearch(search) {
  return isControlledTestRun(
    new URLSearchParams(search).get(CONTROLLED_TEST_PARAM),
  );
}

export function analyticsEventName(event, testRun) {
  if (!testRun || event.startsWith("qa_")) return event;
  return `qa_${event}`;
}

export function hrefWithControlledTestRun(href, testRun) {
  if (!testRun) return href;

  const isAbsolute = /^https?:\/\//i.test(href);
  try {
    const url = new URL(href, "https://foragearound.com");
    url.searchParams.set(CONTROLLED_TEST_PARAM, "true");
    return isAbsolute ? url.toString() : `${url.pathname}${url.search}${url.hash}`;
  } catch {
    const join = href.includes("?") ? "&" : "?";
    return `${href}${join}${CONTROLLED_TEST_PARAM}=true`;
  }
}
