import { NextRequest, NextResponse } from 'next/server';
import { safeAsync, validationError, unauthorizedError } from '@/lib/api-handler';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export const POST = safeAsync(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (!(auth as any).user && !(auth as any).error) return auth as NextResponse;

  const userId = (auth as any).user?.id as string | undefined;
  if (!userId) return unauthorizedError('Unauthorized');

  const body = await req.json();
  const text: string = (body?.text || '').trim();
  if (text.length < 3) return validationError('Text too short');
  if (text.length > 200) return validationError('Text too long');

  const saved = await prisma.reflection.create({
    data: { userId, text },
    select: { id: true, text: true, createdAt: true },
  });

  return NextResponse.json({ success: true, reflection: saved, timestamp: new Date().toISOString() }, { status: 201 });
});

export const GET = safeAsync(async (req: NextRequest) => {
  const auth = await requireAuth(req);
  if (!(auth as any).user && !(auth as any).error) return auth as NextResponse;

  const userId = (auth as any).user?.id as string | undefined;
  if (!userId) return unauthorizedError('Unauthorized');

  const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '5', 10), 20);

  const items = await prisma.reflection.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: { id: true, text: true, createdAt: true },
  });

  return NextResponse.json({ success: true, reflections: items, count: items.length, timestamp: new Date().toISOString() });
});


