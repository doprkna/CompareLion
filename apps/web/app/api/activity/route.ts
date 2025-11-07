import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, notFoundError } from "@/lib/api-handler";

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return authError();
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return notFoundError('User');
  }

  // Fetch recent activities (last 50)
  const activities = await prisma.activity.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Parse metadata JSON strings
  const parsedActivities = activities.map((activity: any) => ({
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
});













