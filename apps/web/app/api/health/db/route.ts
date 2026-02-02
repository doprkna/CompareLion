/**
 * Database Health Check (v0.11.3)
 *
 * Tests database connectivity and query performance.
 * Build-safe: no throw at import; returns dbSkipped when DATABASE_URL is missing.
 */

import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { safeAsync } from "@/lib/api-handler";

export const GET = safeAsync(async (_req: NextRequest) => {
  const prisma = getPrisma();
  if (!prisma) {
    return NextResponse.json(
      {
        status: "skipped",
        dbSkipped: true,
        timestamp: new Date().toISOString(),
        message: "DATABASE_URL not configured",
      },
      { status: 200 }
    );
  }

  const startTime = Date.now();
  await prisma.$queryRaw`SELECT 1 as health`;
  const queryTime = Date.now() - startTime;

  const poolResult = await prisma.$queryRaw<
    Array<{ total: bigint; active: bigint }>
  >`
    SELECT 
      (SELECT count(*) FROM pg_stat_activity) as total,
      (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active
  `;

  const poolStats = {
    total: Number(poolResult[0]?.total || 0),
    active: Number(poolResult[0]?.active || 0),
    idle: Number(poolResult[0]?.total || 0) - Number(poolResult[0]?.active || 0),
  };

  const status = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    query: {
      responseTime: `${queryTime}ms`,
      threshold: "1000ms",
      healthy: queryTime < 1000,
    },
    pool: poolStats,
  };

  if (queryTime > 1000) {
    return NextResponse.json(
      { ...status, status: "degraded", reason: "Slow database queries" },
      { status: 200 }
    );
  }

  if (poolStats.total > 0 && poolStats.active / poolStats.total > 0.9) {
    return NextResponse.json(
      { ...status, status: "degraded", reason: "Connection pool near capacity" },
      { status: 200 }
    );
  }

  return NextResponse.json(status);
});













