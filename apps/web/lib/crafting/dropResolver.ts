/**
 * Material Drop Resolver
 * Resolves material drops from combat encounters
 * v0.36.40 - Materials & Crafting 1.0
 */

import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
import { MaterialDrop } from './types';

/**
 * Resolve material drops for an enemy
 * 
 * @param enemyId - The enemy ID that was defeated
 * @param modifiers - Optional modifiers (e.g., luck bonus, drop rate multiplier)
 * @returns Array of material drops
 */
export async function resolveMaterialDrops(
  enemyId: string,
  modifiers?: {
    dropRateMultiplier?: number; // e.g., 1.2 for 20% bonus
    luckBonus?: number; // Additional luck stat
  }
): Promise<MaterialDrop[]> {
  try {
    // Get all drop table entries for this enemy
    const dropEntries = await prisma.dropTableEntry.findMany({
      where: { enemyId },
      include: {
        material: true,
      },
    });

    if (dropEntries.length === 0) {
      return []; // No drops configured for this enemy
    }

    const drops: MaterialDrop[] = [];
    const dropRateMultiplier = modifiers?.dropRateMultiplier || 1.0;

    for (const entry of dropEntries) {
      // Calculate effective drop rate with modifiers
      let effectiveDropRate = entry.dropRate * dropRateMultiplier;
      
      // Cap at 100%
      effectiveDropRate = Math.min(1.0, effectiveDropRate);

      // Roll for drop (0.0 to 1.0)
      const roll = Math.random();

      if (roll <= effectiveDropRate) {
        // Drop occurred - calculate quantity
        const quantity = Math.floor(
          Math.random() * (entry.maxQuantity - entry.minQuantity + 1) + entry.minQuantity
        );

        drops.push({
          materialId: entry.materialId,
          quantity,
          material: entry.material ? {
            id: entry.material.id,
            name: entry.material.name,
            description: entry.material.description,
            rarity: entry.material.rarity as any,
            category: entry.material.category as any,
            icon: entry.material.icon,
            emoji: entry.material.emoji,
          } : undefined,
        });

        logger.debug(`[DropResolver] Material dropped: ${entry.material?.name} x${quantity} from enemy ${enemyId}`);
      }
    }

    return drops;
  } catch (error) {
    logger.error('[DropResolver] Failed to resolve material drops', { enemyId, error });
    return [];
  }
}

/**
 * Grant material drops to user
 * Adds materials to user's inventory
 * 
 * @param userId - User ID
 * @param drops - Array of material drops
 */
export async function grantMaterialDrops(
  userId: string,
  drops: MaterialDrop[]
): Promise<void> {
  if (drops.length === 0) {
    return;
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const drop of drops) {
        // Check if user already has this material
        const existing = await tx.userMaterial.findUnique({
          where: {
            userId_materialId: {
              userId,
              materialId: drop.materialId,
            },
          },
        });

        if (existing) {
          // Increment quantity
          await tx.userMaterial.update({
            where: { id: existing.id },
            data: { quantity: { increment: drop.quantity } },
          });
        } else {
          // Create new entry
          await tx.userMaterial.create({
            data: {
              userId,
              materialId: drop.materialId,
              quantity: drop.quantity,
            },
          });
        }
      }
    });

    logger.info(`[DropResolver] Granted ${drops.length} material drops to user ${userId}`);
  } catch (error) {
    logger.error('[DropResolver] Failed to grant material drops', { userId, error });
    throw error;
  }
}

/**
 * Resolve and grant material drops in one call
 * Convenience function for combat completion
 * 
 * @param userId - User ID
 * @param enemyId - Enemy ID that was defeated
 * @param modifiers - Optional modifiers
 */
export async function resolveAndGrantMaterialDrops(
  userId: string,
  enemyId: string,
  modifiers?: {
    dropRateMultiplier?: number;
    luckBonus?: number;
  }
): Promise<MaterialDrop[]> {
  const drops = await resolveMaterialDrops(enemyId, modifiers);
  
  if (drops.length > 0) {
    await grantMaterialDrops(userId, drops);
  }

  return drops;
}

