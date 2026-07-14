const DEFAULT_SITE_ORIGIN = "https://foragearound.com";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const SITE_ORIGIN = new URL(
  configuredSiteUrl || DEFAULT_SITE_ORIGIN,
).origin;
