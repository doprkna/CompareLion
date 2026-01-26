const RAW_ENV = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    REDIS_URL: process.env.REDIS_URL,
    DATABASE_URL: process.env.DATABASE_URL,
};
export const IS_PROD = RAW_ENV.NODE_ENV === 'production';
export const IS_DEV = RAW_ENV.NODE_ENV === 'development';
export const HAS_REDIS = Boolean(RAW_ENV.REDIS_URL);
export const HAS_DB = Boolean(RAW_ENV.DATABASE_URL);
let warned = false;
export function validateEnvOnce() {
    if (warned)
        return;
    warned = true;
    if (!RAW_ENV.DATABASE_URL) {
        console.warn('[ENV] DATABASE_URL not set — DB-dependent features may fail.');
    }
    if (!RAW_ENV.REDIS_URL) {
        console.warn('[ENV] REDIS_URL not set — running in no-cache mode.');
    }
}
