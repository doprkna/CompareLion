export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { STRIPE_WEBHOOK_SECRET } from '@/lib/config';
import { safeAsync, successResponse, validationError } from '@/lib/api-handler';
import { logger } from '@/lib/utils/debug';

export const POST = safeAsync(async (req: NextRequest) => {
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature') || '';
  let _event: Stripe.Event;
  
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-11-20.acacia' });
    _event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.error('[WEBHOOK] Stripe signature verification failed', err);
    return validationError('Webhook signature verification failed');
  }

  // TODO: handle event types (checkout.session.completed, customer.subscription.*)

  return successResponse({ received: true });
});
