/**
 * Badge Service
 * v0.17.0 - Award badges for UGC & Events achievements
 */
/**
 * Check and award UGC-related badges to a user
 */
export declare function checkUGCBadges(userId: string): Promise<string[]>;
/**
 * Check event participation badges
 */
export declare function checkEventBadges(userId: string): Promise<string[]>;
