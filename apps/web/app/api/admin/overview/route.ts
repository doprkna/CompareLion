import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { ensurePrismaClient } from "@/lib/prisma-guard";
import { handleApiError } from "@/lib/api-error-handler";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

interface AdminOverview {
  users: number;
  questions: number;
  achievements: number;
  items: number;
  messages: number;
  notifications: number;
  worldEvents: number;
  lastSeed: string | null;
  databaseUrl: string;
  timestamp: string;
}

function readLastSeedTimestamp(): string | null {
  try {
    const logPath = join(process.cwd(), "db-watchdog.log");
    if (!existsSync(logPath)) return null;
    
    const logContent = readFileSync(logPath, "utf-8");
    const lines = logContent.split("\n").reverse();
    
    for (const line of lines) {
      if (line.includes("Seed completed") || line.includes("Database seeded")) {
        const match = line.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
        if (match) return match[1];
      }
    }
    return null;
  } catch {
    return null;
  }
}

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

    // Log database connection for debugging
    console.log("🔗 Admin Overview - Connected to:", process.env.DATABASE_URL);

    // Run all aggregation queries in parallel for better performance
    const [
      users,
      questions,
      achievements,
      items,
      messages,
      notifications,
      worldEvents,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.question.count(),
      prisma.achievement.count(),
      prisma.item.count(),
      prisma.message.count(),
      prisma.notification.count(),
      prisma.worldEvent.count(),
    ]);

    const overview: AdminOverview = {
      users,
      questions,
      achievements,
      items,
      messages,
      notifications,
      worldEvents,
      lastSeed: readLastSeedTimestamp(),
      databaseUrl: process.env.DATABASE_URL || "Not configured",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: overview,
    });
  } catch (error) {
    console.error("[API Error][admin/overview]", error);
    return handleApiError(error, "Failed to fetch admin overview");
  }
}







