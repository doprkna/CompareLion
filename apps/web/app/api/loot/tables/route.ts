/**
 * Loot Tables API
 * GET /api/loot/tables - Get all loot tables (admin/debug)
 * v0.36.30 - Loot System 2.0
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { prisma } from '@/lib/db';

/**
 * GET /api/loot/tables
 * Get all loot tables
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  // Optional: Check admin role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  const lootTables = await prisma.lootTable.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return successResponse({
    tables: lootTables.map(table => ({
      id: table.id,
      name: table.name,
      enemyType: table.enemyType,
      items: table.items,
      weights: table.weights,
      createdAt: table.createdAt,
    })),
  });
});

