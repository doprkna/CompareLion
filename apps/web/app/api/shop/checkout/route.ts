export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { safeAsync, successResponse, validationError } from '@/lib/api-handler';

export const POST = safeAsync(async (req: NextRequest) => {
  const { productId } = await req.json();
  
  if (!productId) {
    return validationError('Missing productId');
  }
  
  // TODO: integrate with Stripe to create a real Checkout Session
  const dummyUrl = `https://stripe.com/checkout/session?product=${encodeURIComponent(productId)}`;
  
  return successResponse({ url: dummyUrl });
});
