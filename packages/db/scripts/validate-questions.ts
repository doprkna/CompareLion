/**
 * Canonical Question Pipeline validation gate.
 * Run: pnpm validate:questions
 *
 * Intentionally excludes repo-wide typecheck (pre-existing errors).
 */

import './_loadEnv';
import { execSync } from 'child_process';
import { resolve } from 'path';
import { ensureDatabaseUrl } from '../src/resolveDatabaseUrl';

const ROOT = resolve(__dirname, '../../..');
const SCHEMA = 'packages/db/schema.prisma';

type Step = {
  name: string;
  run: () => void;
  requiresDb?: boolean;
};

function logStart(name: string) {
  console.log(`[START] ${name}`);
}

function logPass(name: string) {
  console.log(`[PASS] ${name}`);
}

function logFail(name: string, detail?: string) {
  console.log(`[FAIL] ${name}${detail ? ` — ${detail}` : ''}`);
}

function runCommand(name: string, command: string) {
  logStart(name);
  try {
    execSync(command, {
      cwd: ROOT,
      stdio: 'inherit',
      env: process.env,
    });
    logPass(name);
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    logFail(name, detail.slice(0, 200));
    throw e;
  }
}

function assertDevDatabase() {
  try {
    ensureDatabaseUrl();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(
      `DATABASE_URL_DEV (or DATABASE_URL) required for DB steps. ${msg}`
    );
  }
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error('DATABASE_URL not set after ensureDatabaseUrl()');
  }
}

const steps: Step[] = [
  {
    name: 'prisma:validate',
    run: () =>
      runCommand(
        'prisma:validate',
        `pnpm exec prisma validate --schema=${SCHEMA}`
      ),
  },
  {
    name: 'prisma:generate',
    run: () =>
      runCommand(
        'prisma:generate',
        `pnpm exec prisma generate --schema=${SCHEMA}`
      ),
  },
  {
    name: 'db:questions:smoke',
    requiresDb: true,
    run: () => runCommand('db:questions:smoke', 'pnpm db:questions:smoke'),
  },
  {
    name: 'db:questions:stats:backfill',
    requiresDb: true,
    run: () =>
      runCommand(
        'db:questions:stats:backfill',
        'pnpm db:questions:stats:backfill'
      ),
  },
];

async function main() {
  console.log('');
  console.log('=== Question Pipeline Validation ===');
  console.log(`APP_ENV=${process.env.APP_ENV ?? 'dev'}`);
  console.log('Note: repo-wide typecheck is intentionally excluded (pre-existing errors).');
  console.log('');

  let needsDb = false;
  for (const step of steps) {
    if (step.requiresDb) needsDb = true;
  }
  if (needsDb) {
    assertDevDatabase();
  }

  for (const step of steps) {
    try {
      step.run();
    } catch {
      console.log('');
      console.log(`Question pipeline validation: FAIL at ${step.name}`);
      process.exit(1);
    }
  }

  console.log('');
  console.log('Question pipeline validation: PASS (all steps)');
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
