import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Fetch recent activities (last 50)
    const activities = await prisma.activity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Parse metadata JSON strings
    const parsedActivities = activities.map(activity => ({
      ...activity,
      metadata: activity.metadata 
        ? (typeof activity.metadata === 'string' ? JSON.parse(activity.metadata) : activity.metadata)
        : null,
    }));

    return NextResponse.json({
      success: true,
      activities: parsedActivities,
      count: activities.length,
    });
  } catch (error) {
    console.error("[API] Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}










