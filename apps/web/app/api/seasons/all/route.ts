import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/auth/adminAuth';

export const GET = safeAsync(async (req: NextRequest) => {
  const auth = await requireAdmin(req);
  if (!auth.success) return unauthorizedError(auth.error || 'Unauthorized');
  const seasons = await prisma.seasonStoryline.findMany({ orderBy: { startDate: 'desc' }, include: { achievements: true } });
  return NextResponse.json({ success: true, seasons });
});






