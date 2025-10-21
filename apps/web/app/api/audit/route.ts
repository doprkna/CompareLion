import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function GET() {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 }
      );
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
      meta: log.meta ? (typeof log.meta === 'string' ? JSON.parse(log.meta) : log.meta) : null,
    }));

    return NextResponse.json({
      success: true,
      logs: parsedLogs,
      count: logs.length,
    });
  } catch (error) {
    console.error("[API] Error fetching audit logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}











