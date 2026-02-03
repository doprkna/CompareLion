/**
 * Build script for desktop platforms (v0.21.0)
 * Uses Capacitor Electron for cross-platform desktop builds
 */
import { execSync } from 'child_process';
import { existsSync } from 'fs';
function log(message, emoji = '💻') {
    console.log(`${emoji} ${message}`);
}
function error(message) {
    console.error(`❌ ${message}`);
    process.exit(1);
}
function exec(command) {
    try {
        execSync(command, { stdio: 'inherit', env: { ...process.env } });
    }
    catch (err) {
        error(`Command failed: ${command}`);
    }
}
async function main() {
    log('Starting desktop build process...', '🚀');
    // Check if Electron package is installed
    if (!existsSync('node_modules/@capacitor-community/electron')) {
        log('Installing Capacitor Electron...', '📦');
        exec('pnpm add -D @capacitor-community/electron');
    }
    // Step 1: Build Next.js
    log('Building Next.js application...', '📦');
    exec('pnpm run build');
    // Step 2: Export static files
    log('Exporting static files...', '📤');
    exec('next export');
    // Step 3: Initialize Electron platform if needed
    if (!existsSync('electron')) {
        log('Initializing Electron platform...', '🆕');
        exec('npx cap add @capacitor-community/electron');
    }
    // Step 4: Sync files
    log('Syncing files to Electron...', '🔄');
    exec('npx cap sync @capacitor-community/electron');
    log('Desktop build completed successfully!', '✨');
    log('Next steps:', '📝');
    log('  - Development: npx cap open @capacitor-community/electron');
    log('  - Build: cd electron && npm run build');
}
main().catch(err => {
    error(err.message);
});
