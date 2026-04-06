/**
 * Database Connection Pooling (v0.11.2)
 *
 * Optimized Prisma client configuration with connection pooling.
 */
import { PrismaClient } from "@parel/db/client";
/**
 * Global Prisma Client (singleton pattern)
 */
declare global {
    var __prisma: PrismaClient | undefined;
}
declare const prisma: PrismaClient;
/**
 * Connection pool statistics
 */
export declare function getPoolStats(): Promise<{
    total: number;
    active: number;
    idle: number;
}>;
/**
 * Test database connection
 */
export declare function testConnection(): Promise<boolean>;
/**
 * Archive old EventLog/Activity entries
 */
export declare function archiveOldLogs(daysToKeep?: number): Promise<number>;
export { prisma };
export default prisma;
