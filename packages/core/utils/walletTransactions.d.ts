export interface WalletUpdate {
    userId: string;
    tenantId: string;
    fundsDelta?: number;
    diamondsDelta?: number;
    refType: string;
    refId?: string;
    note?: string;
}
export interface WalletBalance {
    funds: number;
    diamonds: number;
}
/**
 * Update wallet with SELECT FOR UPDATE to prevent race conditions
 */
export declare function updateWalletWithLock(update: WalletUpdate): Promise<{
    success: boolean;
    newBalance: WalletBalance;
    error?: string;
}>;
/**
 * Get wallet balance with lock (for checking balances before operations)
 */
export declare function getWalletBalanceWithLock(userId: string, tenantId: string): Promise<WalletBalance | null>;
/**
 * Transfer funds between wallets with locks
 */
export declare function transferBetweenWallets(fromUserId: string, toUserId: string, tenantId: string, fundsAmount: number, diamondsAmount?: number, refType?: string, note?: string): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Bulk wallet operations with proper locking
 */
export declare function bulkWalletUpdate(updates: WalletUpdate[]): Promise<{
    success: boolean;
    results: Array<{
        success: boolean;
        error?: string;
    }>;
}>;
