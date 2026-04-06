/**
 * db-migrate-dev.ts - Safe migration runner (DEV only).
 * Requires APP_ENV=dev; refuses to run against prod.
 */

import './_loadEnv';
import './guard-migrate-env';
import { spawnSync } from 'child_process';
import { resolve } from 'path';
import { ensureDatabaseUrl } from '../src/resolveDatabaseUrl';

ensureDatabaseUrl();

const schemaPath = resolve(__dirname, '../schema.prisma');
const migrateName = process.env.MIGRATE_NAME || process.argv[2];
const createOnly = process.env.MIGRATE_CREATE_ONLY === '1';
const args = ['exec', 'prisma', 'migrate', 'dev', '--schema', schemaPath];
if (migrateName) args.push('--name', migrateName);
if (createOnly) args.push('--create-only');

const result = spawnSync('pnpm', args, {
  stdio: 'inherit',
  env: process.env,
  cwd: resolve(__dirname, '../..'),
  shell: true,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log('db-migrate-dev: OK');
