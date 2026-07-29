import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const sitemapPath =
  process.argv[2] || new URL("../.next/server/app/sitemap.xml.body", import.meta.url);
const expectedEntryCount = 587;
const expectedPathPriorityHash =
  "e9d9e68dc7f5d29019cd2d5cbedf5185e09f347af2c20ff193f27ef0d615b74f";

const xml = await readFile(sitemapPath, "utf8");
const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(
  ([, block]) => {
    const location = block.match(/<loc>(.*?)<\/loc>/)?.[1];
    const priority = block.match(/<priority>(.*?)<\/priority>/)?.[1];

    if (!location || !priority) {
      throw new Error("Every sitemap entry must include a URL and priority.");
    }

    return {
      path: new URL(location).pathname,
      priority,
    };
  },
);

if (entries.length !== expectedEntryCount) {
  throw new Error(
    `Expected ${expectedEntryCount} sitemap entries, found ${entries.length}.`,
  );
}

const uniquePaths = new Set(entries.map(({ path }) => path));
if (uniquePaths.size !== entries.length) {
  throw new Error("The sitemap contains duplicate paths.");
}

if (/<lastmod>/.test(xml)) {
  throw new Error(
    "The sitemap must not claim a modification date without a maintainable source.",
  );
}

const pathPriorityHash = createHash("sha256")
  .update(
    entries
      .map(({ path, priority }) => `${path}\t${priority}`)
      .sort()
      .join("\n"),
  )
  .digest("hex");

if (pathPriorityHash !== expectedPathPriorityHash) {
  throw new Error(
    "The sitemap URL set or priorities changed. Review the change and update the assertion only when that change is intentional.",
  );
}

console.log(
  `Sitemap check passed: ${entries.length} unique URLs, priorities preserved, and no unsupported modification dates.`,
);
