/**
 * Bulk Console.log Remover
 * Processes all TS/TSX files and removes console.log (keeps console.error/warn/info)
 */

const fs = require('fs');
const path = require('path');

const stats = {
  filesProcessed: 0,
  filesModified: 0,
  consoleLogsRemoved: 0
};

const isDryRun = process.argv.includes('--dry-run');

function removeConsoleLogs(filePath, content) {
  // Skip debug.ts
  if (filePath.includes('debug.ts')) {
    return { content, removed: 0 };
  }
  
  const lines = content.split('\n');
  const newLines = [];
  let removed = 0;
  let skip = false;
  let skipLines = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // Skip lines from multi-line console.log
    if (skip && skipLines > 0) {
      skipLines--;
      if (line.includes(');')) {
        skip = false;
      }
      continue;
    }
    
    // Check for console.log
    if (trimmed.includes('console.log(')) {
      // Count brackets to handle multi-line
      const openCount = (line.match(/\(/g) || []).length;
      const closeCount = (line.match(/\)/g) || []).length;
      
      if (openCount > closeCount) {
        // Multi-line console.log - skip upcoming lines
        skip = true;
        skipLines = 10; // Max lines to skip
      }
      
      removed++;
      continue;
    }
    
    newLines.push(line);
  }
  
  return { content: newLines.join('\n'), removed };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { content: newContent, removed } = removeConsoleLogs(filePath, content);
    
    stats.filesProcessed++;
    
    if (removed > 0) {
      console.log(`  ${removed} removed from ${filePath.replace(/.*apps[\\/]web[\\/]/, '')}`);
      stats.consoleLogsRemoved += removed;
      stats.filesModified++;
      
      if (!isDryRun) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
      }
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
  }
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'coverage' && file !== 'dist') {
        walkDir(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

console.log('🧹 Removing console.log statements...\n');
console.log(isDryRun ? '⚠️  DRY RUN MODE\n' : '🔥 LIVE MODE\n');

const baseDir = path.join(__dirname, '../apps/web');
const dirs = ['app', 'lib', 'components'].map(d => path.join(baseDir, d));

for (const dir of dirs) {
  if (fs.existsSync(dir)) {
    console.log(`\nProcessing ${path.basename(dir)}/...`);
    const files = walkDir(dir);
    files.forEach(processFile);
  }
}

console.log('\n' + '='.repeat(60));
console.log('📊 SUMMARY');
console.log('='.repeat(60));
console.log(`Files processed:      ${stats.filesProcessed}`);
console.log(`Files modified:       ${stats.filesModified}`);
console.log(`console.log removed:  ${stats.consoleLogsRemoved}`);
console.log('='.repeat(60));

if (isDryRun) {
  console.log('\n💡 Run without --dry-run to apply changes');
} else {
  console.log('\n✅ Complete!');
}

