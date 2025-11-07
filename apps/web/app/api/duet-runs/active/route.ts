import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  // Find active duet run
  const activeDuet = await prisma.userDuetRun.findFirst({
    where: {
      OR: [
        { userA: user.id, status: 'active' },
        { userB: user.id, status: 'active' },
      ],
    },
    include: {
      run: true,
      userA_ref: { select: { id: true, name: true, image: true } },
      userB_ref: { select: { id: true, name: true, image: true } },
    },
    orderBy: { startedAt: 'desc' },
  });

  if (!activeDuet) {
    return NextResponse.json({
      success: true,
      active: false,
      duetRun: null,
    });
  }

  const isUserA = activeDuet.userA === user.id;
  const partner = isUserA ? activeDuet.userB_ref : activeDuet.userA_ref;
  const myProgress = isUserA ? activeDuet.progressA : activeDuet.progressB;
  const partnerProgress = isUserA ? activeDuet.progressB : activeDuet.progressA;

  const startedAt = new Date(activeDuet.startedAt);
  const now = new Date();
  const elapsed = (now.getTime() - startedAt.getTime()) / 1000; // seconds
  const remaining = Math.max(0, activeDuet.run.durationSec - elapsed);

  return NextResponse.json({
    success: true,
    active: true,
    duetRun: {
      id: activeDuet.id,
      missionKey: activeDuet.run.missionKey,
      title: activeDuet.run.title,
      description: activeDuet.run.description,
      type: activeDuet.run.type,
      durationSec: activeDuet.run.durationSec,
      startedAt: activeDuet.startedAt,
      remainingSec: Math.floor(remaining),
      partner: {
        id: partner.id,
        name: partner.name,
        image: partner.image,
      },
      myProgress,
      partnerProgress,
      bothCompleted: activeDuet.progressA >= 100 && activeDuet.progressB >= 100,
    },
  });
});

