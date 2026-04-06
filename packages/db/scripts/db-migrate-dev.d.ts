/**
 * db-migrate-dev.ts - Safe migration runner (DEV only).
 * Requires APP_ENV=dev; refuses to run against prod.
 */
import './_loadEnv';
import './guard-migrate-env';
