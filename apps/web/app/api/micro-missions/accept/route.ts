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
  const me = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!me) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return validationError('Invalid');

  const um = await prisma.userMicroMission.findUnique({ where: { id: parsed.data.userMissionId }, include: { mission: true } });
  if (!um || um.userId !== me.id) return validationError('Not found');
  if (um.status !== 'active') return validationError('Not active');

  // accepting is implicit since created active; here just confirm
  return NextResponse.json({ success: true, mission: { id: um.id, title: um.mission.title, durationSec: um.mission.durationSec } });
});


