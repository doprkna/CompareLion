/**
 * Prestige Service
 * v0.29.10 - Badge & Title Rewards Integration
 */
/**
 * Get badge key for prestige tier
 */
export declare function getPrestigeBadgeKey(prestigeCount: number): string;
/**
 * Get title for prestige tier
 * v0.29.14 - Updated titles
 */
export declare function getPrestigeTitle(prestigeCount: number): string | null;
/**
 * Get color theme for prestige tier
 * v0.29.14 - Prestige System Expansion
 */
export declare function getPrestigeColorTheme(prestigeCount: number): string | null;
/**
 * Grant prestige badge to user
 */
export declare function grantPrestigeBadge(userId: string, prestigeCount: number): Promise<{
    badgeId: string | null;
    badgeKey: string;
}>;
