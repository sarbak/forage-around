import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("records an address success only after nearby results load", () => {
  const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
  const addressSource = appSource.slice(
    appSource.indexOf("async function useAddress"),
    appSource.indexOf("useEffect(() => {", appSource.indexOf("async function useAddress")),
  );

  assert.match(
    addressSource,
    /await go\(point, \{ method: "address" \}\);\s+track\("address_resolved"\);/,
  );
  assert.equal(addressSource.match(/track\("address_resolved"\)/g)?.length, 1);
});
