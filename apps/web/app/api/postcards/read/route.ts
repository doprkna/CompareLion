import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const ReadSchema = z.object({
  postcardId: z.string().min(1),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = ReadSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message || 'Invalid payload');
  }

  const postcard = await prisma.postcard.findUnique({
    where: { id: parsed.data.postcardId },
  });

  if (!postcard) return notFoundError('Postcard not found');
  if (postcard.receiverId !== user.id) {
    return unauthorizedError('Not your postcard');
  }

  if (postcard.status === 'deleted') {
    return validationError('Postcard already deleted');
  }

  await prisma.postcard.update({
    where: { id: postcard.id },
    data: { status: 'read' },
  });

  return NextResponse.json({ success: true, read: true });
});

