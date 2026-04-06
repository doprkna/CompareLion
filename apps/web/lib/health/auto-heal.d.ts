/**
 * Auto-Heal System (v0.8.12)
 *
 * PLACEHOLDER: Automatic system recovery and maintenance.
 */
export interface HealResult {
    healType: string;
    description: string;
    itemsAffected: number;
    success: boolean;
    error?: string;
}
/**
 * Heal stale sessions (older than 30 days)
 */
export declare function healStaleSessions(): Promise<HealResult>;
/**
 * Heal orphaned jobs (stuck in processing for > 1 hour)
 */
export declare function healOrphanedJobs(): Promise<HealResult>;
/**
 * Clear expired cache entries
 */
export declare function healExpiredCache(): Promise<HealResult>;
/**
 * Clean zombie database connections
 */
export declare function healZombieConnections(): Promise<HealResult>;
/**
 * Run all auto-heal procedures
 */
export declare function runAutoHeal(): Promise<HealResult[]>;
/**
 * Schedule auto-heal cron (every 6 hours)
 */
export declare function scheduleAutoHeal(): void;
