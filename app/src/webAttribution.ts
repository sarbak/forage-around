const SPECIES_CONTEXT_PARAM = "species_context";
const CONTROLLED_TEST_PARAM = "test_run";
const MAX_SPECIES_CONTEXT_LENGTH = 80;

export function cleanSpeciesContext(value: string | null): string | null {
  if (!value) return null;
  const context = value.trim().replace(/\s+/g, " ");
  if (!context || context.length > MAX_SPECIES_CONTEXT_LENGTH) return null;
  if (!/^[a-zA-Z0-9][a-zA-Z0-9 .,'()-]*$/.test(context)) return null;
  return context;
}

export function speciesContextFromHref(href: string): string | null {
  try {
    const url = new URL(href);
    return cleanSpeciesContext(url.searchParams.get(SPECIES_CONTEXT_PARAM));
  } catch {
    return null;
  }
}

export function speciesContextForEntry(
  href: string,
  storedContext: string | null,
): string | null {
  try {
    const url = new URL(href);
    const direct = cleanSpeciesContext(
      url.searchParams.get(SPECIES_CONTEXT_PARAM),
    );
    if (direct) return direct;
    if (url.searchParams.has("map_source")) return null;
    return cleanSpeciesContext(storedContext);
  } catch {
    return null;
  }
}

export function isControlledTestRun(
  value: string | null | undefined,
): boolean {
  return value === "true";
}

export function controlledTestRunFromHref(href: string): boolean {
  try {
    const url = new URL(href);
    return isControlledTestRun(url.searchParams.get(CONTROLLED_TEST_PARAM));
  } catch {
    return false;
  }
}

export function withWebAttribution(
  source: string | null,
  speciesContext: string | null,
  properties: Record<string, unknown>,
  referralParams: Record<string, string> = {},
  testRun = false,
) {
  return {
    ...properties,
    ...(source ? { map_source: source } : {}),
    ...(speciesContext ? { species_context: speciesContext } : {}),
    ...referralParams,
    test_run: testRun,
  };
}
