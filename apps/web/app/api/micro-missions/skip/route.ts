import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError } from '@/lib/api-handler';
import { z } from 'zod';

const Schema = z.object({ userMissionId: z.string().min(1) });

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return validationError('Invalid');

  const um = await prisma.userMicroMission.findUnique({ where: { id: parsed.data.userMissionId }, include: { mission: true } });
  if (!um || um.userId !== me.id) return validationError('Not found');
  if (um.status !== 'active') return validationError('Not active');

  const m = um.mission;
  await prisma.$transaction(async (tx) => {
    if (m.skipCostGold) await tx.user.update({ where: { id: me.id }, data: { coins: { decrement: m.skipCostGold } } });
    if (m.skipCostPremium) await tx.user.update({ where: { id: me.id }, data: { diamonds: { decrement: m.skipCostPremium } } });
    await tx.userMicroMission.update({ where: { id: um.id }, data: { status: 'skipped', completedAt: new Date() } });
  });

  return NextResponse.json({ success: true, skipped: true });
});


