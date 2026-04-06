/**
 * Compare Service
 * Fetch lightweight compare data for two users
 * v0.36.42 - Social Systems 1.0
 */
import { CompareData } from './types';
/**
 * Get compare data for two users
 * Lightweight queries - avoids large joins
 *
 * @param userAId - First user ID
 * @param userBId - Second user ID
 * @returns Compare data or null if blocked/invalid
 */
export declare function getCompareData(userAId: string, userBId: string): Promise<CompareData | null>;
