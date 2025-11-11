import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { ensurePrismaClient } from "@/lib/prisma-guard";
import { handleApiError } from "@/lib/api-error-handler";

// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';

export async function GET() {
  try {
    ensurePrismaClient();
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get top 10 users by XP
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        level: true,
        xp: true,
        funds: true,
        diamonds: true,
        questionsAnswered: true,
        streakCount: true,
        lastActiveAt: true,
        createdAt: true,
        role: true,
      },
      orderBy: { xp: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("[API Error][admin/users]", error);
    return handleApiError(error, "Failed to fetch admin users");
  }
}











