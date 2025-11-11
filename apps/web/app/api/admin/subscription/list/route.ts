/**

// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';
 * Admin Subscription List API
 * 
 * GET /api/admin/subscription/list?limit=5
 * Returns subscription system data
 * v0.30.1 - Feature Exposure
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, successResponse, validationError } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { safePrismaListMultiple } from '@/lib/admin/listHelper';

/**
 * GET /api/admin/subscription/list
 * Get subscription system records
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
      { name: 'userSubscription', select: { id: true, userId: true, status: true, planId: true, createdAt: true } },
      { name: 'subscriptionPlan', select: { id: true, name: true, price: true, features: true, active: true } },
    ],
    limit
  );

  const totalRecords = Object.values(results).reduce((sum, r) => sum + r.total, 0);
  const hasError = Object.values(results).some(r => r.error);

  return successResponse({
    system: 'subscription',
    totalRecords,
    sample: results,
    status: hasError ? 'error' : totalRecords > 0 ? 'active' : 'empty',
  });
});
