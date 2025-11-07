export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse, unauthorizedError } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    return unauthorizedError('Unauthorized');
  }
  
  const entitlements = await prisma.entitlement.findMany({
    where: { userId },
    include: { product: { include: { prices: true } } }
  });
  
  return successResponse({ entitlements });
});
