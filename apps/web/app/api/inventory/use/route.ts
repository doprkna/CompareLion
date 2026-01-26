/**
 * Inventory Use API
 * Use consumables or pet_egg items
 * v0.36.34 - Standardized inventory system
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { unlockPet } from '@/lib/services/petService';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

/**
 * POST /api/inventory/use
 * Use an item (consumable or pet_egg)
 * Body: { itemId: string }
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await parseBody<{
    itemId: string;
  }>(req);

  if (!body.itemId) {
    return validationError('Missing required field: itemId');
  }

  // Get UserItem with Item data
  const userItem = await prisma.userItem.findUnique({
    where: {
      userId_itemId: {
        userId: user.id,
        itemId: body.itemId,
      },
    },
    include: {
      item: true,
    },
  });

  if (!userItem) {
    return validationError('Item not found in inventory');
  }

  if (userItem.quantity < 1) {
    return validationError('Insufficient quantity');
  }

  const item = userItem.item;
  const itemType = item.type;

  // Handle pet_egg items
  if (itemType === 'pet_egg') {
    // Extract petId from item.key (format: "pet_egg_<petId>") or use item.name
    let petId: string | null = null;
    
    if (item.key && item.key.startsWith('pet_egg_')) {
      petId = item.key.replace('pet_egg_', '');
    } else if (item.name) {
      // Try to extract from name or use name as petId
      petId = item.name.toLowerCase().replace(/\s+/g, '_');
    }

    if (!petId) {
      return validationError('Invalid pet_egg item: petId not found');
    }

    // Find pet by id or name
    const pet = await prisma.pet.findFirst({
      where: {
        OR: [
          { id: petId },
          { key: petId },
          { name: { contains: petId, mode: 'insensitive' } },
        ],
      },
    });

    if (!pet) {
      return validationError(`Pet not found: ${petId}`);
    }

    // Unlock the pet (idempotent)
    await unlockPet(user.id, pet.id);

    // Delete the pet_egg item (consumed on use)
    await prisma.userItem.delete({
      where: { id: userItem.id },
    });

    logger.info('[InventoryUse] Pet egg used', {
      userId: user.id,
      itemId: body.itemId,
      petId: pet.id,
    });

    return successResponse({
      success: true,
      type: 'pet_egg',
      petId: pet.id,
      petName: pet.name,
      message: `You unlocked ${pet.name}!`,
    });
  }

  // Handle theme items
  if (itemType === 'theme') {
    // Apply theme and persist in user settings (v0.36.34)
    const themeKey = item.key || item.name.toLowerCase().replace(/\s+/g, '_');
    
    // Update user settings with theme itemId
    const currentSettings = (await prisma.user.findUnique({
      where: { id: user.id },
      select: { settings: true },
    }))?.settings as any || {};

    await prisma.user.update({
      where: { id: user.id },
      data: {
        settings: {
          ...currentSettings,
          themeKey,
          themeItemId: body.itemId, // Store itemId for reference
        },
      },
    });

    // Apply theme via theme API (if exists)
    try {
      const themeRes = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/themes/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeKey }),
      });
      // Note: This is a server-side call, might need to use internal API
    } catch (error) {
      logger.debug('[InventoryUse] Theme apply failed', error);
    }

    logger.info('[InventoryUse] Theme applied', {
      userId: user.id,
      itemId: body.itemId,
      themeKey,
    });

    return successResponse({
      success: true,
      type: 'theme',
      themeKey,
      itemName: item.name,
      message: `Theme "${item.name}" applied!`,
    });
  }

  // Handle consumables
  if (itemType === 'consumable') {
    // Apply consumable effect (for now, just reduce quantity)
    // TODO: Apply actual effects (health potion, luck charm, etc.)
    const updatedUserItem = await prisma.userItem.update({
      where: { id: userItem.id },
      data: {
        quantity: { decrement: 1 },
      },
    });

    // Delete if quantity reaches 0
    if (updatedUserItem.quantity <= 0) {
      await prisma.userItem.delete({
        where: { id: userItem.id },
      });
    }

    logger.info('[InventoryUse] Consumable used', {
      userId: user.id,
      itemId: body.itemId,
      itemName: item.name,
      remainingQuantity: updatedUserItem.quantity,
    });

    return successResponse({
      success: true,
      type: 'consumable',
      itemName: item.name,
      remainingQuantity: Math.max(0, updatedUserItem.quantity),
      message: `Used ${item.name}`,
    });
  }

  // Other item types cannot be used
  return validationError(`Item type "${itemType}" cannot be used`);
});

