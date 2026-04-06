/**
 * Dev/Prod DB separation: set process.env.DATABASE_URL from APP_ENV.
 * Call ensureDatabaseUrl() immediately before PrismaClient instantiation.
 * - APP_ENV=prod → DATABASE_URL_PROD (required, throw if missing)
 * - else → DATABASE_URL_DEV (required, throw if missing)
 * - Default APP_ENV to "dev" if missing.
 */
export declare function ensureDatabaseUrl(): void;
