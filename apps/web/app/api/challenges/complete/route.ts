import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const CompleteSchema = z.object({ challengeId: z.string().min(1) });

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = CompleteSchema.safeParse(body);
  if (!parsed.success) return validationError('Invalid completion payload');

  const challenge = await prisma.publicChallenge.findUnique({ where: { id: parsed.data.challengeId } });
  if (!challenge) return notFoundError('Challenge not found');

  await prisma.$transaction(async (tx) => {
    if ((challenge.rewardXP || 0) > 0) {
      await tx.user.update({ where: { id: user.id }, data: { xp: { increment: challenge.rewardXP || 0 } } });
    }
    await tx.actionLog.create({
      data: { userId: user.id, action: 'challenge_complete', metadata: { challengeId: challenge.id, rewardXP: challenge.rewardXP } as any },
    });
  });

  // Record faction contribution for challenge participation (fire-and-forget)
  import('@/lib/aure/interaction/battleService')
    .then(({ recordFactionContribution }) => {
      return recordFactionContribution(user.id, 'vs', 1);
    })
    .catch(() => {
      // Silently fail - faction battles are optional
    });

  return NextResponse.json({ success: true, completed: true });
});


