/**
 * Safe Gold Operations
 * Prevents negative gold and ensures atomic operations
 * v0.36.14 - Economy Sanity Pass
 */
export interface GoldOperationResult {
    success: boolean;
    newBalance: number;
    error?: string;
}
/**
 * Safely add gold to user's account
 * Ensures gold never goes negative (though adding shouldn't cause this)
 */
export declare function safeAddGold(userId: string, amount: number): Promise<GoldOperationResult>;
/**
 * Safely spend gold from user's account
 * Checks balance before deducting, returns error if insufficient funds
 */
export declare function safeSpendGold(userId: string, amount: number): Promise<GoldOperationResult>;
