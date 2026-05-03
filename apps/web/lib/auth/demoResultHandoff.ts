/** Query value for `?from=` when the user arrives from the guest demo result CTA. */
export const DEMO_RESULT_FROM_QUERY_KEY = "from";
export const DEMO_RESULT_FROM_VALUE = "demo-result";

export function isFromDemoResultHandoff(from: string | null | undefined): boolean {
  return from === DEMO_RESULT_FROM_VALUE;
}

export function signupHrefFromDemoResult(): string {
  return `/signup?${DEMO_RESULT_FROM_QUERY_KEY}=${DEMO_RESULT_FROM_VALUE}`;
}
