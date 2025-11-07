import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, archetypeKey: true } });
  if (!user?.archetypeKey) return NextResponse.json({ success: true, options: [] });

  const current = await prisma.archetype.findUnique({ where: { key: user.archetypeKey } });
  if (!current) return NextResponse.json({ success: true, options: [] });

  const options = await prisma.archetype.findMany({ where: { key: { in: current.fusionWith || [] } }, select: { key: true, name: true, emoji: true, fusionResult: true, fusionCost: true } });
  return NextResponse.json({ success: true, base: current.key, options });
});


