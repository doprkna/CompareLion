/**
 * db-reset-world.ts - Canonical demo reset: migrate deploy + seed world.
 * Requires APP_ENV=dev; refuses prod.
 */
import './_loadEnv';
import './guard-migrate-env';
