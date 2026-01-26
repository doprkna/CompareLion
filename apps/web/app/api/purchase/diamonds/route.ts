/**
 * Diamond Purchase API
 * v0.36.21 - Monetization Foundations
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { createPaymentCheckoutSession } from '@/lib/stripe/server';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, notFoundError, validationError, successResponse } from '@/lib/api-handler';
import { logger } from '@/lib/logger';

export const runtime = 'nodejs';

/**
 * Diamond pack configurations
 */
export const DIAMOND_PACKS = [
  { id: 'diamonds_100', amount: 100, price: 1.99, stripePriceId: process.env.STRIPE_DIAMONDS_100_PRICE_ID || 'price_diamonds_100' },
  { id: 'diamonds_600', amount: 600, price: 7.99, stripePriceId: process.env.STRIPE_DIAMONDS_600_PRICE_ID || 'price_diamonds_600' },
  { id: 'diamonds_1300', amount: 1300, price: 14.99, stripePriceId: process.env.STRIPE_DIAMONDS_1300_PRICE_ID || 'price_diamonds_1300' },
  { id: 'diamonds_2800', amount: 2800, price: 29.99, stripePriceId: process.env.STRIPE_DIAMONDS_2800_PRICE_ID || 'price_diamonds_2800' },
] as const;

/**
 * POST /api/purchase/diamonds
 * Create Stripe checkout session for diamond purchase
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true },
  });

  if (!user) {
    return notFoundError('User not found');
  }

  const body = await req.json().catch(() => ({}));
  const { packId } = body;

  if (!packId) {
    return validationError('Missing required field: packId');
  }

  // Find the diamond pack
  const pack = DIAMOND_PACKS.find(p => p.id === packId);
  if (!pack) {
    return validationError(`Invalid pack ID: ${packId}`);
  }

  // Get base URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Create checkout session
  const checkoutSession = await createPaymentCheckoutSession(
    user.id,
    user.email || '',
    pack.stripePriceId,
    `${baseUrl}/purchase/success?session_id={CHECKOUT_SESSION_ID}&type=diamonds&amount=${pack.amount}`,
    `${baseUrl}/purchase/cancelled`,
    {
      packId: pack.id,
      amount: pack.amount.toString(),
      type: 'diamonds',
    }
  );

  logger.info(`[DiamondPurchase] Created checkout session for user ${user.id}`, {
    packId: pack.id,
    amount: pack.amount,
    sessionId: checkoutSession.id,
  });

  return successResponse({
    sessionId: checkoutSession.id,
    url: checkoutSession.url,
    pack: {
      id: pack.id,
      amount: pack.amount,
      price: pack.price,
    },
  });
});

