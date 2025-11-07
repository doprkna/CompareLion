import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError, validationError } from "@/lib/api-handler";
import { z } from "zod";

const UnlockSchema = z.object({
  regionId: z.string().min(1),
});

/**
 * POST /api/regions/unlock
 * Unlock a new region (by level, quest, or cost)
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      level: true,
      funds: true,
      xp: true,
    },
  });

  if (!user) {
    return notFoundError("User");
  }

  const body = await req.json().catch(() => ({}));
  const parsed = UnlockSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Invalid payload");
  }

  const { regionId } = parsed.data;

  // Get region
  const region = await prisma.region.findUnique({
    where: { id: regionId },
  });

  if (!region || !region.isActive) {
    return notFoundError("Region not found");
  }

  // Check if already unlocked
  const existing = await prisma.userRegion.findUnique({
    where: {
      userId_regionId: {
        userId: user.id,
        regionId,
      },
    },
  });

  if (existing?.isUnlocked) {
    return validationError("Region already unlocked");
  }

  // Check unlock requirements
  if (region.unlockRequirementType) {
    if (region.unlockRequirementType === "level") {
      const requiredLevel = parseInt(region.unlockRequirementValue || "0", 10);
      if (user.level < requiredLevel) {
        return validationError(`Requires level ${requiredLevel}`);
      }
    } else if (region.unlockRequirementType === "gold") {
      const requiredGold = parseInt(region.unlockRequirementValue || "0", 10);
      if (user.funds.toNumber() < requiredGold) {
        return validationError(`Requires ${requiredGold} gold`);
      }

      // Deduct gold
      await prisma.user.update({
        where: { id: user.id },
        data: {
          funds: { decrement: requiredGold },
        },
      });
    } else if (region.unlockRequirementType === "task") {
      // Future: Check task completion
      // For MVP, skip task validation
    } else if (region.unlockRequirementType === "achievement") {
      // Future: Check achievement
      // For MVP, skip achievement validation
    }
  }

  // Create or update UserRegion
  const userRegion = await prisma.userRegion.upsert({
    where: {
      userId_regionId: {
        userId: user.id,
        regionId,
      },
    },
    create: {
      userId: user.id,
      regionId,
      isUnlocked: true,
      visitedAt: new Date(),
      activeBuff: false,
    },
    update: {
      isUnlocked: true,
      visitedAt: new Date(),
    },
  });

  return successResponse({
    success: true,
    message: `Region ${region.name} unlocked!`,
    region: {
      id: region.id,
      name: region.name,
      buffType: region.buffType,
      buffValue: region.buffValue,
    },
  });
});

