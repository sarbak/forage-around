import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  captureEmailSignupDismissal,
  createEmailSignupOutcomeGuard,
  EMAIL_SIGNUP_CONSENT,
  EMAIL_SIGNUP_OFFER,
  emailSignupAnalyticsProperties,
  emailSignupPromptTitle,
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

test("personalizes the prompt with privacy-safe outing context", () => {
  assert.equal(
    emailSignupPromptTitle("Fennel", "Portland, Oregon"),
    "Get Fennel harvest reminders for Portland, Oregon"
  );
  assert.equal(
    emailSignupPromptTitle("Fennel", null),
    "Get Fennel harvest reminders"
  );
  assert.equal(
    emailSignupPromptTitle(null, "Portland, Oregon"),
    "Get harvest reminders"
  );
  assert.equal(
    emailSignupPromptTitle(" ", "Portland, Oregon"),
    "Get harvest reminders"
  );
  assert.equal(
    emailSignupPromptTitle("Fennel", "a".repeat(81)),
    "Get Fennel harvest reminders"
  );
});

test("allows browsers to autofill a saved email address", () => {
  const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");

  assert.match(
    appSource,
    /<TextInput[\s\S]*keyboardType="email-address"[\s\S]*autoComplete="email"[\s\S]*textContentType="emailAddress"/
  );
});

test("offers the managed support address in the app footer and signup consent", () => {
  const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");

  assert.match(
    appSource,
    /const SUPPORT_EMAIL = "foragearound-com@mail\.tin\.computer"/
  );
  assert.match(
    appSource,
    /<Link label="Email Forage Around" url=\{`mailto:\$\{SUPPORT_EMAIL\}`\} \/>/
  );
  assert.match(
    appSource,
    /<FooterLink label="Email Forage Around" url=\{`mailto:\$\{SUPPORT_EMAIL\}`\} \/>/
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

test("classifies X and request-close dismissals with the required prompt properties", () => {
  const attribution = {
    source_action: "walk_here",
    submission_kind: "observation",
    map_source: "seasonal_guide",
    species: "Apple",
    ff_location_id: "123",
    utm_source: "local_partner",
  };

  for (const dismissalMethod of ["close_button", "request_close"] as const) {
    const events: Array<{ event: string; properties: Record<string, unknown> }> = [];
    const captured = captureEmailSignupDismissal(
      createEmailSignupOutcomeGuard(),
      dismissalMethod,
      attribution,
      true,
      (event, properties) => events.push({ event, properties }),
    );

    assert.equal(captured, true);
    assert.deepEqual(events, [
      {
        event: "email_signup_dismissed",
        properties: {
          ...attribution,
          signup_offer: "seasonal_harvest_reminders",
          test_run: true,
          dismissal_method: dismissalMethod,
        },
      },
    ]);
  }
});

test("captures at most one dismissal per prompt", () => {
  const guard = createEmailSignupOutcomeGuard();
  const events: string[] = [];
  const capture = (event: string) => events.push(event);

  assert.equal(
    captureEmailSignupDismissal(guard, "close_button", {}, false, capture),
    true,
  );
  assert.equal(
    captureEmailSignupDismissal(guard, "request_close", {}, false, capture),
    false,
  );
  assert.deepEqual(events, ["email_signup_dismissed"]);
  assert.equal(guard.current(), "dismissed");
});

test("keeps dismissal mutually exclusive with success and explicit skip", () => {
  for (const outcome of ["success", "skipped"] as const) {
    const guard = createEmailSignupOutcomeGuard();
    const events: string[] = [];

    assert.equal(guard.claim(outcome), true);
    assert.equal(
      captureEmailSignupDismissal(
        guard,
        "close_button",
        {},
        false,
        (event) => events.push(event),
      ),
      false,
    );
    assert.deepEqual(events, []);
    assert.equal(guard.current(), outcome);
  }
});

test("keeps a late success exclusive after the prompt was dismissed", () => {
  const guard = createEmailSignupOutcomeGuard();
  const events: string[] = [];

  assert.equal(
    captureEmailSignupDismissal(
      guard,
      "request_close",
      {},
      false,
      (event) => events.push(event),
    ),
    true,
  );
  assert.equal(guard.claim("success"), false);
  assert.deepEqual(events, ["email_signup_dismissed"]);
  assert.equal(guard.current(), "dismissed");
});

test("wires both modal close paths through the dismissal classifier", () => {
  const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");

  assert.match(appSource, /dismissEmailSignup\("close_button"\)/);
  assert.match(appSource, /dismissEmailSignup\("request_close"\)/);
  assert.match(appSource, /onRequestClose=\{closeFromRequest\}/);
  assert.match(appSource, /onPress=\{closeFromButton\}/);
});

test("returns a successful signup to the unchanged map in one action", () => {
  const calls: string[] = [];

  returnToMap(
    () => calls.push("reset"),
    () => calls.push("close")
  );

  assert.deepEqual(calls, ["reset", "close"]);
});
