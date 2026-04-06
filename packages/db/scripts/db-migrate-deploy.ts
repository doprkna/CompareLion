/**
 * db-migrate-deploy.ts - Run prisma migrate deploy.
 * Loads env (DATABASE_URL_DEV / DATABASE_URL_PROD) and sets DATABASE_URL before Prisma runs.
 */

import './_loadEnv';
import { spawnSync } from 'child_process';
import { resolve } from 'path';
import { ensureDatabaseUrl } from '../src/resolveDatabaseUrl';

ensureDatabaseUrl();

const schemaPath = resolve(__dirname, '../schema.prisma');
const result = spawnSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy', '--schema', schemaPath], {
  stdio: 'inherit',
  env: process.env,
  cwd: resolve(__dirname, '../..'),
  shell: true,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log('db-migrate-deploy: OK');
