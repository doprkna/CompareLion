/**
 * Block Service
 * Block/mute user functionality and validation
 * v0.36.42 - Social Systems 1.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * Block a user
 * Prevents all interactions (feed, compare, follow)
 * 
 * @param userId - User ID blocking
 * @param blockedUserId - User ID to block
 * @returns Success result
 */
export async function blockUser(
  userId: string,
  blockedUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Cannot block yourself
    if (userId === blockedUserId) {
      return { success: false, error: 'Cannot block yourself' };
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: blockedUserId },
      select: { id: true },
    });

    if (!targetUser) {
      return { success: false, error: 'User not found' };
    }

    // Check if already blocked
    const existingBlock = await prisma.block.findUnique({
      where: {
        userId_blockedUserId: {
          userId,
          blockedUserId,
        },
      },
    });

    if (existingBlock) {
      return { success: false, error: 'User already blocked' };
    }

    // Create block relationship
    await prisma.block.create({
      data: {
        userId,
        blockedUserId,
      },
    });

    // Auto-unfollow if following
    try {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_targetId: {
            followerId: userId,
            targetId: blockedUserId,
          },
        },
      });

      if (follow) {
        await prisma.follow.delete({
          where: { id: follow.id },
        });
        logger.info(`[BlockService] Auto-unfollowed ${blockedUserId} after blocking`);
      }
    } catch (error) {
      // Don't fail block if unfollow fails
      logger.debug('[BlockService] Failed to auto-unfollow', error);
    }

    logger.info(`[BlockService] User ${userId} blocked ${blockedUserId}`);

    return { success: true };
  } catch (error) {
    logger.error('[BlockService] Failed to block user', { userId, blockedUserId, error });
    return { success: false, error: 'Failed to block user' };
  }
}

/**
 * Unblock a user
 * Removes block relationship
 * 
 * @param userId - User ID unblocking
 * @param blockedUserId - User ID to unblock
 * @returns Success result
 */
export async function unblockUser(
  userId: string,
  blockedUserId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const block = await prisma.block.findUnique({
      where: {
        userId_blockedUserId: {
          userId,
          blockedUserId,
        },
      },
    });

    if (!block) {
      return { success: false, error: 'User not blocked' };
    }

    await prisma.block.delete({
      where: { id: block.id },
    });

    logger.info(`[BlockService] User ${userId} unblocked ${blockedUserId}`);

    return { success: true };
  } catch (error) {
    logger.error('[BlockService] Failed to unblock user', { userId, blockedUserId, error });
    return { success: false, error: 'Failed to unblock user' };
  }
}

/**
 * Check if user is blocked
 * Returns true if either user has blocked the other
 */
export async function isUserBlocked(userId: string, targetUserId: string): Promise<boolean> {
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
    logger.error('[BlockService] Failed to check block status', { userId, targetUserId, error });
    return false;
  }
}

/**
 * Get blocked user IDs for a user
 */
export async function getBlockedUsers(userId: string): Promise<string[]> {
  try {
    const blocks = await prisma.block.findMany({
      where: { userId },
      select: { blockedUserId: true },
    });

    return blocks.map(b => b.blockedUserId);
  } catch (error) {
    logger.error('[BlockService] Failed to get blocked users', { userId, error });
    return [];
  }
}

/**
 * Validate that users can interact
 * Checks if either user has blocked the other
 * 
 * @param userA - First user ID
 * @param userB - Second user ID
 * @returns Validation result
 */
export async function validateInteraction(
  userA: string,
  userB: string
): Promise<{ canInteract: boolean; reason?: string }> {
  const isBlocked = await isUserBlocked(userA, userB);
  
  if (isBlocked) {
    return {
      canInteract: false,
      reason: 'User is blocked',
    };
  }

  return { canInteract: true };
}

/**
 * Filter out blocked users from a list
 * Removes any users that are blocked by or blocking the current user
 * 
 * @param userId - Current user ID
 * @param userIds - List of user IDs to filter
 * @returns Filtered list of user IDs
 */
export async function filterBlockedUsers(userId: string, userIds: string[]): Promise<string[]> {
  try {
    const blockedUsers = await getBlockedUsers(userId);
    
    // Also check reverse blocks (users who blocked current user)
    const blockingUsers = await prisma.block.findMany({
      where: { blockedUserId: userId },
      select: { userId: true },
    });

    const allBlocked = new Set([
      ...blockedUsers,
      ...blockingUsers.map(b => b.userId),
    ]);

    return userIds.filter(id => !allBlocked.has(id));
  } catch (error) {
    logger.error('[BlockService] Failed to filter blocked users', { userId, error });
    return userIds; // Return original list on error
  }
}

