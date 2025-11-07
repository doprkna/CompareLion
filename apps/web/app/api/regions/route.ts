import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse } from "@/lib/api-handler";

/**
 * GET /api/regions
 * List all regions with unlock status for current user
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  // Get all active regions
  const regions = await prisma.region.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      orderIndex: "asc",
    },
  });

  // If user is authenticated, include their unlock status
  let userRegionIds: string[] = [];
  let unlockedRegionIds: string[] = [];
  let activeRegionId: string | null = null;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (user) {
      const userRegions = await prisma.userRegion.findMany({
        where: { userId: user.id },
        select: { regionId: true, isUnlocked: true, activeBuff: true },
      });
      userRegionIds = userRegions.map((ur) => ur.regionId);
      unlockedRegionIds = userRegions.filter((ur) => ur.isUnlocked).map((ur) => ur.regionId);
      const activeRegion = userRegions.find((ur) => ur.activeBuff);
      activeRegionId = activeRegion?.regionId || null;
    }
  }

  // Map regions with unlock status
  const regionsWithStatus = regions.map((region) => {
    const isUnlocked = unlockedRegionIds.includes(region.id);
    const isActive = region.id === activeRegionId;
    
    return {
      id: region.id,
      key: region.key,
      name: region.name,
      description: region.description,
      orderIndex: region.orderIndex,
      buffType: region.buffType,
      buffValue: region.buffValue,
      unlockRequirementType: region.unlockRequirementType,
      unlockRequirementValue: region.unlockRequirementValue,
      isActive: isActive,
      isUnlocked,
      canUnlock: !isUnlocked && region.unlockRequirementType !== null,
    };
  });

  return successResponse({
    regions: regionsWithStatus,
    total: regionsWithStatus.length,
    activeRegionId,
  });
});

