/**
 * Admin List Helper
 *
 * Shared helper for safely listing Prisma models with error handling
 * v0.30.1 - Feature Exposure
 */
export interface SafeListResult {
    records: any[];
    total: number;
    error?: boolean;
    message?: string;
}
/**
 * Safely list records from a Prisma model
 * @param modelName - Name of the Prisma model (e.g., 'economyStat')
 * @param limit - Maximum number of records to return (default: 5)
 * @param select - Optional select object to limit fields returned
 */
export declare function safePrismaList(modelName: string, limit?: number, select?: Record<string, boolean>): Promise<SafeListResult>;
/**
 * List multiple models and combine results
 */
export declare function safePrismaListMultiple(models: Array<{
    name: string;
    select?: Record<string, boolean>;
}>, limit?: number): Promise<Record<string, SafeListResult>>;
