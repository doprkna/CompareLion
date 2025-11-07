/**
 * Combat Arena API
 * Handles idle reflection combat actions
 * v0.25.0 - Phase J-Lite
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync } from '@/lib/api-handler';
import { successResponse, unauthorizedError, validationError } from '@/app/api/_utils';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import {
  getOrCreateSession,
  attack,
  enemyAttack,
  forfeit,
  getPowerBonus,
  checkAndHealFromRest,
} from '@/lib/services/combatService';
import { logger } from '@/lib/logger';

// ========================================
// VALIDATION SCHEMA
// ========================================

const CombatActionSchema = z.object({
  action: z.enum(['start', 'attack', 'skip', 'getState', 'forfeit']),
});

// ========================================
// GET - Get current combat state
// ========================================

export const GET = safeAsync(async (req: NextRequest) => {
  // Get authenticated session
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('You must be logged in to access combat');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Get or create session
  const result = await getOrCreateSession(user.id);
  
  // Check if resting and auto-heal
  if (result.session.heroHp <= 0) {
    const restResult = await checkAndHealFromRest(user.id, result.session);
    return successResponse({
      ...restResult,
      message: 'Combat state retrieved',
    });
  }

  return successResponse({
    ...result,
    message: 'Combat state retrieved',
  });
});

// ========================================
// POST - Perform combat action
// ========================================

export const POST = safeAsync(async (req: NextRequest) => {
  // Get authenticated session
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('You must be logged in to fight');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, level: true, xp: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Parse and validate request
  const body = await req.json();
  const validation = CombatActionSchema.safeParse(body);

  if (!validation.success) {
    return validationError(
      validation.error.issues[0]?.message || 'Invalid action'
    );
  }

  const { action } = validation.data;

  let result;

  try {
    switch (action) {
      case 'start':
      case 'getState':
        result = await getOrCreateSession(user.id);
        // Check if resting and auto-heal
        if (result.session.heroHp <= 0) {
          result = await checkAndHealFromRest(user.id, result.session);
        }
        break;

      case 'attack':
        // Get power bonus from equipped inventory items
        const powerBonus = await getPowerBonus(user.id);
        result = await attack(user.id, powerBonus);
        break;

      case 'skip':
        result = await enemyAttack(user.id);
        break;

      case 'forfeit':
        result = await forfeit(user.id);
        break;

      default:
        return validationError('Invalid action');
    }

    logger.info(`[Arena] User ${user.id} performed action: ${action}`);

    return successResponse({
      ...result,
      action,
      message: `Action '${action}' completed successfully`,
    });
  } catch (error) {
    logger.error(`[Arena] Error performing action ${action} for user ${user.id}`, error);
    throw error;
  }
});

