import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, forbiddenError } from '@/lib/api-handler';
import { z } from 'zod';

const ReqSchema = z.object({ targetId: z.string().min(1), type: z.enum(['friend','rival','mentor','romance']) });

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = ReqSchema.safeParse(body);
  if (!parsed.success) return validationError('Invalid request');

  if (parsed.data.targetId === me.id) return validationError('Cannot add yourself');

  const target = await prisma.user.findUnique({ where: { id: parsed.data.targetId }, select: { id: true, canBeAdded: true } });
  if (!target) return validationError('Target not found');

  if (target.canBeAdded === 'noOne') return forbiddenError('User does not accept requests');
  if (target.canBeAdded === 'friendsOnly') {
    const existingFriend = await prisma.affinity.findFirst({ where: {
      type: 'friend', mutual: true,
      OR: [
        { sourceId: me.id, targetId: target.id },
        { sourceId: target.id, targetId: me.id },
      ]
    }});
    if (!existingFriend) return forbiddenError('Only friends can send requests');
  }

  // Create one-sided affinity (pending)
  await prisma.affinity.create({ data: {
    sourceId: me.id,
    targetId: target.id,
    type: parsed.data.type,
    mutual: false,
  }});

  return NextResponse.json({ success: true, requested: true });
});


