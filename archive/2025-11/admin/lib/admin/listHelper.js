/**
 * Admin List Helper
 *
 * Shared helper for safely listing Prisma models with error handling
 * v0.30.1 - Feature Exposure
 */
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';
/**
 * Safely list records from a Prisma model
 * @param modelName - Name of the Prisma model (e.g., 'economyStat')
 * @param limit - Maximum number of records to return (default: 5)
 * @param select - Optional select object to limit fields returned
 */
export async function safePrismaList(modelName, limit = 5, select) {
    try {
        const model = prisma[modelName];
        if (!model) {
            return {
                records: [],
                total: 0,
                error: true,
                message: `Model ${modelName} not found`,
            };
        }
        // Get total count
        const total = await model.count().catch(() => 0);
        // Get sample records
        const queryOptions = {
            take: limit,
            orderBy: { createdAt: 'desc' },
        };
        if (select) {
            queryOptions.select = select;
        }
        const records = await model.findMany(queryOptions).catch(() => []);
        // Sanitize records: convert BigInt and Date to JSON-serializable format
        const sanitized = records.map((record) => {
            const sanitized = {};
            for (const [key, value] of Object.entries(record)) {
                if (typeof value === 'bigint') {
                    sanitized[key] = value.toString();
                }
                else if (value instanceof Date) {
                    sanitized[key] = value.toISOString();
                }
                else {
                    sanitized[key] = value;
                }
            }
            return sanitized;
        });
        return {
            records: sanitized,
            total,
            error: false,
        };
    }
    catch (error) {
        logger.error(`Error listing ${modelName}:`, error);
        return {
            records: [],
            total: 0,
            error: true,
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
/**
 * List multiple models and combine results
 */
export async function safePrismaListMultiple(models, limit = 5) {
    const results = {};
    await Promise.all(models.map(async (model) => {
        const result = await safePrismaList(model.name, limit, model.select);
        results[model.name] = result;
    }));
    return results;
}
