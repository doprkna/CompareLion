/**
 * Centralized Safe Environment Loader
 * v0.35.17b - Build-safe env var handling with fallbacks
 * Resolve DATABASE_URL from APP_ENV (dev→DATABASE_URL_DEV, prod→DATABASE_URL_PROD) before reading env.
 */
import '@parel/db/resolveDatabaseUrl';
export declare const env: {
    NODE_ENV: "development" | "production" | "test";
    IS_PROD: boolean;
    IS_VERCEL: boolean;
    DATABASE_URL: string;
    REDIS_URL: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_PUBLISHABLE_KEY: string;
    NEXTAUTH_SECRET: string;
    NEXTAUTH_URL: string;
    RESEND_API_KEY: string;
    OPENAI_API_KEY: string;
    APP_URL: string;
};
export declare const isProd: boolean;
export declare const hasDb: boolean;
export declare const hasRedis: boolean;
export declare function getEnvStamp(): 'PROD' | 'DEV' | 'STAGE';
export type Env = typeof env;
