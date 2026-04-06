/**
 * GET /api/predictions - List prediction questions (open by default)
 */
import { NextRequest } from 'next/server';
import { successResponse } from '@/lib/api-handler';
import { getPredictionQuestions } from '@/lib/services/predictionService';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status') as 'open' | 'closed' | 'resolved' | null;
  const categoryId = searchParams.get('categoryId') ?? undefined;
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 100);

  const items = await getPredictionQuestions({
    status: status ?? 'open',
    categoryId,
    limit,
  });

  return successResponse({ items });
}
