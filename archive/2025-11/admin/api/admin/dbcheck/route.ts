/**
 * Database Sanity Check API
 * Returns counts for critical tables
 * v0.13.2h
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { prisma } from "@/lib/db";
import { safeAsync } from "@/lib/api-handler";

export const runtime = 'nodejs';

export const GET = safeAsync(async (req: NextRequest) => {
  // Require admin access
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  // Run parallel count queries for all critical tables
  const [
    users,
    questions,
    flowQuestions,
    questionGenerations,
    achievements,
    items,
    messages,
    notifications,
    activities,
    auditLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.question.count(),
    prisma.flowQuestion.count(),
    prisma.questionGeneration.count(),
    prisma.achievement.count(),
    prisma.item.count(),
    prisma.message.count(),
    prisma.notification.count(),
    prisma.activity.count(),
    prisma.auditLog.count(),
  ]);

  // Check for critical issues
  const issues = [];
  if (users === 0) issues.push("No users in database");
  if (questions === 0 && flowQuestions === 0) issues.push("No questions available");

  return NextResponse.json({
    status: issues.length === 0 ? "ok" : "warning",
    timestamp: new Date().toISOString(),
    counts: {
      users,
      questions,
      flowQuestions,
      questionGenerations,
      achievements,
      items,
      messages,
      notifications,
      activities,
      auditLogs,
    },
    issues: issues.length > 0 ? issues : undefined,
    database: {
      url: process.env.DATABASE_URL ? "configured" : "missing",
      connected: true,
    },
  });
});


