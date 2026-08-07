export const CONTROLLED_TEST_PARAM: "test_run";

export function isControlledTestRun(
  value: string | null | undefined,
): boolean;

export function controlledTestRunFromSearch(search: string): boolean;

export function analyticsEventName(event: string, testRun: boolean): string;

export function hrefWithControlledTestRun(
  href: string,
  testRun: boolean,
): string;
