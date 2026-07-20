function reportedDestination(speciesName: string | null | undefined): string {
  const name = speciesName?.trim();
  return name ? `reported ${name} location` : "reported plant location";
}

export function walkingDestinationLabel(
  speciesName: string | null | undefined,
): string {
  return `Walk to ${reportedDestination(speciesName)}`;
}

export function walkingDestinationAccessibilityLabel(
  speciesName: string | null | undefined,
): string {
  return `Open walking directions to ${reportedDestination(speciesName)}`;
}
