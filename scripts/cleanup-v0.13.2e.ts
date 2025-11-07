/**
 * Automated Cleanup Script for v0.13.2e
 * Removes console.log, unused imports, and fixes import paths
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface CleanupStats {
  filesProcessed: number;
  consoleLogsRemoved: number;
  unusedImportsRemoved: number;
  relativeImportsFixed: number;
  errors: string[];
}

const stats: CleanupStats = {
  filesProcessed: 0,
  consoleLogsRemoved: 0,
  unusedImportsRemoved: 0,
  relativeImportsFixed: 0,
  errors: []
};

const isDryRun = process.argv.includes('--dry-run');

/**
 * Remove console.log but keep console.error, console.warn, console.info
 */
function removeConsoleLogs(content: string, filePath: string): string {
  const lines = content.split('\n');
  const newLines: string[] = [];
  let removed = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip if it's in debug.ts
    if (filePath.includes('debug.ts') || filePath.includes('lib\\utils\\debug.ts')) {
      newLines.push(line);
      continue;
    }
    
    // Skip if inside DEBUG guard
    if (i > 0 && lines[i-1].includes('DEBUG_API') || lines[i-1].includes('DEBUG')) {
      newLines.push(line);
      continue;
    }
    
    // Remove console.log lines
    if (trimmed.startsWith('console.log(')) {
      // Check if it's a multi-line console.log
      let bracketCount = (line.match(/\(/g) || []).length - (line.match(/\)/g) || []).length;
      
      if (bracketCount === 0) {
        // Single line, skip it
        removed++;
        continue;
      } else {
        // Multi-line, skip until closing bracket
        while (i < lines.length - 1 && bracketCount > 0) {
          i++;
          bracketCount += (lines[i].match(/\(/g) || []).length - (lines[i].match(/\)/g) || []).length;
        }
        removed++;
        continue;
      }
    }
    
    newLines.push(line);
  }
  
  stats.consoleLogsRemoved += removed;
  return newLines.join('\n');
}

/**
 * Fix relative imports to use @/ alias
 */
function fixRelativeImports(content: string): string {
  let fixed = 0;
  
  // Replace ../../../ style imports with @/
  const updated = content.replace(
    /from\s+['"](\.\.(\/\.\.)+)(\/[^'"]+)['"]/g,
    (match, dots, _, rest) => {
      fixed++;
      return `from '@${rest}'`;
    }
  );
  
  stats.relativeImportsFixed += fixed;
  return updated;
}

/**
 * Process a single file
 */
async function processFile(filePath: string): Promise<void> {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const original = content;
    
    // Apply transformations
    content = removeConsoleLogs(content, filePath);
    content = fixRelativeImports(content);
    
    // Write back if changed
    if (content !== original && !isDryRun) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Cleaned: ${filePath}`);
    } else if (content !== original) {
      console.log(`[DRY RUN] Would clean: ${filePath}`);
    }
    
    stats.filesProcessed++;
    
  } catch (error) {
    stats.errors.push(`${filePath}: ${error}`);
    console.error(`❌ Error processing ${filePath}:`, error);
  }
}

/**
 * Main cleanup function
 */
async function cleanup(): Promise<void> {
  console.log('🧹 Starting v0.13.2e cleanup...');
  console.log(isDryRun ? '⚠️  DRY RUN MODE\n' : '🔥 LIVE MODE\n');
  
  // Find all TypeScript files in app, components, and lib
  const patterns = [
    'apps/web/app/**/*.{ts,tsx}',
    'apps/web/components/**/*.{ts,tsx}',
    'apps/web/lib/**/*.{ts,tsx}',
    '!apps/web/lib/utils/debug.ts', // Exclude debug.ts
    '!apps/web/node_modules/**',
    '!apps/web/.next/**'
  ];
  
  const files: string[] = [];
  for (const pattern of patterns) {
    if (pattern.startsWith('!')) continue;
    const matches = await glob(pattern, { ignore: patterns.filter(p => p.startsWith('!')) });
    files.push(...matches);
  }
  
  console.log(`Found ${files.length} files to process\n`);
  
  // Process each file
  for (const file of files) {
    await processFile(file);
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 CLEANUP SUMMARY');
  console.log('='.repeat(60));
  console.log(`Files processed:         ${stats.filesProcessed}`);
  console.log(`console.log removed:     ${stats.consoleLogsRemoved}`);
  console.log(`Relative imports fixed:  ${stats.relativeImportsFixed}`);
  console.log(`Errors encountered:      ${stats.errors.length}`);
  console.log('='.repeat(60));
  
  if (stats.errors.length > 0) {
    console.log('\n❌ Errors:');
    stats.errors.forEach(e => console.log(`  - ${e}`));
  }
  
  if (isDryRun) {
    console.log('\n💡 Run without --dry-run to apply changes');
  } else {
    console.log('\n✅ Cleanup complete!');
  }
}

// Run cleanup
cleanup()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  });

