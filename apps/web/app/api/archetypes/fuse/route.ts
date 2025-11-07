import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError } from '@/lib/api-handler';
import { z } from 'zod';

const Schema = z.object({ baseA: z.string().min(1), baseB: z.string().min(1) });

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return validationError('Invalid payload');

  // Cooldown 24h
  const last = await prisma.userArchetypeFusion.findFirst({ where: { userId: me.id }, orderBy: { createdAt: 'desc' } });
  if (last && Date.now() - new Date(last.createdAt).getTime() < 24*60*60*1000) return validationError('Fusion on cooldown');

  const a = await prisma.archetype.findUnique({ where: { key: parsed.data.baseA } });
  const b = await prisma.archetype.findUnique({ where: { key: parsed.data.baseB } });
  if (!a || !b) return validationError('Unknown archetype');
  if (!(a.fusionWith || []).includes(b.key) || !a.fusionResult) return validationError('Incompatible fusion');

  const cost = a.fusionCost || 500;
  if ((me.xp || 0) < cost) return validationError('Not enough XP');

  const resultKey = a.fusionResult as string;
  const resultArch = await prisma.archetype.findUnique({ where: { key: resultKey } });
  if (!resultArch) return validationError('Resulting archetype not found');

  const updated = await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: me.id }, data: { xp: { decrement: cost }, archetypeKey: resultKey } });
    await tx.userArchetypeFusion.create({ data: { userId: me.id, baseA: a.key, baseB: b.key, result: resultKey } });
    return await tx.user.findUnique({ where: { id: me.id }, select: { id: true, xp: true, archetypeKey: true } });
  });

  return NextResponse.json({ success: true, user: updated, result: { key: resultKey, name: resultArch.name, emoji: resultArch.emoji, visual: resultArch.fusionVisual } });
});


