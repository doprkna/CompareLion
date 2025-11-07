/**
 * Admin Regional List API
 * 
 * GET /api/admin/regional/list?limit=5
 * Returns regional events system data
 * v0.30.1 - Feature Exposure
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, successResponse, validationError } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { safePrismaListMultiple } from '@/lib/admin/listHelper';

/**
 * GET /api/admin/regional/list
 * Get regional events system records
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
      { name: 'regionalEvent', select: { id: true, regionId: true, title: true, startDate: true, endDate: true, createdAt: true } },
      { name: 'culturalItem', select: { id: true, regionId: true, name: true, type: true, createdAt: true } },
    ],
    limit
  );

  const totalRecords = Object.values(results).reduce((sum, r) => sum + r.total, 0);
  const hasError = Object.values(results).some(r => r.error);

  return successResponse({
    system: 'regional',
    totalRecords,
    sample: results,
    status: hasError ? 'error' : totalRecords > 0 ? 'active' : 'empty',
  });
});