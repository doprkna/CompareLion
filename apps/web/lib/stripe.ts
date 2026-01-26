/**
 * Stripe Integration (Client-Safe)
 * v0.36.21 - Monetization Foundations
 * 
 * NOTE: Server-side Stripe operations moved to lib/stripe/server.ts
 * This file exports pricing plans and types only (safe for client)
 */

// Re-export server functions for backward compatibility (server-side only)
export {
  createCheckoutSession,
  createPaymentCheckoutSession,
  createPortalSession,
  verifyWebhookSignature,
  getSubscription,
  cancelSubscription,
} from './stripe/server';

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
    stripePriceId: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || 'price_test_premium_monthly', // Optional: keep pricing IDs as direct env access
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

// All server-side Stripe functions are exported from ./stripe/server.ts above

