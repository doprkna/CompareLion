/**
 * Admin Dev Lab Page
 * 
 * SSR page to display all backend systems and verify data flow
 * v0.30.0 - Admin God View
 */

import { requireAdmin } from '@/lib/authGuard';
import { AdminSystemCard } from '@/components/admin/AdminSystemCard';
import { prisma } from '@/lib/db';
import { getFlags } from '@/lib/config/flags';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// System definitions mapping to Prisma models
const SYSTEMS = [
  {
    name: 'Economy / Treasury',
    route: 'economy',
    models: ['economyStat', 'treasury', 'taxTransaction', 'dynamicPrice'] as const,
  },
  {
    name: 'Creator Economy',
    route: 'creator',
    models: ['creatorWallet', 'creatorTransaction', 'payoutPool', 'engagementMetric'] as const,
  },
  {
    name: 'Localization',
    route: 'localization',
    models: ['translationKey', 'languagePreference', 'language'] as const,
  },
  {
    name: 'Regional Events',
    route: 'regional',
    models: ['regionalEvent', 'regionConfig', 'regionSchedule'] as const,
  },
  {
    name: 'Timezones',
    route: 'timezones',
    models: ['userTimeZone'] as const,
  },
  {
    name: 'Lore / Chronicle / Narrative',
    route: 'lore',
    models: ['loreEntry', 'chronicle', 'narrativeQuest', 'worldChronicle'] as const,
  },
  {
    name: 'Moderation',
    route: 'moderation',
    models: ['moderationAction', 'moderationReport', 'report'] as const,
  },
  {
    name: 'Subscription',
    route: 'subscription',
    models: ['subscription', 'userSubscription', 'subscriptionPlan'] as const,
  },
];

async function getSystems() {
  try {
    const systemsWithCounts = await Promise.all(
      SYSTEMS.map(async (system) => {
        let totalCount = 0;
        let status: 'active' | 'empty' | 'error' = 'active';

        try {
          for (const modelName of system.models) {
            try {
              // Use Prisma client to count records
              const count = await (prisma as any)[modelName].count();
              totalCount += count;
            } catch (err) {
              // Model might not exist or have different name
            }
          }

          status = totalCount > 0 ? 'active' : 'empty';
        } catch (err) {
          status = 'error';
        }

        return {
          name: system.name,
          route: system.route,
          modelCount: totalCount,
          status,
        };
      })
    );

    return { systems: systemsWithCounts };
  } catch (error) {
    return { systems: [], error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export default async function DevLabPage() {
  // Require admin access
  await requireAdmin();

  const { systems, error } = await getSystems();
  const flags = getFlags();

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-text mb-2">ðŸ§  Admin Dev Lab</h1>
          <p className="text-subtle">Visibility and sanity check for all backend systems</p>
        </div>

        {/* Feature Flags Summary */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Feature Flags</CardTitle>
              <Link 
                href="/admin/flags" 
                className="text-sm text-blue-500 hover:text-blue-400 transition-colors"
              >
                Manage →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(flags).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1">
                  <span className="text-xs text-subtle truncate">{key}</span>
                  <Badge 
                    variant={
                      typeof value === 'boolean' 
                        ? (value ? 'default' : 'outline')
                        : 'secondary'
                    }
                    className="w-fit"
                  >
                    {String(value)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border-2 border-red-500 rounded-lg p-4">
            <p className="text-red-500 font-medium">Error: {error}</p>
          </div>
        )}

        {/* Systems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {systems.length > 0 ? (
            systems.map((system: any) => (
              <AdminSystemCard
                key={system.route}
                name={system.name}
                route={system.route}
                modelCount={system.modelCount}
                status={system.status}
              />
            ))
          ) : (
            <div className="col-span-full text-center text-subtle py-12">
              No systems found. Check API endpoint or database connection.
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="bg-card border-2 border-border rounded-lg p-4 mt-8">
          <p className="text-subtle text-sm text-center">
            ðŸ’¡ This page exposes all hidden backend systems and placeholder models for admin verification.
          </p>
        </div>
      </div>
    </div>
  );
}