/**
 * REVIEW_MODE: Enables deterministic/demo data, disables destructive actions.
 * Used for E2E tests against local/dev and Vercel Preview.
 * Never enable in production.
 */
export function isReviewMode(): boolean {
  return process.env.REVIEW_MODE === 'true';
}
