/**
 * Load .env files for tsx scripts (db-doctor, db-migrate-dev, seed, smoke).
 * Precedence: .env (defaults), .env.local overrides .env. Shell/cross-env wins.
 * Load order: root .env, root .env.local, apps/web/.env, apps/web/.env.local
 */
export {};
