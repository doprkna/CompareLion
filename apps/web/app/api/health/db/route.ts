/**
 * Database Health Check (v0.11.3)
 * 
 * Tests database connectivity and query performance.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/connection-pool";

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Simple query test
    await prisma.$queryRaw`SELECT 1 as health`;
    
    const queryTime = Date.now() - startTime;
    
    // Get connection pool stats
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
    
    // Check if query time is too slow
    if (queryTime > 1000) {
      return NextResponse.json(
        { ...status, status: "degraded", reason: "Slow database queries" },
        { status: 200 }
      );
    }
    
    // Check if pool is exhausted
    if (poolStats.total > 0 && poolStats.active / poolStats.total > 0.9) {
      return NextResponse.json(
        { ...status, status: "degraded", reason: "Connection pool near capacity" },
        { status: 200 }
      );
    }
    
    return NextResponse.json(status);
  } catch (error) {
    console.error("[Health] Database health check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}











