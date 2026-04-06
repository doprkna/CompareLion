/**
 * Canonical wallet DTO used across all wallet-returning APIs.
 * Maps DB fields (funds, diamonds) to API fields (gold, diamonds).
 * v0.43.40 - Wallet Consistency
 */
export type WalletDTO = {
    gold: number;
    diamonds: number;
};
export declare function toWalletDTO(user: {
    funds?: unknown;
    diamonds?: number | null;
}): WalletDTO;
