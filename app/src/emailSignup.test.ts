import assert from "node:assert/strict";
import test from "node:test";
import {
  EMAIL_SIGNUP_CONSENT,
  shouldShowEmailSignup,
  validEmail,
} from "./emailSignup";

test("uses the approved consent text verbatim", () => {
  assert.equal(
    EMAIL_SIGNUP_CONSENT,
    "Your email is optional; we'll only send Forage Around updates and seasonal harvest reminders."
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
