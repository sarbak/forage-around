const LOCATION_PARAM = "location";
const MAX_LOCATION_LENGTH = 120;

export function cleanInitialLocationQuery(value: string | null): string | null {
  if (!value) return null;
  const query = value.trim().replace(/\s+/g, " ");
  if (!query || query.length > MAX_LOCATION_LENGTH) return null;
  if (!/^[a-zA-Z0-9][a-zA-Z0-9 .,'-]*$/.test(query)) return null;
  return query;
}

export function initialLocationQueryFromHref(href: string): string | null {
  try {
    const url = new URL(href);
    return cleanInitialLocationQuery(url.searchParams.get(LOCATION_PARAM));
  } catch {
    return null;
  }
}

export function readInitialLocationQuery(): string | null {
  if (typeof window === "undefined") return null;
  return initialLocationQueryFromHref(window.location.href);
}
