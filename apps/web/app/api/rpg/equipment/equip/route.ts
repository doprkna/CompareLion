/**
 * POST /api/rpg/equipment/equip
 * Equip UserItem to character slot (alpha canonical stash)
 * Body: { characterId, slot, userItemId }
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, authError, validationError, successResponse } from '@/lib/api-handler';
import { equipCharacterItem } from '@/lib/services/itemService';

export const runtime = 'nodejs';

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return authError();

  const body = await req.json().catch(() => ({}));
  const { characterId, slot, userItemId } = body;

  if (!characterId || !slot || !userItemId) {
    return validationError('Missing characterId, slot, or userItemId');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return authError();

  try {
    const result = await equipCharacterItem(user.id, characterId, slot, userItemId);
    return successResponse(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Equip failed';
    return successResponse({ success: false, error: msg }, 400);
  }
});
