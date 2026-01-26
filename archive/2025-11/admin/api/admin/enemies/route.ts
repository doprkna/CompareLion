/**
 * Admin Enemies API
 * CRUD operations for enemy management
 * v0.36.35 - Combat Engine 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, forbiddenError, validationError, successResponse, parseBody } from '@/lib/api-handler';
import { z } from 'zod';
import { EnemyTier, EnemyRegion, StatPreset } from '@/lib/rpg/enemy/types';

export const runtime = 'nodejs';

const EnemySchema = z.object({
  name: z.string().min(1),
  level: z.number().int().min(1),
  power: z.number().int().min(1),
  defense: z.number().int().min(0),
  maxHp: z.number().int().min(1),
  rarity: z.enum(['common', 'elite', 'boss']),
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
  }),
  icon: z.string().optional().nullable(),
  dropTableId: z.string().optional().nullable(),
});

/**
 * GET /api/admin/enemies
 * List all enemies
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    return forbiddenError('Admin access required');
  }

  const enemies = await prisma.enemy.findMany({
    orderBy: { level: 'asc' },
  });

  return successResponse({ enemies });
});

/**
 * POST /api/admin/enemies
 * Create new enemy
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    return forbiddenError('Admin access required');
  }

  const body = await parseBody(req);
  const parsed = EnemySchema.safeParse(body);

  if (!parsed.success) {
    return validationError('Invalid enemy data', parsed.error.issues);
  }

  const enemy = await prisma.enemy.create({
    data: {
      name: parsed.data.name,
      level: parsed.data.level,
      power: parsed.data.power,
      defense: parsed.data.defense,
      maxHp: parsed.data.maxHp,
      rarity: parsed.data.rarity,
      region: parsed.data.region,
      statPreset: parsed.data.statPreset,
      baseStats: parsed.data.baseStats as any,
      lootTable: parsed.data.lootTable as any,
      icon: parsed.data.icon,
      dropTableId: parsed.data.dropTableId,
    },
  });

  return successResponse({ enemy });
});

