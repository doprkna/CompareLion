/**
 * Database Integrity Utilities
 *
 * Shared utilities for checking database integrity
 * v0.30.2 - Database Integrity Sweep
 */
export interface ModelIntegrityResult {
    model: string;
    total: number;
    empty: boolean;
    nullViolations: Array<{
        field: string;
        count: number;
    }>;
    fkBroken: Array<{
        relation: string;
        count: number;
    }>;
}
export interface IntegritySummary {
    timestamp: string;
    totalModels: number;
    modelsWithRecords: number;
    emptyModels: number;
    modelsWithNullViolations: number;
    modelsWithFkBroken: number;
    results: ModelIntegrityResult[];
}
/**
 * Get all Prisma model names from DMMF
 */
export declare function getAllModelNames(): string[];
/**
 * Get model info from DMMF
 */
export declare function getModelInfo(modelName: string): any;
/**
 * Check for null violations in required fields
 */
export declare function checkNullViolations(modelName: string, modelInfo: any): Promise<Array<{
    field: string;
    count: number;
}>>;
/**
 * Check for broken foreign key relations
 */
export declare function checkBrokenFks(modelName: string, modelInfo: any): Promise<Array<{
    relation: string;
    count: number;
}>>;
/**
 * Check integrity for a single model
 */
export declare function checkModelIntegrity(modelName: string): Promise<ModelIntegrityResult>;
/**
 * Check integrity for all models (chunked for safety)
 */
export declare function checkAllModels(chunkSize?: number): Promise<ModelIntegrityResult[]>;
/**
 * Generate integrity summary
 */
export declare function generateSummary(results: ModelIntegrityResult[]): IntegritySummary;
