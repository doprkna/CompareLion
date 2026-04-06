/**
 * Activity Service
 * Publish and manage social activities
 * v0.36.42 - Social Systems 1.0
 */
import { ActivityType } from './types';
/**
 * Publish a social activity
 * Creates an activity entry for feed generation
 *
 * @param userId - User ID performing the activity
 * @param type - Activity type
 * @param refId - Optional reference ID (missionId, itemId, etc.)
 * @param metadata - Optional metadata (itemName, level, etc.)
 */
export declare function publishActivity(userId: string, type: ActivityType, refId?: string | null, metadata?: Record<string, any> | null): Promise<void>;
/**
 * Get user's recent activities
 *
 * @param userId - User ID
 * @param limit - Number of activities to return
 * @returns Array of activities
 */
export declare function getUserActivities(userId: string, limit?: number): Promise<Array<{
    id: string;
    type: ActivityType;
    refId?: string | null;
    metadata?: Record<string, any> | null;
    timestamp: Date;
    displayText: string;
}>>;
/**
 * Cleanup old activities (stub for cron)
 * Removes activities older than specified days
 *
 * @param daysOld - Number of days to keep (default: 30)
 */
export declare function cleanupOldActivities(daysOld?: number): Promise<{
    deleted: number;
}>;
