/**
 * Stripe Integration (v0.22.0)
 * Test mode stub for monetization layer
 */

import Stripe from 'stripe';

// Initialize Stripe with test keys
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

export interface PricingPlan {
  id: string;
  name: string;
  tier: 'PREMIUM' | 'CREATOR';
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'premium-monthly',
    name: 'Premium Monthly',
    tier: 'PREMIUM',
    price: 9.99,
    interval: 'month',
    stripePriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || 'price_test_premium_monthly',
    features: [
      'VIP comparisons',
      'Advanced analytics',
      'Premium badge',
      'Ad-free experience',
      'Priority support',
    ],
  },
  {
    id: 'premium-yearly',
    name: 'Premium Yearly',
    tier: 'PREMIUM',
    price: 99.99,
    interval: 'year',
    stripePriceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || 'price_test_premium_yearly',
    features: [
      'All Premium Monthly features',
      '2 months free',
    ],
  },
  {
    id: 'creator-monthly',
    name: 'Creator Monthly',
    tier: 'CREATOR',
    price: 19.99,
    interval: 'month',
    stripePriceId: process.env.STRIPE_CREATOR_MONTHLY_PRICE_ID || 'price_test_creator_monthly',
    features: [
      'All Premium features',
      'Creator tools',
      'Revenue sharing',
      'Custom branding',
      'Analytics dashboard',
    ],
  },
  {
    id: 'creator-yearly',
    name: 'Creator Yearly',
    tier: 'CREATOR',
    price: 199.99,
    interval: 'year',
    stripePriceId: process.env.STRIPE_CREATOR_YEARLY_PRICE_ID || 'price_test_creator_yearly',
    features: [
      'All Creator Monthly features',
      '2 months free',
      'Early access features',
    ],
  },
];

/**
 * Create a checkout session
 */
export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
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
 * Create a portal session for managing subscription
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}

/**
 * Get subscription details
 */
export async function getSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  subscriptionId: string
): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Webhook handler for Stripe events
 */
export async function handleStripeWebhook(
  body: string | Buffer,
  signature: string
): Promise<Stripe.Event> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  
  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}

export default stripe;

