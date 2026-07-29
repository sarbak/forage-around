export const LOCATION_ACCESS_RECOVERY_MESSAGE =
  "Location access is off or unavailable. Enter an address or place instead.";

export const LOCATION_LOOKUP_TIMEOUT_MS = 10_000;

export class LocationLookupTimeoutError extends Error {
  constructor() {
    super("Location lookup timed out");
    this.name = "LocationLookupTimeoutError";
  }
}

export type LocationFailureRecovery = {
  message: string;
  useFallback: false;
};

export async function withLocationTimeout<T>(
  lookup: () => Promise<T>,
  timeoutMs = LOCATION_LOOKUP_TIMEOUT_MS,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      lookup(),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new LocationLookupTimeoutError()),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

export function locationFailureRecovery(): LocationFailureRecovery {
  return {
    message: LOCATION_ACCESS_RECOVERY_MESSAGE,
    useFallback: false,
  };
}
