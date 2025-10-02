export const runtime = 'nodejs';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/server/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { id: userId } = getAuthedUser(req);
  // Ensure wallet exists
  const wallet = await prisma.wallet.upsert({
    where: { userId },
    update: {},
    create: { userId, funds: 1000, diamonds: 10 },
  });
  const ledgerPreview = await prisma.ledgerEntry.findMany({ where: { walletId: wallet.id }, orderBy: { createdAt: 'desc' }, take: 10 });
  return NextResponse.json({ success: true, funds: Number(wallet.funds), diamonds: wallet.diamonds, ledgerPreview });
}
