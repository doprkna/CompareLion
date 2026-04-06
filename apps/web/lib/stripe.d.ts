/**
 * Stripe Integration (Client-Safe)
 * v0.36.21 - Monetization Foundations
 *
 * NOTE: Server-side Stripe operations moved to lib/stripe/server.ts
 * This file exports pricing plans and types only (safe for client)
 */
export { createCheckoutSession, createPaymentCheckoutSession, createPortalSession, verifyWebhookSignature, getSubscription, cancelSubscription, } from './stripe/server';
export interface PricingPlan {
    id: string;
    name: string;
    tier: 'PREMIUM' | 'CREATOR';
    price: number;
    interval: 'month' | 'year';
    features: string[];
    stripePriceId: string;
}
export declare const PRICING_PLANS: PricingPlan[];
