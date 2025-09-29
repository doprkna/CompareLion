const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run() {
  console.log('Generating Prisma Client in packages/db...');
  // Run prisma generate within the packages/db directory
  const pkgDbDir = path.resolve(__dirname, '../packages/db');
  try {
    execSync('npx prisma generate --schema=./schema.prisma', { stdio: 'inherit', cwd: pkgDbDir });
  } catch (e) {
    console.warn('Warning: prisma generate failed, continuing. Error:', e.message);
  }

  // Copy from the generated client in packages/db
  const srcDir = path.resolve(pkgDbDir, 'node_modules/.prisma/client');
  const destDir = path.resolve(__dirname, '../prisma/generated');

  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  fs.mkdirSync(destDir, { recursive: true });

  console.log(`Copying generated client from ${srcDir} to ${destDir}...`);
  copyRecursive(srcDir, destDir);
}

function copyRecursive(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

run();
