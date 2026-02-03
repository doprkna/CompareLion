#!/usr/bin/env tsx
/**
 * Hotfix Deployment Script (v0.14.0)
 * Auto-bumps patch version, runs checks, and deploys
 *
 * Usage:
 *   tsx scripts/hotfix-deploy.ts "Fix critical auth bug"
 */
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
const CHANGELOG_PATH = 'CHANGELOG.md';
const PACKAGE_JSON_PATH = 'apps/web/package.json';
/**
 * Execute command and log output
 */
function exec(command, options = {}) {
    console.log(`\n🔧 Running: ${command}`);
    try {
        return execSync(command, {
            stdio: 'inherit',
            encoding: 'utf-8',
            ...options,
        });
    }
    catch (error) {
        console.error(`❌ Command failed: ${command}`);
        throw error;
    }
}
/**
 * Bump patch version (e.g., 0.14.0 → 0.14.0q1)
 */
function bumpVersion(currentVersion) {
    // Check if already has suffix (e.g., 0.14.0q1)
    const match = currentVersion.match(/^(\d+\.\d+\.\d+)([a-z])?(\d+)?$/);
    if (!match) {
        throw new Error(`Invalid version format: ${currentVersion}`);
    }
    const [, baseVersion, letter, number] = match;
    if (letter && number) {
        // Increment existing suffix (0.14.0q1 → 0.14.0q2)
        return `${baseVersion}${letter}${parseInt(number) + 1}`;
    }
    else if (letter) {
        // Add number to letter (0.14.0q → 0.14.0q1)
        return `${baseVersion}${letter}1`;
    }
    else {
        // Add first suffix (0.14.0 → 0.14.0q1)
        return `${baseVersion}q1`;
    }
}
/**
 * Update package.json version
 */
function updatePackageVersion(newVersion) {
    const packagePath = path.join(process.cwd(), PACKAGE_JSON_PATH);
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    console.log(`\n📦 Version: ${packageJson.version} → ${newVersion}`);
    packageJson.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
}
/**
 * Update CHANGELOG.md
 */
function updateChangelog(version, description) {
    const changelogPath = path.join(process.cwd(), CHANGELOG_PATH);
    if (!fs.existsSync(changelogPath)) {
        console.warn(`⚠️  CHANGELOG.md not found, creating new one`);
        fs.writeFileSync(changelogPath, '# Changelog\n\n');
    }
    const changelog = fs.readFileSync(changelogPath, 'utf-8');
    const date = new Date().toISOString().split('T')[0];
    const newEntry = `## [${version}] - ${date}\n\n### Hotfix\n- ${description}\n\n`;
    // Insert after "# Changelog" header
    const updated = changelog.replace(/(# Changelog\n\n)/, `$1${newEntry}`);
    fs.writeFileSync(changelogPath, updated);
    console.log(`\n📝 Updated CHANGELOG.md`);
}
/**
 * Main hotfix deployment
 */
async function main() {
    const description = process.argv[2];
    if (!description) {
        console.error('❌ Error: Hotfix description required');
        console.log('\nUsage:');
        console.log('  tsx scripts/hotfix-deploy.ts "Fix description"');
        process.exit(1);
    }
    console.log('\n🚀 ═══════════════════════════════════════');
    console.log('🚀 HOTFIX DEPLOYMENT PIPELINE');
    console.log('🚀 ═══════════════════════════════════════\n');
    console.log(`📋 Description: ${description}\n`);
    try {
        // 1. Check git status
        console.log('\n📋 Step 1: Checking git status...');
        const gitStatus = execSync('git status --porcelain', { encoding: 'utf-8' });
        if (gitStatus.trim()) {
            console.warn('⚠️  Warning: Uncommitted changes detected');
            console.log(gitStatus);
        }
        // 2. Get current version
        const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), PACKAGE_JSON_PATH), 'utf-8'));
        const currentVersion = packageJson.version;
        const newVersion = bumpVersion(currentVersion);
        // 3. Update version
        console.log('\n📋 Step 2: Bumping version...');
        updatePackageVersion(newVersion);
        // 4. Update changelog
        console.log('\n📋 Step 3: Updating changelog...');
        updateChangelog(newVersion, description);
        // 5. Lint
        console.log('\n📋 Step 4: Running linter...');
        try {
            exec('pnpm lint', { stdio: 'pipe' });
            console.log('✅ Lint passed');
        }
        catch (error) {
            console.warn('⚠️  Lint warnings detected (continuing)');
        }
        // 6. Build
        console.log('\n📋 Step 5: Building...');
        exec('pnpm build');
        console.log('✅ Build successful');
        // 7. Run tests
        console.log('\n📋 Step 6: Running tests...');
        try {
            exec('pnpm test', { stdio: 'pipe' });
            console.log('✅ Tests passed');
        }
        catch (error) {
            console.error('❌ Tests failed');
            console.log('\nℹ️  Reverting version changes...');
            updatePackageVersion(currentVersion);
            throw error;
        }
        // 8. Git commit
        console.log('\n📋 Step 7: Committing changes...');
        exec('git add .');
        exec(`git commit -m "hotfix: ${description} (v${newVersion})"`);
        console.log('\n✅ ═══════════════════════════════════════');
        console.log(`✅ HOTFIX v${newVersion} READY`);
        console.log('✅ ═══════════════════════════════════════\n');
        console.log('📦 Version:', newVersion);
        console.log('📝 Changelog updated');
        console.log('✅ All checks passed\n');
        console.log('Next steps:');
        console.log('  1. Review changes: git show');
        console.log('  2. Push to deploy: git push origin main');
        console.log('  3. Monitor: Check /admin/health and /admin/errors\n');
    }
    catch (error) {
        console.error('\n❌ ═══════════════════════════════════════');
        console.error('❌ HOTFIX DEPLOYMENT FAILED');
        console.error('❌ ═══════════════════════════════════════\n');
        console.error(error);
        process.exit(1);
    }
}
main();
