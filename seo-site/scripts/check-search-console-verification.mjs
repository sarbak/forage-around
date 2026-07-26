import { readFileSync } from "node:fs";
import { join } from "node:path";

const verificationValue = process.env.GOOGLE_SITE_VERIFICATION?.trim();
const homepagePath = join(process.cwd(), ".next/server/app/index.html");
const homepageHtml = readFileSync(homepagePath, "utf8");
const verificationTags =
  homepageHtml.match(
    /<meta\b[^>]*\bname="google-site-verification"[^>]*>/g,
  ) ?? [];

if (!verificationValue) {
  if (verificationTags.length > 0) {
    throw new Error(
      "Google site verification metadata must be omitted when GOOGLE_SITE_VERIFICATION is unset or empty.",
    );
  }

  console.log(
    "Search Console verification check passed: no verification tag is rendered without a configured value.",
  );
  process.exit(0);
}

if (verificationTags.length !== 1) {
  throw new Error(
    `Expected one Google site verification tag, found ${verificationTags.length}.`,
  );
}

const contentMatch = verificationTags[0].match(/\bcontent="([^"]*)"/);
if (!contentMatch || contentMatch[1] !== verificationValue) {
  throw new Error(
    "Google site verification metadata must render the exact configured value.",
  );
}

console.log(
  "Search Console verification check passed: the configured value renders exactly once.",
);
