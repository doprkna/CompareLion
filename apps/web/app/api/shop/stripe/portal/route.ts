export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { safeAsync, successResponse } from '@/lib/api-handler';

export const POST = safeAsync(async (_req: NextRequest) => {
  // TODO: create Stripe customer portal session
  const url = 'https://stripe.com/customer-portal';
  
  return successResponse({ url });
});
