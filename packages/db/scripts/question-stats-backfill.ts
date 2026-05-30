/**
 * Backfill QuestionStats from linked FlowQuestion runtime data.
 *
 * Usage: pnpm db:questions:stats:backfill
 */

import './_loadEnv';
import { ensureDatabaseUrl } from '../src/resolveDatabaseUrl';
import { prisma } from '../src/client';
import {
  backfillQuestionStats,
  USAGE_COUNT_FROM_SERVE_EVENTS,
  USAGE_COUNT_FALLBACK_NOTE,
  REPORT_COUNT_SCOPE,
} from '../src/questionSource/statsBackfill';
import {
  runWithQuestionPipelineAudit,
  startQuestionPipelineRun,
  finishQuestionPipelineRun,
} from '../src/questionSource/pipelineRun';

ensureDatabaseUrl();

async function main() {
  const result = await runWithQuestionPipelineAudit(
    prisma,
    'QUESTION_STATS_BACKFILL',
    { triggeredBy: 'cli' },
    () => backfillQuestionStats(prisma),
    (r) => ({
      counts: {
        recordsProcessed: r.questionsScanned,
        recordsCreated: r.statsCreated,
        recordsUpdated: r.statsUpdated,
        recordsSkipped: r.questionsWithoutFlowQuestion,
      },
      summaryJson: {
        questionsWithAnswers: r.questionsWithAnswers,
        questionsWithReports: r.questionsWithReports,
        questionsWithServeEvents: r.questionsWithServeEvents,
        usageFallbackCount: r.usageFallbackCount,
        usageSource: r.usageSource,
        reportScope: r.reportScope,
      },
    })
  );

  const reportRunId = await startQuestionPipelineRun(prisma, 'QUESTION_REPORT_BACKFILL', {
    triggeredBy: 'cli',
  });
  await finishQuestionPipelineRun(prisma, reportRunId, {
    status: 'SUCCESS',
    counts: {
      recordsProcessed: result.questionsScanned,
      recordsUpdated: result.questionsWithReports,
    },
    summaryJson: {
      questionsWithReports: result.questionsWithReports,
      reportScope: result.reportScope,
      pairedWith: 'QUESTION_STATS_BACKFILL',
    },
  });

  console.log('');
  console.log('QuestionStats backfill');
  console.log(`  questions scanned:          ${result.questionsScanned}`);
  console.log(`  stats created:              ${result.statsCreated}`);
  console.log(`  stats updated:              ${result.statsUpdated}`);
  console.log(`  without FlowQuestion:       ${result.questionsWithoutFlowQuestion}`);
  console.log(`  with answers:               ${result.questionsWithAnswers}`);
  console.log(`  with reports:               ${result.questionsWithReports}`);
  console.log(`  with serve events:          ${result.questionsWithServeEvents}`);
  console.log(`  usage fallback (no serves): ${result.usageFallbackCount}`);
  console.log('');
  console.log(`  usageCount: ${result.usageSource}`);
  console.log(`  fallback:   ${result.usageFallback}`);
  console.log(`  reportCount: ${REPORT_COUNT_SCOPE}`);
  console.log(`  excluded report models: ${result.excludedReportModels.join(', ')}`);
  console.log('');
  console.log('Backfill: OK');
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
