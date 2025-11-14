/**
 * Streak Tracker Utility
 * v0.34.2 - Tracks user activity streaks (7-day window)
 */

import { prisma } from '@/lib/db';

export interface StreakData {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  streakBonus: number; // Current XP multiplier from streak
}

/**
 * Get user's current streak data
 */
export async function getUserStreak(userId: string): Promise<StreakData> {
  // Check if user has activity today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Get user's recent reflections as activity indicator
  const recentActivity = await prisma.userReflection.findFirst({
    where: {
      userId,
      createdAt: {
        gte: yesterday,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Get all activity from last 30 days to calculate streak
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activities = await prisma.userReflection.findMany({
    where: {
      userId,
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      createdAt: true,
    },
  });

  // Calculate current streak
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  const activityDates = new Set(
    activities.map((a) => {
      const d = new Date(a.createdAt);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  // Calculate current streak (counting backwards from today)
  let checkDate = new Date(today);
  while (activityDates.has(checkDate.getTime())) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Calculate longest streak in past 30 days
  checkDate = new Date(today);
  for (let i = 0; i < 30; i++) {
    if (activityDates.has(checkDate.getTime())) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Get streak bonus from settings
  const streakBonusSetting = await prisma.balanceSetting.findUnique({
    where: { key: 'streak_xp_bonus' },
  });

  const streakBonusPerDay = streakBonusSetting?.value ?? 0.05;
  const streakBonus = 1 + streakBonusPerDay * currentStreak;

  return {
    userId,
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    lastActivityDate: recentActivity?.createdAt ?? new Date(0),
    streakBonus,
  };
}

/**
 * Update user's streak (call this when user completes an activity)
 */
export async function updateUserStreak(userId: string): Promise<StreakData> {
  // This is automatically tracked via reflections/activities
  // Just return current streak data
  return getUserStreak(userId);
}

/**
 * Get streak bonus multiplier for a user
 */
export async function getStreakMultiplier(userId: string): Promise<number> {
  const streak = await getUserStreak(userId);
  return streak.streakBonus;
}

/**
 * Reset streaks for inactive users (cron job)
 * This is a no-op since streaks are calculated on-demand
 */
export async function resetInactiveStreaks(): Promise<void> {
  // Streaks are calculated dynamically, no reset needed
  console.log('✅ Streak reset check complete (calculated on-demand)');
}

/**
 * Get leaderboard of users by current streak
 */
export async function getStreakLeaderboard(limit = 10): Promise<StreakData[]> {
  // Get all users with recent activity
  const activeUsers = await prisma.user.findMany({
    where: {
      reflections: {
        some: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      },
    },
    select: {
      id: true,
    },
    take: 100, // Limit to top 100 for performance
  });

  const streaks = await Promise.all(
    activeUsers.map((user) => getUserStreak(user.id))
  );

  return streaks
    .sort((a, b) => b.currentStreak - a.currentStreak)
    .slice(0, limit);
}





