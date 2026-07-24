export const EMAIL_SIGNUP_CONSENT =
  "Your email is optional; we'll only send Forage Around updates and seasonal harvest reminders.";

export const EMAIL_SIGNUP_TRIGGER = "walk_here" as const;

export const EMAIL_SIGNUP_OFFER = "seasonal_harvest_reminders" as const;

export type EmailSignupDismissalMethod = "close_button" | "request_close";

export type EmailSignupTerminalOutcome = "dismissed" | "skipped" | "success";

export type EmailSignupOutcomeGuard = {
  claim: (outcome: EmailSignupTerminalOutcome) => boolean;
  current: () => EmailSignupTerminalOutcome | null;
};

export type NewEmailSignup = {
  email: string;
  consent_text: string;
  source_action: typeof EMAIL_SIGNUP_TRIGGER;
  submission_kind: "observation";
  map_source?: string | null;
  ff_location_id?: string | null;
  species?: string | null;
  lat?: number | null;
  lng?: number | null;
  referral_params?: Record<string, string>;
};

export type EmailSignupRow = NewEmailSignup & {
  created_at: string;
};

export function isControlledSignupTestRun(value: string | null | undefined): boolean {
  return value === "true";
}

export function emailSignupAnalyticsProperties(
  context: Record<string, unknown>,
  testRun: boolean
): Record<string, unknown> & {
  signup_offer: typeof EMAIL_SIGNUP_OFFER;
  test_run: boolean;
} {
  return {
    ...context,
    signup_offer: EMAIL_SIGNUP_OFFER,
    test_run: testRun,
  };
}

export function createEmailSignupOutcomeGuard(): EmailSignupOutcomeGuard {
  let outcome: EmailSignupTerminalOutcome | null = null;

  return {
    claim(nextOutcome) {
      if (outcome) return false;
      outcome = nextOutcome;
      return true;
    },
    current() {
      return outcome;
    },
  };
}

export function captureEmailSignupDismissal(
  guard: EmailSignupOutcomeGuard,
  dismissalMethod: EmailSignupDismissalMethod,
  context: Record<string, unknown>,
  testRun: boolean,
  capture: (event: string, properties: Record<string, unknown>) => void,
): boolean {
  if (!guard.claim("dismissed")) return false;

  capture("email_signup_dismissed", {
    ...emailSignupAnalyticsProperties(context, testRun),
    dismissal_method: dismissalMethod,
  });
  return true;
}

export function shouldShowEmailSignup(sourceAction: string): boolean {
  return sourceAction === EMAIL_SIGNUP_TRIGGER;
}

export function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function returnToMap(reset: () => void, close: () => void): void {
  reset();
  close();
}

export async function saveEmailSignup(
  payload: NewEmailSignup,
  insert: (row: EmailSignupRow) => Promise<boolean>,
  now = () => new Date()
): Promise<boolean> {
  const email = payload.email.trim().toLowerCase();
  if (
    !validEmail(email) ||
    payload.consent_text !== EMAIL_SIGNUP_CONSENT ||
    payload.source_action !== EMAIL_SIGNUP_TRIGGER
  ) {
    return false;
  }

  return insert({
    ...payload,
    email,
    created_at: now().toISOString(),
  });
}
