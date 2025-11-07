import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const me = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!me) return unauthorizedError('Unauthorized');

  const active = await prisma.userMicroMission.findFirst({ where: { userId: me.id, status: 'active' } });
  if (active) return NextResponse.json({ success: true, mission: null });

  // RNG: 10% for common, 2% for rare
  const roll = Math.random();
  let rarity = 'none';
  if (roll < 0.02) rarity = 'rare'; else if (roll < 0.12) rarity = 'common';
  if (rarity === 'none') return NextResponse.json({ success: true, mission: null });

  const mission = await prisma.microMission.findFirst({ where: { isActive: true, rarity }, orderBy: { createdAt: 'desc' } });
  if (!mission) return NextResponse.json({ success: true, mission: null });

  // Pre-create as pending (status active only after accept)
  const um = await prisma.userMicroMission.create({ data: { userId: me.id, missionId: mission.id, status: 'active' } });
  return NextResponse.json({ success: true, mission: { id: um.id, title: mission.title, description: mission.description, durationSec: mission.durationSec, rewardXP: mission.rewardXP, rarity: mission.rarity } });
});


