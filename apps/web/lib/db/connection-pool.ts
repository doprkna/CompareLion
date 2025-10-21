/**
 * Database Connection Pooling (v0.11.2)
 * 
 * Optimized Prisma client configuration with connection pooling.
 */

import { PrismaClient } from "@prisma/client";

const DATABASE_URL = process.env.DATABASE_URL || "";
const isProduction = process.env.NODE_ENV === "production";

/**
 * Connection pool configuration
 * 
 * Based on Prisma best practices:
 * - connection_limit: Max concurrent connections
 * - pool_timeout: Wait time for available connection
 * - pgbouncer: Enable pgBouncer compatibility mode
 */
const getConnectionUrl = (): string => {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  
  // Parse existing URL
  const url = new URL(DATABASE_URL);
  
  // Add connection pool parameters
  const params = new URLSearchParams(url.search);
  
  // Connection limit (default: 10 in production, 5 in dev)
  if (!params.has("connection_limit")) {
    params.set("connection_limit", isProduction ? "10" : "5");
  }
  
  // Pool timeout (10 seconds)
  if (!params.has("pool_timeout")) {
    params.set("pool_timeout", "10");
  }
  
  // pgBouncer mode (if using pgBouncer)
  if (process.env.PGBOUNCER === "true") {
    params.set("pgbouncer", "true");
  }
  
  url.search = params.toString();
  return url.toString();
};

/**
 * Prisma Client Options
 */
const prismaOptions = {
  datasources: {
    db: {
      url: getConnectionUrl(),
    },
  },
  log: isProduction
    ? [
        { level: "error", emit: "stdout" },
        { level: "warn", emit: "stdout" },
      ]
    : [
        { level: "query", emit: "event" },
        { level: "error", emit: "stdout" },
        { level: "warn", emit: "stdout" },
      ],
} as const;

/**
 * Global Prisma Client (singleton pattern)
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (isProduction) {
  prisma = new PrismaClient(prismaOptions);
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient(prismaOptions);
  }
  prisma = global.__prisma;
}

/**
 * Slow query logging (development only)
 */
if (!isProduction) {
  // @ts-ignore
  prisma.$on("query", (e: any) => {
    if (e.duration > 100) {
      console.warn(`[DB] Slow query (${e.duration}ms): ${e.query}`);
    }
  });
}

/**
 * Graceful shutdown
 */
if (isProduction) {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}

/**
 * Connection pool statistics
 */
export async function getPoolStats() {
  try {
    const result = await prisma.$queryRaw<
      Array<{ total_connections: number; active_connections: number }>
    >`
      SELECT 
        (SELECT count(*) FROM pg_stat_activity) as total_connections,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections
    `;
    
    return {
      total: Number(result[0]?.total_connections || 0),
      active: Number(result[0]?.active_connections || 0),
      idle: Number(result[0]?.total_connections || 0) - Number(result[0]?.active_connections || 0),
    };
  } catch (error) {
    console.error("[DB] Failed to get pool stats:", error);
    return { total: 0, active: 0, idle: 0 };
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("[DB] Connection test failed:", error);
    return false;
  }
}

/**
 * Archive old EventLog/Activity entries
 */
export async function archiveOldLogs(daysToKeep: number = 30): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  try {
    // Delete old EventLog entries
    const eventLogResult = await prisma.eventLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
    
    // Delete old Activity entries
    const activityResult = await prisma.activity.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });
    
    const totalDeleted = eventLogResult.count + activityResult.count;
    
    console.log(`[DB] Archived ${totalDeleted} old log entries (older than ${daysToKeep} days)`);
    
    return totalDeleted;
  } catch (error) {
    console.error("[DB] Failed to archive old logs:", error);
    return 0;
  }
}

export { prisma };
export default prisma;











