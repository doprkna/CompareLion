import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError, validationError } from "@/lib/api-handler";
import { z } from "zod";

const TravelSchema = z.object({
  targetRegionId: z.string().min(1),
});

/**
 * POST /api/regions/travel
 * Travel to a new region (auth required)
 * Validates unlock conditions, updates UserRegion.activeBuff
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, funds: true },
  });

  if (!user) {
    return notFoundError("User");
  }

  const body = await req.json().catch(() => ({}));
  const parsed = TravelSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Invalid payload");
  }

  const { targetRegionId } = parsed.data;

  // Get target region
  const targetRegion = await prisma.region.findUnique({
    where: { id: targetRegionId },
  });

  if (!targetRegion || !targetRegion.isActive) {
    return notFoundError("Region not found");
  }

  // Check if user has unlocked this region
  const userRegion = await prisma.userRegion.findUnique({
    where: {
      userId_regionId: {
        userId: user.id,
        regionId: targetRegionId,
      },
    },
  });

  if (!userRegion || !userRegion.isUnlocked) {
    return validationError("Region not unlocked yet");
  }

  // Check travel cooldown (60 seconds)
  const now = new Date();
  if (userRegion.lastTravelAt) {
    const timeSinceLastTravel = now.getTime() - userRegion.lastTravelAt.getTime();
    if (timeSinceLastTravel < 60 * 1000) {
      const remainingSeconds = Math.ceil((60 * 1000 - timeSinceLastTravel) / 1000);
      return validationError(`Please wait ${remainingSeconds} seconds before traveling again`);
    }
  }

  // Travel cost: minor XP or cooldown (simulated as 10 XP cost)
  const travelCost = 10;
  if (user.funds.toNumber() < travelCost) {
    return validationError("Insufficient funds for travel");
  }

  // Perform travel in transaction
  await prisma.$transaction(async (tx) => {
    // Deactivate all other regions for this user
    await tx.userRegion.updateMany({
      where: {
        userId: user.id,
        activeBuff: true,
      },
      data: {
        activeBuff: false,
      },
    });

    // Activate target region
    await tx.userRegion.update({
      where: {
        userId_regionId: {
          userId: user.id,
          regionId: targetRegionId,
        },
      },
      data: {
        activeBuff: true,
        visitedAt: userRegion.visitedAt || now,
        lastTravelAt: now,
      },
    });

    // Deduct travel cost (simplified - funds)
    await tx.user.update({
      where: { id: user.id },
      data: {
        funds: { decrement: travelCost },
      },
    });
  });

  return successResponse({
    success: true,
    message: `You traveled to ${targetRegion.name}`,
    region: {
      id: targetRegion.id,
      name: targetRegion.name,
      buffType: targetRegion.buffType,
      buffValue: targetRegion.buffValue,
    },
  });
});

