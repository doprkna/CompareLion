#!/usr/bin/env node
/**
 * Changelog Integrity Check (Pre-commit Hook)
 * 
 * Verifies changelog has the version-lock comment
 * Automatically adds it if missing
 * Prevents commits with invalid changelog
 */

const fs = require('fs');
const path = require('path');

const LOCK_COMMENT = '<!-- version-lock: true -->';
const CHANGELOG_PATHS = [
  path.join(__dirname, '..', 'apps', 'web', 'CHANGELOG.md'),
  path.join(__dirname, '..', 'CHANGELOG.md'),
];

function findChangelog() {
  for (const p of CHANGELOG_PATHS) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

function main() {
  const changelogPath = findChangelog();
  
  if (!changelogPath) {
    console.warn('⚠️  CHANGELOG.md not found - skipping check');
    process.exit(0);
  }

  console.log(`📄 Checking changelog: ${changelogPath}`);

  const content = fs.readFileSync(changelogPath, 'utf8');

  // Check for lock comment
  if (!content.includes(LOCK_COMMENT)) {
    console.warn('⚠️  CHANGELOG missing version-lock comment — inserting it automatically.');
    
    // Find the right place to insert (after the rules section)
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Find the end of the rules section (look for the separator line)
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '---' || lines[i].includes('Never collapse')) {
        insertIndex = i + 1;
        break;
      }
    }
    
    // Insert lock comment with blank line
    lines.splice(insertIndex, 0, '', LOCK_COMMENT);
    
    fs.writeFileSync(changelogPath, lines.join('\n'), 'utf8');
    console.log('✅ Lock comment added to changelog');
  } else {
    console.log('✅ Changelog lock verified');
  }

  // Basic integrity checks
  const versionRegex = /^## \[(\d+\.\d+\.\d+[a-z]?)\] - (\d{4}-\d{2}-\d{2})$/gm;
  const versions = [];
  let match;

  while ((match = versionRegex.exec(content)) !== null) {
    versions.push({
      version: match[1],
      date: match[2],
    });
  }

  console.log(`📊 Found ${versions.length} versions`);

  // Check for duplicates
  const seen = new Set();
  const duplicates = [];
  
  for (const v of versions) {
    if (seen.has(v.version)) {
      duplicates.push(v.version);
    }
    seen.add(v.version);
  }

  if (duplicates.length > 0) {
    console.error('❌ Duplicate versions found:', duplicates);
    console.error('   Please fix the changelog before committing.');
    process.exit(1);
  }

  console.log('✅ No duplicate versions detected');
  console.log('✅ Changelog checks passed\n');
  process.exit(0);
}

main();

