/**
 * Database Health API (v0.29.22)
 * 
 * GET /api/db/health
 * Returns table counts and index health summary (admin only)
 */

import { NextRequest } from 'next/server';
import { safeAsync, unauthorizedError, successResponse } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { prisma } from '@/lib/db';

export const GET = safeAsync(async (_req: NextRequest) => {
  const auth = await requireAdmin(_req);
  if (!auth.success || !auth.user) {
    return unauthorizedError('Admin required');
  }

  try {
    // Get table counts for major tables
    const [
      userCount,
      reflectionCount,
      questionCount,
      badgeCount,
      questCount,
      notificationCount,
      activityCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.userReflection.count(),
      prisma.question.count(),
      prisma.badge.count(),
      prisma.quest.count(),
      prisma.notification.count(),
      prisma.activity.count(),
    ]);

    // Get index information using raw query
    const indexInfo = await prisma.$queryRaw<Array<{
      tablename: string;
      indexname: string;
      indexdef: string;
    }>>`
      SELECT 
        t.relname as tablename,
        i.relname as indexname,
        pg_get_indexdef(i.oid) as indexdef
      FROM pg_class t
      JOIN pg_index ix ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      WHERE t.relkind = 'r'
        AND t.relname IN (
          'users', 'user_reflections', 'user_badges', 
          'user_quests', 'transactions', 'user_lore_entries',
          'notifications', 'activities'
        )
      ORDER BY t.relname, i.relname
      LIMIT 50
    `.catch(() => []);

    // Get index count per table
    const indexCounts = await prisma.$queryRaw<Array<{
      tablename: string;
      index_count: bigint;
    }>>`
      SELECT 
        t.relname as tablename,
        COUNT(i.oid) as index_count
      FROM pg_class t
      LEFT JOIN pg_index ix ON t.oid = ix.indrelid
      LEFT JOIN pg_class i ON i.oid = ix.indexrelid
      WHERE t.relkind = 'r'
        AND t.relname IN (
          'users', 'user_reflections', 'user_badges', 
          'user_quests', 'transactions', 'user_lore_entries',
          'notifications', 'activities'
        )
      GROUP BY t.relname
      ORDER BY t.relname
    `.catch(() => []);

    // Check for missing composite indexes
    const missingIndexes: string[] = [];
    const expectedIndexes = [
      { table: 'user_reflections', pattern: 'userId.*createdAt.*DESC' },
      { table: 'user_badges', pattern: 'userId.*isClaimed' },
      { table: 'user_quests', pattern: 'userId.*isCompleted.*isClaimed' },
      { table: 'transactions', pattern: 'userId.*createdAt.*DESC' },
      { table: 'user_lore_entries', pattern: 'userId.*createdAt.*DESC' },
    ];

    const indexDefs = (indexInfo || []).map(idx => idx.indexdef.toLowerCase());
    
    for (const expected of expectedIndexes) {
      const hasIndex = indexDefs.some(def => 
        def.includes(expected.table.toLowerCase()) && 
        expected.pattern.split('.*').every(part => def.includes(part.toLowerCase()))
      );
      if (!hasIndex) {
        missingIndexes.push(`${expected.table}: ${expected.pattern}`);
      }
    }

    return successResponse({
      tables: {
        users: userCount,
        reflections: reflectionCount,
        questions: questionCount,
        badges: badgeCount,
        quests: questCount,
        notifications: notificationCount,
        activities: activityCount,
      },
      indexes: {
        total: indexInfo?.length || 0,
        byTable: indexCounts?.map(ic => ({
          table: ic.tablename,
          count: Number(ic.index_count),
        })) || [],
      },
      missingIndexes,
      health: {
        status: missingIndexes.length === 0 ? 'healthy' : 'needs_attention',
        message: missingIndexes.length === 0
          ? 'All expected indexes are present'
          : `${missingIndexes.length} expected indexes may be missing`,
      },
    });

  } catch (error) {
    return successResponse({
      error: error instanceof Error ? error.message : 'Unknown error',
      health: {
        status: 'error',
        message: 'Failed to retrieve database health',
      },
    });
  }
});

