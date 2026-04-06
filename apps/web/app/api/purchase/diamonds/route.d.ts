/**
 * Diamond Purchase API
 * v0.36.21 - Monetization Foundations
 */
export declare const runtime = "nodejs";
/**
 * Diamond pack configurations
 */
export declare const DIAMOND_PACKS: readonly [{
    readonly id: "diamonds_100";
    readonly amount: 100;
    readonly price: 1.99;
    readonly stripePriceId: string;
}, {
    readonly id: "diamonds_600";
    readonly amount: 600;
    readonly price: 7.99;
    readonly stripePriceId: string;
}, {
    readonly id: "diamonds_1300";
    readonly amount: 1300;
    readonly price: 14.99;
    readonly stripePriceId: string;
}, {
    readonly id: "diamonds_2800";
    readonly amount: 2800;
    readonly price: 29.99;
    readonly stripePriceId: string;
}];
/**
 * POST /api/purchase/diamonds
 * Create Stripe checkout session for diamond purchase
 */
export declare const POST: any;
