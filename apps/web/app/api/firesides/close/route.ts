import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { z } from 'zod';

const CloseSchema = z.object({ firesideId: z.string().min(1) });

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = CloseSchema.safeParse(body);
  if (!parsed.success) return validationError('Invalid payload');

  const fs = await (prisma as any).fireside.findUnique({ where: { id: parsed.data.firesideId } });
  if (!fs) return validationError('Not found');
  if (fs.creatorId !== me.id) return unauthorizedError('Only creator can close');

  await (prisma as any).fireside.update({ where: { id: fs.id }, data: { isActive: false } });
  return successResponse({ closed: true }) as any;
});


