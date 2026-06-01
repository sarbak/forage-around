import type { NextConfig } from "next";

// The main site (foragearound.com) rewrites /tree/*, /species/*, /about, etc.
// to this seo-site. Without an absolute assetPrefix, the proxied HTML requests
// /_next/static/* relative to foragearound.com, where they 404. Forcing assets
// to the seo origin makes them load regardless of which domain serves the HTML.
const SEO_ORIGIN = "https://forage-around-seo.vercel.app";

const nextConfig: NextConfig = {
  assetPrefix: process.env.NODE_ENV === "production" ? SEO_ORIGIN : undefined,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "tile.openstreetmap.org" },
      { protocol: "https", hostname: "*.tile.openstreetmap.org" },
      { protocol: "https", hostname: "staticmap.openstreetmap.de" },
    ],
  },
};

export default nextConfig;
