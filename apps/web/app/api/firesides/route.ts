import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError } from '@/lib/api-handler';
import { z } from 'zod';

const CreateSchema = z.object({
  title: z.string().max(80).optional(),
  participantIds: z.array(z.string().min(1)).min(1).max(5),
});

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const me = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!me) return unauthorizedError('Unauthorized');

  const now = new Date();
  const list = await prisma.fireside.findMany({
    where: {
      isActive: true,
      expiresAt: { gt: now },
      OR: [
        { creatorId: me.id },
        { participantIds: { has: me.id } },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ success: true, firesides: list });
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return validationError('Invalid payload');

  const ids = Array.from(new Set(parsed.data.participantIds.concat(me.id))).slice(0, 5);
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

  const fs = await prisma.fireside.create({
    data: {
      title: parsed.data.title || null,
      creatorId: me.id,
      participantIds: ids,
      expiresAt,
      isActive: true,
    },
  });
  return NextResponse.json({ success: true, fireside: fs }, { status: 201 });
});


