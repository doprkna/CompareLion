export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe/server';
import { safeAsync, successResponse, validationError } from '@/lib/api-handler';
import { logger } from '@/lib/logger';
import Stripe from 'stripe';

/**
 * POST /api/shop/webhook
 * Legacy webhook route - redirects to subscription webhook for subscription events
 * Kept for backward compatibility
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return validationError('Missing stripe-signature header');
  }

  try {
    const event = await verifyWebhookSignature(rawBody, signature);
    
    // Handle shop-specific events (one-time purchases, etc.)
    // Subscription events should use /api/subscription/webhook
    
    logger.debug('[ShopWebhook] Received event', { type: event.type });
    
    return successResponse({ received: true });
  } catch (error) {
    logger.error('[ShopWebhook] Error processing webhook', error);
    return validationError('Webhook processing failed');
  }
});
