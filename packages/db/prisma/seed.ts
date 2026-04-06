/**
 * Prisma seed entrypoint - delegates to seed-world.ts
 * Single source of truth: packages/db/scripts/seed-world.ts
 */

import { runSeedWorld } from '../scripts/seed-world';

runSeedWorld()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
