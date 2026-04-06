/**
 * Stripe Server-Side Integration
 * v0.36.21 - Monetization Foundations
 *
 * IMPORTANT: This module ONLY runs server-side, never during build
 */
import Stripe from 'stripe';
/**
 * Get Stripe instance (server-side only)
 * Returns dummy object if STRIPE_SECRET_KEY not available (for build safety)
 */
declare function getStripe(): Stripe;
/**
 * Create checkout session for subscription
 */
export declare function createCheckoutSession(userId: string, userEmail: string, priceId: string, successUrl: string, cancelUrl: string): Promise<Stripe.Checkout.Session>;
/**
 * Create checkout session for one-time payment (diamonds, etc.)
 */
export declare function createPaymentCheckoutSession(userId: string, userEmail: string, priceId: string, successUrl: string, cancelUrl: string, metadata?: Record<string, string>): Promise<Stripe.Checkout.Session>;
/**
 * Create portal session for managing subscription
 */
export declare function createPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session>;
/**
 * Verify webhook signature
 */
export declare function verifyWebhookSignature(body: string | Buffer, signature: string): Promise<Stripe.Event>;
/**
 * Get subscription details
 */
export declare function getSubscription(subscriptionId: string): Promise<Stripe.Subscription>;
/**
 * Cancel subscription
 */
export declare function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription>;
export declare const stripeServer: Stripe;
export { getStripe };
