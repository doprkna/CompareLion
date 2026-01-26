/**
 * Follow Service
 * Follow/unfollow user functionality
 * v0.36.42 - Social Systems 1.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * Follow a user
 * Creates a one-way follow relationship
 * 
 * @param followerId - User ID of the follower
 * @param targetId - User ID to follow
 * @returns Success result
 */
export async function followUser(
  followerId: string,
  targetId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Cannot follow yourself
    if (followerId === targetId) {
      return { success: false, error: 'Cannot follow yourself' };
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true },
    });

    if (!targetUser) {
      return { success: false, error: 'User not found' };
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_targetId: {
          followerId,
          targetId,
        },
      },
    });

    if (existingFollow) {
      return { success: false, error: 'Already following this user' };
    }

    // Check if blocked
    const isBlocked = await isUserBlocked(followerId, targetId);
    if (isBlocked) {
      return { success: false, error: 'Cannot follow blocked user' };
    }

    // Create follow relationship
    await prisma.follow.create({
      data: {
        followerId,
        targetId,
      },
    });

    logger.info(`[FollowService] User ${followerId} followed ${targetId}`);

    return { success: true };
  } catch (error) {
    logger.error('[FollowService] Failed to follow user', { followerId, targetId, error });
    return { success: false, error: 'Failed to follow user' };
  }
}

/**
 * Unfollow a user
 * Removes follow relationship
 * 
 * @param followerId - User ID of the follower
 * @param targetId - User ID to unfollow
 * @returns Success result
 */
export async function unfollowUser(
  followerId: string,
  targetId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_targetId: {
          followerId,
          targetId,
        },
      },
    });

    if (!follow) {
      return { success: false, error: 'Not following this user' };
    }

    await prisma.follow.delete({
      where: { id: follow.id },
    });

    logger.info(`[FollowService] User ${followerId} unfollowed ${targetId}`);

    return { success: true };
  } catch (error) {
    logger.error('[FollowService] Failed to unfollow user', { followerId, targetId, error });
    return { success: false, error: 'Failed to unfollow user' };
  }
}

/**
 * Check if user is following another user
 */
export async function isFollowing(followerId: string, targetId: string): Promise<boolean> {
  try {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_targetId: {
          followerId,
          targetId,
        },
      },
    });

    return !!follow;
  } catch (error) {
    logger.error('[FollowService] Failed to check follow status', { followerId, targetId, error });
    return false;
  }
}

/**
 * Get users that a user is following
 */
export async function getFollowing(userId: string): Promise<string[]> {
  try {
    const follows = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { targetId: true },
    });

    return follows.map(f => f.targetId);
  } catch (error) {
    logger.error('[FollowService] Failed to get following', { userId, error });
    return [];
  }
}

/**
 * Get users that follow a user (followers)
 */
export async function getFollowers(userId: string): Promise<string[]> {
  try {
    const follows = await prisma.follow.findMany({
      where: { targetId: userId },
      select: { followerId: true },
    });

    return follows.map(f => f.followerId);
  } catch (error) {
    logger.error('[FollowService] Failed to get followers', { userId, error });
    return [];
  }
}

/**
 * Check if user is blocked (helper for blockService)
 */
async function isUserBlocked(userId: string, targetUserId: string): Promise<boolean> {
  try {
    // Check if userId blocked targetUserId
    const block1 = await prisma.block.findUnique({
      where: {
        userId_blockedUserId: {
          userId,
          blockedUserId: targetUserId,
        },
      },
    });

    // Check if targetUserId blocked userId
    const block2 = await prisma.block.findUnique({
      where: {
        userId_blockedUserId: {
          userId: targetUserId,
          blockedUserId: userId,
        },
      },
    });

    return !!block1 || !!block2;
  } catch (error) {
    logger.error('[FollowService] Failed to check block status', { userId, targetUserId, error });
    return false;
  }
}

