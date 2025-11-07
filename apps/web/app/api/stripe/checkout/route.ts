export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_SECRET_KEY, NEXT_PUBLIC_APP_URL } from '@/lib/config';
import { prisma } from '@/lib/db';
import { getAuthedUser } from '@/lib/server/auth';
import { safeAsync, successResponse, validationError } from '@/lib/api-handler';

export const POST = safeAsync(async (req: NextRequest) => {
  const { productId } = await req.json();
  const { id: userId } = getAuthedUser(req);
  
  if (!productId) {
    return validationError('Missing productId');
  }
  
  // Fetch product and price
  const product = await prisma.product.findUnique({ where: { id: productId }, include: { prices: true } });
  if (!product || product.kind !== 'CURRENCY_PACK') {
    return validationError('Invalid product');
  }
  
  const price = product.prices[0];
  if (!price?.stripePriceId) {
    return validationError('Product not available for Stripe');
  }
  
  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' });
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: userId, // For simplicity; adjust as needed
    line_items: [{ price: price.stripePriceId, quantity: 1 }],
    success_url: `${NEXT_PUBLIC_APP_URL}/shop?success=true`,
    cancel_url: `${NEXT_PUBLIC_APP_URL}/shop?canceled=true`,
    metadata: { userId, productId },
  });
  
  return successResponse({ url: session.url });
});
