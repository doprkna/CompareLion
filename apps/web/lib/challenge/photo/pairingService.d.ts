/**
 * Photo Challenge Snack Pairing Service
 * Generate AI snack pairing suggestions (stub)
 * v0.37.13 - AI Snack Pairing
 */
export interface SnackPairing {
    pairing: string[];
    healthierAlternative: string | null;
    cached: boolean;
}
/**
 * Generate snack pairing suggestions for a photo entry
 * Stub implementation - returns placeholder suggestions for now
 *
 * @param entryId - Entry ID
 * @returns Pairing suggestions with healthier alternative
 */
export declare function generateSnackPairing(entryId: string): Promise<SnackPairing>;
/**
 * Get snack pairing suggestions (cached or generated)
 *
 * @param entryId - Entry ID
 * @returns Pairing suggestions
 */
export declare function getSnackPairing(entryId: string): Promise<SnackPairing>;
