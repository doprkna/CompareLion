/**
 * Database Integrity Check Script
 *
 * Validates all seeded data and migrations for consistency
 * v0.30.2 - Database Integrity Sweep
 *
 * Usage:
 *   pnpm tsx scripts/db-integrity-check.ts
 *   pnpm tsx scripts/db-integrity-check.ts --save
 */
declare function main(): Promise<any>;
export { main };
