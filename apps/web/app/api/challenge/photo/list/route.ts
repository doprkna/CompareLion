/**
 * Photo Challenge List API
 * Get challenge entries by category
 * v0.37.12 - Photo Challenge
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse } from '@/lib/api-handler';
import { getChallengeEntries } from '@/lib/challenge/photo/photoService';

/**
 * GET /api/challenge/photo/list?category=XYZ
 * Get challenge entries, optionally filtered by category
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  // Get user ID if authenticated (for vote state)
  let userId: string | undefined;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    userId = user?.id;
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;

  const entries = await getChallengeEntries(category, userId);

  return successResponse({
    success: true,
    entries,
    count: entries.length,
  });
});

