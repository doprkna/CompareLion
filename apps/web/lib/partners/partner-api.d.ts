/**
 * Partner API (v0.9.1)
 *
 * PLACEHOLDER: External API for brand and content collaboration.
 */
export interface PartnerTier {
    tier: "free" | "standard" | "premium" | "enterprise";
    name: string;
    rateLimit: number;
    dailyLimit: number;
    features: string[];
    price?: number;
}
export declare const PARTNER_TIERS: PartnerTier[];
export declare const API_SCOPES: {
    scope: string;
    description: string;
}[];
export declare const WEBHOOK_EVENTS: {
    event: string;
    description: string;
}[];
/**
 * Generate API key
 */
export declare function generateApiKey(): {
    key: string;
    hash: string;
    preview: string;
};
/**
 * Verify API key
 */
export declare function verifyApiKey(key: string, hash: string): boolean;
/**
 * Generate HMAC signature for webhooks
 */
export declare function generateWebhookSignature(payload: string, secret: string): string;
/**
 * Verify webhook signature
 */
export declare function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean;
/**
 * PLACEHOLDER: Register partner app
 */
export declare function registerPartnerApp(data: {
    name: string;
    contactEmail: string;
    website?: string;
    description?: string;
}): Promise<null>;
/**
 * PLACEHOLDER: Check rate limit
 */
export declare function checkRateLimit(partnerId: string, apiKeyId: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date;
}>;
/**
 * PLACEHOLDER: Send webhook
 */
export declare function sendWebhook(partnerId: string, eventType: string, payload: Record<string, any>): Promise<null>;
