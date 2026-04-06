/**
 * RPG Unequip API (canonical - clears CharacterEquipment only, no InventoryItem write)
 * Body: { characterId, slot } or back-compat: { inventoryItemId } (finds eq by legacy ref)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, authError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { unequipCharacterSlot } from '@/lib/services/itemService';

export const runtime = 'nodejs';

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return authError();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return authError();

  const body = await parseBody<{
    characterId?: string;
    slot?: string;
    inventoryItemId?: string;
  }>(req);

  let characterId = body.characterId;
  let slot = body.slot;

  // Back-compat: find CharacterEquipment by inventoryItemId
  if ((!characterId || !slot) && body.inventoryItemId) {
    const eq = await prisma.characterEquipment.findFirst({
      where: { inventoryItemId: body.inventoryItemId, character: { userId: user.id } },
    });
    if (eq) {
      characterId = eq.characterId;
      slot = eq.slot;
    }
  }

  if (!characterId || !slot) {
    return validationError('Missing characterId and slot (or inventoryItemId for legacy)');
  }

  try {
    const result = await unequipCharacterSlot(user.id, characterId, slot);
    return successResponse(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unequip failed';
    return successResponse({ success: false, error: msg }, 400);
  }
});

