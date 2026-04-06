/**
 * POST /api/rpg/enable
 * Sets rpgEnabled=true if user has a character (v0.46.01)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, authError } from '@/lib/api-handler';

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return authError();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, characters: { select: { id: true } } },
  });
  if (!user) return authError();

  if ((user.characters?.length ?? 0) === 0) {
    return NextResponse.json({
      success: true,
      requiresCreate: true,
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { rpgEnabled: true },
  });

  return NextResponse.json({ success: true, requiresCreate: false });
});
