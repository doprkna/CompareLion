/**
 * Self-Healing Routines (v0.11.3)
 *
 * Automated recovery from common failure scenarios.
 */
/**
 * Heal stale sessions
 *
 * Removes sessions older than configured TTL
 */
export declare function healStaleSessions(): Promise<number>;
/**
 * Heal stuck jobs
 *
 * Resets jobs that have been active for too long
 */
export declare function healStuckJobs(): Promise<number>;
/**
 * Clean up orphaned records
 *
 * Removes database records that reference deleted entities
 */
export declare function cleanOrphanedRecords(): Promise<number>;
/**
 * Vacuum database (optimize)
 *
 * Reclaims storage and updates statistics
 */
export declare function vacuumDatabase(): Promise<void>;
/**
 * Run all healing routines
 */
export declare function runAllHealingRoutines(): Promise<{
    staleSessions: number;
    stuckJobs: number;
    orphanedRecords: number;
    duration: number;
}>;
/**
 * Schedule healing routines (cron job)
 */
export declare function scheduleHealingRoutines(): void;
