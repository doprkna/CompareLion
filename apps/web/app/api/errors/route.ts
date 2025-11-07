/**
 * Error Reporting API (v0.14.0)
 * 
 * Capture and log client-side and server-side errors.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeAsync } from "@/lib/api-handler";
import { z } from "zod";
import { getRuntimeInfo } from "@/lib/build-info";
import { logger } from "@/lib/logger";

const ErrorReportSchema = z.object({
  errorType: z.string(),
  message: z.string(),
  stack: z.string().optional(),
  page: z.string().optional(),
  userAgent: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  severity: z.enum(['critical', 'error', 'warning', 'info']).default('error'),
  metadata: z.record(z.any()).optional(),
});

/**
 * POST /api/errors
 * Report an error
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const body = await req.json();
  const validation = ErrorReportSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validation.error.issues },
      { status: 400 }
    );
  }

  const {
    errorType,
    message,
    stack,
    page,
    userAgent,
    userId,
    sessionId,
    severity,
    metadata,
  } = validation.data;

  const buildInfo = getRuntimeInfo();
  const environment = process.env.NODE_ENV || 'unknown';

  // Check if similar error exists (within last hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const existingError = await prisma.errorLog.findFirst({
    where: {
      errorType,
      message,
      createdAt: { gte: oneHourAgo },
    },
  });

  if (existingError) {
    // Update existing error (increment frequency, update lastSeen)
    const updated = await prisma.errorLog.update({
      where: { id: existingError.id },
      data: {
        frequency: { increment: 1 },
        lastSeen: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      errorId: updated.id,
      duplicate: true,
      frequency: updated.frequency,
      timestamp: new Date().toISOString(),
    });
  }

  // Create new error log
  const errorLog = await prisma.errorLog.create({
    data: {
      errorType,
      message,
      stack,
      page,
      userAgent: userAgent || req.headers.get('user-agent') || 'unknown',
      userId,
      sessionId,
      buildId: buildInfo.commit,
      environment,
      severity,
      metadata,
      status: severity === 'critical' ? 'urgent' : 'new',
    },
  });

  // For critical errors, log for monitoring
  if (severity === 'critical') {
    logger.error('[CRITICAL ERROR]', {
      id: errorLog.id,
      type: errorType,
      message,
      page,
    });
  }

  return NextResponse.json({
    success: true,
    errorId: errorLog.id,
    duplicate: false,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/errors
 * Retrieve error logs (admin only)
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
  const severity = searchParams.get("severity") || undefined;
  const resolved = searchParams.get("resolved");
  const sortBy = searchParams.get("sortBy") || "frequency"; // frequency | lastSeen | createdAt

  const whereClause: any = {};

  if (severity) {
    whereClause.severity = severity;
  }

  if (resolved !== null) {
    whereClause.resolved = resolved === 'true';
  }

  const orderByMap: any = {
    frequency: { frequency: 'desc' },
    lastSeen: { lastSeen: 'desc' },
    createdAt: { createdAt: 'desc' },
  };

  const errors = await prisma.errorLog.findMany({
    where: whereClause,
    orderBy: orderByMap[sortBy] || { frequency: 'desc' },
    take: limit,
    select: {
      id: true,
      errorType: true,
      message: true,
      page: true,
      severity: true,
      frequency: true,
      firstSeen: true,
      lastSeen: true,
      status: true,
      resolved: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    success: true,
    errors,
    count: errors.length,
    timestamp: new Date().toISOString(),
  });
});

