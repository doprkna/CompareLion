/**
 * Follow Activity Notifications (privacy-safe)
 * Notify followers when followed user answers or posts. No content leakage.
 */
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

const DEDUPE_WINDOW_MS = 30 * 60 * 1000; // 30 min

export type FollowActivityType = 'ANSWERED' | 'POSTED';

export async function notifyFollowersOfActivity(opts: {
  actorUserId: string;
  activityType: FollowActivityType;
  entityType: string;
  entityId?: string;
  createdAt?: Date;
}): Promise<void> {
  const { actorUserId, activityType } = opts;
  const now = opts.createdAt ?? new Date();

  try {
    const followers = await prisma.userFollow.findMany({
      where: { followedId: actorUserId },
      select: { followerId: true },
    });
    if (followers.length === 0) return;

    const actor = await prisma.user.findUnique({
      where: { id: actorUserId },
      select: { name: true, username: true },
    });
    const actorName = actor?.name || actor?.username || 'Someone';
    const body =
      activityType === 'ANSWERED'
        ? 'They answered a question.'
        : 'They posted something.';

    for (const { followerId } of followers) {
      if (followerId === actorUserId) continue;

      const dedupeKey = `follow:${followerId}:${actorUserId}:${activityType}`;
      const windowStart = new Date(now.getTime() - DEDUPE_WINDOW_MS);
      const existing = await prisma.notification.findFirst({
        where: {
          userId: followerId,
          refId: dedupeKey,
          createdAt: { gte: windowStart },
        },
        select: { id: true },
      });
      if (existing) continue;

      await prisma.notification.create({
        data: {
          userId: followerId,
          type: 'follow_activity',
          title: `${actorName} was active`,
          body,
          refId: dedupeKey,
        },
      });
    }
  } catch (err) {
    logger.error('[notifyFollowersOfActivity] Failed', { actorUserId, activityType, err });
  }
}
