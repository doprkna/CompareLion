/**
 * Mission Service - Daily & Weekly Missions
 * v0.36.28 - BattlePass 2.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { addBattlePassXP } from './battlepassService';

export interface DailyMission {
  id: string;
  type: 'answer_question' | 'win_fight' | 'login';
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  completed: boolean;
}

export interface WeeklyMission {
  id: string;
  type: 'answer_questions' | 'win_fights' | 'earn_gold' | 'get_loot';
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  completed: boolean;
}

/**
 * Get daily missions for user
 */
export async function getDailyMissions(userId: string): Promise<DailyMission[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get or create daily mission progress
  let missionProgress = await prisma.userMissionProgress.findUnique({
    where: { userId },
  });

  if (!missionProgress) {
    missionProgress = await prisma.userMissionProgress.create({
      data: {
        userId,
        dailyMissions: {},
        weeklyMissions: {},
        lastDailyReset: today,
        lastWeeklyReset: getWeekStart(),
      },
    });
  }

  // Check if daily reset needed
  const lastReset = missionProgress.lastDailyReset;
  if (lastReset < today) {
    // Reset daily missions
    await prisma.userMissionProgress.update({
      where: { id: missionProgress.id },
      data: {
        dailyMissions: {},
        lastDailyReset: today,
      },
    });
    missionProgress = await prisma.userMissionProgress.findUnique({
      where: { id: missionProgress.id },
    })!;
  }

  const dailyMissions = (missionProgress?.dailyMissions as any) || {};
  
  // Default daily missions
  const missions: DailyMission[] = [
    {
      id: 'daily_answer_question',
      type: 'answer_question',
      description: 'Answer 1 question',
      xpReward: 50,
      progress: dailyMissions.answer_question || 0,
      target: 1,
      completed: (dailyMissions.answer_question || 0) >= 1,
    },
    {
      id: 'daily_win_fight',
      type: 'win_fight',
      description: 'Win 1 arena fight',
      xpReward: 40,
      progress: dailyMissions.win_fight || 0,
      target: 1,
      completed: (dailyMissions.win_fight || 0) >= 1,
    },
    {
      id: 'daily_login',
      type: 'login',
      description: 'Login today',
      xpReward: 25,
      progress: dailyMissions.login || 0,
      target: 1,
      completed: (dailyMissions.login || 0) >= 1,
    },
  ];

  return missions;
}

/**
 * Get weekly missions for user
 */
export async function getWeeklyMissions(userId: string): Promise<WeeklyMission[]> {
  const weekStart = getWeekStart();

  let missionProgress = await prisma.userMissionProgress.findUnique({
    where: { userId },
  });

  if (!missionProgress) {
    missionProgress = await prisma.userMissionProgress.create({
      data: {
        userId,
        dailyMissions: {},
        weeklyMissions: {},
        lastDailyReset: new Date(),
        lastWeeklyReset: weekStart,
      },
    });
  }

  // Check if weekly reset needed
  const lastReset = missionProgress.lastWeeklyReset;
  if (lastReset < weekStart) {
    await prisma.userMissionProgress.update({
      where: { id: missionProgress.id },
      data: {
        weeklyMissions: {},
        lastWeeklyReset: weekStart,
      },
    });
    missionProgress = await prisma.userMissionProgress.findUnique({
      where: { id: missionProgress.id },
    })!;
  }

  const weeklyMissions = (missionProgress?.weeklyMissions as any) || {};

  const missions: WeeklyMission[] = [
    {
      id: 'weekly_answer_questions',
      type: 'answer_questions',
      description: 'Answer 20 questions',
      xpReward: 150,
      progress: weeklyMissions.answer_questions || 0,
      target: 20,
      completed: (weeklyMissions.answer_questions || 0) >= 20,
    },
    {
      id: 'weekly_win_fights',
      type: 'win_fights',
      description: 'Win 10 arena fights',
      xpReward: 150,
      progress: weeklyMissions.win_fights || 0,
      target: 10,
      completed: (weeklyMissions.win_fights || 0) >= 10,
    },
    {
      id: 'weekly_earn_gold',
      type: 'earn_gold',
      description: 'Earn 500 gold',
      xpReward: 150,
      progress: weeklyMissions.earn_gold || 0,
      target: 500,
      completed: (weeklyMissions.earn_gold || 0) >= 500,
    },
    {
      id: 'weekly_get_loot',
      type: 'get_loot',
      description: 'Get 5 loot drops',
      xpReward: 150,
      progress: weeklyMissions.get_loot || 0,
      target: 5,
      completed: (weeklyMissions.get_loot || 0) >= 5,
    },
  ];

  return missions;
}

/**
 * Update mission progress
 */
export async function updateMissionProgress(
  userId: string,
  missionType: string,
  amount: number = 1
): Promise<void> {
  try {
    const isDaily = missionType.startsWith('daily_');
    const isWeekly = missionType.startsWith('weekly_');

    if (!isDaily && !isWeekly) {
      return;
    }

    let missionProgress = await prisma.userMissionProgress.findUnique({
      where: { userId },
    });

    if (!missionProgress) {
      missionProgress = await prisma.userMissionProgress.create({
        data: {
          userId,
          dailyMissions: {},
          weeklyMissions: {},
          lastDailyReset: new Date(),
          lastWeeklyReset: getWeekStart(),
        },
      });
    }

    const key = missionType.replace('daily_', '').replace('weekly_', '');
    const missions = isDaily 
      ? (missionProgress.dailyMissions as any) || {}
      : (missionProgress.weeklyMissions as any) || {};

    const currentProgress = missions[key] || 0;
    const newProgress = currentProgress + amount;

    // Update progress
    if (isDaily) {
      await prisma.userMissionProgress.update({
        where: { id: missionProgress.id },
        data: {
          dailyMissions: {
            ...missions,
            [key]: newProgress,
          },
        },
      });
    } else {
      await prisma.userMissionProgress.update({
        where: { id: missionProgress.id },
        data: {
          weeklyMissions: {
            ...missions,
            [key]: newProgress,
          },
        },
      });
    }

    // Check if mission completed and grant XP
    const missionsList = isDaily 
      ? await getDailyMissions(userId)
      : await getWeeklyMissions(userId);
    
    const mission = missionsList.find(m => m.id === missionType);
    if (mission && !mission.completed && newProgress >= mission.target) {
      // Mission just completed - grant XP
      await addBattlePassXP(userId, mission.xpReward);
      logger.info(`[Mission] User ${userId} completed ${missionType}, granted ${mission.xpReward} XP`);
      
      // Grant pet XP (v0.36.32) - +5 XP for completing daily missions
      if (isDaily) {
        try {
          const { grantXPToAllUserPets } = await import('@/lib/services/petService');
          await grantXPToAllUserPets(userId, 5);
        } catch (error) {
          logger.debug('[Mission] Pet XP grant failed', error);
        }
      }
    }
  } catch (error) {
    logger.error('[Mission] Failed to update progress', error);
  }
}

/**
 * Get week start (Monday)
 */
function getWeekStart(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const weekStart = new Date(now.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
}

