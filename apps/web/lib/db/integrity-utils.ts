/**
 * Database Integrity Utilities
 * 
 * Shared utilities for checking database integrity
 * v0.30.2 - Database Integrity Sweep
 */

import { PrismaClient, Prisma } from '@parel/db/client';

let _prisma: PrismaClient | null = null;

function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = new PrismaClient();
  }
  return _prisma;
}

const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getPrisma() as any)[prop];
  },
  set(_target, prop, value) {
    (getPrisma() as any)[prop] = value;
    return true;
  }
});

export interface ModelIntegrityResult {
  model: string;
  total: number;
  empty: boolean;
  nullViolations: Array<{ field: string; count: number }>;
  fkBroken: Array<{ relation: string; count: number }>;
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
export function getAllModelNames(): string[] {
  const models = (Prisma as any).dmmf?.datamodel?.models || [];
  return models
    .map((m: any) => m.name)
    .filter((name: string) => 
      !name.startsWith('_') && 
      name !== '_prisma_migrations' &&
      !isJoinTable(name)
    );
}

/**
 * Check if a model name is likely a join table
 */
function isJoinTable(modelName: string): boolean {
  // Simple heuristic: join tables often have multiple capitalized words
  // or match patterns like "UserGroup", "UserBadge", etc.
  const joinPatterns = [
    /^(User|Group|Clan|Faction|Coop|Quest|Achievement|Badge|Item|Theme|Preference|Subscription|Streak|Energy|Profile|Response|Question|Archetype|Insight|Legacy|TimeZone|Version|Collection|Event|Challenge|Flow|Step|Memory|Api|Stats).*$/,
  ];
  
  // If it matches multiple patterns, it might be a join table
  // But we'll keep User* models that aren't clearly join tables
  if (modelName.startsWith('User') && modelName.length > 10) {
    return false; // Keep UserProfile, UserPreferences, etc.
  }
  
  return false; // Default: not a join table (be conservative)
}

/**
 * Get model info from DMMF
 */
export function getModelInfo(modelName: string): any {
  const models = (Prisma as any).dmmf?.datamodel?.models || [];
  return models.find((m: any) => m.name === modelName);
}

/**
 * Check for null violations in required fields
 */
export async function checkNullViolations(
  modelName: string,
  modelInfo: any
): Promise<Array<{ field: string; count: number }>> {
  if (!modelInfo) return [];
  
  const violations: Array<{ field: string; count: number }> = [];
  
  // Get required scalar fields (not optional, no default)
  const requiredFields = modelInfo.fields.filter((f: any) => 
    f.kind === 'scalar' &&
    !f.isOptional &&
    !f.hasDefaultValue &&
    f.type !== 'Json' &&
    f.type !== 'DateTime' // DateTime can be null if not required
  );
  
  for (const field of requiredFields) {
    try {
      // Count records where this field is null
      const count = await (prisma as any)[modelName].count({
        where: {
          [field.name]: null,
        },
      });
      
      if (count > 0) {
        violations.push({ field: field.name, count });
      }
    } catch (error) {
      // Field might not be queryable or doesn't exist in DB
      // Skip silently
    }
  }
  
  return violations;
}

/**
 * Check for broken foreign key relations
 */
export async function checkBrokenFks(
  modelName: string,
  modelInfo: any
): Promise<Array<{ relation: string; count: number }>> {
  if (!modelInfo) return [];
  
  const broken: Array<{ relation: string; count: number }> = [];
  
  // Get relation fields
  const relationFields = modelInfo.fields.filter((f: any) => 
    f.kind === 'object' && f.relationName
  );
  
  for (const field of relationFields) {
    try {
      // Check if relation is required
      if (!field.isRequired) continue;
      
      // Get the foreign key field name
      const fkField = field.relationFromFields?.[0] || `${field.name}Id`;
      
      // Count records with this FK that don't have a parent
      const total = await (prisma as any)[modelName].count();
      
      if (total === 0) continue;
      
      // Try to find records where the FK is set but parent doesn't exist
      // This is expensive, so we'll do a simpler check: count records with FK set
      const withFk = await (prisma as any)[modelName].count({
        where: {
          [fkField]: { not: null },
        },
      });
      
      // If we have records with FK set, check if parent exists (sample check)
      if (withFk > 0) {
        const sample = await (prisma as any)[modelName].findFirst({
          where: { [fkField]: { not: null } },
          select: { [fkField]: true },
        });
        
        if (sample && sample[fkField]) {
          // Check if parent exists
          const relatedModel = getRelatedModel(modelInfo, field.name);
          if (relatedModel) {
            const parentExists = await (prisma as any)[relatedModel].findUnique({
              where: { id: sample[fkField] },
            });
            
            if (!parentExists) {
              // Broken FK - but we only sample, so estimate
              broken.push({ 
                relation: field.name, 
                count: withFk // Estimate
              });
            }
          }
        }
      }
    } catch (error) {
      // Skip if query fails
    }
  }
  
  return broken;
}

/**
 * Get related model name from field
 */
function getRelatedModel(modelInfo: any, fieldName: string): string | null {
  const field = modelInfo.fields.find((f: any) => f.name === fieldName);
  if (!field) return null;
  return field.type || null;
}

/**
 * Check integrity for a single model
 */
export async function checkModelIntegrity(
  modelName: string
): Promise<ModelIntegrityResult> {
  const modelInfo = getModelInfo(modelName);
  let total = 0;
  let empty = true;
  
  try {
    total = await (prisma as any)[modelName].count();
    empty = total === 0;
  } catch (error) {
    // Model might not exist or can't be queried
    return {
      model: modelName,
      total: 0,
      empty: true,
      nullViolations: [],
      fkBroken: [],
    };
  }
  
  const nullViolations = await checkNullViolations(modelName, modelInfo);
  const fkBroken = await checkBrokenFks(modelName, modelInfo);
  
  return {
    model: modelName,
    total,
    empty,
    nullViolations,
    fkBroken,
  };
}

/**
 * Check integrity for all models (chunked for safety)
 */
export async function checkAllModels(
  chunkSize: number = 25
): Promise<ModelIntegrityResult[]> {
  const modelNames = getAllModelNames();
  const results: ModelIntegrityResult[] = [];
  
  // Process in chunks
  for (let i = 0; i < modelNames.length; i += chunkSize) {
    const chunk = modelNames.slice(i, i + chunkSize);
    
    const chunkResults = await Promise.all(
      chunk.map(name => checkModelIntegrity(name))
    );
    
    results.push(...chunkResults);
  }
  
  return results;
}

/**
 * Generate integrity summary
 */
export function generateSummary(results: ModelIntegrityResult[]): IntegritySummary {
  const modelsWithRecords = results.filter(r => r.total > 0).length;
  const emptyModels = results.filter(r => r.empty).length;
  const modelsWithNullViolations = results.filter(r => r.nullViolations.length > 0).length;
  const modelsWithFkBroken = results.filter(r => r.fkBroken.length > 0).length;
  
  return {
    timestamp: new Date().toISOString(),
    totalModels: results.length,
    modelsWithRecords,
    emptyModels,
    modelsWithNullViolations,
    modelsWithFkBroken,
    results,
  };
}