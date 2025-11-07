/**
 * Admin System List API
 * 
 * GET /api/admin/[system]/list?limit=5
 * Returns records for a specific system
 * v0.30.0 - Admin God View
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, successResponse, validationError } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@/lib/db';

// Model name mapping by system route
const SYSTEM_MODELS: Record<string, string[]> = {
  economy: ['economyStat', 'treasury', 'taxTransaction', 'dynamicPrice'],
  creator: ['creatorWallet', 'creatorTransaction', 'payoutPool', 'engagementMetric'],
  localization: ['translationKey', 'languagePreference', 'language'],
  regional: ['regionalEvent', 'regionConfig', 'regionSchedule'],
  timezones: ['userTimeZone'],
  lore: ['loreEntry', 'chronicle', 'narrativeQuest', 'worldChronicle'],
  moderation: ['moderationAction', 'moderationReport', 'report'],
  subscription: ['subscription', 'userSubscription', 'subscriptionPlan'],
};

/**
 * GET /api/admin/[system]/list
 * Get records for a specific system
 */
export const GET = safeAsync(async (
  req: NextRequest,
  { params }: { params: { system: string } }
) => {
  const auth = await requireAdmin(req);
  if (!auth.success || !auth.user) {
    return unauthorizedError('Admin required');
  }

  const system = params.system;
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '5', 10);
  const showPlaceholders = req.nextUrl.searchParams.get('show_placeholders') === 'true';

  if (limit < 1 || limit > 100) {
    return validationError('Limit must be between 1 and 100');
  }

  const models = SYSTEM_MODELS[system];
  if (!models) {
    return validationError(`Unknown system: ${system}`);
  }

  try {
    const results: Record<string, any[]> = {};

    for (const modelName of models) {
      try {
        // Try to fetch records from Prisma
        const records = await (prisma as any)[modelName].findMany({
          take: limit,
          orderBy: { createdAt: 'desc' },
        });

        // Convert BigInt and Date to JSON-serializable format
        const sanitized = records.map((record: any) => {
          const sanitized: any = {};
          for (const [key, value] of Object.entries(record)) {
            if (typeof value === 'bigint') {
              sanitized[key] = value.toString();
            } else if (value instanceof Date) {
              sanitized[key] = value.toISOString();
            } else {
              sanitized[key] = value;
            }
          }
          return sanitized;
        });

        results[modelName] = sanitized.length > 0 || showPlaceholders ? sanitized : [];
      } catch (err) {
        // Model might not exist or have different name
        results[modelName] = showPlaceholders ? [] : [];
      }
    }

    return successResponse({
      system,
      limit,
      records: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return successResponse({
      system,
      records: {},
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});