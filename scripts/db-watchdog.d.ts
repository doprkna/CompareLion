/**
 * Database Watchdog - Auto-healing database monitor
 *
 * Monitors database health and automatically repairs when needed:
 * - Checks if database has sufficient data
 * - Auto-pushes schema if needed
 * - Auto-seeds data if database is empty
 * - Logs all activities
 * - Updates changelog with reseed timestamps
 */
declare class DatabaseWatchdog {
    private prisma;
    private config;
    private webhookNotifier;
    constructor();
    initialize(): Promise<void>;
    private checkDatabaseHealth;
    private triggerReseed;
    private updateChangelog;
    private log;
    private writeLog;
    private validateChangelogTimestamps;
}
export { DatabaseWatchdog };
