/**
 * Compare Users API
 * GET /api/compare/[userA]/[userB]
 * Compares two users side-by-side with stats, XP, badges, questions
 * v0.36.24 - Social Profiles 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { getKarmaTier } from '@/lib/karma';
import { getPrestigeTier } from '@/lib/prestige';
import {
  safeAsync,
  successResponse,
  unauthorizedError,
  notFoundError,
  forbiddenError,
} from '@/lib/api-handler';
import { canCompare } from '@/lib/middleware/privacy';

export const GET = safeAsync(
  async (
    req: NextRequest,
    { params }: { params: { userA: string; userB: string } }
  ) => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return unauthorizedError('Unauthorized');
    }

    const { userA, userB } = params;

    if (!userA || !userB) {
      return unauthorizedError('Both user IDs required');
    }

    // Get current user for privacy checks
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!currentUser) {
      return unauthorizedError('User not found');
    }

    // Privacy check - user must be able to compare both users
    const canCompareA = await canCompare(currentUser.id, userA);
    const canCompareB = await canCompare(currentUser.id, userB);

    if (!canCompareA || !canCompareB) {
      return forbiddenError('Comparison not allowed due to privacy settings');
    }

    // Fetch both users with comprehensive data
    const [userAData, userBData] = await Promise.all([
      getUserComparisonData(userA),
      getUserComparisonData(userB),
    ]);

    if (!userAData) {
      return notFoundError('User A not found');
    }

    if (!userBData) {
      return notFoundError('User B not found');
    }

    // Calculate similarity score
    const similarityScore = calculateSimilarity(userAData, userBData);

    // Format comparison response
    const comparison = {
      userA: formatUserComparison(userAData),
      userB: formatUserComparison(userBData),
      similarity: {
        score: similarityScore,
        percentage: Math.round(similarityScore),
        message: getSimilarityMessage(similarityScore),
      },
    };

    return successResponse({ comparison });
  }
);

/**
 * Get user data for comparison
 */
async function getUserComparisonData(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      avatarUrl: true,
      level: true,
      xp: true,
      karma: true,
      karmaScore: true,
      prestigeScore: true,
      archetype: true,
      questionsAnswered: true,
      combatKills: true,
      combatBattles: true,
      streakCount: true,
      createdAt: true,
      showBadges: true,
      userBadges: {
        select: {
          badge: {
            select: {
              id: true,
              name: true,
              icon: true,
              rarity: true,
            },
          },
        },
        take: 10,
      },
      userAchievements: {
        select: {
          achievement: {
            select: {
              id: true,
              title: true,
              icon: true,
            },
          },
        },
        take: 20,
      },
    },
  });
}

/**
 * Format user data for comparison
 */
function formatUserComparison(user: any) {
  const karmaTier = getKarmaTier(user.karma || user.karmaScore || 0);
  const prestigeTier = getPrestigeTier(user.prestigeScore || 0);

  return {
    id: user.id,
    username: user.username,
    name: user.name || user.email?.split('@')[0] || 'Unknown',
    email: user.email,
    avatarUrl: user.avatarUrl,
    level: user.level,
    xp: user.xp,
    archetype: user.archetype || 'Adventurer',
    karma: user.karma || user.karmaScore || 0,
    karmaTier,
    prestige: user.prestigeScore || 0,
    prestigeTier,
    stats: {
      questionsAnswered: user.questionsAnswered || 0,
      fightsWon: user.combatKills || 0,
      fightsTotal: user.combatBattles || 0,
      streak: user.streakCount || 0,
    },
    badges: user.showBadges
      ? user.userBadges.map((ub: any) => ({
          id: ub.badge.id,
          name: ub.badge.name,
          icon: ub.badge.icon,
          rarity: ub.badge.rarity,
        }))
      : [],
    achievements: {
      count: user.userAchievements?.length || 0,
      list: user.userAchievements.map((ua: any) => ({
        id: ua.achievement.id,
        title: ua.achievement.title,
        icon: ua.achievement.icon,
      })),
    },
    joinedAt: user.createdAt,
  };
}

/**
 * Calculate similarity score between two users (0-100)
 */
function calculateSimilarity(userA: any, userB: any): number {
  let score = 0;
  let maxScore = 0;

  // Level similarity (0-20 points)
  maxScore += 20;
  const levelDiff = Math.abs((userA.level || 1) - (userB.level || 1));
  score += Math.max(0, 20 - levelDiff * 2);

  // XP similarity (0-15 points)
  maxScore += 15;
  const xpDiff = Math.abs((userA.xp || 0) - (userB.xp || 0));
  const xpMax = Math.max(userA.xp || 0, userB.xp || 0, 1);
  score += Math.max(0, 15 * (1 - xpDiff / xpMax));

  // Archetype match (0-15 points)
  maxScore += 15;
  if (userA.archetype === userB.archetype) {
    score += 15;
  }

  // Questions answered similarity (0-15 points)
  maxScore += 15;
  const questionsDiff = Math.abs(
    (userA.questionsAnswered || 0) - (userB.questionsAnswered || 0)
  );
  const questionsMax = Math.max(userA.questionsAnswered || 0, userB.questionsAnswered || 0, 1);
  score += Math.max(0, 15 * (1 - questionsDiff / questionsMax));

  // Fights similarity (0-10 points)
  maxScore += 10;
  const fightsDiff = Math.abs((userA.combatKills || 0) - (userB.combatKills || 0));
  const fightsMax = Math.max(userA.combatKills || 0, userB.combatKills || 0, 1);
  score += Math.max(0, 10 * (1 - fightsDiff / fightsMax));

  // Badge overlap (0-10 points)
  maxScore += 10;
  const badgesA = new Set((userA.userBadges || []).map((ub: any) => ub.badge.id));
  const badgesB = new Set((userB.userBadges || []).map((ub: any) => ub.badge.id));
  const badgeIntersection = [...badgesA].filter((id) => badgesB.has(id)).length;
  const badgeUnion = new Set([...badgesA, ...badgesB]).size;
  if (badgeUnion > 0) {
    score += (badgeIntersection / badgeUnion) * 10;
  }

  // Achievement overlap (0-10 points)
  maxScore += 10;
  const achievementsA = new Set((userA.userAchievements || []).map((ua: any) => ua.achievement.id));
  const achievementsB = new Set((userB.userAchievements || []).map((ua: any) => ua.achievement.id));
  const achievementIntersection = [...achievementsA].filter((id) => achievementsB.has(id)).length;
  const achievementUnion = new Set([...achievementsA, ...achievementsB]).size;
  if (achievementUnion > 0) {
    score += (achievementIntersection / achievementUnion) * 10;
  }

  // Karma similarity (0-5 points)
  maxScore += 5;
  const karmaDiff = Math.abs((userA.karma || userA.karmaScore || 0) - (userB.karma || userB.karmaScore || 0));
  const karmaMax = Math.max(
    Math.abs(userA.karma || userA.karmaScore || 0),
    Math.abs(userB.karma || userB.karmaScore || 0),
    1
  );
  score += Math.max(0, 5 * (1 - karmaDiff / karmaMax));

  // Normalize to 0-100
  return Math.round((score / maxScore) * 100);
}

/**
 * Get similarity message based on score
 */
function getSimilarityMessage(score: number): string {
  if (score >= 80) {
    return 'You are remarkably similar!';
  } else if (score >= 60) {
    return 'You have a lot in common!';
  } else if (score >= 40) {
    return 'You share some similarities.';
  } else if (score >= 20) {
    return 'You have different playstyles.';
  } else {
    return 'You are quite different!';
  }
}

