export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { clearSessionCookie } from '@/lib/auth/session';
import { safeAsync, successResponse } from '@/lib/api-handler';

export const POST = safeAsync(async (_req: NextRequest) => {
  // Clear the session cookie
  await clearSessionCookie();

  return successResponse(undefined, 'Logged out successfully');
});
