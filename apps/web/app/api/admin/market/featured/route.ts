/**

// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';
 * Admin Featured Items API
 * v0.34.3 - Rotate featured marketplace items
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import {
  safeAsync,
  authError,
  validationError,
  successResponse,
} from '@/lib/api-handler';
import {
  rotateFeaturedItems,
  autoSelectFeatured,
  getFeaturedItems,
} from '@/lib/marketplace/featured';
import { MAX_FEATURED_ITEMS } from '@/lib/marketplace/types';

/**
 * GET /api/admin/market/featured
 * Returns current featured items
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return authError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'DEVOPS')) {
    return authError('Admin access required');
  }

  const featuredItems = await getFeaturedItems();

  return successResponse({
    featured: featuredItems,
    count: featuredItems.length,
    maxFeatured: MAX_FEATURED_ITEMS,
  });
});

/**
 * POST /api/admin/market/featured
 * Rotate featured items (manual or auto)
 * Body: { itemIds?: string[], auto?: boolean }
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return authError('Unauthorized');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'DEVOPS')) {
    return authError('Admin access required');
  }

  const body = await req.json();
  const { itemIds, auto } = body;

  let selectedIds: string[];

  if (auto) {
    // Auto-select featured items
    selectedIds = await autoSelectFeatured();
  } else if (itemIds && Array.isArray(itemIds)) {
    // Manual selection
    if (itemIds.length > MAX_FEATURED_ITEMS) {
      return validationError(`Cannot feature more than ${MAX_FEATURED_ITEMS} items`);
    }
    selectedIds = itemIds;
  } else {
    return validationError('Provide either itemIds array or auto=true');
  }

  // Rotate featured items
  await rotateFeaturedItems(selectedIds);

  // Get updated featured items
  const featuredItems = await getFeaturedItems();

  return successResponse(
    {
      featured: featuredItems,
      count: featuredItems.length,
    },
    auto ? 'Featured items auto-selected' : 'Featured items updated'
  );
});
