import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const LeaveSchema = z.object({
  clanId: z.string().min(1),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = LeaveSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message || 'Invalid payload');
  }

  // Find clan
  const clan = await prisma.microClan.findUnique({
    where: { id: parsed.data.clanId },
  });

  if (!clan || !clan.isActive) return notFoundError('Clan not found or inactive');

  // If user is leader, cannot leave (must disband or transfer leadership first)
  if (clan.leaderId === user.id) {
    return validationError('Leader cannot leave; transfer leadership or disband clan');
  }

  // Check if user is a member
  if (!clan.memberIds.includes(user.id)) {
    return validationError('User is not a member of this clan');
  }

  // Remove user from memberIds
  await prisma.microClan.update({
    where: { id: clan.id },
    data: {
      memberIds: {
        set: clan.memberIds.filter((id) => id !== user.id),
      },
    },
  });

  // Log action
  await prisma.actionLog.create({
    data: {
      userId: user.id,
      action: 'micro_clan_leave',
      metadata: {
        clanId: clan.id,
        clanName: clan.name,
      } as any,
    },
  }).catch(() => {});

  return NextResponse.json({
    success: true,
    message: 'Left clan successfully',
  });
});

