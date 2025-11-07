import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const ContributeSchema = z.object({
  amount: z.number().int().min(1).max(1000),
  region: z.string().optional(),
});

const DAILY_XP_CAP = 500;

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = ContributeSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message || 'Invalid payload');
  }

  const userFaction = await prisma.userFaction.findUnique({ where: { userId: user.id } });
  if (!userFaction) return notFoundError('Not a member of any faction');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check daily cap (simple check - could be enhanced with activity log)
  const alreadyContributed = userFaction.contributedXP;
  const remaining = Math.max(0, DAILY_XP_CAP - alreadyContributed);
  const contribution = Math.min(parsed.data.amount, remaining);

  if (contribution <= 0) {
    return validationError('Daily contribution cap reached');
  }

  const region = parsed.data.region || user.region || 'GLOBAL';

  await prisma.$transaction(async (tx) => {
    // Update user faction contribution
    await tx.userFaction.update({
      where: { userId: user.id },
      data: { contributedXP: { increment: contribution } },
    });

    // Update or create faction influence
    const influence = await tx.factionInfluence.upsert({
      where: {
        region_factionId: {
          region,
          factionId: userFaction.factionId,
        },
      },
      update: {
        influenceScore: { increment: contribution },
        contributionsCount: { increment: 1 },
        lastUpdated: new Date(),
      },
      create: {
        factionId: userFaction.factionId,
        region,
        influenceScore: contribution,
        contributionsCount: 1,
        lastUpdated: new Date(),
        dailyDelta: contribution,
      },
    });

    // Log action
    await tx.actionLog.create({
      data: {
        userId: user.id,
        action: 'faction_contribute',
        metadata: { factionId: userFaction.factionId, amount: contribution, region } as any,
      },
    });
  });

  return NextResponse.json({
    success: true,
    contribution,
    message: `+${contribution} Influence for ${userFaction.faction.name}!`,
  });
});

