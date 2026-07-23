import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  LOCATION_ACCESS_RECOVERY_MESSAGE,
  locationFailureRecovery,
} from "./locationRecovery";

test("keeps browser location failures on the address-search screen", () => {
  assert.deepEqual(locationFailureRecovery("web"), {
    message: "Location access is off. Enter an address or place instead.",
    useFallback: false,
  });
  assert.equal(
    locationFailureRecovery("web").message,
    LOCATION_ACCESS_RECOVERY_MESSAGE,
  );
});

test("preserves the existing fallback outside the browser recovery path", () => {
  assert.deepEqual(locationFailureRecovery("ios"), {
    message: null,
    useFallback: true,
  });
  assert.deepEqual(locationFailureRecovery("android"), {
    message: null,
    useFallback: true,
  });
});

test("preserves denial analytics and focuses the address field", () => {
  const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
  const locateSource = appSource.slice(
    appSource.indexOf("async function locateMe()"),
    appSource.indexOf("function reset()"),
  );

  assert.match(
    locateSource,
    /track\("geolocation_denied"\);\s+await recoverFromLocationFailure\(\);/,
  );
  assert.equal(
    locateSource.match(/await recoverFromLocationFailure\(\);/g)?.length,
    2,
  );
  assert.match(
    appSource,
    /if \(geoError !== LOCATION_ACCESS_RECOVERY_MESSAGE\) return;\s+addrInputRef\.current\?\.focus\(\);/,
  );
  assert.match(appSource, /ref=\{addrInputRef\}/);
});
