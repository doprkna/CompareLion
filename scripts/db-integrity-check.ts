/**
 * Database Integrity Check Script
 * 
 * Validates all seeded data and migrations for consistency
 * v0.30.2 - Database Integrity Sweep
 * 
 * Usage:
 *   pnpm tsx scripts/db-integrity-check.ts
 *   pnpm tsx scripts/db-integrity-check.ts --save
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import {
  getAllModelNames,
  checkModelIntegrity,
  generateSummary,
  IntegritySummary,
} from '../apps/web/lib/db/integrity-utils';

const prisma = new PrismaClient();

async function main() {
  const save = process.argv.includes('--save');
  
  console.log('\n' + 'â•'.repeat(60));
  console.log('ðŸ” Database Integrity Check');
  console.log('â•'.repeat(60) + '\n');
  
  try {
    // Get all model names
    const modelNames = getAllModelNames();
    console.log(`ðŸ“‹ Found ${modelNames.length} models to check\n`);
    
    // Check integrity for all models (in chunks of 25)
    console.log('â³ Checking models...');
    const results: any[] = [];
    
    const chunkSize = 25;
    for (let i = 0; i < modelNames.length; i += chunkSize) {
      const chunk = modelNames.slice(i, i + chunkSize);
      console.log(`   Processing chunk ${Math.floor(i / chunkSize) + 1}/${Math.ceil(modelNames.length / chunkSize)} (${chunk.length} models)...`);
      
      const chunkResults = await Promise.all(
        chunk.map(async (modelName) => {
          try {
            return await checkModelIntegrity(modelName);
          } catch (error) {
            console.error(`   âš ï¸  Error checking ${modelName}:`, error);
            return {
              model: modelName,
              total: 0,
              empty: true,
              nullViolations: [],
              fkBroken: [],
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        })
      );
      
      results.push(...chunkResults);
    }
    
    // Generate summary
    const summary = generateSummary(results);
    
    // Display results
    console.log('\n' + 'â•'.repeat(60));
    console.log('ðŸ“Š INTEGRITY SUMMARY');
    console.log('â•'.repeat(60) + '\n');
    
    console.log(`Total Models: ${summary.totalModels}`);
    console.log(`Models with Records: ${summary.modelsWithRecords}`);
    console.log(`Empty Models: ${summary.emptyModels}`);
    console.log(`Models with Null Violations: ${summary.modelsWithNullViolations}`);
    console.log(`Models with Broken FKs: ${summary.modelsWithFkBroken}\n`);
    
    // Show empty tables
    const emptyModels = results.filter(r => r.empty);
    if (emptyModels.length > 0) {
      console.log('ðŸ“­ EMPTY MODELS:');
      emptyModels.forEach(r => {
        console.log(`   â€¢ ${r.model}`);
      });
      console.log('');
    }
    
    // Show null violations
    const nullViolations = results.filter(r => r.nullViolations.length > 0);
    if (nullViolations.length > 0) {
      console.log('âš ï¸  NULL VIOLATIONS:');
      nullViolations.forEach(r => {
        console.log(`   â€¢ ${r.model}:`);
        r.nullViolations.forEach(v => {
          console.log(`     - ${v.field}: ${v.count} records`);
        });
      });
      console.log('');
    }
    
    // Show broken FKs
    const brokenFks = results.filter(r => r.fkBroken.length > 0);
    if (brokenFks.length > 0) {
      console.log('ðŸ”— BROKEN FOREIGN KEYS:');
      brokenFks.forEach(r => {
        console.log(`   â€¢ ${r.model}:`);
        r.fkBroken.forEach(fk => {
          console.log(`     - ${fk.relation}: ${fk.count} records`);
        });
      });
      console.log('');
    }
    
    // Save to file if requested
    if (save) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `db-integrity-${timestamp}.json`;
      const logsDir = join(process.cwd(), 'logs');
      
      try {
        await mkdir(logsDir, { recursive: true });
        const filepath = join(logsDir, filename);
        await writeFile(filepath, JSON.stringify(summary, null, 2));
        console.log(`ðŸ’¾ Saved report to: ${filepath}\n`);
      } catch (error) {
        console.error('âŒ Error saving report:', error);
      }
    }
    
    console.log('â•'.repeat(60));
    console.log('âœ… Integrity check complete!');
    console.log('â•'.repeat(60) + '\n');
    
    // Return summary for programmatic use
    return summary;
  } catch (error) {
    console.error('\nâŒ Fatal error during integrity check:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { main };
