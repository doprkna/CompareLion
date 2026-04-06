/**
 * Return Bonus System (v0.11.9)
 *
 * PLACEHOLDER: Welcome back bonuses for inactive users.
 */
/**
 * Check for inactive users and grant return bonuses
 */
export declare function checkAndGrantReturnBonuses(): Promise<void>;
/**
 * Claim return bonus
 */
export declare function claimReturnBonus(_userId: string, _bonusId: string): Promise<null>;
