import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/app/api/_utils';
import { safeAsync, authError } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  const user = getUserFromRequest(req);
  if (!user) {
    return authError('Not logged in');
  }
  return NextResponse.json({ success: true, user });
});
