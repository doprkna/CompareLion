/**
 * Queue Health Check (v0.11.3)
 * 
 * Monitors BullMQ job queues for lag and failures.
 */

import { NextRequest, NextResponse } from "next/server";
import { getAllQueueStats } from "@/lib/queue/queue-config";
import { safeAsync } from "@/lib/api-handler";

export const GET = safeAsync(async (_req: NextRequest) => {
  const queueStats = await getAllQueueStats();
    
    // Calculate overall lag and failure rates
    const totalWaiting = queueStats.reduce((sum, q) => sum + q.waiting, 0);
    const totalActive = queueStats.reduce((sum, q) => sum + q.active, 0);
    const totalFailed = queueStats.reduce((sum, q) => sum + q.failed, 0);
    const totalCompleted = queueStats.reduce((sum, q) => sum + q.completed, 0);
    const totalJobs = totalWaiting + totalActive + totalFailed + totalCompleted;
    
    const failureRate = totalJobs > 0 ? (totalFailed / totalJobs) * 100 : 0;
    
    // Check for high priority queue lag
    const highPriorityQueue = queueStats.find((q) => q.name === "high-priority");
    const highPriorityLag = highPriorityQueue ? highPriorityQueue.waiting : 0;
    
    let status: "healthy" | "degraded" | "unhealthy" = "healthy";
    let reason: string | undefined;
    
    // Determine health status
    if (highPriorityLag > 100) {
      status = "unhealthy";
      reason = `High priority queue lag: ${highPriorityLag} jobs waiting`;
    } else if (failureRate > 10) {
      status = "degraded";
      reason = `High failure rate: ${failureRate.toFixed(2)}%`;
    } else if (highPriorityLag > 50 || failureRate > 5) {
      status = "degraded";
      reason = `Moderate queue lag or failures`;
    }
    
    const response = {
      status,
      reason,
      timestamp: new Date().toISOString(),
      queues: queueStats,
      summary: {
        totalJobs,
        waiting: totalWaiting,
        active: totalActive,
        completed: totalCompleted,
        failed: totalFailed,
        failureRate: `${failureRate.toFixed(2)}%`,
      },
      thresholds: {
        highPriorityLag: {
          warning: 50,
          critical: 100,
          current: highPriorityLag,
        },
        failureRate: {
          warning: 5,
          critical: 10,
          current: failureRate.toFixed(2),
        },
      },
    };
    
  const httpStatus = status === "unhealthy" ? 503 : 200;
  
  return NextResponse.json(response, { status: httpStatus });
});













