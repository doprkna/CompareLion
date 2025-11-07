import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError } from "@/lib/api-handler";

/**
 * GET /api/badges
 * List all badges (filter by unlocked/locked)
 * Query params: ?unlocked=true (optional - filter by unlock status)
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const searchParams = req.nextUrl.searchParams;
  const unlockedFilter = searchParams.get("unlocked");

  // Get all active badges
  const badges = await prisma.badge.findMany({
    where: {
      isActive: true,
    },
    include: {
      season: {
        select: {
          id: true,
          name: true,
          displayName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // If user is authenticated, include their unlock status
  let userBadgeIds: string[] = [];
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (user) {
      const userBadges = await prisma.userBadge.findMany({
        where: { userId: user.id },
        select: { badgeId: true },
      });
      userBadgeIds = userBadges.map((ub) => ub.badgeId);
    }
  }

  // Map badges with unlock status
  const badgesWithStatus = badges.map((badge) => {
    const isUnlocked = userBadgeIds.includes(badge.id);
    return {
      id: badge.id,
      key: badge.key,
      name: badge.name || badge.title || badge.slug,
      description: badge.description,
      icon: badge.icon,
      rarity: badge.rarity,
      unlockType: badge.unlockType,
      requirementValue: badge.requirementValue,
      rewardType: badge.rewardType,
      rewardValue: badge.rewardValue,
      seasonId: badge.seasonId,
      season: badge.season,
      isActive: badge.isActive,
      isUnlocked,
      createdAt: badge.createdAt,
    };
  });

  // Apply unlocked filter if specified
  let filteredBadges = badgesWithStatus;
  if (unlockedFilter === "true") {
    filteredBadges = badgesWithStatus.filter((b) => b.isUnlocked);
  } else if (unlockedFilter === "false") {
    filteredBadges = badgesWithStatus.filter((b) => !b.isUnlocked);
  }

  return successResponse({
    badges: filteredBadges,
    total: filteredBadges.length,
  });
});
