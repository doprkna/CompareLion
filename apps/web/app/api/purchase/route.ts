export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthedUser } from '@/lib/server/auth';
import { checkAndGrantPurchaseBadges } from '@/lib/services/badgeService';

export async function POST(req: NextRequest) {
  // Cosmetic purchase via wallet only
  const { productId, payment } = await req.json();
  const { id: userId } = getAuthedUser();
  if (!productId || !payment) {
    return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
  }
  // Load product and payload price
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.kind !== 'COSMETIC') {
    return NextResponse.json({ ok: false, error: 'Invalid cosmetic' }, { status: 400 });
  }
  const price = (product.payload as any).price;
  const cost = payment === 'funds' ? price.funds : price.diamonds;
  // Transaction: debit wallet, create ledger, purchase, entitlement
  return await prisma.$transaction(async (tx) => {
    // Lock and fetch wallet
    const wallet = await tx.wallet.findFirst({ where: { userId }, lock: { mode: 'ForUpdate' } });
    if (!wallet) throw new Error('Wallet missing');
    const bal = payment === 'funds' ? wallet.funds : wallet.diamonds;
    if (bal < cost) {
      return NextResponse.json({ ok: false, error: 'Insufficient balance' }, { status: 402 });
    }
    // Update wallet
    const update = payment === 'funds'
      ? { funds: wallet.funds - cost }
      : { diamonds: wallet.diamonds - cost };
    await tx.wallet.update({ where: { id: wallet.id }, data: update });
    // Create ledger entry
    await tx.ledgerEntry.create({ data: {
      walletId: wallet.id,
      kind: 'DEBIT',
      amount: cost,
      currency: payment === 'funds' ? 'FUNDS' : 'DIAMONDS',
      refType: 'purchase',
      refId: productId,
    }});
    // Create purchase
    const purchase = await tx.purchase.create({ data: {
      userId,
      productId,
      quantity: 1,
      totalMinor: 0,
      status: 'SUCCEEDED'
    }});
    // Grant entitlement
    const existing = await tx.entitlement.findUnique({ where: { userId_productId: { userId, productId } } });
    if (existing) {
      return NextResponse.json({ ok: false, error: 'Already owned' }, { status: 400 });
    }
    const ent = await tx.entitlement.create({ data: {
      userId,
      productId,
      meta: { category: (product.payload as any).category }
    }});
    
    // Grant badges after successful purchase
    const grantedBadges = await checkAndGrantPurchaseBadges(userId);
    
    return NextResponse.json({ 
      ok: true, 
      entitlementId: ent.id,
      badgesGranted: grantedBadges
    });
  });
}
