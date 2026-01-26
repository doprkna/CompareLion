/**
 * Extended Health Check API (v0.14.0)
 * 
 * Returns comprehensive health metrics including:
 * - Uptime
 * - Database latency
 * - Active sessions (if available)
 * - Memory usage
 * - Recent error rate
 * v0.41.2 - C3 Step 3: Unified API envelope
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getRuntimeInfo } from '@/lib/build-info';
import { safeAsync } from '@/lib/api-handler';
import { getFlags } from '@parel/core/config/flags';
import { env, hasDb } from '@/lib/env';
import { buildSuccess } from '@parel/api';

// Track startup time for uptime calculation
const startTime = Date.now();

/**
 * Check database connectivity and measure latency
 */
async function checkDatabase() {
  if (!hasDb) {
    return {
      status: 'unavailable',
      error: 'DATABASE_URL not configured',
    };
  }

  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - startTime;

    // Get connection pool stats if available
    let poolStats: any = {};
    try {
      poolStats = {
        connections: (prisma as any)._engine?.connectionCount || 'N/A',
      };
    } catch (e) {
      // Pool stats not available
    }

    return {
      status: 'healthy',
      latencyMs,
      ...poolStats,
    };
  } catch (error: any) {
    return {
      status: 'unhealthy',
      error: error.message || 'Database check failed',
    };
  }
}

/**
 * Get active session count (approximate)
 */
async function getActiveSessions() {
  try {
    // Count sessions active in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const activeCount = await prisma.telemetryEvent.groupBy({
      by: ['sessionId'],
      where: {
        sessionId: { not: null },
        createdAt: { gte: fiveMinutesAgo },
      },
    });

    return {
      active: activeCount.length,
      windowMinutes: 5,
    };
  } catch (error) {
    return {
      active: 'N/A',
      error: 'Failed to count sessions',
    };
  }
}

/**
 * Get recent error rate
 */
async function getErrorRate() {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const [errors, total] = await Promise.all([
      prisma.errorLog.count({
        where: {
          createdAt: { gte: oneHourAgo },
          resolved: false,
        },
      }),
      prisma.telemetryEvent.count({
        where: {
          createdAt: { gte: oneHourAgo },
        },
      }),
    ]);

    const rate = total > 0 ? (errors / total) * 100 : 0;

    return {
      errors,
      totalEvents: total,
      rate: Math.round(rate * 100) / 100,
      windowHours: 1,
    };
  } catch (error) {
    return {
      errors: 'N/A',
      error: 'Failed to calculate error rate',
    };
  }
}

/**
 * Get memory usage
 */
function getMemoryUsage() {
  if (typeof process === 'undefined') {
    return { available: false };
  }

  const usage = process.memoryUsage();
  
  return {
    heapUsedMB: Math.round(usage.heapUsed / 1024 / 1024),
    heapTotalMB: Math.round(usage.heapTotal / 1024 / 1024),
    rssMB: Math.round(usage.rss / 1024 / 1024),
    externalMB: Math.round(usage.external / 1024 / 1024),
  };
}

/**
 * GET /api/health/extended
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const runtimeInfo = getRuntimeInfo();
  const uptimeMs = Date.now() - startTime;
  const uptimeSec = Math.floor(uptimeMs / 1000);
  const uptimeMin = Math.floor(uptimeSec / 60);
  const uptimeHours = Math.floor(uptimeMin / 60);

  // Run checks in parallel
  const [db, sessions, errorRate, memory] = await Promise.all([
    checkDatabase(),
    getActiveSessions(),
    getErrorRate(),
    Promise.resolve(getMemoryUsage()),
  ]);

  const isHealthy = db.status === 'healthy';

  const response = {
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    
    // Runtime info
    version: runtimeInfo.version,
    commit: runtimeInfo.commit,
    buildTime: runtimeInfo.buildTime,
    environment: runtimeInfo.env,
    
    // Uptime
    uptime: {
      ms: uptimeMs,
      seconds: uptimeSec,
      minutes: uptimeMin,
      hours: uptimeHours,
      formatted: `${uptimeHours}h ${uptimeMin}m ${uptimeSec}s`,
    },
    
    // Database
    database: db,
    
    // Sessions
    sessions,
    
    // Error rate
    errorRate,
    
    // Memory
    memory,
    
    // Features
    features: {
      sentry: !!process.env.NEXT_PUBLIC_SENTRY_DSN, // Public env var - keep as-is
      redis: !!env.REDIS_URL,
      analytics: getFlags().enableAnalytics,
    },
  };

  const httpResponse = buildSuccess(req, response, { status: isHealthy ? 200 : 503 });
  httpResponse.headers.set('Cache-Control', 'no-store, max-age=0');
  return httpResponse;
});


