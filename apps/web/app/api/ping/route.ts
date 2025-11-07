import { NextRequest } from 'next/server';
import { safeAsync, successResponse } from '@/lib/api-handler';

export const GET = safeAsync(async (_req: NextRequest) => {
  return successResponse({ status: 'ok' });
});

