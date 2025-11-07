import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const StartSchema = z.object({
  missionKey: z.string().min(1),
  partnerId: z.string().optional(),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = StartSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message || 'Invalid payload');
  }

  // Find mission
  const mission = await prisma.duetRun.findUnique({
    where: { missionKey: parsed.data.missionKey },
  });
  if (!mission || !mission.isActive) return notFoundError('Mission not found or inactive');

  // Check if user has active duet
  const activeDuet = await prisma.userDuetRun.findFirst({
    where: {
      OR: [
        { userA: user.id, status: { in: ['pending', 'active'] } },
        { userB: user.id, status: { in: ['pending', 'active'] } },
      ],
    },
  });

  if (activeDuet) {
    return validationError('User already has an active duet run');
  }

  let partner: any = null;
  if (parsed.data.partnerId) {
    partner = await prisma.user.findUnique({ where: { id: parsed.data.partnerId } });
    if (!partner) return notFoundError('Partner not found');

    // Check partner cooldown (5 min)
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const partnerRecentDuet = await prisma.userDuetRun.findFirst({
      where: {
        OR: [
          { userA: partner.id, startedAt: { gte: fiveMinAgo } },
          { userB: partner.id, startedAt: { gte: fiveMinAgo } },
        ],
      },
    });

    if (partnerRecentDuet) {
      return validationError('Partner is on cooldown (5 min)');
    }
  } else {
    // Random matchmaking - find available user (simple implementation)
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const availableUsers = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: user.id } },
          {
            NOT: {
              OR: [
                { duetRunsA: { some: { startedAt: { gte: fiveMinAgo } } } },
                { duetRunsB: { some: { startedAt: { gte: fiveMinAgo } } } },
              ],
            },
          },
        ],
      },
      take: 10,
    });

    if (availableUsers.length === 0) {
      return validationError('No available partners found');
    }

    // Pick random from available
    const randomIndex = Math.floor(Math.random() * availableUsers.length);
    partner = availableUsers[randomIndex];
  }

  // Create duet run
  const duetRun = await prisma.userDuetRun.create({
    data: {
      runId: mission.id,
      userA: user.id,
      userB: partner.id,
      status: 'active',
      startedAt: new Date(),
      progressA: 0,
      progressB: 0,
    },
    include: {
      run: true,
      userA_ref: { select: { id: true, name: true, image: true } },
      userB_ref: { select: { id: true, name: true, image: true } },
    },
  });

  // Log action
  await prisma.actionLog.create({
    data: {
      userId: user.id,
      action: 'duet_run_start',
      metadata: {
        duetRunId: duetRun.id,
        missionKey: mission.missionKey,
        partnerId: partner.id,
      } as any,
    },
  }).catch(() => {});

  return NextResponse.json({
    success: true,
    duetRun: {
      id: duetRun.id,
      missionKey: mission.missionKey,
      title: mission.title,
      description: mission.description,
      type: mission.type,
      durationSec: mission.durationSec,
      startedAt: duetRun.startedAt,
      partner: {
        id: partner.id,
        name: partner.name,
        image: partner.image,
      },
      progressA: duetRun.progressA,
      progressB: duetRun.progressB,
    },
  });
});

