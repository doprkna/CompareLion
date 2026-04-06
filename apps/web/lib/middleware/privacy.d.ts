/**
 * Privacy Middleware (v0.29.30)
 * Access control helpers for privacy settings
 */
export type PrivacyLevel = 'private' | 'mid' | 'public';
export interface PrivacySettings {
    privacyLevel: PrivacyLevel;
    showComparisons: boolean;
    showStats: boolean;
}
/**
 * Get user's privacy settings
 */
export declare function getUserPrivacySettings(userId: string): Promise<PrivacySettings>;
/**
 * Check if user can view target user's stats
 */
export declare function canViewStats(viewerId: string, targetId: string): Promise<boolean>;
/**
 * Check if user can compare with target user
 */
export declare function canCompare(viewerId: string, targetId: string): Promise<boolean>;
/**
 * Check if user can appear in leaderboards
 * Alpha: allow public + mid (default) so seeded users appear; showStats must be true
 */
export declare function canAppearInLeaderboard(userId: string): Promise<boolean>;
