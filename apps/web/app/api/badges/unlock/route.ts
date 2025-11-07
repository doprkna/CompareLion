import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { publishEvent } from "@/lib/realtime";
import { notify } from "@/lib/notify";
import { safeAsync, authError, successResponse, notFoundError, validationError } from "@/lib/api-handler";
import { z } from "zod";

const UnlockBadgeSchema = z.object({
  badgeKey: z.string().min(1).optional(),
  badgeId: z.string().min(1).optional(),
}).refine((data) => data.badgeKey || data.badgeId, {
  message: "Either badgeKey or badgeId must be provided",
});

/**
 * POST /api/badges/unlock
 * Unlock/award a badge to the user (auth required)
 * Triggered when XP/level/event condition is met
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, email: true },
  });

  if (!user) {
    return notFoundError("User");
  }

  const body = await req.json().catch(() => ({}));
  const parsed = UnlockBadgeSchema.safeParse(body);
  if (!parsed.success) {
    return validationError("Invalid payload: " + parsed.error.message);
  }

  const { badgeKey, badgeId } = parsed.data;

  // Find badge by key or id
  const badge = await prisma.badge.findFirst({
    where: {
      OR: [
        badgeKey ? { key: badgeKey } : {},
        badgeId ? { id: badgeId } : {},
      ].filter((c) => Object.keys(c).length > 0),
      isActive: true,
    },
  });

  if (!badge) {
    return notFoundError("Badge not found");
  }

  // Check if already unlocked
  const existing = await prisma.userBadge.findUnique({
    where: {
      userId_badgeId: {
        userId: user.id,
        badgeId: badge.id,
      },
    },
  });

  if (existing) {
    return validationError("Badge already unlocked");
  }

  // Create user badge entry
  const userBadge = await prisma.userBadge.create({
    data: {
      userId: user.id,
      badgeId: badge.id,
      unlockedAt: new Date(),
      isClaimed: false,
    },
    include: {
      badge: true,
    },
  });

  // Send notification
  await notify(
    user.id,
    "badge_unlock",
    `🎖️ Badge Unlocked: ${badge.name || badge.title || badge.slug}`,
    badge.description
  );

  // Publish real-time event
  await publishEvent("badge:unlock", {
    userId: user.id,
    userName: user.name || user.email,
    badgeId: badge.id,
    badgeKey: badge.key,
    name: badge.name || badge.title || badge.slug,
    icon: badge.icon,
    rarity: badge.rarity,
    rewardType: badge.rewardType,
    rewardValue: badge.rewardValue,
  });

  return successResponse({
    success: true,
    message: "Badge unlocked!",
    badge: {
      id: badge.id,
      key: badge.key,
      name: badge.name || badge.title || badge.slug,
      description: badge.description,
      icon: badge.icon,
      rarity: badge.rarity,
      rewardType: badge.rewardType,
      rewardValue: badge.rewardValue,
      isClaimed: false,
      canClaim: badge.rewardType !== null,
    },
  });
});

