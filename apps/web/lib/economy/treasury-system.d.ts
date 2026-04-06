/**
 * Global Treasury System (v0.11.13)
 *
 * PLACEHOLDER: Collect taxes and fund community projects.
 */
/**
 * Collect tax from transaction
 */
export declare function collectTax(_data: {
    sourceType: string;
    sourceId?: string;
    amount: number;
    currency: "gold" | "diamond";
    userId?: string;
}): Promise<null>;
/**
 * Get treasury balance
 */
export declare function getTreasuryBalance(): Promise<null>;
/**
 * Spend from treasury for event/project
 */
export declare function spendFromTreasury(_amount: number, _currency: "gold" | "diamond", _purpose: "event" | "project"): Promise<null>;
/**
 * Donate to treasury
 */
export declare function donateToTreasury(_userId: string, _amount: number, _currency: "gold" | "diamond"): Promise<null>;
