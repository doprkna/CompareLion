/**
 * AURE Interaction Engine - Adaptive Quest Generator
 * Generates personalized quests based on archetype and behavior
 * v0.39.6 - Intelligent Quests
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { getUserArchetype } from '@/lib/aure/life/archetypeService';
import { getArchetypeById } from '@/lib/aure/life/archetypes';
import { GEN_CONFIG } from '@parel/core/config/generator';

export type QuestType = 'upload' | 'rate' | 'vs' | 'assist' | 'mix' | 'vibe';
export type QuestFrequency = 'daily' | 'weekly';

export interface GeneratedQuest {
  id: string;
  type: QuestType;
  description: string;
  rewardXp: number;
  frequency: QuestFrequency;
  required: number;
}

/**
 * Generate adaptive quests for user
 * Based on archetype + recent behavior
 */
export async function generateQuestsForUser(
  userId: string,
  frequency: QuestFrequency
): Promise<GeneratedQuest[]> {
  try {
    // Get user archetype
    const userArchetype = await getUserArchetype(userId);
    const archetypeDetails = userArchetype
      ? getArchetypeById(userArchetype.archetypeId)
      : null;

    // Get recent behavior (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentRatings = await prisma.ratingResult.findMany({
      where: {
        request: {
          userId,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      },
      include: {
        request: {
          select: {
            category: true,
          },
        },
      },
      take: 20,
    });

    // Analyze behavior
    const categoryDistribution: Record<string, number> = {};
    recentRatings.forEach((result) => {
      const category = result.request.category;
      categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
    });

    const totalRecentRatings = recentRatings.length;
    const topCategory = Object.entries(categoryDistribution)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

    // Generate quests based on frequency
    if (frequency === 'daily') {
      return generateDailyQuests(userId, archetypeDetails, categoryDistribution, totalRecentRatings, topCategory);
    } else {
      return generateWeeklyQuests(userId, archetypeDetails, categoryDistribution, totalRecentRatings, topCategory);
    }
  } catch (error) {
    logger.error('[AURE Interaction] Failed to generate quests', { error, userId, frequency });
    return getFallbackQuests(frequency);
  }
}

/**
 * Generate 3 daily quests
 */
function generateDailyQuests(
  userId: string,
  archetypeDetails: any,
  categoryDistribution: Record<string, number>,
  totalRecentRatings: number,
  topCategory: string
): GeneratedQuest[] {
  const quests: GeneratedQuest[] = [];

  // Quest 1: Based on archetype
  if (archetypeDetails) {
    const archetypeQuest = getArchetypeDailyQuest(archetypeDetails, categoryDistribution);
    if (archetypeQuest) {
      quests.push(archetypeQuest);
    }
  }

  // Quest 2: Based on recent behavior
  const behaviorQuest = getBehaviorDailyQuest(categoryDistribution, totalRecentRatings, topCategory);
  if (behaviorQuest) {
    quests.push(behaviorQuest);
  }

  // Quest 3: Universal quest (always include)
  quests.push({
    id: `daily-rate-${Date.now()}`,
    type: 'rate',
    description: 'Rate 3 items today',
    rewardXp: 15,
    frequency: 'daily',
    required: 3,
  });

  // Ensure we have 3 quests
  while (quests.length < 3) {
    quests.push({
      id: `daily-upload-${Date.now()}-${quests.length}`,
      type: 'upload',
      description: 'Upload 1 item for rating',
      rewardXp: 10,
      frequency: 'daily',
      required: 1,
    });
  }

  return quests.slice(0, 3);
}

/**
 * Generate 1-2 weekly quests
 */
function generateWeeklyQuests(
  userId: string,
  archetypeDetails: any,
  categoryDistribution: Record<string, number>,
  totalRecentRatings: number,
  topCategory: string
): GeneratedQuest[] {
  const quests: GeneratedQuest[] = [];

  // Weekly quest based on archetype
  if (archetypeDetails) {
    const archetypeQuest = getArchetypeWeeklyQuest(archetypeDetails, categoryDistribution);
    if (archetypeQuest) {
      quests.push(archetypeQuest);
    }
  }

  // Fallback weekly quest
  if (quests.length === 0) {
    quests.push({
      id: `weekly-vs-${Date.now()}`,
      type: 'vs',
      description: 'Complete 5 VS comparisons this week',
      rewardXp: 50,
      frequency: 'weekly',
      required: 5,
    });
  }

  return quests;
}

/**
 * Get archetype-specific daily quest
 */
function getArchetypeDailyQuest(archetype: any, categoryDistribution: Record<string, number>): GeneratedQuest | null {
  const archetypeId = archetype.id;

  if (archetypeId === 'cozy-gremlin' || archetypeId === 'comfort-seeker') {
    return {
      id: `daily-cozy-${Date.now()}`,
      type: 'upload',
      description: 'Upload something cozy (room, snack, or outfit)',
      rewardXp: 12,
      frequency: 'daily',
      required: 1,
    };
  }

  if (archetypeId === 'minimalist-monk' || archetypeId === 'aesthetic-architect') {
    return {
      id: `daily-organize-${Date.now()}`,
      type: 'upload',
      description: 'Upload a clean, organized space or item',
      rewardXp: 12,
      frequency: 'daily',
      required: 1,
    };
  }

  if (archetypeId === 'snack-wizard') {
    return {
      id: `daily-snack-${Date.now()}`,
      type: 'upload',
      description: 'Rate a snack today',
      rewardXp: 12,
      frequency: 'daily',
      required: 1,
    };
  }

  if (archetypeId === 'chaos-goblin') {
    return {
      id: `daily-chaos-${Date.now()}`,
      type: 'upload',
      description: 'Upload something unexpected or chaotic',
      rewardXp: 12,
      frequency: 'daily',
      required: 1,
    };
  }

  return null;
}

