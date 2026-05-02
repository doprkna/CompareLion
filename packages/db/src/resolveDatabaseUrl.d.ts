/**
 * Dev/Prod DB separation: set process.env.DATABASE_URL from APP_ENV.
 * Call ensureDatabaseUrl() immediately before PrismaClient instantiation.
 * - APP_ENV=prod → DATABASE_URL_PROD (required at runtime, throw if missing)
 * - else → DATABASE_URL_DEV (required at runtime, throw if missing)
 * - Default APP_ENV to "dev" if missing.
 * During Next production build, missing DATABASE_URL_* logs a warning and leaves DATABASE_URL unset.
 */
export declare function ensureDatabaseUrl(): void;
