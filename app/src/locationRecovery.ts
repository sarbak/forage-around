export const LOCATION_ACCESS_RECOVERY_MESSAGE =
  "Location access is off or unavailable. Enter an address or place instead.";

export type LocationFailureRecovery = {
  message: string;
  useFallback: false;
};

export function locationFailureRecovery(): LocationFailureRecovery {
  return {
    message: LOCATION_ACCESS_RECOVERY_MESSAGE,
    useFallback: false,
  };
}
