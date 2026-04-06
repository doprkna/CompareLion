/**
 * Load .env files for tsx scripts (db-doctor, db-migrate-dev, seed, smoke).
 * Precedence: .env (defaults), .env.local overrides .env. Shell/cross-env wins.
 * Load order: root .env, root .env.local, apps/web/.env, apps/web/.env.local
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
const root = resolve(__dirname, '../../..');
const before = { ...process.env };
const loads = [
    [resolve(root, '.env'), false],
    [resolve(root, '.env.local'), true],
    [resolve(root, 'apps', 'web', '.env'), false],
    [resolve(root, 'apps', 'web', '.env.local'), true],
];
for (const [p, override] of loads) {
    if (existsSync(p)) {
        config({ path: p, override, quiet: true });
    }
}
for (const k of Object.keys(before)) {
    if (before[k] !== undefined && before[k] !== '') {
        process.env[k] = before[k];
    }
}
