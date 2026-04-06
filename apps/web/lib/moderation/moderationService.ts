/**
 * Central moderation service
 */

import { prisma } from '@/lib/db';
import { autoFlag, REPORT_THRESHOLD, HOURS_WINDOW } from './autoFlag';
import type { ModerationStatus, ContentRating } from '@prisma/client';

export type ModeratableEntityType = 'question' | 'comment' | 'pack' | 'flow' | 'post' | 'feed_post';

export interface EnsureModerationInput {
  entityType: string;
  entityId: string;
  userId?: string | null;
  text?: string;
  rating?: ContentRating;
}

/**
 * Ensure ModerationEntity exists, run auto-flag, return entity.
 */
export async function ensureModerationEntity(input: EnsureModerationInput) {
  const existing = await prisma.moderationEntity.findUnique({
    where: {
      entityType_entityId: { entityType: input.entityType, entityId: input.entityId },
    },
  });

  if (existing) {
    return existing;
  }

  const entity = await prisma.moderationEntity.create({
    data: {
      entityType: input.entityType,
      entityId: input.entityId,
      userId: input.userId ?? null,
      status: 'VISIBLE',
      rating: input.rating ?? 'GENERAL',
    },
  });

  if (input.text) {
    let user: { createdAt?: Date } | null = null;
    if (input.userId) {
      user = await prisma.user.findUnique({
        where: { id: input.userId },
        select: { createdAt: true },
      });
    }
    const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let postCount = 0;
    if (input.userId) {
      if (input.entityType === 'comment') {
        postCount = await prisma.comment.count({
          where: { userId: input.userId, createdAt: { gte: cutoff24h } },
        });
      } else if (input.entityType === 'post' || input.entityType === 'feed_post') {
        postCount = await prisma.feedPost.count({
          where: { userId: input.userId, createdAt: { gte: cutoff24h } },
        });
      }
    }

    const { scoreDelta, shouldFlag } = autoFlag({
      text: input.text,
      userId: input.userId ?? undefined,
      accountCreatedAt: user?.createdAt,
      postCountLast24h: postCount,
      entityType: input.entityType,
    });

    if (scoreDelta > 0 || shouldFlag) {
      await prisma.moderationEntity.update({
        where: { id: entity.id },
        data: {
          autoFlagScore: entity.autoFlagScore + scoreDelta,
          isAutoFlagged: shouldFlag,
          status: shouldFlag ? 'PENDING_REVIEW' : 'VISIBLE',
        },
      });
      return prisma.moderationEntity.findUniqueOrThrow({
        where: { id: entity.id },
      });
    }
  }

  return entity;
}

/**
 * Can user see this entity? Visibility rules.
 */
export function canUserSeeEntity(
  viewerId: string | null,
  entityUserId: string | null,
  status: ModerationStatus
): boolean {
  switch (status) {
    case 'VISIBLE':
    case 'APPROVED':
      return true;
    case 'PENDING_REVIEW':
    case 'FLAGGED':
      return !!viewerId && viewerId === entityUserId;
    case 'REJECTED':
      return false;
    case 'SHADOW_BANNED':
      return !!viewerId && viewerId === entityUserId;
    default:
      return false;
  }
}

/**
 * Is content rating allowed for user age?
 * birthYear null = safe mode (GENERAL only)
 */
export function isRatingAllowedForUser(
  rating: ContentRating,
  birthYear: number | null
): boolean {
  if (rating === 'GENERAL') return true;
  if (!birthYear) return false;
  const age = new Date().getFullYear() - birthYear;
  if (rating === 'TEEN') return age >= 13;
  if (rating === 'ADULT') return age >= 18;
  return true;
}

/**
 * Increment autoFlagScore and optionally move to PENDING_REVIEW if threshold hit.
 */
export async function recordReportAndMaybeFlag(
  entityType: string,
  entityId: string,
  reporterId: string,
  reason: string,
  message?: string | null
) {
  const mod = await prisma.moderationEntity.findUnique({
    where: { entityType_entityId: { entityType, entityId } },
  });

  if (!mod) return;

  const newScore = mod.autoFlagScore + 1;
  const reportCount = await prisma.contentReport.count({
    where: {
      entityType,
      entityId,
      createdAt: { gte: new Date(Date.now() - HOURS_WINDOW * 60 * 60 * 1000) },
    },
  });

  const shouldFlag = reportCount >= REPORT_THRESHOLD || newScore >= 5;

  await prisma.moderationEntity.update({
    where: { id: mod.id },
    data: {
      autoFlagScore: newScore,
      isAutoFlagged: shouldFlag,
      status: shouldFlag ? 'PENDING_REVIEW' : mod.status,
    },
  });
}

export { REPORT_THRESHOLD };
