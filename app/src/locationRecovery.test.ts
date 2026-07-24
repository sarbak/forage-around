import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  LOCATION_ACCESS_RECOVERY_MESSAGE,
  locationFailureRecovery,
} from "./locationRecovery";

test("keeps every location failure on the address-search screen", () => {
  assert.deepEqual(locationFailureRecovery(), {
    message:
      "Location access is off or unavailable. Enter an address or place instead.",
    useFallback: false,
  });
  assert.equal(
    locationFailureRecovery().message,
    LOCATION_ACCESS_RECOVERY_MESSAGE,
  );
});

test("preserves denial analytics and focuses the address field", () => {
  const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
  const locateSource = appSource.slice(
    appSource.indexOf("async function locateMe()"),
    appSource.indexOf("function reset()"),
  );

  assert.match(
    locateSource,
    /track\("geolocation_denied"\);\s+recoverFromLocationFailure\(\);/,
  );
  assert.equal(
    locateSource.match(/recoverFromLocationFailure\(\);/g)?.length,
    2,
  );
  assert.doesNotMatch(locateSource, /FALLBACK|method: "fallback"/);
  assert.match(
    appSource,
    /if \(geoError !== LOCATION_ACCESS_RECOVERY_MESSAGE\) return;\s+addrInputRef\.current\?\.focus\(\);/,
  );
  assert.match(appSource, /ref=\{addrInputRef\}/);
});
