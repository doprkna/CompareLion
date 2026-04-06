/**
 * seed-demo-big.ts - Big deterministic demo seed for UI/state bug surfacing.
 * Dev-only: exits(1) if APP_ENV !== "dev".
 * Deterministic RNG (mulberry32, seed=1337), stable IDs, idempotent upserts.
 */
import './_loadEnv';
import './guard-seed-demo-env';
