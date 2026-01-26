/**
 * Compare Service
 * Fetch lightweight compare data for two users
 * v0.36.42 - Social Systems 1.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { CompareData } from './types';
import { isUserBlocked } from './blockService';

/**
 * Get compare data for two users
 * Lightweight queries - avoids large joins
 * 
 * @param userAId - First user ID
 * @param userBId - Second user ID
 * @returns Compare data or null if blocked/invalid
 */
export async function getCompareData(
  userAId: string,
  userBId: string
): Promise<CompareData | null> {
  try {
    // Check if users are blocked
    const blocked = await isUserBlocked(userAId, userBId);
    if (blocked) {
      return null; // Cannot compare blocked users
    }

    // Fetch both users' data in parallel
    const [userA, userB] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userAId },
        select: {
          id: true,
          username: true,
          name: true,
          level: true,
          xp: true,
          funds: true,
          diamonds: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: userBId },
        select: {
          id: true,
          username: true,
          name: true,
          level: true,
          xp: true,
          funds: true,
          diamonds: true,
        },
      }),
    ]);

    if (!userA || !userB) {
      return null;
    }

    // Fetch mount stats (if mount system exists)
    const [mountA, mountB] = await Promise.all([
      prisma.userMount.findFirst({
        where: { userId: userAId },
        select: {
          level: true,
          power: true,
          speed: true,
        },
        orderBy: { level: 'desc' },
      }).catch(() => null),
      prisma.userMount.findFirst({
        where: { userId: userBId },
        select: {
          level: true,
          power: true,
          speed: true,
        },
        orderBy: { level: 'desc' },
      }).catch(() => null),
    ]);

    // Fetch recent missions (last 5 completed)
    const [missionsA, missionsB] = await Promise.all([
      prisma.missionProgress.findMany({
        where: {
          userId: userAId,
          completed: true,
        },
        include: {
          mission: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }).catch(() => []),
      prisma.missionProgress.findMany({
        where: {
          userId: userBId,
          completed: true,
        },
        include: {
          mission: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }).catch(() => []),
    ]);

    // Calculate economy stats (simplified - total earned is estimated)
    // TODO: Add proper tracking for totalEarned in future
    const economyA = {
      gold: Number(userA.funds) || 0,
      diamonds: userA.diamonds || 0,
      totalEarned: Number(userA.funds) || 0, // Placeholder
    };

    const economyB = {
      gold: Number(userB.funds) || 0,
      diamonds: userB.diamonds || 0,
      totalEarned: Number(userB.funds) || 0, // Placeholder
    };

    return {
      userA: {
        id: userA.id,
        username: userA.username,
        name: userA.name,
        level: userA.level || 1,
        xp: userA.xp || 0,
        mountStats: mountA ? {
          level: mountA.level || 1,
          power: mountA.power || 0,
          speed: mountA.speed || 0,
        } : null,
        recentMissions: missionsA.map(mp => ({
          id: mp.mission.id,
          title: mp.mission.title,
          completedAt: mp.updatedAt,
        })),
        economyStats: economyA,
      },
      userB: {
        id: userB.id,
        username: userB.username,
        name: userB.name,
        level: userB.level || 1,
        xp: userB.xp || 0,
        mountStats: mountB ? {
          level: mountB.level || 1,
          power: mountB.power || 0,
          speed: mountB.speed || 0,
        } : null,
        recentMissions: missionsB.map(mp => ({
          id: mp.mission.id,
          title: mp.mission.title,
          completedAt: mp.updatedAt,
        })),
        economyStats: economyB,
      },
    };
  } catch (error) {
    logger.error('[CompareService] Failed to get compare data', { userAId, userBId, error });
    return null;
  }
}

