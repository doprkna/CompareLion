/**
 * Tag Utilities
 * Normalize and validate hashtags
 * v0.37.7 - Hashtag Filtering
 */

/**
 * Normalize a tag: lowercase, strip "#"
 */
export function normalizeTag(tag: string): string {
  return tag.trim().replace(/^#+/, '').toLowerCase();
}

/**
 * Normalize an array of tags
 */
export function normalizeTags(tags: string[]): string[] {
  return tags.map(normalizeTag).filter(tag => tag.length > 0);
}

/**
 * Validate tag characters (alphanumeric, underscore, hyphen)
 * Returns true if valid
 */
export function isValidTag(tag: string): boolean {
  // Allow alphanumeric, underscore, hyphen
  return /^[a-z0-9_-]+$/i.test(tag);
}

/**
 * Validate and normalize tags, filtering out invalid ones
 */
export function validateAndNormalizeTags(tags: string[]): string[] {
  return normalizeTags(tags).filter(isValidTag);
}

