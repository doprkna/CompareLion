import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const RespondSchema = z.object({
  pollId: z.string().min(1),
  optionIdx: z.number().int().min(0).optional(),
  freetext: z.string().min(1).max(500).optional(),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
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
  if (!parsed.data.freetext && parsed.data.optionIdx == null) {
    return validationError('Provide optionIdx or freetext');
  }

  const regionHeader = req.headers.get('x-region') || undefined;

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
    // Reward XP (simple):
    if ((poll.rewardXP || 0) > 0) {
      await tx.user.update({ where: { id: user.id }, data: { xp: { increment: poll.rewardXP || 0 } } });
      await tx.actionLog.create({
        data: { userId: user.id, action: 'poll_vote', metadata: { pollId: poll.id, rewardXP: poll.rewardXP } as any },
      });
    }
  });

  return NextResponse.json({ success: true });
});


