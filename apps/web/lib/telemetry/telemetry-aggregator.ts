/**
 * Telemetry Aggregation Worker (v0.11.7)
 * 
 * Aggregate daily telemetry events for analytics.
 */

import { prisma } from "@/lib/db/connection-pool";
import { logger } from "@/lib/logger";

/**
 * Calculate percentile from sorted array
 */
function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  
  return sorted[Math.max(0, index)] || 0;
}

/**
 * Aggregate telemetry for a specific date and type
 */
async function aggregateByDateAndType(
  date: Date,
  type: string,
  context?: string
): Promise<void> {
  // Get events for the day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const whereClause: any = {
    type,
    createdAt: {
      gte: startOfDay,
      lte: endOfDay,
    },
  };
  
  if (context) {
    whereClause.OR = [{ page: context }, { action: context }];
  }
  
  const events = await prisma.telemetryEvent.findMany({
    where: whereClause,
    select: {
      duration: true,
      metadata: true,
    },
  });
  
  const count = events.length;
  
  if (count === 0) return;
  
  // Calculate duration metrics
  const durations = events.filter((e) => e.duration).map((e) => e.duration!);
  
  const avgDuration = durations.length > 0
    ? durations.reduce((a, b) => a + b, 0) / durations.length
    : undefined;
  
  const p50Duration = durations.length > 0 ? percentile(durations, 50) : undefined;
  const p95Duration = durations.length > 0 ? percentile(durations, 95) : undefined;
  const p99Duration = durations.length > 0 ? percentile(durations, 99) : undefined;
  
  // Calculate error rate (for error events)
  let errorRate: number | undefined;
  if (type === "error") {
    const totalActions = await prisma.telemetryEvent.count({
      where: {
        type: "action",
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
    
    errorRate = totalActions > 0 ? (count / totalActions) * 100 : 0;
  }
  
  // Upsert aggregate
  await prisma.telemetryAggregate.upsert({
    where: {
      date_type_context: {
        date: startOfDay,
        type,
        context: context || "",
      },
    },
    update: {
      count,
      avgDuration,
      p50Duration,
      p95Duration,
      p99Duration,
      errorRate,
    },
    create: {
      date: startOfDay,
      type,
      context: context || "",
      count,
      avgDuration,
      p50Duration,
      p95Duration,
      p99Duration,
      errorRate,
    },
  });
}

/**
 * Aggregate all telemetry for yesterday
 */
export async function aggregateTelemetryDaily(): Promise<void> {
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  try {
    // Aggregate by type
    const types = [
      "page_view",
      "action",
      "error",
      "api_call",
      "session_start",
      "session_end",
    ];
    
    for (const type of types) {
      await aggregateByDateAndType(yesterday, type);
      
      // Also aggregate by context (page/action)
      if (type === "page_view" || type === "action") {
        const contexts = await prisma.telemetryEvent.findMany({
          where: {
            type,
            createdAt: {
              gte: yesterday,
              lt: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000),
            },
          },
          select: {
            page: true,
            action: true,
          },
          distinct: ["page", "action"],
        });
        
        const uniqueContexts = new Set<string>();
        contexts.forEach((c) => {
          if (c.page) uniqueContexts.add(c.page);
          if (c.action) uniqueContexts.add(c.action);
        });
        
        for (const context of uniqueContexts) {
          await aggregateByDateAndType(yesterday, type, context);
        }
      }
    }
    
  } catch (error) {
    logger.error("[Telemetry] Aggregation failed", error);
    throw error;
  }
}

/**
 * Get aggregated metrics for date range
 */
export async function getAggregatedMetrics(
  startDate: Date,
  endDate: Date,
  type?: string
) {
  const where: any = {
    date: {
      gte: startDate,
      lte: endDate,
    },
  };
  
  if (type) {
    where.type = type;
  }
  
  const aggregates = await prisma.telemetryAggregate.findMany({
    where,
    orderBy: {
      date: "desc",
    },
  });
  
  return aggregates;
}

/**
 * Get summary statistics
 */
export async function getSummaryStats(days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  
  const aggregates = await prisma.telemetryAggregate.findMany({
    where: {
      date: {
        gte: startDate,
      },
    },
  });
  
  // Calculate summary
  const summary = {
    pageViews: aggregates.filter((a) => a.type === "page_view").reduce((sum, a) => sum + a.count, 0),
    actions: aggregates.filter((a) => a.type === "action").reduce((sum, a) => sum + a.count, 0),
    errors: aggregates.filter((a) => a.type === "error").reduce((sum, a) => sum + a.count, 0),
    apiCalls: aggregates.filter((a) => a.type === "api_call").reduce((sum, a) => sum + a.count, 0),
    sessions: aggregates.filter((a) => a.type === "session_start").reduce((sum, a) => sum + a.count, 0),
    
    avgApiLatency: 0,
    errorRate: 0,
    avgSessionLength: 0,
  };
  
  // Calculate averages
  const apiAggregates = aggregates.filter((a) => a.type === "api_call" && a.avgDuration);
  if (apiAggregates.length > 0) {
    summary.avgApiLatency = apiAggregates.reduce((sum, a) => sum + (a.avgDuration || 0), 0) / apiAggregates.length;
  }
  
  // Calculate error rate
  if (summary.actions > 0) {
    summary.errorRate = (summary.errors / summary.actions) * 100;
  }
  
  // Calculate session length
  const sessionAggregates = aggregates.filter((a) => a.type === "session_end" && a.avgDuration);
  if (sessionAggregates.length > 0) {
    summary.avgSessionLength = sessionAggregates.reduce((sum, a) => sum + (a.avgDuration || 0), 0) / sessionAggregates.length;
  }
  
  return summary;
}













