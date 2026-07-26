import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";
import { SiteHeader, SiteFooter } from "./components";
import { PostHogProvider } from "./PostHogProvider";
import { SITE_ORIGIN } from "@/lib/site-origin";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-fraunces",
  display: "swap",
});

// Favicon/apple-touch-icon live only in this seo-site's /public. When the HTML
// is proxied through foragearound.com, a root-relative path would 404 there, so
// reference them on the seo origin directly. (OG/canonical URLs intentionally
// stay on SITE_ORIGIN via metadataBase below.)
const SEO_ORIGIN = "https://forage-around-seo.vercel.app";
const GOOGLE_SITE_VERIFICATION =
  process.env.GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "Forage Around | Free urban foraging map",
    template: "%s · Forage Around",
  },
  description:
    "Find fruit, herbs, and greens likely in season near you. Free open-source urban foraging map with Falling Fruit source notes and permission reminders.",
  icons: {
    icon: `${SEO_ORIGIN}/favicon.png`,
    apple: `${SEO_ORIGIN}/apple-touch-icon.png`,
  },
  verification: GOOGLE_SITE_VERIFICATION
    ? { google: GOOGLE_SITE_VERIFICATION }
    : undefined,
  openGraph: {
    type: "website",
    siteName: "Forage Around",
    title: "Forage Around | Free urban foraging map",
    description:
      "Find fruit, herbs, and greens likely in season near you, with source notes and permission reminders.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fraunces.variable}>
      <body>
        <PostHogProvider>
          <SiteHeader />
          <main>
            <div className="wrap">{children}</div>
          </main>
          <SiteFooter />
        </PostHogProvider>
      </body>
    </html>
  );
}
