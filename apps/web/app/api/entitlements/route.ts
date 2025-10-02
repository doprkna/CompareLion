export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getAuthedUser } from '@/lib/server/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  // Get mock or real authenticated user
  const { id: userId } = getAuthedUser(req);
  // Build filter
  const category = req.nextUrl.searchParams.get('category');
  const where: any = { userId };
  if (category) {
    where.product = { payload: { path: ['category'], equals: category } };
  }
  // Fetch entitlements with product info
  const entitlements = await prisma.entitlement.findMany({
    where,
    include: { product: true },
    orderBy: { createdAt: 'desc' },
  });
  // Map to response shape
  const result = entitlements.map(e => ({
    id: e.id,
    product: {
      id: e.product.id,
      title: e.product.title,
      payload: e.product.payload,
    },
    createdAt: e.createdAt,
  }));
  return NextResponse.json(result);
}
