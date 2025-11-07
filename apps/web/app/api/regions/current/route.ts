import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError } from "@/lib/api-handler";

/**
 * GET /api/regions/current
 * Returns user's active region + buff
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return notFoundError("User");
  }

  // Get active region
  const activeUserRegion = await prisma.userRegion.findFirst({
    where: {
      userId: user.id,
      activeBuff: true,
    },
    include: {
      region: true,
    },
  });

  if (!activeUserRegion) {
    // Default to "Home Base" if no active region
    const homeBase = await prisma.region.findFirst({
      where: {
        key: "home_base",
      },
    });

    if (!homeBase) {
      return successResponse({
        success: true,
        region: null,
        message: "No active region found",
      });
    }

    // Auto-create and activate home base for user
    await prisma.userRegion.upsert({
      where: {
        userId_regionId: {
          userId: user.id,
          regionId: homeBase.id,
        },
      },
      create: {
        userId: user.id,
        regionId: homeBase.id,
        isUnlocked: true,
        visitedAt: new Date(),
        activeBuff: true,
        lastTravelAt: new Date(),
      },
      update: {
        activeBuff: true,
        visitedAt: activeUserRegion?.visitedAt || new Date(),
        lastTravelAt: new Date(),
      },
    });

    return successResponse({
      success: true,
      region: {
        id: homeBase.id,
        key: homeBase.key,
        name: homeBase.name,
        description: homeBase.description,
        buffType: homeBase.buffType,
        buffValue: homeBase.buffValue,
      },
    });
  }

  return successResponse({
    success: true,
    region: {
      id: activeUserRegion.region.id,
      key: activeUserRegion.region.key,
      name: activeUserRegion.region.name,
      description: activeUserRegion.region.description,
      buffType: activeUserRegion.region.buffType,
      buffValue: activeUserRegion.region.buffValue,
    },
  });
});

