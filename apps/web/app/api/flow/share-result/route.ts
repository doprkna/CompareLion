import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse, unauthorizedError, validationError } from '@/lib/api-handler';
import { z } from 'zod';

const CreateFlowShareSchema = z.object({
  hookLine: z.string().min(3).max(180),
  insightTitle: z.string().min(3).max(180),
  insightSubtitle: z.string().min(3).max(240),
  archetypeLabel: z.string().min(2).max(80),
  moodLabel: z.string().min(2).max(40),
  ambientLine: z.string().min(3).max(180),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return unauthorizedError('User not found');

  const body = await req.json().catch(() => ({}));
  const parsed = CreateFlowShareSchema.safeParse(body);
  if (!parsed.success) return validationError('Invalid payload');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 14);

  const snapshot = {
    version: 1,
    ...parsed.data,
  };

  const share = await prisma.shareCard.create({
    data: {
      userId: user.id,
      type: 'flow_result',
      caption: JSON.stringify(snapshot),
      imageUrl: null,
      expiresAt,
    },
    select: { id: true, expiresAt: true },
  });

  return successResponse({
    shareId: share.id,
    shareUrl: `/r/${share.id}`,
    expiresAt: share.expiresAt,
  });
});
