/**
 * AURE Interaction Engine - Quests Service 2.0
 * Manages adaptive daily/weekly quests with XP rewards
 * v0.39.6 - Intelligent Quests
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { awardXP } from '@/lib/economy-service';
import { generateQuestsForUser, shouldRefreshQuests, QuestType, QuestFrequency } from './questGenerator';

export type QuestType = 'upload' | 'rate' | 'vs' | 'coach' | 'mix' | 'vibe';

export interface Quest {
  id: string;
  type: QuestType;
  description: string;
  rewardXp: number;
  frequency: QuestFrequency;
  required?: number;
}

export interface QuestProgress {
  questId: string;
  progress: number;
  required: number;
  completedAt: Date | null;
  quest: Quest;
}

/**
 * Get active quests for a user
 * Returns daily + weekly quests with user progress
 * Auto-refreshes if needed
 */
export async function getActiveQuests(userId: string): Promise<QuestProgress[]> {
  try {
    // Check if quests need refresh
    const needsDailyRefresh = await shouldRefreshQuests(userId, 'daily');
    const needsWeeklyRefresh = await shouldRefreshQuests(userId, 'weekly');

    // Refresh if needed
    if (needsDailyRefresh) {
      await refreshQuests(userId, 'daily');
    }
    if (needsWeeklyRefresh) {
      await refreshQuests(userId, 'weekly');
    }

    // Get active quests from DB
    try {
      const quests = await prisma.quest.findMany({
        where: {
          frequency: {
            in: ['daily', 'weekly'],
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10, // Get recent quests
      });

      // Get user progress for each quest
      const progressList = await Promise.all(
        quests.map(async (quest) => {
          try {
            const progress = await prisma.questProgress.findUnique({
              where: {
                userId_questId: {
                  userId,
                  questId: quest.id,
                },
              },
            });

            return {
              questId: quest.id,
              progress: progress?.progress || 0,
              required: quest.required || getDefaultRequired(quest.type),
              completedAt: progress?.completedAt || null,
              quest: {
                id: quest.id,
                type: quest.type as QuestType,
                description: quest.description,
                rewardXp: quest.rewardXp,
                frequency: quest.frequency as QuestFrequency,
                required: quest.required || getDefaultRequired(quest.type),
              },
            };
          } catch (error: any) {
            // If model doesn't exist yet, return placeholder
            if (error.message?.includes('model') || error.message?.includes('QuestProgress')) {
              return {
                questId: quest.id,
                progress: 0,
                required: quest.required || getDefaultRequired(quest.type),
                completedAt: null,
                quest: {
                  id: quest.id,
                  type: quest.type as QuestType,
                  description: quest.description,
                  rewardXp: quest.rewardXp,
                  frequency: quest.frequency as QuestFrequency,
                  required: quest.required || getDefaultRequired(quest.type),
                },
              };
            }
            throw error;
          }
        })
      );

      // Filter to only daily/weekly and group
      const dailyQuests = progressList.filter((q) => q.quest.frequency === 'daily').slice(0, 3);
      const weeklyQuests = progressList.filter((q) => q.quest.frequency === 'weekly').slice(0, 2);

      return [...dailyQuests, ...weeklyQuests];
    } catch (error: any) {
      // If model doesn't exist, return fallback
      if (error.message?.includes('model') || error.message?.includes('Quest')) {
        logger.warn('[AURE Interaction] Quest model not found - Prisma migration required');
        return getFallbackQuestProgress(userId);
      }
      throw error;
    }
  } catch (error) {
    logger.error('[AURE Interaction] Failed to get active quests', { error, userId });
    return getFallbackQuestProgress(userId);
  }
}

/**
 * Refresh quests for user
 * Generates new quests and stores them
 */
export async function refreshQuests(userId: string, frequency: QuestFrequency): Promise<void> {
  try {
    // Generate new quests
    const generatedQuests = await generateQuestsForUser(userId, frequency);

    // Store quests in DB
    for (const generatedQuest of generatedQuests) {
      try {
        await prisma.quest.upsert({
          where: { id: generatedQuest.id },
          create: {
            id: generatedQuest.id,
            type: generatedQuest.type,
            description: generatedQuest.description,
            rewardXp: generatedQuest.rewardXp,
            frequency: generatedQuest.frequency,
            required: generatedQuest.required,
          },
          update: {
            description: generatedQuest.description,
            rewardXp: generatedQuest.rewardXp,
            required: generatedQuest.required,
          },
        });
      } catch (error: any) {
        // If model doesn't exist, skip
        if (error.message?.includes('model') || error.message?.includes('Quest')) {
          logger.warn('[AURE Interaction] Quest model not found - Prisma migration required');
          return;
        }
        throw error;
      }
    }

    logger.info('[AURE Interaction] Quests refreshed', { userId, frequency, count: generatedQuests.length });
  } catch (error) {
    logger.error('[AURE Interaction] Failed to refresh quests', { error, userId, frequency });
  }
}

/**
 * Get default required count for quest type
 */
function getDefaultRequired(type: QuestType): number {
  switch (type) {
    case 'rate':
      return 3;
    case 'vs':
      return 5;
    case 'mix':
      return 2;
    case 'upload':
    case 'assist':
    case 'vibe':
    default:
      return 1;
  }
}

/**
 * Get fallback quest progress (when DB models don't exist)
 */
function getFallbackQuestProgress(userId: string): QuestProgress[] {
  return [
    {
      questId: 'daily-upload-fallback',
      progress: 0,
      required: 1,
      completedAt: null,
      quest: {
        id: 'daily-upload-fallback',
        type: 'upload',
        description: 'Upload 1 item for rating',
        rewardXp: 10,
        frequency: 'daily',
        required: 1,
      },
    },
    {
      questId: 'daily-rate-fallback',
      progress: 0,
      required: 3,
      completedAt: null,
      quest: {
        id: 'daily-rate-fallback',
        type: 'rate',
        description: 'Rate 3 items',
        rewardXp: 15,
        frequency: 'daily',
        required: 3,
      },
    },
    {
      questId: 'weekly-vs-fallback',
      progress: 0,
      required: 5,
      completedAt: null,
      quest: {
        id: 'weekly-vs-fallback',
        type: 'vs',
        description: 'Complete 5 VS comparisons',
        rewardXp: 50,
        frequency: 'weekly',
        required: 5,
      },
    },
  ];
}

/**
 * Increment quest progress by quest ID
 * New helper for explicit quest progress updates
 */
export async function incrementQuestProgress(
  userId: string,
  questId: string,
  amount: number = 1
): Promise<{ success: boolean; completed: boolean }> {
  try {
    // Get quest
    const quest = await prisma.quest.findUnique({
      where: { id: questId },
    });

    if (!quest) {
      throw new Error('Quest not found');
    }

    // Update progress
    try {
      const progress = await prisma.questProgress.upsert({
        where: {
          userId_questId: {
            userId,
            questId,
          },
        },
        create: {
          userId,
          questId,
          progress: amount,
          required: quest.required || getDefaultRequired(quest.type as QuestType),
        },
        update: {
          progress: {
            increment: amount,
          },
        },
      });

      const required = quest.required || getDefaultRequired(quest.type as QuestType);
      const isCompleted = progress.progress >= required && !progress.completedAt;

      if (isCompleted) {
        // Auto-complete quest
        await completeQuest(userId, questId);
        return { success: true, completed: true };
      }

      return { success: true, completed: false };
    } catch (error: any) {
      // If model doesn't exist yet, log and continue
      if (error.message?.includes('model') || error.message?.includes('QuestProgress')) {
        logger.warn('[AURE Interaction] QuestProgress model not found - Prisma migration required');
        return { success: false, completed: false };
      }
      throw error;
    }
  } catch (error) {
    logger.error('[AURE Interaction] Failed to increment quest progress', { error, userId, questId });
    return { success: false, completed: false };
  }
}

/**
 * Increment quest progress by type (legacy helper)
 * Called when user performs quest-related actions
 */
export async function incrementQuest(userId: string, questType: QuestType, amount: number = 1): Promise<void> {
  try {
    // Find matching quest
    const quests = await getActiveQuests(userId);
    const matchingQuest = quests.find((q) => q.quest.type === questType);

    if (!matchingQuest) {
      logger.warn('[AURE Interaction] No matching quest found', { userId, questType });
      return;
    }

    // Update progress
    try {
      await prisma.questProgress.upsert({
        where: {
          userId_questId: {
            userId,
            questId: matchingQuest.questId,
          },
        },
        create: {
          userId,
          questId: matchingQuest.questId,
          progress: amount,
          required: matchingQuest.required,
        },
        update: {
          progress: {
            increment: amount,
          },
        },
      });
    } catch (error: any) {
      // If model doesn't exist yet, log and continue
      if (error.message?.includes('model') || error.message?.includes('QuestProgress')) {
        logger.warn('[AURE Interaction] QuestProgress model not found - Prisma migration required');
        return;
      }
      throw error;
    }

    // Check if quest is completed
    const updated = await prisma.questProgress.findUnique({
      where: {
        userId_questId: {
          userId,
          questId: matchingQuest.questId,
        },
      },
    });

    if (updated && updated.progress >= matchingQuest.required && !updated.completedAt) {
      // Auto-complete quest
      await completeQuest(userId, matchingQuest.questId);
    }
  } catch (error) {
    logger.error('[AURE Interaction] Failed to increment quest', { error, userId, questType });
  }
}

/**
 * Complete a quest
 * Marks quest as completed and awards XP
 */
export async function completeQuest(userId: string, questId: string): Promise<{ success: boolean; xpAwarded: number }> {
  try {
    // Get quest
    const quests = await getActiveQuests(userId);
    const quest = quests.find((q) => q.questId === questId);

    if (!quest) {
      throw new Error('Quest not found');
    }

    // Mark as completed
    try {
      await prisma.questProgress.update({
        where: {
          userId_questId: {
            userId,
            questId,
          },
        },
        data: {
          completedAt: new Date(),
        },
      });

      // Award XP to user
      try {
        await awardXP(userId, quest.quest.rewardXp, `quest-${questId}`);
      } catch (error) {
        logger.warn('[AURE Interaction] Failed to award XP', { error, userId, questId });
        // Continue even if XP award fails
      }

      // Record faction contribution for quest completion (fire-and-forget)
      import('@/lib/aure/interaction/battleService')
        .then(({ recordFactionContribution }) => {
          return recordFactionContribution(userId, 'quest', 1);
        })
        .catch((error) => {
          // Silently fail - faction battles are optional
          logger.debug('[AURE Interaction] Failed to record faction contribution', { error, userId });
        });

      logger.info('[AURE Interaction] Quest completed', {
        userId,
        questId,
        xpReward: quest.quest.rewardXp,
      });

      return {
        success: true,
        xpAwarded: quest.quest.rewardXp,
      };
    } catch (error: any) {
      // If model doesn't exist yet, return placeholder
      if (error.message?.includes('model') || error.message?.includes('QuestProgress')) {
        logger.warn('[AURE Interaction] QuestProgress model not found - Prisma migration required');
        return {
          success: false,
          xpAwarded: 0,
        };
      }
      throw error;
    }
  } catch (error) {
    logger.error('[AURE Interaction] Failed to complete quest', { error, userId, questId });
    return {
      success: false,
      xpAwarded: 0,
    };
  }
}

