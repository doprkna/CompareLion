/**

// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';
 * Admin Reseed API
 * v0.35.14 - Unified with master seeder
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { ensurePrismaClient } from '@/lib/prisma-guard';
import { safeAsync, unauthorizedError, forbiddenError, successResponse } from '@/lib/api-handler';
import { seedAll } from '@/lib/seed/seedAll';

/**
 * POST /api/admin/reseed
 * Comprehensive database reseed for demo/testing
 */
export const POST = safeAsync(async (req: NextRequest) => {
  console.log('🔁 [Reseed] Request received from admin...');

  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ [Reseed] Blocked - production environment');
    return forbiddenError('Reseed not allowed in production');
  }

  ensurePrismaClient();
  
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    console.warn('⚠️ [Reseed] No session found');
    return unauthorizedError();
  }

  // Check if user is admin
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    console.warn('⚠️ [Reseed] Non-admin user attempted reseed');
    return forbiddenError('Admin access required');
  }

  console.log('✅ [Reseed] Admin authenticated, starting comprehensive seed...');

  // Run master seed function
  const result = await seedAll();

  // Build detailed message
  const successItems = [];
  if (result.stats.users > 0) successItems.push(`👥  users`);
  if (result.stats.achievements > 0) successItems.push(`🏆  achievements`);
  if (result.stats.items > 0) successItems.push(`📦  items`);
  if (result.stats.questions > 0) successItems.push(`❓  questions`);
  if (result.stats.messages > 0) successItems.push(`💬  messages`);
  if (result.stats.notifications > 0) successItems.push(`🔔  notifications`);
  if (result.stats.events > 0) successItems.push(`🌍  events`);
  if (result.stats.leaderboard > 0) successItems.push(`🏅  leaderboard entries`);

  const detailedMessage = result.success
    ? `Database reseeded successfully!\\n\\nCreated: `
    : `Database partially reseeded ( errors)\\n\\nCreated: \\n\\nErrors: `;

  console.log(`\\n📊 [Reseed] Complete! Duration: `);
  console.log('Stats:', result.stats);
  
  if (result.errors.length > 0) {
    console.warn('⚠️ Errors:', result.errors);
  }

  return successResponse({
    message: detailedMessage,
    summary: successItems.join(', '),
    stats: result.stats,
    errors: result.errors.length > 0 ? result.errors : undefined,
  });
});
