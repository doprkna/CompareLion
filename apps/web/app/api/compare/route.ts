import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/db";
import { getKarmaTier } from "@/lib/karma";
import { getPrestigeTier } from "@/lib/prestige";
import { safeAsync, successResponse, unauthorizedError, notFoundError, validationError, forbiddenError } from "@/lib/api-handler";
import { canCompare } from "@/lib/middleware/privacy";

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get("targetId");

  if (!targetId) {
    return validationError('targetId required');
  }

    // Get current user
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      level: true,
      xp: true,
      archetype: true,
      badgeType: true,
      karmaScore: true,
      prestigeScore: true,
      statSleep: true,
      statHealth: true,
      statSocial: true,
      statKnowledge: true,
      statCreativity: true,
      allowPublicCompare: true,
      showBadges: true,
      userAchievements: { select: { id: true } },
    },
  });

  if (!currentUser) {
    return notFoundError('User');
  }

  // Get target user
  const targetUser = await prisma.user.findUnique({
    where: { id: targetId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      level: true,
      xp: true,
      archetype: true,
      badgeType: true,
      karmaScore: true,
      prestigeScore: true,
      statSleep: true,
      statHealth: true,
      statSocial: true,
      statKnowledge: true,
      statCreativity: true,
      allowPublicCompare: true,
      showBadges: true,
      userAchievements: { select: { id: true } },
    },
  });

  if (!targetUser) {
    return notFoundError('Target user');
  }

  // Privacy check (v0.29.30 - Enhanced privacy system)
  const canCompareUsers = await canCompare(currentUser.id, targetId);
  
  if (!canCompareUsers) {
    return forbiddenError('Comparison not allowed due to privacy settings');
  }

    // Calculate tiers
    const currentKarmaTier = getKarmaTier(currentUser.karmaScore);
    const targetKarmaTier = getKarmaTier(targetUser.karmaScore);
    const currentPrestigeTier = getPrestigeTier(currentUser.prestigeScore);
    const targetPrestigeTier = getPrestigeTier(targetUser.prestigeScore);

    // Format comparison data
    const comparison = {
      currentUser: {
        id: currentUser.id,
        name: currentUser.name || currentUser.email.split('@')[0],
        email: currentUser.email,
        image: currentUser.image,
        level: currentUser.level,
        xp: currentUser.xp,
        archetype: currentUser.archetype || "Adventurer",
        badge: currentUser.showBadges ? currentUser.badgeType : null,
        karma: currentUser.karmaScore,
        karmaTier: currentKarmaTier,
        prestige: currentUser.prestigeScore,
        prestigeTier: currentPrestigeTier,
        stats: {
          sleep: currentUser.statSleep,
          health: currentUser.statHealth,
          social: currentUser.statSocial,
          knowledge: currentUser.statKnowledge,
          creativity: currentUser.statCreativity,
        },
        achievementCount: currentUser.userAchievements.length,
      },
      targetUser: {
        id: targetUser.id,
        name: targetUser.name || targetUser.email.split('@')[0],
        email: targetUser.email,
        image: targetUser.image,
        level: targetUser.level,
        xp: targetUser.xp,
        archetype: targetUser.archetype || "Adventurer",
        badge: targetUser.showBadges ? targetUser.badgeType : null,
        karma: targetUser.karmaScore,
        karmaTier: targetKarmaTier,
        prestige: targetUser.prestigeScore,
        prestigeTier: targetPrestigeTier,
        stats: {
          sleep: targetUser.statSleep,
          health: targetUser.statHealth,
          social: targetUser.statSocial,
          knowledge: targetUser.statKnowledge,
          creativity: targetUser.statCreativity,
        },
        achievementCount: targetUser.userAchievements.length,
      },
  };

  return successResponse({ comparison });
});













