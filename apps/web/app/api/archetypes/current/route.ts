import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const me = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, archetypeKey: true } });
  if (!me?.archetypeKey) return NextResponse.json({ success: true, current: null, fusionAvailable: false });

  const arch = await prisma.archetype.findUnique({ where: { key: me.archetypeKey } });
  const fusionAvailable = !!(arch?.fusionWith && arch.fusionWith.length > 0);
  return NextResponse.json({ success: true, current: arch, fusionAvailable });
});


