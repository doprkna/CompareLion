import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const JoinSchema = z.object({
  clanId: z.string().min(1),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = JoinSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message || 'Invalid payload');
  }

  // Find clan
  const clan = await prisma.microClan.findUnique({
    where: { id: parsed.data.clanId },
    include: { stats: true },
  });

  if (!clan || !clan.isActive) return notFoundError('Clan not found or inactive');

  // Check if user is already in clan
  if (clan.leaderId === user.id || clan.memberIds.includes(user.id)) {
    return validationError('User already in clan');
  }

  // Check if clan is full (max 5: leader + 4 members)
  const currentMemberCount = clan.memberIds.length + 1; // +1 for leader
  if (currentMemberCount >= 5) {
    return validationError('Clan is full (max 5 members)');
  }

  // Add user to memberIds
  await prisma.microClan.update({
    where: { id: clan.id },
    data: {
      memberIds: {
        push: user.id,
      },
    },
  });

  // Log action
  await prisma.actionLog.create({
    data: {
      userId: user.id,
      action: 'micro_clan_join',
      metadata: {
        clanId: clan.id,
        clanName: clan.name,
      } as any,
    },
  }).catch(() => {});

  return NextResponse.json({
    success: true,
    message: 'Joined clan successfully',
    clan: {
      id: clan.id,
      name: clan.name,
      memberCount: currentMemberCount + 1,
    },
  });
});

