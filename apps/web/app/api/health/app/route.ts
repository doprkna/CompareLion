/**
 * Application Health Check (v0.11.3)
 * 
 * Returns app uptime and memory usage.
 */

import { NextRequest, NextResponse } from "next/server";
import os from "os";
import { safeAsync } from "@/lib/api-handler";

const startTime = Date.now();

export const GET = safeAsync(async (_req: NextRequest) => {
  const uptime = Date.now() - startTime;
  const memoryUsage = process.memoryUsage();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
    
    const status = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: {
        ms: uptime,
        seconds: Math.floor(uptime / 1000),
        minutes: Math.floor(uptime / 1000 / 60),
        hours: Math.floor(uptime / 1000 / 60 / 60),
      },
      memory: {
        process: {
          rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
          heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
          heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
          external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
        },
        system: {
          total: `${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
          free: `${(freeMemory / 1024 / 1024 / 1024).toFixed(2)} GB`,
          used: `${((totalMemory - freeMemory) / 1024 / 1024 / 1024).toFixed(2)} GB`,
          usagePercent: (((totalMemory - freeMemory) / totalMemory) * 100).toFixed(2),
        },
      },
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };
    
    // Check if memory usage is too high
    const memoryUsagePercent = ((totalMemory - freeMemory) / totalMemory) * 100;
    if (memoryUsagePercent > 90) {
      return NextResponse.json(
        { ...status, status: "unhealthy", reason: "High memory usage" },
        { status: 503 }
      );
    }
    
  return NextResponse.json(status);
});













