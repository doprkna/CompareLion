/**
 * Stripe Webhook Handlers (v0.11.11)
 *
 * PLACEHOLDER: Handle Stripe webhook events.
 */
/**
 * Handle subscription created
 */
export declare function handleSubscriptionCreated(_subscription: any): Promise<void>;
/**
 * Handle subscription updated
 */
export declare function handleSubscriptionUpdated(_subscription: any): Promise<void>;
/**
 * Handle subscription deleted
 */
export declare function handleSubscriptionDeleted(_subscription: any): Promise<void>;
/**
 * Handle payment succeeded
 */
export declare function handlePaymentSucceeded(_paymentIntent: any): Promise<void>;
/**
 * Handle payment failed
 */
export declare function handlePaymentFailed(_paymentIntent: any): Promise<void>;
/**
 * Verify Stripe webhook signature
 */
export declare function verifyWebhookSignature(_payload: string, _signature: string, _secret: string): boolean;
