import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError } from '@/lib/api-handler';
import { z } from 'zod';

const CreateSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  buffType: z.enum(['xp', 'gold', 'karma', 'compare', 'reflect']),
  buffValue: z.number().min(1.0).max(1.5).optional().default(1.05),
  seasonId: z.string().optional(),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message || 'Invalid payload');
  }

  // Check if user already has an active clan (one per season)
  const seasonId = parsed.data.seasonId || null;
  const existingClan = await prisma.microClan.findFirst({
    where: {
      leaderId: user.id,
      isActive: true,
      ...(seasonId ? { seasonId } : { seasonId: null }),
    },
  });

  if (existingClan) {
    return validationError('User already has an active clan for this season');
  }

  // Create clan with stats
  const clan = await prisma.$transaction(async (tx) => {
    const newClan = await tx.microClan.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        leaderId: user.id,
        memberIds: [], // Empty initially (leader not in memberIds)
        buffType: parsed.data.buffType,
        buffValue: parsed.data.buffValue,
        seasonId,
      },
    });

    // Create stats record
    await tx.microClanStats.create({
      data: {
        clanId: newClan.id,
        xpTotal: 0,
        activityScore: 0,
        rank: 9999,
      },
    });

    // Log action
    await tx.actionLog.create({
      data: {
        userId: user.id,
        action: 'micro_clan_create',
        metadata: {
          clanId: newClan.id,
          name: newClan.name,
          buffType: newClan.buffType,
        } as any,
      },
    }).catch(() => {});

    return newClan;
  });

  return NextResponse.json({
    success: true,
    clan: {
      id: clan.id,
      name: clan.name,
      description: clan.description,
      buffType: clan.buffType,
      buffValue: clan.buffValue,
      seasonId: clan.seasonId,
      memberCount: 1, // Leader only
    },
  });
});

