/**
 * Inventory API
 * v0.35.16c - Admin sees all items, users see owned items
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse, unauthorizedError } from '@/lib/api-handler';
import { isAdminViewServer } from '@/lib/utils/isAdminViewServer';

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

    return successResponse({
      inventory: allItems.map(item => ({
        id: item.id,
        name: item.name,
        emoji: item.emoji || item.icon || 'ðŸ“¦',
        icon: item.icon || item.emoji || 'ðŸ“¦',
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
    return unauthorizedError('You must be logged in');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Fetch user's owned items from UserItem table
  const userItems = await prisma.userItem.findMany({
    where: { userId: user.id },
    include: {
      item: true,
    },
    orderBy: [
      { quantity: 'desc' },
      { acquiredAt: 'desc' },
    ],
  });

  // Also check InventoryItem table
  const inventoryItems = await prisma.inventoryItem.findMany({
    where: { userId: user.id },
    include: {
      item: true,
    },
    orderBy: [
      { quantity: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  // Combine and deduplicate by itemId
  const combinedItems = [
    ...userItems.map(ui => ({
      id: ui.id,
      itemId: ui.item.id,
      name: ui.item.name,
      emoji: ui.item.emoji || ui.item.icon || 'ðŸ“¦',
      icon: ui.item.icon || ui.item.emoji || 'ðŸ“¦',
      description: ui.item.description,
      rarity: ui.item.rarity,
      type: ui.item.type,
      goldPrice: ui.item.goldPrice || 0,
      quantity: ui.quantity,
      equipped: false,
    })),
    ...inventoryItems.map(ii => ({
      id: ii.id,
      itemId: ii.item.id,
      name: ii.item.name,
      emoji: ii.item.emoji || ii.item.icon || 'ðŸ“¦',
      icon: ii.item.icon || ii.item.emoji || 'ðŸ“¦',
      description: ii.item.description,
      rarity: ii.item.rarity,
      type: ii.item.type,
      goldPrice: ii.item.goldPrice || 0,
      quantity: ii.quantity,
      equipped: ii.equipped,
    })),
  ];

  // Remove duplicates
  const uniqueItems = combinedItems.filter((item, index, self) =>
    index === self.findIndex(t => t.itemId === item.itemId)
  );

  return successResponse({
    inventory: uniqueItems,
    cosmetics: uniqueItems, // For backwards compatibility
    totalCount: uniqueItems.length,
    isAdminView: false,
  });
});
