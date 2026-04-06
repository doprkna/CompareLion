/**
 * POST /api/rpg/equipment/unequip
 * Unequip character slot (alpha canonical)
 * Body: { characterId, slot }
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, authError, validationError, successResponse } from '@/lib/api-handler';
import { unequipCharacterSlot } from '@/lib/services/itemService';

export const runtime = 'nodejs';

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return authError();

  const body = await req.json().catch(() => ({}));
  const { characterId, slot } = body;

  if (!characterId || !slot) {
    return validationError('Missing characterId or slot');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return authError();

  try {
    const result = await unequipCharacterSlot(user.id, characterId, slot);
    return successResponse(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unequip failed';
    return successResponse({ success: false, error: msg }, 400);
  }
});
