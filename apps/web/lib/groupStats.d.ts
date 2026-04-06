/**
 * Group Stats Aggregation Utility
 *
 * Calculates collective totem statistics from members.
 */
export interface GroupStats {
    totalXp: number;
    avgKarma: number;
    avgPrestige: number;
    memberCount: number;
}
/**
 * Calculate aggregate stats for a group
 */
export declare function calculateGroupStats(groupId: string): Promise<GroupStats>;
/**
 * Update stored group stats
 */
export declare function updateGroupStats(groupId: string): Promise<void>;
/**
 * Get top groups by total XP
 */
export declare function getTopGroups(limit?: number): Promise<any>;
/**
 * Log group activity
 */
export declare function logGroupActivity(groupId: string, type: string, message: string, userId?: string, metadata?: any): Promise<void>;
/**
 * Award weekly bonus to top group
 * (Placeholder for cron job)
 */
export declare function awardWeeklyBonus(): Promise<void>;
