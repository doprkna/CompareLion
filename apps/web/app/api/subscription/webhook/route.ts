/**
 * Stripe Subscription Webhook Handler
 * v0.36.21 - Monetization Foundations
 */

import { NextRequest } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe/server';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse, validationError } from '@/lib/api-handler';
import { logger } from '@/lib/logger';
import Stripe from 'stripe';

export const runtime = 'nodejs';

/**
 * POST /api/subscription/webhook
 * Handle Stripe webhook events for subscriptions
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return validationError('Missing stripe-signature header');
  }

  let event: Stripe.Event;

  try {
    event = await verifyWebhookSignature(rawBody, signature);
  } catch (error) {
    logger.error('[SubscriptionWebhook] Signature verification failed', error);
    return validationError('Webhook signature verification failed');
  }

  // Handle different event types
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        logger.debug(`[SubscriptionWebhook] Unhandled event type: ${event.type}`);
    }

    return successResponse({ received: true });
  } catch (error) {
    logger.error(`[SubscriptionWebhook] Error handling event ${event.type}`, error);
    // Return success to Stripe to prevent retries, but log error
    return successResponse({ received: true, error: 'Handler error logged' });
  }
});

/**
 * Handle checkout.session.completed
 * Grants premium status when subscription checkout completes
 * Credits diamonds for one-time payments
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id || session.metadata?.userId;
  
  if (!userId) {
    logger.warn('[SubscriptionWebhook] No userId in checkout session', { sessionId: session.id });
    return;
  }

  // If it's a subscription, wait for subscription.created event
  if (session.mode === 'subscription') {
    logger.debug('[SubscriptionWebhook] Subscription checkout completed, waiting for subscription.created');
    return;
  }

  // Handle one-time payments (diamonds, etc.) - v0.36.21
  if (session.mode === 'payment' && session.metadata?.type === 'diamonds') {
    const amount = parseInt(session.metadata.amount || '0');
    const packId = session.metadata.packId;

    if (amount > 0) {
      // Credit diamonds to user
      await prisma.user.update({
        where: { id: userId },
        data: {
          diamonds: { increment: amount },
        },
      });

      // Record purchase (v0.36.21)
      try {
        await prisma.diamondPurchase.create({
          data: {
            userId,
            amount,
            stripeId: session.id,
          },
        });
      } catch (error) {
        // If DiamondPurchase model doesn't exist yet, log and continue
        logger.warn('[SubscriptionWebhook] Failed to record diamond purchase', error);
      }

      logger.info(`[SubscriptionWebhook] Credited ${amount} diamonds to user ${userId}`, {
        sessionId: session.id,
        packId,
      });
    }
  }
}

/**
 * Handle subscription created/updated
 * Sets user.isPremium = true
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    logger.warn('[SubscriptionWebhook] No userId in subscription metadata', { subscriptionId: subscription.id });
    return;
  }

  const isActive = subscription.status === 'active' || subscription.status === 'trialing';

  await prisma.user.update({
    where: { id: userId },
    data: {
      isPremium: isActive,
      premiumUntil: isActive ? null : new Date(), // null = ongoing, Date = expires
    },
  });

  logger.info(`[SubscriptionWebhook] Updated premium status for user ${userId}`, {
    subscriptionId: subscription.id,
    status: subscription.status,
    isPremium: isActive,
  });
}

/**
 * Handle subscription deleted/cancelled
 * Sets user.isPremium = false
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    logger.warn('[SubscriptionWebhook] No userId in subscription metadata', { subscriptionId: subscription.id });
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      isPremium: false,
      premiumUntil: new Date(), // Mark as expired
    },
  });

  logger.info(`[SubscriptionWebhook] Removed premium status for user ${userId}`, {
    subscriptionId: subscription.id,
  });
}

/**
 * Handle successful invoice payment
 * Ensures premium status is maintained
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = typeof invoice.subscription === 'string' 
    ? invoice.subscription 
    : invoice.subscription?.id;

  if (!subscriptionId) {
    return; // Not a subscription invoice
  }

  // Get subscription from Stripe to find userId
  try {
    const { stripeServer } = await import('@/lib/stripe/server');
    const subscription = await stripeServer.subscriptions.retrieve(subscriptionId);
    
    const userId = subscription.metadata?.userId;
    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          premiumUntil: null,
        },
      });
    }
  } catch (error) {
    logger.error('[SubscriptionWebhook] Error handling invoice payment', error);
  }
}

/**
 * Handle failed invoice payment
 * Optionally downgrade user (or wait for retry)
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  logger.warn('[SubscriptionWebhook] Invoice payment failed', {
    invoiceId: invoice.id,
    customerId: invoice.customer,
  });
  
  // Don't immediately revoke premium - Stripe will retry
  // Premium will be revoked if subscription is cancelled
}

