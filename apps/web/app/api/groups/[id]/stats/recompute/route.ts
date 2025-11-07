import { NextRequest, NextResponse } from 'next/server';
import { safeAsync, unauthorizedError, notFoundError } from '@/lib/api-handler';
import { requireAdmin } from '@/lib/auth/adminAuth';
import { prisma } from '@/lib/db';
import { recomputeGroupStats } from '@/lib/groups/stats';

export const POST = safeAsync(async (req: NextRequest, ctx: { params: { id: string } }) => {
  const auth = await requireAdmin(req);
  if (!auth.success) return unauthorizedError(auth.error || 'Unauthorized');

  const { id } = ctx.params;
  const group = await prisma.group.findUnique({ where: { id } });
  if (!group) return notFoundError('Group not found');

  const stat = await recomputeGroupStats(id);
  return NextResponse.json({ success: true, stat });
});


