export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  const url = new URL(req.url);
  const kindParam = url.searchParams.get('kind');
  const category = url.searchParams.get('category');
  const sort = url.searchParams.get('sort');

  const where: any = { active: true };
  if (kindParam) where.kind = kindParam;
  // category filter from payload JSON, simplistic JSON_CONTAINS style
  if (category) where.payload = { path: ['category'], equals: category }; // requires Prisma JSON filtering support

  let orderBy = undefined;
  if (sort === 'price_asc') orderBy = { prices: { unitAmount: 'asc' } };

  const products = await prisma.product.findMany({
    where,
    include: { prices: true },
    orderBy,
  });
  return successResponse({ products });
});
