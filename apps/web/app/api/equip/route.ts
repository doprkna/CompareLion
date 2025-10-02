export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/server/auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { productId } = await req.json();
    const { id: userId } = getAuthedUser(req);
    if (!productId) {
      return NextResponse.json({ success: false, error: 'Missing productId' }, { status: 400 });
    }
    // Verify entitlement exists
    const ent = await prisma.entitlement.findUnique({ where: { userId_productId: { userId, productId } } });
    if (!ent) {
      return NextResponse.json({ success: false, error: 'Not entitled' }, { status: 403 });
    }
    // Determine category from payload
    const product = await prisma.product.findUnique({ where: { id: productId } });
    const category = (product?.payload as any).category;
    if (!category) {
      return NextResponse.json({ success: false, error: 'Cannot equip this product' }, { status: 400 });
    }
    // Upsert UserProfile
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        equippedAvatarId: category === 'avatar' ? productId : undefined,
        equippedBackgroundId: category === 'background' ? productId : undefined,
        equippedSkinId: category === 'ui_skin' ? productId : undefined,
      },
      create: {
        userId,
        equippedAvatarId: category === 'avatar' ? productId : null,
        equippedBackgroundId: category === 'background' ? productId : null,
        equippedSkinId: category === 'ui_skin' ? productId : null,
      },
    });
    return NextResponse.json({ success: true, profile });
  } catch (err) {
    console.error('Equip error:', err);
    return NextResponse.json({ success: false, error: 'Equip failed' }, { status: 500 });
  }
}
