import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const LikeSchema = z.object({
  creationId: z.string().min(1),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = LikeSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message || 'Invalid payload');
  }

  const creation = await prisma.communityCreation.findUnique({
    where: { id: parsed.data.creationId },
  });

  if (!creation) return notFoundError('Creation not found');
  if (creation.status !== 'approved') {
    return validationError('Can only like approved creations');
  }

  // Check if already liked
  const existing = await prisma.communityCreationLike.findUnique({
    where: {
      userId_creationId: {
        userId: user.id,
        creationId: creation.id,
      },
    },
  });

  if (existing) {
    return validationError('Already liked');
  }

  await prisma.$transaction(async (tx) => {
    await tx.communityCreationLike.create({
      data: {
        userId: user.id,
        creationId: creation.id,
      },
    });

    await tx.communityCreation.update({
      where: { id: creation.id },
      data: { likes: { increment: 1 } },
    });
  });

  return NextResponse.json({ success: true, liked: true });
});

