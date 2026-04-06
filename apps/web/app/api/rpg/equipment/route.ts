/**
 * GET /api/rpg/equipment?characterId=...
 * Returns equipped items per slot. Resolves userItemId first, inventoryItemId fallback (legacy).
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, authError, successResponse } from '@/lib/api-handler';

export const runtime = 'nodejs';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return authError();

  const characterId = req.nextUrl.searchParams.get('characterId');
  if (!characterId) {
    return successResponse({ equipment: [] });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return authError();

  const character = await prisma.character.findFirst({
    where: { id: characterId, userId: user.id },
  });
  if (!character) return successResponse({ equipment: [] });

  const slots = await prisma.characterEquipment.findMany({
    where: { characterId },
    include: {
      userItem: { include: { item: true } },
      inventoryItem: { include: { item: true } },
    },
  });

  const equipment = slots.map((s) => {
    // Canonical: userItemId first; legacy: inventoryItemId fallback
    const itemSource = s.userItem
      ? { id: s.userItem.id, name: s.userItem.item.name, emoji: s.userItem.item.emoji, icon: s.userItem.item.icon }
      : s.inventoryItem
      ? { id: s.inventoryItem.id, name: s.inventoryItem.item.name, emoji: s.inventoryItem.item.emoji, icon: s.inventoryItem.item.icon }
      : null;
    return {
      slot: s.slot,
      itemId: s.userItemId ?? s.inventoryItemId,
      source: s.userItemId ? 'userItem' : 'inventoryItem',
      ...itemSource,
    };
  });

  return successResponse({ equipment });
});
