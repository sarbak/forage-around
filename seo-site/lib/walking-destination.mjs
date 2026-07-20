function reportedDestination(speciesName) {
  const name = typeof speciesName === "string" ? speciesName.trim() : "";
  return name ? `reported ${name} location` : "reported plant location";
}

export function walkingDestinationLabel(speciesName) {
  return `Walk to ${reportedDestination(speciesName)}`;
}
