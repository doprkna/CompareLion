/**
 * POST /api/rpg/character/create
 * Creates a character for the user (v0.46.01)
 * Body: { type: "mage"|"paladin"|"warrior"|..., name?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, authError, validationError, parseBody } from '@/lib/api-handler';
import { z } from 'zod';

const VALID_TYPES = ['mage', 'paladin', 'warrior', 'rogue', 'cleric'] as const;

const BodySchema = z.object({
  type: z.enum(VALID_TYPES),
  name: z.string().max(64).optional(),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return authError();

  const body = await parseBody(req);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.message);
  }

  const { type, name } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, activeCharacterId: true, rpgCreatedAt: true, characters: { select: { id: true } } },
  });
  if (!user) return authError();

  const character = await prisma.character.create({
    data: {
      userId: user.id,
      type,
      name: name || null,
    },
  });

  const updates: { activeCharacterId?: string; rpgCreatedAt?: Date; rpgEnabled?: boolean } = {};
  if (!user.activeCharacterId) updates.activeCharacterId = character.id;
  if (!user.rpgCreatedAt) updates.rpgCreatedAt = new Date();
  updates.rpgEnabled = true;

  await prisma.user.update({
    where: { id: user.id },
    data: updates,
  });

  return NextResponse.json({
    success: true,
    activeCharacterId: character.id,
  });
});
