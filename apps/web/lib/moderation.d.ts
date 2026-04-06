/**
 * Content Moderation Utilities
 * v0.20.0 - Simple profanity and abuse detection
 */
export interface ModerationResult {
    flagged: boolean;
    reasons: string[];
    cleanContent?: string;
}
/**
 * Check content for profanity and abuse
 */
export declare function moderateContent(content: string): ModerationResult;
/**
 * Check if content is safe to display
 */
export declare function isSafeContent(content: string): boolean;
/**
 * Get user's flagged content count (for rate limiting)
 */
export declare function getUserFlaggedCount(userId: string, prisma: any): Promise<number>;
/**
 * Check if user should be rate limited based on flagged content
 */
export declare function shouldRateLimit(userId: string, prisma: any): Promise<boolean>;
