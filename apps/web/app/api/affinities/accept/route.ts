import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError } from '@/lib/api-handler';
import { z } from 'zod';

const AcceptSchema = z.object({ sourceId: z.string().min(1), type: z.enum(['friend','rival','mentor','romance']) });

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = AcceptSchema.safeParse(body);
  if (!parsed.success) return validationError('Invalid payload');

  const request = await prisma.affinity.findFirst({ where: { sourceId: parsed.data.sourceId, targetId: me.id, type: parsed.data.type, mutual: false } });
  if (!request) return validationError('No pending request');

  await prisma.$transaction(async (tx) => {
    await tx.affinity.update({ where: { id: request.id }, data: { mutual: true } });
    // Ensure reverse exists as mutual
    const reverse = await tx.affinity.findFirst({ where: { sourceId: me.id, targetId: parsed.data.sourceId, type: parsed.data.type } });
    if (reverse) {
      await tx.affinity.update({ where: { id: reverse.id }, data: { mutual: true } });
    } else {
      await tx.affinity.create({ data: { sourceId: me.id, targetId: parsed.data.sourceId, type: parsed.data.type, mutual: true } });
    }
  });

  return NextResponse.json({ success: true, accepted: true });
});


