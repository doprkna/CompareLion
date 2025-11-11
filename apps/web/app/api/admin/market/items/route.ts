/**

// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';
 * Admin Market Items CRUD API
 * v0.34.3 - Update item metadata (category, tag, isFeatured)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import {
  safeAsync,
  authError,
  validationError,
  notFoundError,
  successResponse,
} from '@/lib/api-handler';
import { updateItemMetadata } from '@/lib/marketplace/featured';
import { MarketItemCategory } from '@/lib/marketplace/types';

/**
 * GET /api/admin/market/items
 * Returns all market items (admin view)
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

  const items = await prisma.marketItem.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });

  return successResponse({
    items: items.map((item) => ({
      ...item,
      price: Number(item.price),
    })),
    count: items.length,
  });
});

/**
 * PATCH /api/admin/market/items
 * Update item metadata (category, tag, isFeatured)
 */
export const PATCH = safeAsync(async (req: NextRequest) => {
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
  const { itemId, category, tag, isFeatured } = body;

  if (!itemId) {
    return validationError('Missing itemId');
  }

  // Check if item exists
  const item = await prisma.marketItem.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    return notFoundError('Item not found');
  }

  // Validate category
  const validCategories = ['item', 'cosmetic', 'booster', 'utility', 'social'];
  if (category && !validCategories.includes(category)) {
    return validationError('Invalid category');
  }

  // Update metadata
  await updateItemMetadata(itemId, {
    category: category as MarketItemCategory,
    tag: tag !== undefined ? tag : undefined,
    isFeatured: isFeatured !== undefined ? isFeatured : undefined,
  });

  const updatedItem = await prisma.marketItem.findUnique({
    where: { id: itemId },
  });

  return successResponse({
    item: {
      ...updatedItem,
      price: Number(updatedItem!.price),
    },
  }, 'Item updated successfully');
});
