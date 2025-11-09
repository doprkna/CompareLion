import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, forbiddenError } from "@/lib/api-handler";
import { promises as fs } from "fs";
import { join } from "path";

/**
 * Format uptime as "Xd Xh Xm"
 */
function formatUptime(uptimeSeconds: number): string {
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);

  return parts.join(" ") || "0m";
}

/**
 * GET /api/admin/system/health
 * Returns system health overview including uptime, DB status, cron jobs, API latency
 * Admin-only auth required
 * v0.32.7 - System Health & Cron Monitor
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError("Unauthorized");
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user || (user.role !== "ADMIN" && user.role !== "DEVOPS")) {
    return forbiddenError("Admin access required");
  }

  // System uptime
  const uptimeSeconds = process.uptime();
  const uptime = formatUptime(uptimeSeconds);

  // Database status
  let dbStatus = "ok";
  let dbLatency = 0;
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
    
    if (dbLatency > 1000) {
      dbStatus = "slow";
    }
  } catch (error) {
    dbStatus = "error";
  }

  // Get last cron runs (if table exists)
  let lastCronRuns: Array<{
    jobKey: string;
    lastRun: string;
    status: string;
    durationMs?: number | null;
  }> = [];

  try {
    const cronLogs = await prisma.cronJobLog.findMany({
      orderBy: { startedAt: "desc" },
      take: 10,
      distinct: ["jobKey"],
      select: {
        jobKey: true,
        status: true,
        startedAt: true,
        finishedAt: true,
        durationMs: true,
      },
    });

    lastCronRuns = cronLogs.map((log) => ({
      jobKey: log.jobKey,
      lastRun: log.startedAt.toISOString(),
      status: log.status.toLowerCase(),
      durationMs: log.durationMs,
    }));
  } catch (error) {
    // CronJobLog table might not exist, continue without it
  }

  // Read API latency from perf logs
  const apiLatencyMs: Record<string, number> = {};
  try {
    const logPath = join(process.cwd(), "logs", "perf.log");
    const content = await fs.readFile(logPath, "utf-8");
    const lines = content.split("\n").filter((line) => line.trim()).slice(-50);

    // Parse and calculate average latency per endpoint
    const latencyMap = new Map<string, number[]>();
    lines.forEach((line) => {
      const match = line.match(/\[([^\]]+)\]\s+(.+?):\s+(\d+)ms/);
      if (match) {
        const label = match[2];
        const duration = parseInt(match[3], 10);
        
        if (!latencyMap.has(label)) {
          latencyMap.set(label, []);
        }
        latencyMap.get(label)!.push(duration);
      }
    });

    // Calculate averages for top endpoints
    const topEndpoints = [
      "/api/market/items",
      "/api/wallet/transactions",
      "/api/economy/summary",
    ];

    topEndpoints.forEach((endpoint) => {
      const durations = latencyMap.get(endpoint);
      if (durations && durations.length > 0) {
        const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
        apiLatencyMs[endpoint] = Math.round(avg);
      }
    });
  } catch (error) {
    // Perf log might not exist, continue without it
  }

  // Memory and CPU usage
  const memoryUsage = process.memoryUsage();
  const memoryUsageMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);

  // CPU load (approximation - not available directly in Node.js without native modules)
  const cpuLoadPercent = 0; // Placeholder - would need OS module or process monitoring

  return successResponse({
    success: true,
    uptime,
    dbStatus,
    dbLatencyMs: dbLatency,
    lastCronRuns,
    apiLatencyMs,
    memoryUsageMB,
    cpuLoadPercent,
    timestamp: new Date().toISOString(),
  });
});





