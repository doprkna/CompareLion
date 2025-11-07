import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { invalidate } from '@/lib/cache/packCache';
import { z } from 'zod';

const UnlockSchema = z.object({ packId: z.string().min(1) });

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = UnlockSchema.safeParse(body);
  if (!parsed.success) return validationError('Invalid unlock payload');

  const pack = await prisma.contentPack.findUnique({ where: { id: parsed.data.packId } });
  if (!pack || !pack.isActive) return notFoundError('Pack not found');

  const already = await prisma.userPack.findFirst({ where: { userId: user.id, packId: pack.id } });
  if (already) return NextResponse.json({ success: true, unlocked: true });

  // Premium validation: if premiumOnly, require any active subscription (MVP heuristic)
  if (pack.premiumOnly) {
    const anySub = await prisma.subscription?.findFirst?.({ where: { userId: user.id } } as any).catch?.(() => null);
    if (!anySub) return validationError('Premium pack requires subscription');
  }

  const price = pack.price || 0;
  if (price > 0 && (user.diamonds || 0) < price) {
    return validationError('Insufficient diamonds');
  }

  await prisma.$transaction(async (tx) => {
    if (price > 0) {
      await tx.user.update({ where: { id: user.id }, data: { diamonds: { decrement: price } } });
    }
    await tx.userPack.create({ data: { userId: user.id, packId: pack.id } });
  });

  invalidate('packs:');
  return NextResponse.json({ success: true, unlocked: true });
});


