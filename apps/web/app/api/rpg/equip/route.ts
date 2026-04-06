/**
 * RPG Equip API (canonical - UserItem)
 * Body: { characterId, slot, userItemId } or back-compat: { inventoryItemId } (maps to UserItem or rejects)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, authError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { equipCharacterItem } from '@/lib/services/itemService';

export const runtime = 'nodejs';

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return authError();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, activeCharacterId: true },
  });
  if (!user) return authError();

  const body = await parseBody<{
    characterId?: string;
    slot?: string;
    userItemId?: string;
    inventoryItemId?: string;
  }>(req);

  let characterId = body.characterId ?? user.activeCharacterId;
  let slot = body.slot;
  let userItemId = body.userItemId;

  // Back-compat: inventoryItemId -> map to UserItem via (userId, itemId)
  if (!userItemId && body.inventoryItemId) {
    const inv = await prisma.inventoryItem.findUnique({
      where: { id: body.inventoryItemId },
      select: { userId: true, itemId: true },
    });
    if (!inv || inv.userId !== user.id) {
      return successResponse(
        { success: false, message: 'Legacy item cannot be mapped; re-add item to stash' },
        400
      );
    }
    const ui = await prisma.userItem.findUnique({
      where: { userId_itemId: { userId: user.id, itemId: inv.itemId } },
    });
    if (!ui) {
      return successResponse(
        { success: false, message: 'Legacy item cannot be mapped; re-add item to stash' },
        400
      );
    }
    userItemId = ui.id;
    if (!characterId) characterId = user.activeCharacterId ?? undefined;
    if (!slot) slot = 'weapon'; // default slot when mapping from legacy
  }

  if (!characterId || !slot || !userItemId) {
    return validationError('Missing characterId, slot, or userItemId (or inventoryItemId for legacy)');
  }

  try {
    const result = await equipCharacterItem(user.id, characterId, slot, userItemId);
    return successResponse(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Equip failed';
    return successResponse({ success: false, error: msg }, 400);
  }
});

