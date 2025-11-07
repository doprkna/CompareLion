import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const ResolveDreamSchema = z.object({
  userDreamId: z.string().min(1),
});

/**
 * POST /api/dreamspace/resolve
 * Applies dream effect (XP, karma, temporary mood)
 * Auth required
 * v0.29.16 - Dreamspace
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      xp: true,
      karmaScore: true,
      moodFeed: true,
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await req.json().catch(() => ({}));
  const parsed = ResolveDreamSchema.safeParse(body);
  if (!parsed.success) {
    return validationError('Invalid payload');
  }

  const { userDreamId } = parsed.data;

  // Get user dream event
  const userDream = await prisma.userDreamEvent.findUnique({
    where: { id: userDreamId },
    include: {
      dream: true,
    },
  });

  if (!userDream) {
    return notFoundError('Dream event not found');
  }

  // Verify ownership
  if (userDream.userId !== user.id) {
    return validationError('Not authorized to resolve this dream');
  }

  // Check if already resolved
  if (userDream.resolved) {
    return validationError('Dream already resolved');
  }

  // Parse effect from JSON
  const effect = userDream.dream.effect as any;
  const xpShift = effect?.xpShift || 0;
  const karmaFlux = effect?.karmaFlux || 0;
  const moodChange = effect?.moodChange || null;

  // Apply effects in transaction
  await prisma.$transaction(async (tx) => {
    // Update user dream as resolved
    await tx.userDreamEvent.update({
      where: { id: userDreamId },
      data: {
        resolved: true,
        resolvedAt: new Date(),
      },
    });

    // Apply XP shift (±5% variance)
    if (xpShift !== 0) {
      const currentXP = user.xp || 0;
      const xpChange = Math.round(currentXP * (xpShift / 100));
      await tx.user.update({
        where: { id: user.id },
        data: {
          xp: currentXP + xpChange,
        },
      });
    }

    // Apply karma flux
    if (karmaFlux !== 0) {
      const currentKarma = user.karmaScore || 0;
      await tx.user.update({
        where: { id: user.id },
        data: {
          karmaScore: currentKarma + karmaFlux,
        },
      });
    }

    // Apply mood change (temporary, stored in moodFeed)
    if (moodChange) {
      await tx.user.update({
        where: { id: user.id },
        data: {
          moodFeed: moodChange,
        },
      });
    }
  });

  return successResponse({
    success: true,
    dream: {
      id: userDream.dream.id,
      title: userDream.dream.title,
      description: userDream.dream.description,
      flavorTone: userDream.dream.flavorTone,
      effect: {
        xpShift,
        karmaFlux,
        moodChange,
      },
    },
    message: `🌙 Dream resolved — ${xpShift !== 0 ? `XP: ${xpShift > 0 ? '+' : ''}${xpShift}%` : ''}${karmaFlux !== 0 ? ` Karma: ${karmaFlux > 0 ? '+' : ''}${karmaFlux}` : ''}${moodChange ? ` Mood: ${moodChange}` : ''}`,
  });
});

