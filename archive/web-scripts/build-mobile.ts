/**
 * Build script for mobile platforms (v0.21.0)
 * Builds static export and copies to Capacitor platforms
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const PLATFORMS = ['android', 'ios'];

function log(message: string, emoji = '📱') {
  console.log(`${emoji} ${message}`);
}

function error(message: string) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function exec(command: string, cwd?: string) {
  try {
    execSync(command, { 
      stdio: 'inherit', 
      cwd: cwd || process.cwd(),
      env: { ...process.env }
    });
  } catch (err) {
    error(`Command failed: ${command}`);
  }
}

async function main() {
  const platform = process.argv[2] || 'all';
  
  if (platform !== 'all' && !PLATFORMS.includes(platform)) {
    error(`Invalid platform: ${platform}. Use: ${PLATFORMS.join(', ')}, or all`);
  }

  log('Starting mobile build process...', '🚀');

  // Step 1: Build Next.js static export
  log('Building Next.js static export...', '📦');
  exec('pnpm run build');

  // Step 2: Export static files
  log('Exporting static files...', '📤');
  exec('next export');

  // Step 3: Copy to Capacitor platforms
  const platforms = platform === 'all' ? PLATFORMS : [platform];
  
  for (const plt of platforms) {
    log(`Syncing ${plt}...`, '🔄');
    
    // Initialize platform if not exists
    if (!existsSync(plt)) {
      log(`Initializing ${plt} platform...`, '🆕');
      exec(`npx cap add ${plt}`);
    }
    
    // Sync files to platform
    exec(`npx cap sync ${plt}`);
    
    log(`✅ ${plt} build ready`);
  }

  log('Mobile build completed successfully!', '✨');
  log('Next steps:', '📝');
  log('  - Android: npx cap open android');
  log('  - iOS: npx cap open ios (macOS only)');
}

main().catch(err => {
  error(err.message);
});

