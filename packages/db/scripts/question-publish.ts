/**
 * Publish imported Questions and optionally sync to FlowQuestion.
 *
 * Usage:
 *   pnpm db:questions:publish --source=question-catalog-sample --dry-run
 *   pnpm db:questions:publish --source=question-catalog-sample --limit=1 --sync
 */

import './_loadEnv';
import { ensureDatabaseUrl } from '../src/resolveDatabaseUrl';
import { prisma } from '../src/client';
import { publishSourceQuestions } from '../src/questionSource';
import {
  runWithQuestionPipelineAudit,
  startQuestionPipelineRun,
  finishQuestionPipelineRun,
  resolvePipelineRunStatus,
} from '../src/questionSource/pipelineRun';

ensureDatabaseUrl();

const DEFAULT_LIMIT = 50;

function parseArgs() {
  const args = process.argv.slice(2);
  const out: Record<string, string | boolean> = {
    dryRun: false,
    sync: false,
    allowSensitive: false,
  };
  for (const arg of args) {
    if (arg === '--dry-run') out.dryRun = true;
    else if (arg === '--sync') out.sync = true;
    else if (arg === '--allow-sensitive') out.allowSensitive = true;
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

  return {
    sourceName: typeof out.source === 'string' ? out.source : undefined,
    limit,
    dryRun: out.dryRun === true,
    sync: out.sync === true,
    allowSensitive: out.allowSensitive === true,
  };
}

function printResult(result: Awaited<ReturnType<typeof publishSourceQuestions>>) {
  console.log('');
  console.log(`Source: ${result.sourceName}`);
  console.log(`  mode:     ${result.dryRun ? 'dry-run' : 'live'}`);
  console.log(`  selected: ${result.selected}`);
  console.log(`  published:${result.published}`);
  console.log(`  skipped:  ${result.skipped}`);
  if (result.skips.length) {
    console.log('');
    console.log('Skipped:');
    for (const s of result.skips.slice(0, 10)) {
      console.log(`  ${s.questionId}: ${s.reason}${s.detail ? ` — ${s.detail}` : ''}`);
    }
  }
  if (result.sync) {
    console.log('');
    console.log('Sync:');
    console.log(`  flowUpserted:   ${result.sync.flowUpserted}`);
    console.log(`  flowSkipped:    ${result.sync.flowSkipped}`);
    console.log(`  flowDeactivated:${result.sync.flowDeactivated}`);
    console.log(`  activeFlow:     ${result.sync.activeFlowQuestions}`);
  }
  console.log('');
  console.log(result.dryRun ? 'Publish dry-run: OK' : 'Publish: OK');
}

async function main() {
  const { sourceName, limit, dryRun, sync, allowSensitive } = parseArgs();
  if (!sourceName) {
    console.error(
      'Usage: pnpm db:questions:publish --source=<sourceName> [--limit=50] [--sync] [--dry-run] [--allow-sensitive]'
    );
    process.exit(1);
  }

  const result = await runWithQuestionPipelineAudit(
    prisma,
    'QUESTION_PUBLISH',
    { triggeredBy: 'cli', sourceName, dryRun },
    () =>
      publishSourceQuestions(prisma, {
        sourceName,
        limit,
        dryRun,
        sync: dryRun ? false : sync,
        allowSensitive,
      }),
    (r) => ({
      counts: {
        recordsProcessed: r.selected,
        recordsCreated: r.published,
        recordsSkipped: r.skipped,
      },
      summaryJson: {
        dryRun: r.dryRun,
        skips: r.skips.slice(0, 10),
      },
    })
  );

  if (result.skips.some((s) => s.reason === 'missing_source')) {
    console.error('sourceName is required');
    process.exit(1);
  }

  if (!dryRun && sync && result.sync) {
    const sync = result.sync;
    const syncRunId = await startQuestionPipelineRun(prisma, 'QUESTION_SYNC', {
      triggeredBy: 'cli',
      sourceName,
    });
    const syncCounts = {
      recordsProcessed: sync.flowUpserted + sync.flowSkipped + sync.flowDeactivated,
      recordsCreated: sync.flowUpserted,
      recordsUpdated: sync.flowDeactivated,
      recordsSkipped: sync.flowSkipped,
    };
    await finishQuestionPipelineRun(prisma, syncRunId, {
      status: resolvePipelineRunStatus(syncCounts, false),
      counts: syncCounts,
      summaryJson: {
        publishedQuestions: sync.publishedQuestions,
        activeFlowQuestions: sync.activeFlowQuestions,
        skips: sync.skips.slice(0, 10),
      },
    });
  }

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
