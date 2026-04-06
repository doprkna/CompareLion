/**
 * Dev/Prod DB separation: set process.env.DATABASE_URL from APP_ENV.
 * Call ensureDatabaseUrl() immediately before PrismaClient instantiation.
 * - APP_ENV=prod → DATABASE_URL_PROD (required, throw if missing)
 * - else → DATABASE_URL_DEV (required, throw if missing)
 * - Default APP_ENV to "dev" if missing.
 */
export function ensureDatabaseUrl() {
    const appEnv = (process.env.APP_ENV ?? 'dev').toString().toLowerCase();
    const isProd = appEnv === 'prod' || appEnv === 'production';
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
        return;
    }
    if (isProd) {
        const url = process.env.DATABASE_URL_PROD;
        if (!url || url.trim() === '') {
            const msg = 'Fatal: APP_ENV=prod requires DATABASE_URL_PROD to be set.';
            console.error(msg);
            throw new Error(msg);
        }
        process.env.DATABASE_URL = url;
    }
    else {
        const url = process.env.DATABASE_URL_DEV;
        if (!url || url.trim() === '') {
            const msg = 'Fatal: APP_ENV=dev requires DATABASE_URL_DEV to be set.';
            console.error(msg);
            throw new Error(msg);
        }
        process.env.DATABASE_URL = url;
    }
}
// Run on import so env loaders (e.g. apps/web/lib/env.ts) get DATABASE_URL set
ensureDatabaseUrl();
