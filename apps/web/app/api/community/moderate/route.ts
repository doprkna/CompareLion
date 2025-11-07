import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const ModerateSchema = z.object({
  creationId: z.string().min(1),
  status: z.enum(['approved', 'rejected']),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || user.role !== 'ADMIN') return unauthorizedError('Admin only');

  const body = await req.json().catch(() => ({}));
  const parsed = ModerateSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message || 'Invalid payload');
  }

  const creation = await prisma.communityCreation.findUnique({
    where: { id: parsed.data.creationId },
    include: { user: true },
  });

  if (!creation) return notFoundError('Creation not found');

  await prisma.$transaction(async (tx) => {
    await tx.communityCreation.update({
      where: { id: creation.id },
      data: { status: parsed.data.status },
    });

    // Grant rewards if approved
    if (parsed.data.status === 'approved' && (creation.rewardXP || creation.rewardKarma)) {
      if (creation.rewardXP && creation.rewardXP > 0) {
        await tx.user.update({
          where: { id: creation.userId },
          data: { xp: { increment: creation.rewardXP } },
        });
      }
      if (creation.rewardKarma && creation.rewardKarma > 0) {
        await tx.user.update({
          where: { id: creation.userId },
          data: { karmaScore: { increment: creation.rewardKarma } },
        });
      }

      // Log action
      await tx.actionLog.create({
        data: {
          userId: creation.userId,
          action: 'community_creation_approved',
          metadata: {
            creationId: creation.id,
            rewardXP: creation.rewardXP,
            rewardKarma: creation.rewardKarma,
          } as any,
        },
      });
    }
  });

  return NextResponse.json({
    success: true,
    creation: {
      id: creation.id,
      status: parsed.data.status,
    },
  });
});

