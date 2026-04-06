/**
 * POST /api/polls/respond
 *
 * Badge system (reused for Alpha Feedback):
 * - Source of truth: Badge table (key, name, icon); UserBadge links user<->badge; User.badgeType for header display.
 * - Registry/seed: apps/web/lib/services/seedBadges.ts (CORE_BADGES), ensureAlphaFeedbackPoll for ALPHA_CONTRIBUTOR.
 * - Granting: create UserBadge (userId, badgeId); set User.badgeType for header. Idempotent: check hasBadge before create.
 * - Rendered: components/UserBadge.tsx (badgeConfig), profile userBadges, compare page.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';
import { ALPHA_FEEDBACK_PACK_KEY, ALPHA_CONTRIBUTOR_BADGE_KEY } from '@parel/db';
import { FEEDBACK_REWARD_XP, FEEDBACK_REWARD_COINS } from '@/lib/config';

const RespondSchema = z.object({
  pollId: z.string().min(1),
  optionIdx: z.number().int().min(0).optional(),
  freetext: z.string().min(1).max(500).optional(),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, feedbackRewardClaimed: true, badgeType: true },
  });
  if (!user) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = RespondSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message || 'Invalid response payload');
  }

  const poll = await prisma.publicPoll.findUnique({ where: { id: parsed.data.pollId } });
  if (!poll) return notFoundError('Poll not found');

  if (poll.expiresAt && poll.expiresAt <= new Date()) {
    return validationError('Poll expired');
  }

  // Enforce one response per user per poll
  const existing = await prisma.pollResponse.findFirst({ where: { pollId: poll.id, userId: user.id } });
  if (existing) {
    return validationError('Already responded');
  }

  if (parsed.data.freetext && !poll.allowFreetext) {
    return validationError('Freetext not allowed');
  }
  if (parsed.data.optionIdx != null) {
    if (parsed.data.optionIdx < 0 || parsed.data.optionIdx >= (poll.options?.length || 0)) {
      return validationError('Invalid option index');
    }
  }
  const hasChoice = parsed.data.optionIdx != null;
  const hasFreetext = parsed.data.freetext != null && parsed.data.freetext.trim().length > 0;
  const isFreetextOnly = (poll.options?.length ?? 0) === 0 && poll.allowFreetext;
  if (!hasChoice && !hasFreetext && !isFreetextOnly) {
    return validationError('Provide optionIdx or freetext');
  }

  const regionHeader = req.headers.get('x-region') || undefined;
  const isAlphaFeedbackPack = poll.packKey === ALPHA_FEEDBACK_PACK_KEY;

  await prisma.$transaction(async (tx) => {
    await tx.pollResponse.create({
      data: {
        pollId: poll.id,
        userId: user.id,
        optionIdx: parsed.data.optionIdx ?? null,
        freetext: parsed.data.freetext ?? null,
        region: regionHeader || poll.region || 'GLOBAL',
      },
    });

    // Per-poll XP (skip for alpha feedback pack; use pack reward on completion)
    if (!isAlphaFeedbackPack && (poll.rewardXP || 0) > 0) {
      await tx.user.update({ where: { id: user.id }, data: { xp: { increment: poll.rewardXP || 0 } } });
      await tx.actionLog.create({
        data: { userId: user.id, action: 'poll_vote', metadata: { pollId: poll.id, rewardXP: poll.rewardXP } as any },
      });
    }

    // Alpha feedback pack: grant XP+coins when all 5 polls completed (once per user)
    if (isAlphaFeedbackPack && !user.feedbackRewardClaimed) {
      const packPollIds = await tx.publicPoll.findMany({
        where: { packKey: ALPHA_FEEDBACK_PACK_KEY },
        select: { id: true },
      });
      const respondedCount = await tx.pollResponse.count({
        where: {
          userId: user.id,
          pollId: { in: packPollIds.map((p) => p.id) },
        },
      });
      if (respondedCount >= 5) {
        const badge = await tx.badge.findUnique({ where: { key: ALPHA_CONTRIBUTOR_BADGE_KEY } });
        const userUpdateData: { xp?: { increment: number }; coins?: { increment: number }; feedbackRewardClaimed: boolean; badgeType?: string } = {
          xp: { increment: FEEDBACK_REWARD_XP },
          coins: { increment: FEEDBACK_REWARD_COINS },
          feedbackRewardClaimed: true,
        };
        if (badge) {
          const hasBadge = await tx.userBadge.findUnique({
            where: { userId_badgeId: { userId: user.id, badgeId: badge.id } },
          });
          if (!hasBadge) {
            await tx.userBadge.create({
              data: { userId: user.id, badgeId: badge.id, isClaimed: false },
            });
          }
          const currentBadge = (user as { badgeType?: string | null }).badgeType;
          if (!currentBadge || currentBadge === 'none') {
            userUpdateData.badgeType = 'alpha_contributor';
          }
        }
        await tx.user.update({
          where: { id: user.id },
          data: userUpdateData,
        });
        await tx.actionLog.create({
          data: {
            userId: user.id,
            action: 'poll_vote',
            metadata: {
              pollPackKey: ALPHA_FEEDBACK_PACK_KEY,
              rewardXP: FEEDBACK_REWARD_XP,
              rewardCoins: FEEDBACK_REWARD_COINS,
              feedbackRewardClaimed: true,
            } as any,
          },
        });
      }
    }
  });

  return NextResponse.json({ success: true });
});


