/**

// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';
 * Admin Economy List API
 * 
 * GET /api/admin/economy/list?limit=5
 * Returns economy system data
 * v0.30.1 - Feature Exposure
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, successResponse, validationError } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { safePrismaListMultiple } from '@/lib/admin/listHelper';

/**
 * GET /api/admin/economy/list
 * Get economy system records
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const auth = await requireAdmin(req);
  if (!auth.success || !auth.user) {
    return unauthorizedError('Admin required');
  }

  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '5', 10);
  if (limit < 1 || limit > 10) {
    return validationError('Limit must be between 1 and 10');
  }

  const results = await safePrismaListMultiple(
    [
      { name: 'economyStat', select: { id: true, date: true, totalGold: true, totalDiamonds: true, createdAt: true } },
      { name: 'treasury', select: { id: true, gold: true, diamonds: true, taxCollected: true, updatedAt: true } },
    ],
    limit
  );

  const totalRecords = Object.values(results).reduce((sum, r) => sum + r.total, 0);
  const hasError = Object.values(results).some(r => r.error);

  return successResponse({
    system: 'economy',
    totalRecords,
    sample: results,
    status: hasError ? 'error' : totalRecords > 0 ? 'active' : 'empty',
  });
});
