/**
 * Archive (unpublish) Questions and deactivate linked FlowQuestions.
 *
 * Usage:
 *   pnpm db:questions:archive --source=pipeline-smoke-test --source-row=1 --dry-run
 *   pnpm db:questions:archive --question-id=<id> --limit=1
 */

import './_loadEnv';
import { ensureDatabaseUrl } from '../src/resolveDatabaseUrl';
import { prisma } from '../src/client';
import {
  archiveSourceQuestions,
  validateArchiveFilters,
} from '../src/questionSource';
import { runWithQuestionPipelineAudit } from '../src/questionSource/pipelineRun';

ensureDatabaseUrl();

const DEFAULT_LIMIT = 10;

function parseArgs() {
  const args = process.argv.slice(2);
  const out: Record<string, string | boolean> = {
    dryRun: false,
    deactivateFlow: true,
  };
  for (const arg of args) {
    if (arg === '--dry-run') out.dryRun = true;
    else if (arg === '--deactivate-flow=false') out.deactivateFlow = false;
    else if (arg === '--deactivate-flow=true') out.deactivateFlow = true;
    else {
      const m = arg.match(/^--([^=]+)=(.*)$/);
      if (m) out[m[1]] = m[2];
    }
  }

  const limitRaw = out.limit;
  const limit =
    typeof limitRaw === 'string' && limitRaw.length > 0
      ? Math.max(1, parseInt(limitRaw, 10) || DEFAULT_LIMIT)
      : DEFAULT_LIMIT;

  const sourceRowRaw = out['source-row'];
  const sourceRowNumber =
    typeof sourceRowRaw === 'string' && sourceRowRaw.length > 0
      ? parseInt(sourceRowRaw, 10)
      : undefined;

  return {
    questionId: typeof out['question-id'] === 'string' ? out['question-id'] : undefined,
    sourceName: typeof out.source === 'string' ? out.source : undefined,
    sourceRowNumber: Number.isFinite(sourceRowNumber) ? sourceRowNumber : undefined,
    limit,
    dryRun: out.dryRun === true,
    deactivateFlow: out.deactivateFlow !== false,
  };
}

function printResult(result: Awaited<ReturnType<typeof archiveSourceQuestions>>) {
  if (result.skips.some((s) => s.reason === 'missing_filter')) {
    console.error(result.skips[0].detail ?? 'Missing required filters');
    process.exit(1);
  }

  console.log('');
  console.log(`  mode:            ${result.dryRun ? 'dry-run' : 'live'}`);
  console.log(`  selected:        ${result.selected}`);
  console.log(`  archived:        ${result.archived}`);
  console.log(`  skipped:         ${result.skipped}`);
  console.log(`  flowDeactivated: ${result.flowDeactivated}`);

  if (result.skips.length) {
    console.log('');
    console.log('Skipped:');
    for (const s of result.skips.slice(0, 10)) {
      console.log(`  ${s.questionId}: ${s.reason}${s.detail ? ` — ${s.detail}` : ''}`);
    }
  }
  console.log('');
  console.log(result.dryRun ? 'Archive dry-run: OK' : 'Archive: OK');
}

async function main() {
  const opts = parseArgs();
  const filterError = validateArchiveFilters(opts);
  if (filterError) {
    console.error(filterError);
    console.error(
      'Usage: pnpm db:questions:archive --source=<name> [--source-row=N] [--limit=10] [--dry-run]'
    );
    console.error('   or: pnpm db:questions:archive --question-id=<id> [--dry-run]');
    process.exit(1);
  }

  const result = await runWithQuestionPipelineAudit(
    prisma,
    'QUESTION_ARCHIVE',
    {
      triggeredBy: 'cli',
      sourceName: opts.sourceName,
      dryRun: opts.dryRun,
    },
    () => archiveSourceQuestions(prisma, opts),
    (r) => ({
      counts: {
        recordsProcessed: r.selected,
        recordsUpdated: r.archived,
        recordsSkipped: r.skipped,
      },
      summaryJson: {
        dryRun: r.dryRun,
        flowDeactivated: r.flowDeactivated,
        skips: r.skips.slice(0, 10),
      },
    })
  );
  printResult(result);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
