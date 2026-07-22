import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  EMAIL_SIGNUP_CONSENT,
  EMAIL_SIGNUP_OFFER,
  emailSignupAnalyticsProperties,
  isControlledSignupTestRun,
  returnToMap,
  shouldShowEmailSignup,
  validEmail,
} from "./emailSignup";

test("uses the approved consent text verbatim", () => {
  assert.equal(
    EMAIL_SIGNUP_CONSENT,
    "Your email is optional; we'll only send Forage Around updates and seasonal harvest reminders."
  );
});

test("uses one stable analytics label for the signup offer", () => {
  assert.equal(EMAIL_SIGNUP_OFFER, "seasonal_harvest_reminders");
});

test("names the signup benefit on the primary prompt action", () => {
  const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");

  assert.match(
    appSource,
    /<Text style=\{styles\.signupBtnText\}>Get harvest reminders<\/Text>/
  );
  assert.doesNotMatch(appSource, /Keep me posted/);
});

test("offers the managed support address beside the signup consent", () => {
  const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");

  assert.match(appSource, /const SUPPORT_EMAIL = "foragearound@mail\.tin\.computer"/);
  assert.match(
    appSource,
    /<Link label="Email Forage Around" url=\{`mailto:\$\{SUPPORT_EMAIL\}`\} \/>/
  );
  assert.match(
    appSource,
    /function Link[\s\S]*accessibilityRole="link"[\s\S]*function About/
  );
});

test("shows the prompt only after walking directions", () => {
  assert.equal(shouldShowEmailSignup("walk_here"), true);
  assert.equal(shouldShowEmailSignup("wall"), false);
  assert.equal(shouldShowEmailSignup("find_opened"), false);
  assert.equal(shouldShowEmailSignup("address_submitted"), false);
});

test("validates a usable email without making it mandatory", () => {
  assert.equal(validEmail("forager@example.com"), true);
  assert.equal(validEmail(""), false);
  assert.equal(validEmail("not-an-email"), false);
});

test("marks only an explicit controlled signup test", () => {
  assert.equal(isControlledSignupTestRun("true"), true);
  assert.equal(isControlledSignupTestRun("false"), false);
  assert.equal(isControlledSignupTestRun("1"), false);
  assert.equal(isControlledSignupTestRun("TRUE"), false);
  assert.equal(isControlledSignupTestRun(null), false);
});

test("keeps signup attribution while distinguishing real and controlled analytics", () => {
  const attribution = {
    source_action: "walk_here",
    submission_kind: "observation",
    map_source: "seasonal_guide",
    utm_source: "local_partner",
    utm_campaign: "nearby_fruit",
    ref: "resource_page",
  };

  assert.deepEqual(emailSignupAnalyticsProperties(attribution, false), {
    ...attribution,
    signup_offer: "seasonal_harvest_reminders",
    test_run: false,
  });
  assert.deepEqual(emailSignupAnalyticsProperties(attribution, true), {
    ...attribution,
    signup_offer: "seasonal_harvest_reminders",
    test_run: true,
  });
});

test("returns a successful signup to the unchanged map in one action", () => {
  const calls: string[] = [];

  returnToMap(
    () => calls.push("reset"),
    () => calls.push("close")
  );

  assert.deepEqual(calls, ["reset", "close"]);
});
