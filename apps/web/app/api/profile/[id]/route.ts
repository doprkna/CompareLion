import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/app/api/_utils';
import { prisma } from '@/lib/db';
import { safeAsync, authError, notFoundError } from '@/lib/api-handler';
import { awardKarmaForComparison } from '@/lib/services/karmaService';
import { getUserArchetype } from '@/lib/archetype/calc';

/**
 * GET /api/profile/[id]
 * Returns full user profile with all social features
 * v0.36.24 - Social Profiles 2.0
 */
export const GET = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const currentUser = await getUserFromRequest(req);
  if (!currentUser) {
    return authError('Unauthorized');
  }

  const { id: targetUserId } = params;
  const isSelf = currentUser.userId === targetUserId;

  // Award karma for comparison (once per day per viewer)
  if (!isSelf) {
    try {
      await awardKarmaForComparison(targetUserId, currentUser.userId);
    } catch (error) {
      // Silently fail - karma award is not critical
    }
  }

  // Fetch target user with comprehensive profile info
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
      bio: true,
      statusMessage: true,
      visibility: true,
      isPublicProfile: true,
      level: true,
      xp: true,
      karma: true,
      karmaScore: true, // Legacy field
      createdAt: true,
      lastActiveAt: true,
      showBadges: true,
      badgeType: true,
      archetype: true,
      avatarFrameId: true,
      equippedTitle: true,
      equippedIcon: true,
      equippedBackground: true,
      streakCount: true,
      lastAnsweredAt: true,
      questionsAnswered: true,
      combatKills: true,
      combatBattles: true,
      funds: true,
      userBadges: {
        select: {
          badge: {
            select: {
              id: true,
              key: true,
              name: true,
              description: true,
              icon: true,
              rarity: true,
            },
          },
          unlockedAt: true,
        },
        orderBy: {
          unlockedAt: 'desc',
        },
        take: 8, // Max 8 badges shown
      },
      userAchievements: {
        select: {
          achievement: {
            select: {
              id: true,
              code: true,
              title: true,
              description: true,
              icon: true,
              xpReward: true,
            },
          },
          earnedAt: true,
        },
        orderBy: {
          earnedAt: 'desc',
        },
        take: 20,
      },
    },
  });

  if (!targetUser) {
    return notFoundError('User');
  }

  // Check privacy settings
  const canViewFull = isSelf || targetUser.isPublicProfile !== false;

  if (!canViewFull) {
    // Private profile - show minimal info
    return NextResponse.json({
      success: true,
      profile: {
        id: targetUser.id,
        username: targetUser.username,
        name: targetUser.name,
        avatarUrl: targetUser.avatarUrl,
        isPrivate: true,
        message: 'This user keeps a low profile.',
      },
    });
  }

  // Calculate weekly stats (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  weekAgo.setHours(0, 0, 0, 0);

  const [weeklyXP, weeklyGold, weeklyQuestions] = await Promise.all([
    // Weekly XP (from action logs or user stats)
    prisma.actionLog.count({
      where: {
        userId: targetUserId,
        action: { contains: 'xp' },
        createdAt: { gte: weekAgo },
      },
    }).then(() => {
      // Estimate: use questions answered as proxy
      return (targetUser.questionsAnswered || 0) * 10; // Rough estimate
    }),
    // Weekly gold (from transactions or funds change)
    Promise.resolve(0), // TODO: Track weekly gold properly
    // Weekly questions
    prisma.userQuestion.count({
      where: {
        userId: targetUserId,
        updatedAt: { gte: weekAgo },
      },
    }),
  ]);

  // Get equipped companion
  const equippedCompanion = await prisma.userCompanion.findFirst({
    where: {
      userId: targetUserId,
      equipped: true,
    },
    include: {
      companion: {
        select: {
          id: true,
          name: true,
          icon: true,
          rarity: true,
          description: true,
          atkBonus: true,
          defBonus: true,
          hpBonus: true,
          xpBonus: true,
          goldBonus: true,
        },
      },
    },
  });

  // Get equipped items (inventory summary)
  const equippedItems = isSelf
    ? await prisma.inventoryItem.findMany({
        where: {
          userId: targetUserId,
          equipped: true,
        },
        include: {
          item: {
            select: {
              id: true,
              name: true,
              icon: true,
              rarity: true,
              type: true,
            },
          },
        },
        take: 10,
      })
    : [];

  // Get parallels (similar users) - top 3
  const parallels = await getSimilarUsers(targetUserId, 3);

  // Calculate archetype if not set
  let archetype = targetUser.archetype;
  if (!archetype || archetype === 'Adventurer') {
    try {
      archetype = await getUserArchetype(targetUserId);
    } catch (error) {
      // Fallback to existing archetype
    }
  }

  // Build comprehensive profile response
  const profile = {
    // Header
    id: targetUser.id,
    username: targetUser.username,
    name: targetUser.name,
    avatarUrl: targetUser.avatarUrl,
    avatarFrameId: targetUser.avatarFrameId,
    statusMessage: targetUser.statusMessage,
    archetype: archetype || 'Adventurer',
    level: targetUser.level,
    xp: targetUser.xp,
    karma: targetUser.karma || targetUser.karmaScore || 0,
    joinedAt: targetUser.createdAt,
    lastActiveAt: targetUser.lastActiveAt,

    // Quick Stats
    stats: {
      level: targetUser.level,
      karma: targetUser.karma || targetUser.karmaScore || 0,
      questionsAnswered: targetUser.questionsAnswered || 0,
      fightsWon: targetUser.combatKills || 0,
      fightsTotal: targetUser.combatBattles || 0,
      playstyle: archetype || 'Adventurer',
    },

    // Badges (max 8 shown)
    badges: targetUser.showBadges
      ? targetUser.userBadges.slice(0, 8).map((ub) => ({
          id: ub.badge.id,
          key: ub.badge.key,
          name: ub.badge.name,
          description: ub.badge.description,
          icon: ub.badge.icon,
          rarity: ub.badge.rarity,
          earnedAt: ub.unlockedAt,
        }))
      : [],

    // Companion Preview
    companion: equippedCompanion
      ? {
          id: equippedCompanion.companion.id,
          name: equippedCompanion.companion.name,
          icon: equippedCompanion.companion.icon,
          rarity: equippedCompanion.companion.rarity,
          description: equippedCompanion.companion.description,
          bonuses: {
            atk: equippedCompanion.companion.atkBonus || 0,
            def: equippedCompanion.companion.defBonus || 0,
            hp: equippedCompanion.companion.hpBonus || 0,
            xp: equippedCompanion.companion.xpBonus || 0,
            gold: equippedCompanion.companion.goldBonus || 0,
          },
        }
      : null,

    // Progress (last 7 days)
    progress: {
      weeklyXP,
      weeklyGold,
      weeklyQuestions,
      streak: targetUser.streakCount || 0,
      lastActive: targetUser.lastActiveAt,
    },

    // Parallels Preview (top 3 similar users)
    parallels: parallels.map((p) => ({
      id: p.id,
      username: p.username,
      name: p.name,
      avatarUrl: p.avatarUrl,
      level: p.level,
      archetype: p.archetype,
      similarity: p.similarity,
    })),

    // Inventory Summary (only if self)
    inventory: isSelf
      ? {
          equipped: equippedItems.map((inv) => ({
            id: inv.item.id,
            name: inv.item.name,
            icon: inv.item.icon,
            rarity: inv.rarity,
            type: inv.item.type,
          })),
        }
      : null,

    // Achievements
    achievements: targetUser.userAchievements.map((ua) => ({
      id: ua.achievement.id,
      code: ua.achievement.code,
      title: ua.achievement.title,
      description: ua.achievement.description,
      icon: ua.achievement.icon,
      xpReward: ua.achievement.xpReward,
      earnedAt: ua.earnedAt,
    })),

    // Cosmetics
    cosmetics: {
      title: targetUser.equippedTitle,
      icon: targetUser.equippedIcon,
      background: targetUser.equippedBackground,
    },

    isPrivate: false,
    isSelf,
  };

  return NextResponse.json({
    success: true,
    profile,
  });
});

