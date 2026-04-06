/**
 * CI Database Watchdog
 *
 * Lightweight version for CI/CD pipelines
 * Only checks database health without auto-repair
 */
interface CIHealthCheck {
    users: number;
    questions: number;
    achievements: number;
    items: number;
    totalRecords: number;
    isHealthy: boolean;
    timestamp: string;
}
declare class CIWatchdog {
    private prisma;
    checkHealth(): Promise<CIHealthCheck>;
    run(): Promise<void>;
}
export { CIWatchdog };
