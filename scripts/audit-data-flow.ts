#!/usr/bin/env tsx
/**
 * Data Flow Audit Script
 * Detects hard-coded demo users, mock data, and DB connection issues
 * that prevent the UI from displaying real data from PostgreSQL
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface Issue {
  file: string;
  line: number;
  type: 'demo-user' | 'mock-data' | 'role-filter' | 'db-url' | 'session-mismatch' | 'hardcoded-filter';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  code: string;
  suggestedFix?: string;
}

const issues: Issue[] = [];

// Patterns to detect
const PATTERNS = {
  demoUser: [
    /email:\s*["']demo@example\.com["']/gi,
    /role:\s*["']DEMO["']/gi,
    /userId:\s*["']demo["']/gi,
    /"demo@example\.com"/gi,
    /'demo@example\.com'/gi,
  ],
  mockData: [
    /MOCK_[A-Z_]+/g,
    /mock:\s*true/gi,
    /useMock/gi,
    /mockData/gi,
    /fallback.*data/gi,
  ],
  roleFilter: [
    /if\s*\([^)]*role\s*!==\s*["']ADMIN["']\s*\)\s*return/gi,
    /where:.*role.*ADMIN/gi,
  ],
  dbUrl: [
    /DATABASE_URL/g,
    /process\.env\.DATABASE_URL/g,
  ],
  sessionMismatch: [
    /findFirst\(\{[^}]*where:[^}]*email/gi,
    /findUnique\(\{[^}]*where:[^}]*email:\s*["']demo/gi,
  ],
  hardcodedFilter: [
    /where:\s*\{[^}]*id:\s*["'][^"']+["']/gi,
    /userId:\s*["'][^"']+["']/gi,
  ],
};

// Directories to scan
const SCAN_DIRS = [
  'apps/web/app/api',
  'apps/web/app',
  'apps/web/components',
  'apps/web/hooks',
  'apps/web/lib',
];

function scanFile(filePath: string): void {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
  
  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      const lineNum = index + 1;
      
      // Check for demo user references
      PATTERNS.demoUser.forEach(pattern => {
        if (pattern.test(line)) {
          issues.push({
            file: filePath,
            line: lineNum,
            type: 'demo-user',
            severity: 'critical',
            message: 'Hard-coded demo user reference found',
            code: line.trim(),
            suggestedFix: 'Use session.user.id or session.user.email instead',
          });
        }
      });
      
      // Check for mock data usage
      PATTERNS.mockData.forEach(pattern => {
        if (pattern.test(line) && !line.includes('// ') && !filePath.includes('mock-data.ts')) {
          issues.push({
            file: filePath,
            line: lineNum,
            type: 'mock-data',
            severity: 'high',
            message: 'Mock data usage detected - may prevent real DB data from showing',
            code: line.trim(),
            suggestedFix: 'Ensure mock data is only used as fallback when Prisma fails',
          });
        }
      });
      
      // Check for restrictive role filters
      PATTERNS.roleFilter.forEach(pattern => {
        if (pattern.test(line) && line.includes('return')) {
          issues.push({
            file: filePath,
            line: lineNum,
            type: 'role-filter',
            severity: 'high',
            message: 'Restrictive admin role filter - may block legitimate requests',
            code: line.trim(),
            suggestedFix: 'Check if admin role should bypass this filter',
          });
        }
      });
      
      // Check for DATABASE_URL references
      PATTERNS.dbUrl.forEach(pattern => {
        if (pattern.test(line)) {
          issues.push({
            file: filePath,
            line: lineNum,
            type: 'db-url',
            severity: 'medium',
            message: 'DATABASE_URL reference - verify consistency across .env files',
            code: line.trim(),
          });
        }
      });
      
      // Check for session mismatches
      PATTERNS.sessionMismatch.forEach(pattern => {
        if (pattern.test(line)) {
          issues.push({
            file: filePath,
            line: lineNum,
            type: 'session-mismatch',
            severity: 'critical',
            message: 'Potential session mismatch - using email filter instead of session ID',
            code: line.trim(),
            suggestedFix: 'Use findUnique({ where: { id: session.user.id } })',
          });
        }
      });
      
      // Check for hard-coded filters
      PATTERNS.hardcodedFilter.forEach(pattern => {
        if (pattern.test(line) && !line.includes('session') && !line.includes('params')) {
          issues.push({
            file: filePath,
            line: lineNum,
            type: 'hardcoded-filter',
            severity: 'high',
            message: 'Hard-coded ID filter - should use dynamic session or params',
            code: line.trim(),
            suggestedFix: 'Replace hard-coded ID with session.user.id or route params',
          });
        }
      });
    });
  } catch (error) {
    console.warn(`⚠️  Could not scan ${filePath}:`, error);
  }
}

function scanDirectory(dir: string): void {
  try {
    const entries = readdirSync(dir);
    
    entries.forEach(entry => {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory() && !entry.startsWith('.') && entry !== 'node_modules') {
        scanDirectory(fullPath);
      } else if (stat.isFile()) {
        scanFile(fullPath);
      }
    });
  } catch (error) {
    console.warn(`⚠️  Could not scan directory ${dir}:`, error);
  }
}

function printReport(): void {
  console.log('\n🔍 DATA FLOW AUDIT REPORT\n');
  console.log('=' .repeat(80));
  
  if (issues.length === 0) {
    console.log('\n✅ No issues found! Your data flow looks healthy.\n');
    return;
  }
  
  // Group by severity
  const critical = issues.filter(i => i.severity === 'critical');
  const high = issues.filter(i => i.severity === 'high');
  const medium = issues.filter(i => i.severity === 'medium');
  const low = issues.filter(i => i.severity === 'low');
  
  console.log(`\n📊 SUMMARY:`);
  console.log(`   🔴 Critical: ${critical.length}`);
  console.log(`   🟠 High: ${high.length}`);
  console.log(`   🟡 Medium: ${medium.length}`);
  console.log(`   🟢 Low: ${low.length}`);
  console.log(`   Total: ${issues.length}\n`);
  
  // Print critical issues first
  if (critical.length > 0) {
    console.log('\n🔴 CRITICAL ISSUES (Fix these first!):\n');
    critical.forEach((issue, idx) => {
      console.log(`${idx + 1}. [${issue.type.toUpperCase()}] ${issue.file}:${issue.line}`);
      console.log(`   ${issue.message}`);
      console.log(`   Code: ${issue.code}`);
      if (issue.suggestedFix) {
        console.log(`   ✅ Fix: ${issue.suggestedFix}`);
      }
      console.log();
    });
  }
  
  // Print high severity issues
  if (high.length > 0) {
    console.log('\n🟠 HIGH PRIORITY ISSUES:\n');
    high.forEach((issue, idx) => {
      console.log(`${idx + 1}. [${issue.type.toUpperCase()}] ${issue.file}:${issue.line}`);
      console.log(`   ${issue.message}`);
      console.log(`   Code: ${issue.code}`);
      if (issue.suggestedFix) {
        console.log(`   ✅ Fix: ${issue.suggestedFix}`);
      }
      console.log();
    });
  }
  
  // Print medium severity issues (condensed)
  if (medium.length > 0) {
    console.log('\n🟡 MEDIUM PRIORITY ISSUES:\n');
    const grouped = medium.reduce((acc, issue) => {
      const key = issue.type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(issue);
      return acc;
    }, {} as Record<string, Issue[]>);
    
    Object.entries(grouped).forEach(([type, issueList]) => {
      console.log(`   ${type.toUpperCase()}: ${issueList.length} occurrences`);
      issueList.slice(0, 3).forEach(issue => {
        console.log(`     - ${issue.file}:${issue.line}`);
      });
      if (issueList.length > 3) {
        console.log(`     ... and ${issueList.length - 3} more`);
      }
    });
    console.log();
  }
  
  console.log('\n' + '=' .repeat(80));
  console.log('\n💡 NEXT STEPS:\n');
  console.log('1. Fix all CRITICAL issues (demo user references and session mismatches)');
  console.log('2. Review HIGH priority issues (mock data and role filters)');
  console.log('3. Verify DATABASE_URL is consistent in all .env files');
  console.log('4. Test login as admin@example.com and verify data shows up');
  console.log('5. Check browser console and network tab for API errors\n');
}

// Main execution
console.log('🔍 Starting data flow audit...\n');

SCAN_DIRS.forEach(dir => {
  console.log(`📁 Scanning ${dir}...`);
  scanDirectory(dir);
});

printReport();

// Generate fix script suggestions
if (issues.filter(i => i.severity === 'critical').length > 0) {
  console.log('\n📝 Generating automated fixes...\n');
  console.log('Run these commands to auto-fix some issues:\n');
  
  // Group critical issues by file
  const fileGroups = issues
    .filter(i => i.severity === 'critical')
    .reduce((acc, issue) => {
      if (!acc[issue.file]) acc[issue.file] = [];
      acc[issue.file].push(issue);
      return acc;
    }, {} as Record<string, Issue[]>);
  
  Object.entries(fileGroups).slice(0, 5).forEach(([file, fileIssues]) => {
    console.log(`# Fix ${file}`);
    fileIssues.forEach(issue => {
      if (issue.type === 'demo-user') {
        console.log(`# Line ${issue.line}: Replace demo user reference with session`);
      }
    });
    console.log();
  });
}

process.exit(issues.filter(i => i.severity === 'critical').length > 0 ? 1 : 0);








