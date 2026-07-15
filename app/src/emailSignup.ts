export const EMAIL_SIGNUP_CONSENT =
  "Your email is optional; we'll only send Forage Around updates and seasonal harvest reminders.";

export const EMAIL_SIGNUP_TRIGGER = "walk_here" as const;

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

export function emailSignupSuccessProperties(
  context: Record<string, unknown>,
  testRun: boolean
): Record<string, unknown> & { test_run: boolean } {
  return {
    ...context,
    test_run: testRun,
  };
}

export function shouldShowEmailSignup(sourceAction: string): boolean {
  return sourceAction === EMAIL_SIGNUP_TRIGGER;
}

export function validEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
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
