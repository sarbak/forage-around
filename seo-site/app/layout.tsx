import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./globals.css";
import { SiteHeader, SiteFooter } from "./components";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-fraunces",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://forage-around-seo.vercel.app";

// Favicon/apple-touch-icon live only in this seo-site's /public. When the HTML
// is proxied through foragearound.com, a root-relative path would 404 there, so
// reference them on the seo origin directly. (OG/canonical URLs intentionally
// stay on SITE_URL via metadataBase below.)
const SEO_ORIGIN = "https://forage-around-seo.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Forage Around — a quiet map of the urban harvest",
    template: "%s · Forage Around",
  },
  description:
    "See what fruit is ripe near you and what you can make with it. A simple foraging map built on Falling Fruit's open data.",
  icons: {
    icon: `${SEO_ORIGIN}/favicon.png`,
    apple: `${SEO_ORIGIN}/apple-touch-icon.png`,
  },
  openGraph: {
    type: "website",
    siteName: "Forage Around",
    title: "Forage Around — a quiet map of the urban harvest",
    description:
      "See what fruit is ripe near you and what you can make with it.",
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
        <SiteHeader />
        <main>
          <div className="wrap">{children}</div>
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
