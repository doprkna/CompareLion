/**
 * Build-time stub for tagUtils so validation package compiles without
 * depending on apps/web lib. At runtime, apps/web can use its own tagUtils.
 */
export function validateAndNormalizeTags(tags: string[]): string[] {
  return tags
    .map((t) => t.trim().replace(/^#+/, '').toLowerCase())
    .filter((t) => t.length > 0 && /^[a-z0-9_-]+$/i.test(t));
}
