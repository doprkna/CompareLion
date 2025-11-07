import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError } from '@/lib/api-handler';

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');
  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!user) return unauthorizedError('Unauthorized');

  const { moodKey } = await req.json().catch(() => ({}));
  const allowed = ['chill','deep','roast'];
  if (!moodKey || typeof moodKey !== 'string') return validationError('Invalid mood');

  await prisma.user.update({ where: { id: user.id }, data: { moodFeed: moodKey } });
  return NextResponse.json({ success: true });
});


