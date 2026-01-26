/**
 * Seed Theme Items API
 * v0.35.17a - Populate database with region-specific themes
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse, unauthorizedError, forbiddenError } from '@/lib/api-handler';
import { THEME_ITEMS } from '@/lib/seed-theme-items';

export const runtime = 'nodejs';

/**
 * POST /api/admin/seed-themes
 * Seeds theme items into database (admin only)
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    return forbiddenError('Admin access required');
  }

  const results = [];
  let created = 0;
  let skipped = 0;

  for (const themeData of THEME_ITEMS) {
    // Check if item already exists
    const existing = await prisma.item.findFirst({
      where: { key: themeData.key },
    });

    if (existing) {
      skipped++;
      results.push({ key: themeData.key, status: 'skipped', reason: 'already exists' });
      continue;
    }

    // Create theme item
    try {
      const item = await prisma.item.create({
        data: themeData as any,
      });

      created++;
      results.push({ key: themeData.key, status: 'created', id: item.id });
    } catch (error: any) {
      results.push({ 
        key: themeData.key, 
        status: 'error', 
        reason: error.message || 'Failed to create' 
      });
    }
  }

  // Log audit
  await prisma.actionLog.create({
    data: {
      userId: session.user.id,
      action: 'seed-themes',
      metadata: {
        created,
        skipped,
        total: THEME_ITEMS.length,
      },
    },
  });

  return successResponse({
    message: `Theme seed complete: ${created} created, ${skipped} skipped`,
    created,
    skipped,
    total: THEME_ITEMS.length,
    results,
  });
});

/**
 * DELETE /api/admin/seed-themes
 * Removes all theme items from database (admin only, for testing)
 */
export const DELETE = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    return forbiddenError('Admin access required');
  }

  const deleted = await prisma.item.deleteMany({
    where: {
      type: 'theme',
      key: { in: THEME_ITEMS.map(t => t.key) },
    },
  });

  // Log audit
  await prisma.actionLog.create({
    data: {
      userId: session.user.id,
      action: 'delete-themes',
      metadata: {
        count: deleted.count,
      },
    },
  });

  return successResponse({
    message: `Deleted ${deleted.count} theme items`,
    count: deleted.count,
  });
});

