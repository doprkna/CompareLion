import { NextRequest } from 'next/server';
import { getAvailableCategories } from '@/lib/flow/flow-skeleton';
import { safeAsync, successResponse } from '@/lib/api-handler';

/**
 * GET /api/flow/categories
 * Get available categories for flow
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const categories = await getAvailableCategories();
  
  return successResponse(categories);
});


