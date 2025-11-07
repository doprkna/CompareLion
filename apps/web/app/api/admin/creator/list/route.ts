/**
 * Admin Creator List API
 * 
 * GET /api/admin/creator/list?limit=5
 * Returns creator economy system data
 * v0.30.1 - Feature Exposure
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, successResponse, validationError } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { safePrismaListMultiple } from '@/lib/admin/listHelper';

/**
 * GET /api/admin/creator/list
 * Get creator economy system records
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
      { name: 'creatorWallet', select: { id: true, userId: true, pendingBalance: true, paidBalance: true, totalEarned: true, createdAt: true } },
      { name: 'payoutPool', select: { id: true, totalAmount: true, distributionStatus: true, createdAt: true } },
    ],
    limit
  );

  const totalRecords = Object.values(results).reduce((sum, r) => sum + r.total, 0);
  const hasError = Object.values(results).some(r => r.error);

  return successResponse({
    system: 'creator',
    totalRecords,
    sample: results,
    status: hasError ? 'error' : totalRecords > 0 ? 'active' : 'empty',
  });
});