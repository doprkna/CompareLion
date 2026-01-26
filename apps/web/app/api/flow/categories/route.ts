import { NextRequest } from 'next/server';
import { getAvailableCategories } from '@parel/features/flow';
import { safeAsync, successResponse } from '@/lib/api-handler';

// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';

/**
 * GET /api/flow/categories
 * Get available categories for flow
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const categories = await getAvailableCategories();
  
  return successResponse(categories);
});


