import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { UserRole } from "@parel/db/client";
import { safeAsync, forbiddenError } from "@/lib/api-handler";

export const GET = safeAsync(async (_req: NextRequest) => {
  // Check if user is authenticated and is admin
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    return forbiddenError('Admin access required');
  }

    // Fetch latest audit logs
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50, // Last 50 logs
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

  // Parse meta JSON strings back to objects
  const parsedLogs = logs.map(log => ({
    ...log,
    meta: log.meta ? (typeof log.meta === 'string' ? (() => { try { return JSON.parse(log.meta); } catch { return null; } })() : log.meta) : null, // sanity-fix
  }));

  return NextResponse.json({
    success: true,
    logs: parsedLogs,
    count: logs.length,
    timestamp: new Date().toISOString(),
  });
});













