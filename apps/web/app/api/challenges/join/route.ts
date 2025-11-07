import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const JoinSchema = z.object({ challengeId: z.string().min(1) });

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = JoinSchema.safeParse(body);
  if (!parsed.success) return validationError('Invalid join payload');

  const challenge = await prisma.publicChallenge.findUnique({ where: { id: parsed.data.challengeId } });
  if (!challenge) return notFoundError('Challenge not found');

  // Log join (MVP) via ActionLog
  await prisma.actionLog.create({
    data: { userId: user.id, action: 'challenge_join', metadata: { challengeId: challenge.id } as any },
  });

  return NextResponse.json({ success: true, joined: true });
});


