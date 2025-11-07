import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const ReactSchema = z.object({ firesideId: z.string().min(1), emoji: z.string().min(1).max(4) });

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const me = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!me) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = ReactSchema.safeParse(body);
  if (!parsed.success) return validationError('Invalid payload');

  const fs = await prisma.fireside.findUnique({ where: { id: parsed.data.firesideId } });
  if (!fs) return notFoundError('Not found');
  if (!fs.isActive || fs.expiresAt <= new Date()) return validationError('Fireside closed');
  if (fs.creatorId !== me.id && !fs.participantIds.includes(me.id)) return unauthorizedError('Access denied');

  // Rate limit: one reaction per 3s per user in this fireside
  const since = new Date(Date.now() - 3000);
  const recent = await prisma.firesideReaction.findFirst({ where: { firesideId: fs.id, userId: me.id, createdAt: { gt: since } } });
  if (recent) return validationError('Too fast');

  const r = await prisma.firesideReaction.create({ data: { firesideId: fs.id, userId: me.id, emoji: parsed.data.emoji } });
  return NextResponse.json({ success: true, reaction: r });
});


