#!/usr/bin/env npx tsx
/**
 * Diagnose DATABASE_URL and migration status (DEV).
 * Uses same env resolution as db-migrate-deploy.
 */
import './_loadEnv';
import { spawnSync } from 'child_process';
import { resolve } from 'path';
import { ensureDatabaseUrl } from '../src/resolveDatabaseUrl';

ensureDatabaseUrl();

const url = process.env.DATABASE_URL || '';
const safe = url ? url.replace(/:[^:@]+@/, ':****@') : '(not set)';
console.log('DATABASE_URL (resolved, redacted):', safe);
console.log('APP_ENV:', process.env.APP_ENV ?? 'dev');
console.log('---');
console.log('prisma migrate status:');
const schemaPath = resolve(__dirname, '../schema.prisma');
spawnSync('pnpm', ['exec', 'prisma', 'migrate', 'status', '--schema', schemaPath], {
  stdio: 'inherit',
  env: process.env,
  cwd: resolve(__dirname, '../..'),
  shell: true,
});
