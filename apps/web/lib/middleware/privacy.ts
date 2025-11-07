/**
 * Privacy Middleware (v0.29.30)
 * Access control helpers for privacy settings
 */

import { prisma } from '@/lib/db';

export type PrivacyLevel = 'private' | 'mid' | 'public';

export interface PrivacySettings {
  privacyLevel: PrivacyLevel;
  showComparisons: boolean;
  showStats: boolean;
}

/**
 * Get user's privacy settings
 */
export async function getUserPrivacySettings(userId: string): Promise<PrivacySettings> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      settings: true,
      allowPublicCompare: true,
    },
  });

  if (!user) {
    return {
      privacyLevel: 'private',
      showComparisons: false,
      showStats: false,
    };
  }

  const settings = (user.settings as any) || {};
  return {
    privacyLevel: settings.privacyLevel || 'mid',
    showComparisons: settings.showComparisons !== undefined ? settings.showComparisons : (user.allowPublicCompare ?? true),
    showStats: settings.showStats !== undefined ? settings.showStats : true,
  };
}

/**
 * Check if user can view target user's stats
 */
export async function canViewStats(
  viewerId: string,
  targetId: string
): Promise<boolean> {
  if (viewerId === targetId) {
    return true; // Always can view own stats
  }

  const targetPrivacy = await getUserPrivacySettings(targetId);
  
  if (targetPrivacy.privacyLevel === 'private') {
    return false;
  }

  if (targetPrivacy.privacyLevel === 'mid') {
    // Check if users are friends (future enhancement)
    // For MVP, mid allows viewing if showStats is true
    return targetPrivacy.showStats;
  }

  // Public: can view if showStats is true
  return targetPrivacy.showStats;
}

/**
 * Check if user can compare with target user
 */
export async function canCompare(
  viewerId: string,
  targetId: string
): Promise<boolean> {
  if (viewerId === targetId) {
    return true; // Always can compare with self
  }

  const viewerPrivacy = await getUserPrivacySettings(viewerId);
  const targetPrivacy = await getUserPrivacySettings(targetId);

  // Both must allow comparisons
  if (!viewerPrivacy.showComparisons || !targetPrivacy.showComparisons) {
    return false;
  }

  // Private level: no comparisons
  if (viewerPrivacy.privacyLevel === 'private' || targetPrivacy.privacyLevel === 'private') {
    return false;
  }

  // Mid level: only friends (future enhancement)
  // For MVP, mid allows comparisons
  if (viewerPrivacy.privacyLevel === 'mid' || targetPrivacy.privacyLevel === 'mid') {
    // TODO: Check if users are friends
    return true; // For MVP, allow comparisons
  }

  // Public: allowed
  return true;
}

/**
 * Check if user can appear in leaderboards
 */
export async function canAppearInLeaderboard(userId: string): Promise<boolean> {
  const privacy = await getUserPrivacySettings(userId);
  
  // Only public users appear in leaderboards
  return privacy.privacyLevel === 'public' && privacy.showStats;
}

