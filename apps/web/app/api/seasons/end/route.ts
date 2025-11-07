import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/auth/adminAuth';
import { z } from 'zod';

const Schema = z.object({ seasonId: z.string().min(1) });

export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get('x-cron-token');
  const auth = await requireAdmin(req);
  if (!token && (!auth.success || !auth.user)) return unauthorizedError('Admin or token required');
  const body = await req.json().catch(() => ({}));
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return validationError('Invalid payload');
  
  const season = await prisma.seasonStoryline.findUnique({ where: { id: parsed.data.seasonId } });
  if (!season) return validationError('Season not found');
  
  await prisma.seasonStoryline.update({ where: { id: parsed.data.seasonId }, data: { isActive: false } });
  return NextResponse.json({ success: true, ended: true });
});






