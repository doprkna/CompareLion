import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/adminAuth';
import { prisma } from '@/lib/db';
import { safeAsync, validationError } from '@/lib/api-handler';
import { invalidate } from '@/lib/cache/packCache';

export const POST = safeAsync(async (req: NextRequest) => {
  const auth = await requireAdmin(req);
  if (!auth.success) return NextResponse.json({ success: false, error: auth.error || 'Unauthorized' }, { status: 401 });

  const payload = await req.json().catch(() => null);
  if (!payload || !payload.pack) return validationError('Missing pack payload');

  const { pack, items } = payload as { pack: any; items?: any[] };

  const upserted = await prisma.$transaction(async (tx) => {
    const p = await tx.contentPack.upsert({
      where: { key: pack.key },
      update: { ...pack, updatedAt: new Date() },
      create: { ...pack },
    });

    if (Array.isArray(items) && items.length > 0) {
      // Replace all items for simplicity
      await tx.packItem.deleteMany({ where: { packId: p.id } });
      await tx.packItem.createMany({ data: items.map((it) => ({ ...it, packId: p.id })) });
    }

    return p;
  });

  invalidate('packs:');
  return NextResponse.json({ success: true, pack: upserted });
});


