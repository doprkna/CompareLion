/**
 * Badge Service
 * v0.17.0 - Award badges for UGC & Events achievements
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

/**
 * Check and award UGC-related badges to a user
 */
export async function checkUGCBadges(userId: string): Promise<string[]> {
  const awardedBadges: string[] = [];

  try {
    // Get user's submission stats
    const submissions = await prisma.userSubmission.findMany({
      where: { userId },
      select: {
        status: true,
        upvotes: true,
        score: true,
      },
    });

    const approvedCount = submissions.filter(s => s.status === 'APPROVED').length;
    const totalUpvotes = submissions.reduce((sum, s) => sum + s.upvotes, 0);
    const maxScore = Math.max(...submissions.map(s => s.score), 0);

    // Check First Submission Badge
    if (submissions.length >= 1) {
      const awarded = await awardBadge(userId, 'ugc_first_submission');
      if (awarded) awardedBadges.push('ugc_first_submission');
    }

    // Check Approved Creator Badge
    if (approvedCount >= 1) {
      const awarded = await awardBadge(userId, 'ugc_first_approved');
      if (awarded) awardedBadges.push('ugc_first_approved');
    }

    // Check Top Contributor Badge
    if (approvedCount >= 10) {
      const awarded = await awardBadge(userId, 'ugc_top_contributor');
      if (awarded) awardedBadges.push('ugc_top_contributor');
    }

    // Check Upvote Champion Badge
    if (totalUpvotes >= 100) {
      const awarded = await awardBadge(userId, 'ugc_upvote_champion');
      if (awarded) awardedBadges.push('ugc_upvote_champion');
    }

    // Check Community Favorite Badge
    if (maxScore >= 50) {
      const awarded = await awardBadge(userId, 'ugc_community_favorite');
      if (awarded) awardedBadges.push('ugc_community_favorite');
    }

    return awardedBadges;
  } catch (error) {
    logger.error('[BADGE_SERVICE] Error checking UGC badges', error);
    return awardedBadges;
  }
}

/**
 * Award a badge to a user if they don't already have it
 */
async function awardBadge(userId: string, badgeSlug: string): Promise<boolean> {
  try {
    // Find badge
    const badge = await prisma.badge.findUnique({
      where: { slug: badgeSlug },
      select: { id: true },
    });

    if (!badge) {
      logger.warn('[BADGE_SERVICE] Badge not found', { badgeSlug });
      return false;
    }

    // Check if user already has badge
    const existingBadge = await prisma.userBadge.findFirst({
      where: {
        userId,
        badgeId: badge.id,
      },
    });

    if (existingBadge) {
      return false; // Already has badge
    }

    // Award badge
    await prisma.userBadge.create({
      data: {
        userId,
        badgeId: badge.id,
      },
    });

    // Create notification
    try {
      await prisma.notification.create({
        data: {
          userId,
          title: 'New Badge Earned! 🎉',
          message: `You earned the "${badgeSlug.replace('_', ' ')}" badge!`,
          type: 'success',
          read: false,
        },
      });
    } catch (error) {
      logger.error('[BADGE_SERVICE] Failed to create notification', error);
    }

    return true;
  } catch (error) {
    logger.error('[BADGE_SERVICE] Error awarding badge', { badgeSlug, error });
    return false;
  }
}

/**
 * Check event participation badges
 */
export async function checkEventBadges(userId: string): Promise<string[]> {
  const awardedBadges: string[] = [];

  try {
    // TODO: Implement event participation tracking
    // For now, this is a placeholder for when event participation is tracked
    
    // const participationCount = await getEventParticipationCount(userId);
    
    // if (participationCount >= 1) {
    //   const awarded = await awardBadge(userId, 'event_participant');
    //   if (awarded) awardedBadges.push('event_participant');
    // }
    
    // if (participationCount >= 10) {
    //   const awarded = await awardBadge(userId, 'event_champion');
    //   if (awarded) awardedBadges.push('event_champion');
    // }

    return awardedBadges;
  } catch (error) {
    logger.error('[BADGE_SERVICE] Error checking event badges', error);
    return awardedBadges;
  }
}

