/**
 * Dev/Prod DB separation: set process.env.DATABASE_URL from APP_ENV.
 * Call ensureDatabaseUrl() immediately before PrismaClient instantiation.
 * - APP_ENV=prod → DATABASE_URL_PROD (required, throw if missing)
 * - else → DATABASE_URL_DEV (required, throw if missing)
 * - Default APP_ENV to "dev" if missing.
 *
 * During `next build`, Next evaluates route modules without CI DB secrets. If the
 * lifecycle phase is production build (`NEXT_PHASE` / `npm_lifecycle_event`),
 * missing DATABASE_URL_* is warned instead of fatal; runtime (`next dev`, `next start`) stays strict.
 */

/** Mirrors apps/web/lib/env.ts — skips fatal env resolution during Next route collection. */
function isNextProductionBuild(): boolean {
  return (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.npm_lifecycle_event === 'build'
  );
}

export function ensureDatabaseUrl(): void {
  const appEnv = (process.env.APP_ENV ?? 'dev').toString().toLowerCase();
  const isProd = appEnv === 'prod' || appEnv === 'production';

  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '') {
    return;
  }

  if (isProd) {
    const url = process.env.DATABASE_URL_PROD;
    if (!url || url.trim() === '') {
      if (isNextProductionBuild()) {
        console.warn(
          '[ensureDatabaseUrl] Skipping DATABASE_URL resolution: APP_ENV=prod but DATABASE_URL_PROD is unset during Next production build. Deployed runtime still requires DATABASE_URL_PROD or DATABASE_URL.',
        );
        return;
      }
      const msg = 'Fatal: APP_ENV=prod requires DATABASE_URL_PROD to be set.';
      console.error(msg);
      throw new Error(msg);
    }
    process.env.DATABASE_URL = url;
  } else {
    const url = process.env.DATABASE_URL_DEV;
    if (!url || url.trim() === '') {
      if (isNextProductionBuild()) {
        console.warn(
          '[ensureDatabaseUrl] Skipping DATABASE_URL resolution: APP_ENV=dev but DATABASE_URL_DEV is unset during Next production build. Deployed runtime still requires DATABASE_URL_DEV or DATABASE_URL.',
        );
        return;
      }
      const msg = 'Fatal: APP_ENV=dev requires DATABASE_URL_DEV to be set.';
      console.error(msg);
      throw new Error(msg);
    }
    process.env.DATABASE_URL = url;
  }
}

// Run on import so env loaders (e.g. apps/web/lib/env.ts) get DATABASE_URL set
ensureDatabaseUrl();
