/**
 * Stripe Server-Side Integration
 * v0.36.21 - Monetization Foundations
 * 
 * IMPORTANT: This module ONLY runs server-side, never during build
 */

import Stripe from 'stripe';
import { env } from '@/lib/env';

// Ensure this only runs server-side
if (typeof window !== 'undefined') {
  throw new Error('Stripe server module cannot run in browser');
}

let _stripe: Stripe | null = null;

/**
 * Get Stripe instance (server-side only)
 * Returns dummy object if STRIPE_SECRET_KEY not available (for build safety)
 */
function getStripe(): Stripe {
  // During build, env may not be available - return safe dummy
  if (typeof process === 'undefined' || !process.env) {
    return createDummyStripe();
  }

  if (!_stripe) {
    const secretKey = env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    
    if (!secretKey) {
      // Return dummy for build safety
      return createDummyStripe();
    }

    try {
      _stripe = new Stripe(secretKey, {
        apiVersion: '2024-11-20.acacia',
        typescript: true,
      });
    } catch (error) {
      console.warn('[Stripe] Failed to initialize, using dummy:', error);
      return createDummyStripe();
    }
  }
  
  return _stripe;
}

/**
 * Create dummy Stripe instance for build safety
 */
function createDummyStripe(): Stripe {
  return {
    checkout: {
      sessions: {
        create: async () => ({
          id: 'dummy_session',
          url: null,
        } as any),
      },
    },
    billingPortal: {
      sessions: {
        create: async () => ({
          url: 'dummy_url',
        } as any),
      },
    },
    subscriptions: {
      retrieve: async () => ({} as any),
      cancel: async () => ({} as any),
    },
    webhooks: {
      constructEvent: () => ({} as any),
    },
  } as any as Stripe;
}

/**
 * Create checkout session for subscription
 */
export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  
  // Validate we have real Stripe (not dummy)
  if (!env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe not configured - STRIPE_SECRET_KEY missing');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: userEmail,
    client_reference_id: userId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        userId,
      },
    },
  });

  return session;
}

/**
 * Create checkout session for one-time payment (diamonds, etc.)
 */
export async function createPaymentCheckoutSession(
  userId: string,
  userEmail: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  
  if (!env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe not configured - STRIPE_SECRET_KEY missing');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: userEmail,
    client_reference_id: userId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      ...metadata,
    },
  });

  return session;
}

/**
 * Create portal session for managing subscription
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const stripe = getStripe();
  
  if (!env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe not configured - STRIPE_SECRET_KEY missing');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Verify webhook signature
 */
export async function verifyWebhookSignature(
  body: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const stripe = getStripe();
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || '';
  
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  }

  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}

/**
 * Get subscription details
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  
  if (!env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe not configured');
  }

  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  
  if (!env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe not configured');
  }

  return await stripe.subscriptions.cancel(subscriptionId);
}

// Export Stripe instance for direct access (use functions above when possible)
export const stripeServer = getStripe();

// Export getStripe for advanced use cases
export { getStripe };

