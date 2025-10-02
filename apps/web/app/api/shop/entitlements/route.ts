export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const entitlements = await prisma.entitlement.findMany({
      where: { userId },
      include: { product: { include: { prices: true } } }
    });
    return NextResponse.json({ success: true, entitlements });
  } catch (err) {
    console.error('Entitlements fetch error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch entitlements' }, { status: 500 });
  }
}