/**
 * Get similar users (parallels) based on age, region, playstyle, stats
 */
async function getSimilarUsers(userId: string, limit: number = 3) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      level: true,
      xp: true,
      archetype: true,
      questionsAnswered: true,
      combatKills: true,
      region: true,
      ageGroup: true,
    },
  });

  if (!user) {
    return [];
  }

  // Find users with similar stats
  const similarUsers = await prisma.user.findMany({
    where: {
      id: { not: userId },
      isPublicProfile: { not: false },
      level: {
        gte: Math.max(1, user.level - 3),
        lte: user.level + 3,
      },
    },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
      level: true,
      xp: true,
      archetype: true,
      questionsAnswered: true,
      combatKills: true,
      region: true,
      ageGroup: true,
    },
    take: limit * 3, // Get more to filter
  });

  // Score similarity
  const scored = similarUsers.map((u) => {
    let similarity = 0;

    // Level similarity (0-30 points)
    const levelDiff = Math.abs(u.level - user.level);
    similarity += Math.max(0, 30 - levelDiff * 5);

    // Archetype match (20 points)
    if (u.archetype === user.archetype) {
      similarity += 20;
    }

    // Region match (15 points)
    if (u.region === user.region) {
      similarity += 15;
    }

    // Age group match (15 points)
    if (u.ageGroup === user.ageGroup) {
      similarity += 15;
    }

    // Activity similarity (20 points)
    const questionsDiff = Math.abs((u.questionsAnswered || 0) - (user.questionsAnswered || 0));
    const fightsDiff = Math.abs((u.combatKills || 0) - (user.combatKills || 0));
    similarity += Math.max(0, 20 - (questionsDiff + fightsDiff) / 10);

    return { ...u, similarity };
  });

  // Sort by similarity and return top N
  return scored
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}
