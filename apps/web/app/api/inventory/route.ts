/**
 * Inventory API
 * v0.35.16c - Admin sees all items, users see owned items
 * v0.41.4 - C3 Step 5: Unified API envelope
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync } from '@/lib/api-handler';
import { buildSuccess, buildError, ApiErrorCode } from '@parel/api';
import { isAdminViewServer } from '@parel/core/utils/isAdminViewServer';

// Force Node.js runtime (uses NextAuth session)
export const runtime = 'nodejs';

/**
 * GET /api/inventory
 * Get user's item inventory (admin sees ALL items for verification)
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const isAdmin = await isAdminViewServer();
  
  // Admin/dev sees ALL items (for verification/testing)
  if (isAdmin) {
    const allItems = await prisma.item.findMany({
      select: {
        id: true,
        key: true,
        name: true,
        emoji: true,
        icon: true,
        rarity: true,
        goldPrice: true,
        isShopItem: true,
        description: true,
        type: true,
      },
      orderBy: [
        { rarity: 'desc' },
        { goldPrice: 'asc' },
      ],
    });

    return buildSuccess(req, {
      inventory: allItems.map(item => ({
        id: item.id,
        name: item.name,
        emoji: item.emoji || item.icon || 'dY"�',
        icon: item.icon || item.emoji || 'dY"�',
        description: item.description,
        rarity: item.rarity,
        type: item.type,
        goldPrice: item.goldPrice || 0,
        quantity: 1,
        equipped: false,
        isShopItem: item.isShopItem,
      })),
      cosmetics: [], // For backwards compatibility
      totalCount: allItems.length,
      isAdminView: true,
    });
  }

  // Regular user - must be logged in
  if (!session?.user?.email) {
    return buildError(req, ApiErrorCode.AUTHENTICATION_ERROR, 'You must be logged in');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return buildError(req, ApiErrorCode.AUTHENTICATION_ERROR, 'User not found');
  }

  // Fetch user's owned items from UserItem table (v0.36.34 - Standardized inventory)
  const userItems = await prisma.userItem.findMany({
    where: { userId: user.id },
    include: {
      item: true,
    },
    orderBy: [
      { equipped: 'desc' }, // Equipped items first
      { quantity: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  // Get active listings for this user to exclude listed items from inventory (v0.36.4)
  const activeListings = await prisma.marketListing.findMany({
    where: {
      sellerId: user.id,
      status: 'active',
    },
    select: {
      itemId: true,
    },
  });
  const listedItemIds = new Set(activeListings.map(l => l.itemId));

  // Map UserItems to inventory format with merged Item data
  const uniqueItems = userItems
    .filter(ui => !listedItemIds.has(ui.itemId)) // Exclude listed items
    .map(ui => ({
      id: ui.id,
      itemId: ui.item.id,
      name: ui.item.name,
      emoji: ui.item.emoji || ui.item.icon || '??',
      icon: ui.item.icon || ui.item.emoji || '??',
      description: ui.item.description,
      rarity: ui.item.rarity,
      type: ui.item.type,
      slot: ui.item.slot,
      power: ui.item.power,
      bonus: ui.item.bonus,
      region: ui.item.region,
      isTradable: ui.item.isTradable,
      goldPrice: ui.item.goldPrice || 0,
      quantity: ui.quantity,
      equipped: ui.equipped,
      durability: ui.durability,
      createdAt: ui.createdAt.toISOString(),
    }));

  // Get user's companions (v0.36.20 - Unified companion system)
  const userCompanions = await prisma.userCompanion.findMany({
    where: { userId: user.id },
    include: {
      companion: true,
    },
    orderBy: {
      equipped: 'desc', // Equipped first
    },
  });

  const companions = userCompanions.map(uc => ({
    id: uc.id,
    companionId: uc.companionId,
    name: uc.companion.name,
    type: uc.companion.type,
    rarity: uc.companion.rarity,
    icon: uc.companion.icon,
    description: uc.companion.description,
    level: uc.level,
    xp: uc.xp,
    equipped: uc.equipped,
    bonuses: {
      atk: uc.companion.atkBonus,
      def: uc.companion.defBonus,
      hp: uc.companion.hpBonus,
      crit: uc.companion.critBonus,
      speed: uc.companion.speedBonus,
      xp: uc.companion.xpBonus,
      gold: uc.companion.goldBonus,
      travel: uc.companion.travelBonus || 0,
    },
  }));

  return buildSuccess(req, {
    inventory: uniqueItems,
    companions, // v0.36.20 - Unified companion system
    cosmetics: uniqueItems, // For backwards compatibility
    totalCount: uniqueItems.length,
    companionCount: companions.length,
    isAdminView: false,
  });
});
