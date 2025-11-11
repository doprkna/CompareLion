/**

// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';
 * Admin Systems Overview API
 * 
 * GET /api/admin/systems
 * Returns all major systems with record counts
 * v0.30.0 - Admin God View
 * v0.30.1 - Feature Exposure: Added route references
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@/lib/db';

// System definitions mapping to Prisma models
const SYSTEMS = [
  {
    name: 'Economy / Treasury',
    route: 'economy',
    apiRoute: '/api/admin/economy/list',
    models: ['economyStat', 'treasury', 'taxTransaction', 'dynamicPrice'] as const,
  },
  {
    name: 'Creator Economy',
    route: 'creator',
    apiRoute: '/api/admin/creator/list',
    models: ['creatorWallet', 'creatorTransaction', 'payoutPool', 'engagementMetric'] as const,
  },
  {
    name: 'Localization',
    route: 'localization',
    apiRoute: '/api/admin/localization/list',
    models: ['translationKey', 'languagePreference', 'language'] as const,
  },
  {
    name: 'Regional Events',
    route: 'regional',
    apiRoute: '/api/admin/regional/list',
    models: ['regionalEvent', 'regionConfig', 'regionSchedule'] as const,
  },
  {
    name: 'Timezones',
    route: 'timezone',
    apiRoute: '/api/admin/timezone/list',
    models: ['userTimeZone', 'regionSchedule'] as const,
  },
  {
    name: 'Lore / Chronicle / Narrative',
    route: 'lore',
    apiRoute: '/api/admin/lore/list',
    models: ['loreEntry', 'chronicle', 'narrativeQuest', 'worldChronicle'] as const,
  },
  {
    name: 'Moderation',
    route: 'moderation',
    apiRoute: '/api/admin/moderation/list',
    models: ['moderationAction', 'moderationReport', 'report'] as const,
  },
  {
    name: 'Subscription',
    route: 'subscription',
    apiRoute: '/api/admin/subscription/list',
    models: ['subscription', 'userSubscription', 'subscriptionPlan'] as const,
  },
];

/**
 * GET /api/admin/systems
 * Get all systems with record counts
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const auth = await requireAdmin(req);
  if (!auth.success || !auth.user) {
    return unauthorizedError('Admin required');
  }

  try {
    const systemsWithCounts = await Promise.all(
      SYSTEMS.map(async (system) => {
        let totalCount = 0;
        const modelCounts: Record<string, number> = {};
        let status: 'active' | 'empty' | 'error' = 'active';

        try {
          for (const modelName of system.models) {
            try {
              // Use Prisma client to count records
              const count = await (prisma as any)[modelName].count();
              modelCounts[modelName] = count;
              totalCount += count;
            } catch (err) {
              // Model might not exist or have different name
              modelCounts[modelName] = 0;
            }
          }

          status = totalCount > 0 ? 'active' : 'empty';
        } catch (err) {
          status = 'error';
        }

        return {
          name: system.name,
          route: system.route,
          apiRoute: system.apiRoute,
          modelCount: totalCount,
          status,
          details: modelCounts,
        };
      })
    );

    return successResponse({
      systems: systemsWithCounts,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return successResponse({
      systems: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});
