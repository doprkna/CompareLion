/**
 * AI Reflection Generator
 * v0.19.0 - Generate personalized user reflections
 */
/**
 * Generate a reflection based on user activity
 */
export declare function generateReflection(userId: string, type?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'MILESTONE'): Promise<string>;
/**
 * Store reflection in database
 */
export declare function storeReflection(userId: string, type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'MILESTONE', content: string, stats?: any): Promise<void>;
