import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { safeAsync, authError, successResponse, notFoundError } from "@/lib/api-handler";

/**
 * GET /api/badges/user
 * Get user's unlocked badges + claim status
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

  // Get user's badges with full badge details
  const userBadges = await prisma.userBadge.findMany({
    where: { userId: user.id },
    include: {
      badge: {
        include: {
          season: {
            select: {
              id: true,
              name: true,
              displayName: true,
            },
          },
        },
      },
    },
    orderBy: {
      unlockedAt: "desc",
    },
  });

  const badges = userBadges.map((ub) => ({
    id: ub.badgeId, // Badge.id
    userBadgeId: ub.id, // UserBadge.id for claiming
    badgeId: ub.badgeId,
    key: ub.badge.key,
    name: ub.badge.name || ub.badge.title || ub.badge.slug,
    description: ub.badge.description,
    icon: ub.badge.icon,
    rarity: ub.badge.rarity,
    unlockType: ub.badge.unlockType,
    rewardType: ub.badge.rewardType,
    rewardValue: ub.badge.rewardValue,
    season: ub.badge.season,
    unlockedAt: ub.unlockedAt,
    claimedAt: ub.claimedAt,
    isClaimed: ub.isClaimed,
    canClaim: !ub.isClaimed && ub.badge.rewardType !== null,
  }));

  return successResponse({
    badges,
    total: badges.length,
    claimedCount: badges.filter((b) => b.isClaimed).length,
    unclaimedCount: badges.filter((b) => !b.isClaimed && b.canClaim).length,
  });
});