/**
 * Get behavior-based daily quest
 */
function getBehaviorDailyQuest(
  categoryDistribution: Record<string, number>,
  totalRecentRatings: number,
  topCategory: string
): GeneratedQuest | null {
  // If user has many snacks, suggest outfit/desk quest
  if (topCategory === 'snack' && categoryDistribution['snack'] > 5) {
    return {
      id: `daily-diversify-${Date.now()}`,
      type: 'upload',
      description: 'Try rating an outfit or desk setup',
      rewardXp: 12,
      frequency: 'daily',
      required: 1,
    };
  }

  // If low uploads, suggest upload quest
  if (totalRecentRatings < 3) {
    return {
      id: `daily-upload-encourage-${Date.now()}`,
      type: 'upload',
      description: 'Upload something today',
      rewardXp: 10,
      frequency: 'daily',
      required: 1,
    };
  }

  // Default: VS quest
  return {
    id: `daily-vs-${Date.now()}`,
    type: 'vs',
    description: 'Complete 1 VS comparison',
    rewardXp: 10,
    frequency: 'daily',
    required: 1,
  };
}

/**
 * Get archetype-specific weekly quest
 */
function getArchetypeWeeklyQuest(archetype: any, categoryDistribution: Record<string, number>): GeneratedQuest | null {
  const archetypeId = archetype.id;

  if (archetypeId === 'vibe-curator' || archetypeId === 'aesthetic-architect') {
    return {
      id: `weekly-mix-${Date.now()}`,
      type: 'mix',
      description: 'Create 2 mix stories this week',
      rewardXp: 40,
      frequency: 'weekly',
      required: 2,
    };
  }

  if (archetypeId === 'snack-wizard') {
    return {
      id: `weekly-snack-explore-${Date.now()}`,
      type: 'upload',
      description: 'Rate 10 different snacks this week',
      rewardXp: 50,
      frequency: 'weekly',
      required: 10,
    };
  }

  // Default weekly quest
  return {
    id: `weekly-vs-${Date.now()}`,
    type: 'vs',
    description: 'Complete 5 VS comparisons this week',
    rewardXp: 50,
    frequency: 'weekly',
    required: 5,
  };
}

/**
 * Get fallback quests if generation fails
 */
function getFallbackQuests(frequency: QuestFrequency): GeneratedQuest[] {
  if (frequency === 'daily') {
    return [
      {
        id: 'daily-fallback-1',
        type: 'upload',
        description: 'Upload 1 item for rating',
        rewardXp: 10,
        frequency: 'daily',
        required: 1,
      },
      {
        id: 'daily-fallback-2',
        type: 'rate',
        description: 'Rate 3 items',
        rewardXp: 15,
        frequency: 'daily',
        required: 3,
      },
      {
        id: 'daily-fallback-3',
        type: 'vs',
        description: 'Complete 1 VS comparison',
        rewardXp: 10,
        frequency: 'daily',
        required: 1,
      },
    ];
  } else {
    return [
      {
        id: 'weekly-fallback-1',
        type: 'vs',
        description: 'Complete 5 VS comparisons this week',
        rewardXp: 50,
        frequency: 'weekly',
        required: 5,
      },
    ];
  }
}

/**
 * Check if quests need refresh
 * Returns true if no quests exist or if they're older than threshold
 */
export async function shouldRefreshQuests(
  userId: string,
  frequency: QuestFrequency
): Promise<boolean> {
  try {
    const thresholdHours = frequency === 'daily' ? 24 : 168; // 24h for daily, 7 days for weekly
    const threshold = new Date();
    threshold.setHours(threshold.getHours() - thresholdHours);

    // Check if any quests exist for this frequency
    // Note: This assumes Quest model has a frequency field
    // If not, we'll need to check QuestProgress records instead
    try {
      const existingQuests = await prisma.quest.findMany({
        where: {
          frequency: frequency === 'daily' ? 'daily' : 'weekly',
        },
        include: {
          progress: {
            where: { userId },
          },
        },
        take: 1,
      });

      if (existingQuests.length === 0) {
        return true; // No quests exist, need refresh
      }

      // Check if quests are old (simple check - if no progress records or old progress)
      const hasRecentProgress = existingQuests.some((quest) => {
        const progress = quest.progress[0];
        return progress && new Date(progress.createdAt) > threshold;
      });

      return !hasRecentProgress;
    } catch (error: any) {
      // If Quest model doesn't have frequency field, check QuestProgress directly
      if (error.message?.includes('frequency') || error.message?.includes('field')) {
        // Fallback: check if user has any recent progress
        try {
          const recentProgress = await prisma.questProgress.findFirst({
            where: {
              userId,
              createdAt: {
                gte: threshold,
              },
            },
          });
          return !recentProgress; // Refresh if no recent progress
        } catch {
          return true; // Default to refresh
        }
      }
      throw error;
    }

    if (existingQuests.length === 0) {
      return true; // No quests exist, need refresh
    }

    // Check if quests are old (simple check - if no progress records or old progress)
    const hasRecentProgress = existingQuests.some((quest) => {
      const progress = quest.progress[0];
      return progress && new Date(progress.createdAt) > threshold;
    });

    return !hasRecentProgress;
  } catch (error: any) {
    // If model doesn't exist, always refresh
    if (error.message?.includes('model') || error.message?.includes('Quest')) {
      return true;
    }
    logger.error('[AURE Interaction] Failed to check quest refresh', { error, userId, frequency });
    return true; // Default to refresh on error
  }
}

