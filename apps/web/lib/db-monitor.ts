/**
 * Database Performance Monitoring
 * 
 * Tracks slow queries and provides performance insights.
 */

import { prisma } from "@/lib/db";

interface QueryLog {
  query: string;
  duration: number;
  timestamp: Date;
  params?: any;
}

// In-memory store for slow queries (last 100)
const slowQueries: QueryLog[] = [];
const SLOW_QUERY_THRESHOLD = 200; // ms
const MAX_STORED_QUERIES = 100;

/**
 * Log slow query
 */
export function logSlowQuery(query: string, duration: number, params?: any) {
  slowQueries.unshift({
    query,
    duration,
    timestamp: new Date(),
    params,
  });

  // Keep only last 100
  if (slowQueries.length > MAX_STORED_QUERIES) {
    slowQueries.pop();
  }

  console.warn(`[DB] Slow query (${duration}ms):`, query.substring(0, 100));
}

/**
 * Get slow query stats
 */
export function getSlowQueryStats() {
  if (slowQueries.length === 0) {
    return {
      count: 0,
      avgDuration: 0,
      maxDuration: 0,
      queries: [],
    };
  }

  const durations = slowQueries.map((q) => q.duration);
  const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  const maxDuration = Math.max(...durations);

  return {
    count: slowQueries.length,
    avgDuration,
    maxDuration,
    queries: slowQueries.slice(0, 20), // Return top 20 slowest
  };
}

/**
 * Clear slow query logs
 */
export function clearSlowQueryLogs() {
  slowQueries.length = 0;
}

/**
 * Setup Prisma middleware for query monitoring
 * Note: This is called from the Prisma client initialization
 */
export function setupQueryMonitoring() {
  if (process.env.NODE_ENV !== "production") {
    // Only in development to avoid production overhead
    (prisma as any).$use(async (params: any, next: any) => {
      const before = Date.now();
      const result = await next(params);
      const after = Date.now();
      const duration = after - before;

      if (duration > SLOW_QUERY_THRESHOLD) {
        logSlowQuery(
          `${params.model}.${params.action}`,
          duration,
          params.args
        );
      }

      return result;
    });

    console.log("✅ Prisma query monitoring enabled (dev mode)");
  }
}











