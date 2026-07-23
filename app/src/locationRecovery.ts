export const LOCATION_ACCESS_RECOVERY_MESSAGE =
  "Location access is off. Enter an address or place instead.";

export type LocationFailureRecovery = {
  message: string | null;
  useFallback: boolean;
};

export function locationFailureRecovery(
  platform: string,
): LocationFailureRecovery {
  if (platform === "web") {
    return {
      message: LOCATION_ACCESS_RECOVERY_MESSAGE,
      useFallback: false,
    };
  }

  return {
    message: null,
    useFallback: true,
  };
}
