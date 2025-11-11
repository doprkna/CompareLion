/**

// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';
 * Admin Localization List API
 * 
 * GET /api/admin/localization/list?limit=5
 * Returns localization system data
 * v0.30.1 - Feature Exposure
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, successResponse, validationError } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { safePrismaListMultiple } from '@/lib/admin/listHelper';

/**
 * GET /api/admin/localization/list
 * Get localization system records
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
      { name: 'translationKey', select: { id: true, namespace: true, key: true, en: true, isMissing: true, createdAt: true } },
      { name: 'languagePreference', select: { id: true, userId: true, languageCode: true, createdAt: true } },
    ],
    limit
  );

  const totalRecords = Object.values(results).reduce((sum, r) => sum + r.total, 0);
  const hasError = Object.values(results).some(r => r.error);

  return successResponse({
    system: 'localization',
    totalRecords,
    sample: results,
    status: hasError ? 'error' : totalRecords > 0 ? 'active' : 'empty',
  });
});
