/**
 * Admin Enemy CRUD API
 * Update/Delete enemy by ID
 * v0.36.35 - Combat Engine 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, forbiddenError, validationError, notFoundError, successResponse, parseBody } from '@/lib/api-handler';
import { z } from 'zod';
import { EnemyTier, EnemyRegion, StatPreset } from '@/lib/rpg/enemy/types';

export const runtime = 'nodejs';

const EnemyUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  level: z.number().int().min(1).optional(),
  power: z.number().int().min(1).optional(),
  defense: z.number().int().min(0).optional(),
  maxHp: z.number().int().min(1).optional(),
  rarity: z.enum(['common', 'elite', 'boss']).optional(),
  region: z.nativeEnum(EnemyRegion).optional(),
  statPreset: z.nativeEnum(StatPreset).optional(),
  baseStats: z.object({
    hp: z.number().int().min(1),
    atk: z.number().int().min(1),
    def: z.number().int().min(0),
    speed: z.number().int().min(1),
    abilities: z.array(z.string()).optional(),
  }).optional(),
  lootTable: z.object({
    common: z.array(z.string()).optional(),
    rare: z.array(z.string()).optional(),
    epic: z.array(z.string()).optional(),
    gold: z.object({
      min: z.number().int().min(0),
      max: z.number().int().min(0),
    }),
  }).optional(),
  icon: z.string().optional().nullable(),
  dropTableId: z.string().optional().nullable(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    throw new Error('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }
}

/**
 * PUT /api/admin/enemies/[id]
 * Update enemy
 */
export const PUT = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  await requireAdmin();

  const body = await parseBody(req);
  const parsed = EnemyUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid enemy data', parsed.error.issues);
  }

  const enemy = await prisma.enemy.update({
    where: { id: params.id },
    data: parsed.data as any,
  });

  return successResponse({ enemy });
});

/**
 * DELETE /api/admin/enemies/[id]
 * Delete enemy
 */
export const DELETE = safeAsync(async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  await requireAdmin();

  const enemy = await prisma.enemy.findUnique({
    where: { id: params.id },
  });

  if (!enemy) {
    return notFoundError('Enemy');
  }

  await prisma.enemy.delete({
    where: { id: params.id },
  });

  return successResponse({ deleted: true });
});

