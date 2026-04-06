/**
 * Profanity Filter for UGC Content
 * v0.17.0 - Basic implementation with expandable word list
 */
export interface FilterResult {
    isClean: boolean;
    flaggedWords: string[];
    cleanedText: string;
}
/**
 * Check if text contains profanity
 */
export declare function containsProfanity(text: string): boolean;
/**
 * Filter text and return detailed results
 */
export declare function filterText(text: string): FilterResult;
/**
 * Validate UGC submission content
 */
export declare function validateUGCContent(title: string, content: string, description?: string): {
    valid: boolean;
    errors: string[];
};
