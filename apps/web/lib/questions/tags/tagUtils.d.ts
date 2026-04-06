/**
 * Tag Utilities
 * Normalize and validate hashtags
 * v0.37.7 - Hashtag Filtering
 */
/**
 * Normalize a tag: lowercase, strip "#"
 */
export declare function normalizeTag(tag: string): string;
/**
 * Normalize an array of tags
 */
export declare function normalizeTags(tags: string[]): string[];
/**
 * Validate tag characters (alphanumeric, underscore, hyphen)
 * Returns true if valid
 */
export declare function isValidTag(tag: string): boolean;
/**
 * Validate and normalize tags, filtering out invalid ones
 */
export declare function validateAndNormalizeTags(tags: string[]): string[];
