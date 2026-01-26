/**
 * Feed Service
 * Generates feed posts from game actions
 * v0.36.25 - Community Feed 1.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export type FeedPostType =
  | 'achievement'
  | 'fight'
  | 'question'
  | 'levelup'
  | 'loot'
  | 'status'
  | 'milestone';

interface CreateFeedPostParams {
  userId: string;
  type: FeedPostType;
  content?: string;
  refId?: string;
  visibility?: string;
}

/**
 * Create a feed post
 */
export async function createFeedPost(params: CreateFeedPostParams): Promise<string> {
  try {
    const post = await prisma.feedPost.create({
      data: {
        userId: params.userId,
        type: params.type,
        content: params.content || null,
        refId: params.refId || null,
        visibility: params.visibility || 'public',
      },
    });

    logger.debug(`[FeedService] Created ${params.type} post for user ${params.userId}`);
    return post.id;
  } catch (error) {
    logger.error('[FeedService] Failed to create feed post', { params, error });
    throw error;
  }
}

/**
 * Post when user answers a question
 */
export async function postQuestionAnswered(userId: string, questionId: string): Promise<void> {
  await createFeedPost({
    userId,
    type: 'question',
    content: 'Made progress on personal growth.',
    refId: questionId,
  });
}

/**
 * Post when user finishes 5 questions (milestone)
 */
export async function postQuestionMilestone(userId: string, count: number): Promise<void> {
  await createFeedPost({
    userId,
    type: 'milestone',
    content: `Completed ${count} questions!`,
  });
}

/**
 * Post when user wins a fight
 */
export async function postFightWin(
  userId: string,
  fightId: string,
  enemyName: string
): Promise<void> {
  await createFeedPost({
    userId,
    type: 'fight',
    content: `You defeated ${enemyName} in the arena!`,
    refId: fightId,
  });
}

/**
 * Post when user loses a fight
 */
export async function postFightLoss(
  userId: string,
  fightId: string,
  enemyName: string
): Promise<void> {
  await createFeedPost({
    userId,
    type: 'fight',
    content: `You fought bravely against ${enemyName}.`,
    refId: fightId,
  });
}

/**
 * Post when user loots an item
 */
export async function postLoot(
  userId: string,
  itemId: string,
  itemName: string,
  rarity: string
): Promise<void> {
  await createFeedPost({
    userId,
    type: 'loot',
    content: `Found ${itemName} (${rarity}).`,
    refId: itemId,
  });
}

/**
 * Post when user levels up
 */
export async function postLevelUp(userId: string, newLevel: number): Promise<void> {
  await createFeedPost({
    userId,
    type: 'levelup',
    content: `Reached Level ${newLevel}!`,
  });
}

/**
 * Post when user unlocks an achievement
 */
export async function postAchievement(
  userId: string,
  achievementId: string,
  achievementTitle: string
): Promise<void> {
  await createFeedPost({
    userId,
    type: 'achievement',
    content: `Unlocked achievement: ${achievementTitle}`,
    refId: achievementId,
  });
}

/**
 * Post when user updates status message
 */
export async function postStatusUpdate(userId: string, statusMessage: string): Promise<void> {
  if (!statusMessage || statusMessage.length > 160) {
    return; // Skip invalid status messages
  }

  await createFeedPost({
    userId,
    type: 'status',
    content: statusMessage,
  });
}

/**
 * Create ComparePost when user answers a question (v0.36.31)
 */
export async function createComparePostFromAnswer(
  userId: string,
  questionId: string,
  answer: string,
  value?: number | string | object
): Promise<void> {
  try {
    const { prisma } = await import('@/lib/db');
    
    await prisma.comparePost.create({
      data: {
        userId,
        questionId,
        content: answer.length > 280 ? answer.slice(0, 280) : answer,
        value: value ? (typeof value === 'object' ? value : { value }) : null,
        visibility: 'public',
      },
    });

    logger.debug(`[CompareFeed] Created compare post for question ${questionId} by user ${userId}`);
  } catch (error) {
    logger.error('[CompareFeed] Failed to create compare post from answer', { userId, questionId, error });
    // Don't throw - this is non-critical
  }
}

