/**
 * db-reset-world.ts - Canonical demo reset: migrate deploy + seed world.
 * Requires APP_ENV=dev; refuses prod.
 */
import './_loadEnv';
import './guard-migrate-env';
import { spawnSync } from 'child_process';
import { resolve } from 'path';
import { ensureDatabaseUrl } from '../src/resolveDatabaseUrl';
import { runSeedWorld } from './seed-world';
ensureDatabaseUrl();
const schemaPath = resolve(__dirname, '../schema.prisma');
const rootDir = resolve(__dirname, '../..');
console.log('db-reset-world: Applying migrations...');
const migrateResult = spawnSync('pnpm', ['exec', 'prisma', 'migrate', 'deploy', '--schema', schemaPath], {
    stdio: 'inherit',
    env: process.env,
    cwd: rootDir,
    shell: true,
});
if (migrateResult.status !== 0) {
    process.exit(migrateResult.status ?? 1);
}
async function main() {
    const stats = await runSeedWorld();
    const summary = Object.entries(stats)
        .map(([k, v]) => `${k}=${v}`)
        .join(', ');
    console.log(`db-reset-world: OK | ${summary}`);
    process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
