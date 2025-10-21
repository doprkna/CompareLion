/**
 * Queue Statistics API (v0.11.2)
 * 
 * Admin endpoint for monitoring BullMQ queue metrics.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import {
  getAllQueueStats,
  getCpuUsage,
  getMemoryUsage,
} from "@/lib/queue/queue-config";
import { getPoolStats } from "@/lib/db/connection-pool";

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check admin role (placeholder - implement actual role check)
    // TODO: Verify user.role === "ADMIN"
    
    // Gather all statistics
    const [queueStats, cpuUsage, memoryUsage, dbPoolStats] = await Promise.all([
      getAllQueueStats(),
      Promise.resolve(getCpuUsage()),
      Promise.resolve(getMemoryUsage()),
      getPoolStats(),
    ]);
    
    // Calculate health status
    const health = {
      cpu: cpuUsage.usagePercent1min < 75 ? "healthy" : cpuUsage.usagePercent1min < 90 ? "warning" : "critical",
      memory: memoryUsage.usagePercent < 80 ? "healthy" : memoryUsage.usagePercent < 90 ? "warning" : "critical",
      dbPool: dbPoolStats.active / dbPoolStats.total < 0.8 ? "healthy" : "warning",
    };
    
    const overallHealth =
      health.cpu === "critical" || health.memory === "critical"
        ? "critical"
        : health.cpu === "warning" || health.memory === "warning"
        ? "warning"
        : "healthy";
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      health: {
        overall: overallHealth,
        components: health,
      },
      queues: queueStats,
      system: {
        cpu: cpuUsage,
        memory: memoryUsage,
        database: {
          pool: dbPoolStats,
        },
      },
      summary: {
        totalJobs: queueStats.reduce((sum, q) => sum + q.total, 0),
        activeJobs: queueStats.reduce((sum, q) => sum + q.active, 0),
        waitingJobs: queueStats.reduce((sum, q) => sum + q.waiting, 0),
        failedJobs: queueStats.reduce((sum, q) => sum + q.failed, 0),
      },
    });
  } catch (error) {
    console.error("[Queue Stats] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch queue statistics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}











