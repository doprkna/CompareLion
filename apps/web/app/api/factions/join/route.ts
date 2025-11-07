import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const JoinSchema = z.object({
  factionId: z.string().min(1),
});

const JOIN_COOLDOWN_DAYS = 7;

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

  const faction = await prisma.faction.findUnique({ where: { id: parsed.data.factionId } });
  if (!faction || !faction.isActive) return notFoundError('Faction not found or inactive');

  const existing = await prisma.userFaction.findUnique({ where: { userId: user.id } });
  if (existing) {
    if (existing.factionId === parsed.data.factionId) {
      return validationError('Already a member of this faction');
    }

    // Check cooldown
    const daysSinceJoin = Math.floor((Date.now() - existing.joinedAt.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceJoin < JOIN_COOLDOWN_DAYS) {
      return validationError(`Can only switch factions after ${JOIN_COOLDOWN_DAYS} days (${JOIN_COOLDOWN_DAYS - daysSinceJoin} days remaining)`);
    }

    // Switch faction
    await prisma.userFaction.update({
      where: { userId: user.id },
      data: {
        factionId: parsed.data.factionId,
        joinedAt: new Date(),
        contributedXP: 0,
        isLeader: false,
      },
    });

    return NextResponse.json({ success: true, switched: true }, { status: 200 });
  }

  // Join new faction
  await prisma.userFaction.create({
    data: {
      userId: user.id,
      factionId: parsed.data.factionId,
      joinedAt: new Date(),
      contributedXP: 0,
      isLeader: false,
    },
  });

  return NextResponse.json({ success: true, joined: true }, { status: 201 });
});

