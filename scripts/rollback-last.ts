#!/usr/bin/env tsx

/**
 * Rollback Script (v0.14.0)
 * Reverts last commit and deployment
 * 
 * Usage:
 *   tsx scripts/rollback-last.ts
 */

import { execSync } from 'child_process';
import * as readline from 'readline';

/**
 * Execute command and log output
 */
function exec(command: string, options: any = {}): string {
  console.log(`\n🔧 Running: ${command}`);
  try {
    return execSync(command, {
      stdio: 'inherit',
      encoding: 'utf-8',
      ...options,
    });
  } catch (error) {
    console.error(`❌ Command failed: ${command}`);
    throw error;
  }
}

/**
 * Ask for user confirmation
 */
function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return new Promise((resolve) => {
    rl.question(question + ' (y/N): ', (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Main rollback function
 */
async function main() {
  console.log('\n🔙 ═══════════════════════════════════════');
  console.log('🔙 ROLLBACK LAST DEPLOYMENT');
  console.log('🔙 ═══════════════════════════════════════\n');
  
  try {
    // 1. Show last commit
    console.log('📋 Last commit:');
    const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf-8' });
    console.log(lastCommit);
    
    // 2. Confirm rollback
    const confirmed = await confirm('\n⚠️  Are you sure you want to rollback this commit?');
    
    if (!confirmed) {
      console.log('\n❌ Rollback cancelled');
      process.exit(0);
    }
    
    // 3. Check if commit has been pushed
    const remoteDiff = execSync('git log origin/main..HEAD --oneline', { encoding: 'utf-8' });
    const isPushed = remoteDiff.trim() === '';
    
    if (isPushed) {
      console.log('\n⚠️  Commit has been pushed to remote');
      const confirmForce = await confirm('This will require force push. Continue?');
      
      if (!confirmForce) {
        console.log('\n❌ Rollback cancelled');
        process.exit(0);
      }
    }
    
    // 4. Stash any uncommitted changes
    console.log('\n📋 Step 1: Stashing uncommitted changes...');
    try {
      exec('git stash', { stdio: 'pipe' });
    } catch (error) {
      console.log('ℹ️  No changes to stash');
    }
    
    // 5. Revert commit
    console.log('\n📋 Step 2: Reverting last commit...');
    exec('git reset --hard HEAD~1');
    
    // 6. Force push if needed
    if (isPushed) {
      console.log('\n📋 Step 3: Force pushing to remote...');
      const confirmPush = await confirm('Push rollback to origin/main?');
      
      if (confirmPush) {
        exec('git push origin main --force');
      } else {
        console.log('\n⚠️  Rollback local only. Remember to push manually!');
      }
    }
    
    console.log('\n✅ ═══════════════════════════════════════');
    console.log('✅ ROLLBACK COMPLETE');
    console.log('✅ ═══════════════════════════════════════\n');
    console.log('Next steps:');
    console.log('  1. Verify app state: pnpm dev');
    console.log('  2. Check logs: tail -f logs/server-start.log');
    console.log('  3. If needed, restore stashed changes: git stash pop\n');
    
  } catch (error) {
    console.error('\n❌ ═══════════════════════════════════════');
    console.error('❌ ROLLBACK FAILED');
    console.error('❌ ═══════════════════════════════════════\n');
    console.error(error);
    process.exit(1);
  }
}

main();

