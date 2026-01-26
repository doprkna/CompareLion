/**
 * Allocate Attribute Points API
 * POST /api/stats/allocate - Allocate unspent attribute points
 * v0.36.34 - Stats / Attributes / Level Curve 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import {
  safeAsync,
  unauthorizedError,
  validationError,
  successResponse,
} from '@/lib/api-handler';
import { z } from 'zod';
import { createNotification } from '@/lib/services/notificationService';
import { logger } from '@/lib/logger';

const AllocateAttributesSchema = z.object({
  strength: z.number().int().min(0).optional(),
  agility: z.number().int().min(0).optional(),
  endurance: z.number().int().min(0).optional(),
  intellect: z.number().int().min(0).optional(),
  luck: z.number().int().min(0).optional(),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      strength: true,
      agility: true,
      endurance: true,
      intellect: true,
      luck: true,
      unspentPoints: true,
      stats: true, // Legacy stats for backward compatibility
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await req.json();
  const parsed = AllocateAttributesSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid request data', parsed.error.issues);
  }

  // Get current base attributes (new system or legacy)
  let currentAttributes = {
    strength: user.strength ?? 5,
    agility: user.agility ?? 5,
    endurance: user.endurance ?? 5,
    intellect: user.intellect ?? 5,
    luck: user.luck ?? 5,
  };

  // If new fields don't exist, try to map from legacy stats
  if (user.strength === null || user.strength === undefined) {
    const legacyStats = (user.stats || {}) as { str?: number; int?: number; cha?: number; luck?: number };
    currentAttributes = {
      strength: legacyStats.str || 5,
      agility: legacyStats.luck || 5,
      endurance: legacyStats.cha || 5,
      intellect: legacyStats.int || 5,
      luck: legacyStats.luck || 5,
    };
  }

  // Calculate total points to allocate
  const requestedAttributes = {
    strength: parsed.data.strength ?? currentAttributes.strength,
    agility: parsed.data.agility ?? currentAttributes.agility,
    endurance: parsed.data.endurance ?? currentAttributes.endurance,
    intellect: parsed.data.intellect ?? currentAttributes.intellect,
    luck: parsed.data.luck ?? currentAttributes.luck,
  };

  // Calculate points needed
  const pointsNeeded =
    (requestedAttributes.strength - currentAttributes.strength) +
    (requestedAttributes.agility - currentAttributes.agility) +
    (requestedAttributes.endurance - currentAttributes.endurance) +
    (requestedAttributes.intellect - currentAttributes.intellect) +
    (requestedAttributes.luck - currentAttributes.luck);

  // Validate: cannot reduce below base (5)
  const minBase = 5;
  if (
    requestedAttributes.strength < minBase ||
    requestedAttributes.agility < minBase ||
    requestedAttributes.endurance < minBase ||
    requestedAttributes.intellect < minBase ||
    requestedAttributes.luck < minBase
  ) {
    return validationError('Attributes cannot be reduced below base value (5)');
  }

  // Validate: cannot exceed unspent points
  const unspentPoints = user.unspentPoints || 0;
  if (pointsNeeded > unspentPoints) {
    return validationError(`Insufficient unspent points. Need ${pointsNeeded}, have ${unspentPoints}`);
  }

  // Validate: cannot use negative points (reducing attributes)
  if (pointsNeeded < 0) {
    return validationError('Cannot reduce attributes below current values');
  }

  // Update user attributes
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        strength: requestedAttributes.strength,
        agility: requestedAttributes.agility,
        endurance: requestedAttributes.endurance,
        intellect: requestedAttributes.intellect,
        luck: requestedAttributes.luck,
        unspentPoints: {
          decrement: pointsNeeded,
        },
      },
    });

    // Send notification
    try {
      await createNotification({
        userId: user.id,
        type: 'system',
        title: 'Attributes Updated',
        body: `You allocated ${pointsNeeded} attribute points.`,
      });
    } catch (error) {
      // Don't fail if notification fails
      logger.debug('[StatsAPI] Notification failed', error);
    }

    logger.info(`[StatsAPI] User ${user.id} allocated ${pointsNeeded} attribute points`);

    return successResponse({
      success: true,
      message: 'Attributes allocated successfully',
      attributes: requestedAttributes,
      unspentPoints: unspentPoints - pointsNeeded,
    });
  } catch (error: any) {
    logger.error('[StatsAPI] Failed to allocate attributes', error);
    
    // Handle case where fields don't exist yet (backward compatibility)
    if (error.message?.includes('Unknown argument') || error.message?.includes('does not exist')) {
      return validationError('Attribute system not yet initialized. Please contact support.');
    }
    
    return validationError(error.message || 'Failed to allocate attributes');
  }
});

