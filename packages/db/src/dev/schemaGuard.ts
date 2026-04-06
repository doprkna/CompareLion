/**
 * DEV-ONLY Prisma schema drift guard.
 * Validates critical columns exist on startup. Run: APP_ENV=dev, Node runtime only.
 */
import { prisma } from '../client';

const REQUIRED_COLUMNS = [
  'starterFlowCompletedAt',
  'feedbackRewardClaimed',
  'isBeta',
] as const;

export async function validateSchema(): Promise<void> {
  // Safe: constant values only, no user input
  const inList = REQUIRED_COLUMNS.map((c) => `'${c}'`).join(', ');
  const rows = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'users'
     AND column_name IN (${inList})`
  );

  const found = new Set(rows.map((r) => r.column_name));
  const missing = REQUIRED_COLUMNS.filter((c) => !found.has(c));

  if (missing.length > 0) {
    const msg = missing.map((c) => `users.${c}`).join(', ');
    throw new Error(
      `SCHEMA DRIFT DETECTED: missing column(s) ${msg}. Run pnpm prisma:migrate:deploy`
    );
  }

  console.log('[SchemaGuard] Prisma schema validated (dev)');
}
