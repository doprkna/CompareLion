/**
 * POST /api/rpg/character/set-active
 * Sets active character (v0.46.01)
 * Body: { characterId: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, authError, validationError, parseBody } from '@/lib/api-handler';
import { z } from 'zod';

const BodySchema = z.object({
  characterId: z.string().min(1),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return authError();

  const body = await parseBody(req);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.message);
  }

  const { characterId } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return authError();

  const character = await prisma.character.findFirst({
    where: { id: characterId, userId: user.id },
  });

  if (!character) {
    return validationError('Character not found or not owned by user');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { activeCharacterId: characterId },
  });

  return NextResponse.json({ success: true, activeCharacterId: characterId });
});
