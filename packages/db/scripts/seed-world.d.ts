/**
 * seed-world.ts - Minimal-but-complete world seed. Dev-only.
 * Eliminates "empty world": inventory, progression, achievements, feed, events, groups.
 * Single source of truth; invoked by prisma/seed.ts and db:seed:world.
 */
import './_loadEnv';
export declare function runSeedWorld(): Promise<Record<string, number>>;
