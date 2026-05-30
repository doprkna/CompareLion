/**
 * Question SoT regression smoke: fixture → Question → sync → FlowQuestion → serve → answer.
 * Run: pnpm db:questions:smoke
 */

import './_loadEnv';
import { ensureDatabaseUrl } from '../src/resolveDatabaseUrl';
import { prisma } from '../src/client';
import {
  importSourceQuestions,
  syncPublishedQuestionsToFlow,
  archiveSourceQuestions,
  backfillQuestionStats,
  reportFlowQuestion,
} from '../src/questionSource';
import { getNextQuestion, answerQuestion } from '../../features/flow/flow-skeleton';
import * as fs from 'fs';
import * as path from 'path';

const SOURCE_NAME = 'pipeline-smoke-test';
const FIXTURE = path.resolve(__dirname, '../fixtures/question-pipeline-smoke.json');
const PUBLISH_TEXT = 'Do you have any siblings?';
const EXPECTED_ROW_COUNT = 5;

ensureDatabaseUrl();

type Check = { name: string; pass: boolean; detail?: string };

function validateYesNoOptions(
  options: { id: string; label: string; value: string; order: number }[]
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (options.length !== 2) {
    errors.push(`expected 2 options, got ${options.length}`);
    return { ok: false, errors };
  }
  const sorted = [...options].sort((a, b) => a.order - b.order);
  if (sorted[0].label !== 'Yes' || sorted[0].value !== 'yes' || sorted[0].order !== 0) {
    errors.push(`option[0] expected Yes/yes/0`);
  }
  if (sorted[1].label !== 'No' || sorted[1].value !== 'no' || sorted[1].order !== 1) {
    errors.push(`option[1] expected No/no/1`);
  }
  return { ok: errors.length === 0, errors };
}

async function loadFlowQuestionWithOptions(sourceQuestionId: string) {
  return prisma.flowQuestion.findUnique({
    where: { sourceQuestionId },
    include: { options: { orderBy: { order: 'asc' } } },
  });
}

function printResults(checks: Check[], failed: boolean) {
  console.log('');
  for (const c of checks) {
    console.log(`${c.pass ? 'PASS' : 'FAIL'}  ${c.name}${c.detail ? ` — ${c.detail}` : ''}`);
  }
  console.log('');
  if (failed) {
    console.log('Question SoT smoke: FAILED');
    process.exit(1);
  }
  console.log(`Question SoT smoke: OK (${checks.length} checks)`);
}

async function main() {
  const checks: Check[] = [];
  const add = (name: string, pass: boolean, detail?: string) => {
    checks.push({ name, pass, detail });
    if (!pass) {
      printResults(checks, true);
    }
  };

  try {
    await prisma.$queryRaw`SELECT "lifecycleStatus" FROM "questions" LIMIT 1`;
    add('schema: Question lifecycle columns exist', true);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    add('schema: Question lifecycle columns exist', false, msg);
    return;
  }

  const rows = JSON.parse(fs.readFileSync(FIXTURE, 'utf-8')) as unknown[];
  const importResult = await importSourceQuestions(prisma, rows, {
    sourceName: SOURCE_NAME,
  });
  const rowsUpserted = importResult.imported + importResult.updated;
  add(
    'import: 5 source rows upserted',
    importResult.processed === EXPECTED_ROW_COUNT &&
      rowsUpserted === EXPECTED_ROW_COUNT &&
      importResult.skipped === 0,
    `processed=${importResult.processed} upserted=${rowsUpserted} skipped=${importResult.skipped}`
  );

  const now = new Date();
  const publishUpdate = await prisma.question.updateMany({
    where: {
      sourceName: SOURCE_NAME,
      sourceRowNumber: 1,
      text: PUBLISH_TEXT,
    },
    data: {
      lifecycleStatus: 'PUBLISHED',
      approved: true,
      approvedAt: now,
      publishedAt: now,
    },
  });
  add(
    'publish: exactly one question set PUBLISHED',
    publishUpdate.count === 1,
    `"${PUBLISH_TEXT}"`
  );

  const publishedCount = await prisma.question.count({
    where: { sourceName: SOURCE_NAME, lifecycleStatus: 'PUBLISHED' },
  });
  const draftCount = await prisma.question.count({
    where: { sourceName: SOURCE_NAME, lifecycleStatus: 'DRAFT' },
  });
  add(
    'publish: only 1 PUBLISHED, 4 remain DRAFT',
    publishedCount === 1 && draftCount === EXPECTED_ROW_COUNT - 1,
    `published=${publishedCount} draft=${draftCount}`
  );

  const question = await prisma.question.findFirst({
    where: { sourceName: SOURCE_NAME, sourceRowNumber: 1 },
    include: {
      sssc: {
        include: {
          subSubCategory: {
            include: {
              subCategory: { include: { category: true } },
            },
          },
        },
      },
    },
  });
  add('publish: published Question row exists', Boolean(question));
  if (!question) return;

  const taxonomyOk =
    Boolean(question.sssc) &&
    Boolean(question.sssc.subSubCategory) &&
    Boolean(question.sssc.subSubCategory.subCategory) &&
    Boolean(question.sssc.subSubCategory.subCategory.category);
  add(
    'taxonomy: SssCategory hierarchy linked',
    taxonomyOk,
    question.sssc?.name ?? 'missing sssc'
  );

  await syncPublishedQuestionsToFlow(prisma);

  let flowQuestion = await loadFlowQuestionWithOptions(question.id);
  add('sync: FlowQuestion projected', Boolean(flowQuestion));
  if (!flowQuestion) return;

  add(
    'sync: sourceQuestionId links to Question',
    flowQuestion.sourceQuestionId === question.id,
    flowQuestion.sourceQuestionId ?? 'null'
  );
  add(
    'sync: FlowQuestion isActive',
    flowQuestion.isActive === true,
    String(flowQuestion.isActive)
  );

  const optionCheck = validateYesNoOptions(flowQuestion.options);
  add(
    'sync: exactly 2 Yes/No options',
    optionCheck.ok,
    optionCheck.ok
      ? 'Yes=yes, No=no'
      : optionCheck.errors.join('; ')
  );

  await syncPublishedQuestionsToFlow(prisma);
  const afterResync = await loadFlowQuestionWithOptions(question.id);
  add(
    'sync: re-run does not duplicate options',
    afterResync?.options.length === 2,
    `count=${afterResync?.options.length ?? 0}`
  );
  if (!afterResync) return;
  flowQuestion = afterResync;

  const q3 = await prisma.question.findFirst({
    where: { sourceName: SOURCE_NAME, sourceRowNumber: 3 },
    select: { metadata: true },
  });
  const q3Opts = (
    q3?.metadata as { importOptions?: { label: string; value: string }[] } | null
  )?.importOptions;
  add(
    'import: frequency options stored on Question',
    q3Opts?.length === 5 &&
      q3Opts.some((o) => o.value === 'never') &&
      q3Opts.some((o) => o.value === 'always'),
    q3Opts?.map((o) => o.label).join('|') ?? 'none'
  );

  await prisma.question.updateMany({
    where: { sourceName: SOURCE_NAME, sourceRowNumber: 2 },
    data: {
      lifecycleStatus: 'PUBLISHED',
      approved: true,
      approvedAt: now,
      publishedAt: now,
    },
  });
  await syncPublishedQuestionsToFlow(prisma);
  const q2 = await prisma.question.findFirst({
    where: { sourceName: SOURCE_NAME, sourceRowNumber: 2 },
  });
  let fq2 = q2 ? await loadFlowQuestionWithOptions(q2.id) : null;
  const scaleValues = ['1', '2', '3', '4', '5'];
  add(
    'sync: custom 1-5 options projected',
    Boolean(
      fq2?.options.length === 5 &&
        scaleValues.every((v) => fq2!.options.some((o) => o.value === v))
    ),
    fq2?.options.map((o) => o.value).join(',') ?? 'none'
  );
  await syncPublishedQuestionsToFlow(prisma);
  fq2 = q2 ? await loadFlowQuestionWithOptions(q2.id) : null;
  add(
    'sync: custom options idempotent on re-sync',
    fq2?.options.length === 5,
    `count=${fq2?.options.length ?? 0}`
  );

  const user = await prisma.user.findFirst({ select: { id: true } });
  add('runtime: test user available', Boolean(user));
  if (!user) return;

  // Isolate runtime to the smoke-projected question (other published imports may share ssscId).
  await prisma.flowQuestion.updateMany({
    where: { categoryId: question.ssscId, id: { not: flowQuestion.id } },
    data: { isActive: false },
  });

  await prisma.userResponse.deleteMany({
    where: { userId: user.id, questionId: flowQuestion.id },
  });

  const served = await getNextQuestion(user.id, question.ssscId);
  add(
    'runtime: getNextQuestion serves projected FlowQuestion',
    served?.id === flowQuestion.id,
    served?.id ?? 'null'
  );
  add(
    'runtime: served question includes 2 options',
    served?.options?.length === 2,
    `options=${served?.options?.length ?? 0}`
  );

  let serveEventCount = 0;
  try {
    serveEventCount = await prisma.flowQuestionServeEvent.count({
      where: { flowQuestionId: flowQuestion.id, sourceQuestionId: question.id },
    });
  } catch {
    serveEventCount = 0;
  }
  add(
    'serve: FlowQuestionServeEvent recorded',
    serveEventCount >= 1,
    `count=${serveEventCount}`
  );

  let q1Stats = await prisma.questionStats.findUnique({
    where: { questionId: question.id },
  });
  add(
    'stats: usageCount after serve',
    (q1Stats?.usageCount ?? 0) >= 1,
    `usageCount=${q1Stats?.usageCount ?? 0}`
  );

  const yesOption = flowQuestion.options.find((o) => o.value === 'yes');
  if (!yesOption) {
    add('runtime: yes option present', false);
    return;
  }

  await answerQuestion(user.id, flowQuestion.id, [yesOption.id]);
  const response = await prisma.userResponse.findUnique({
    where: {
      userId_questionId: { userId: user.id, questionId: flowQuestion.id },
    },
  });
  add(
    'runtime: answerQuestion records Yes optionId',
    Boolean(response?.optionIds?.includes(yesOption.id)),
    response?.optionIds?.join(',') ?? 'none'
  );

  q1Stats = await prisma.questionStats.findUnique({
    where: { questionId: question.id },
  });
  add(
    'stats: live answerCount after answer',
    (q1Stats?.answerCount ?? 0) >= 1,
    `answerCount=${q1Stats?.answerCount ?? 0}`
  );
  add(
    'stats: usageCount >= answerCount after serve+answer',
    (q1Stats?.usageCount ?? 0) >= (q1Stats?.answerCount ?? 0),
    `usage=${q1Stats?.usageCount ?? 0} answer=${q1Stats?.answerCount ?? 0}`
  );

  const backfill1 = await backfillQuestionStats(prisma);
  q1Stats = await prisma.questionStats.findUnique({ where: { questionId: question.id } });
  const usageAfterBackfill = q1Stats?.usageCount ?? 0;
  const answerCountAfterBackfill = q1Stats?.answerCount ?? 0;
  add(
    'stats: backfill usageCount >= 1',
    usageAfterBackfill >= 1,
    `usageCount=${usageAfterBackfill}`
  );
  add(
    'stats: backfill answerCount >= 1',
    answerCountAfterBackfill >= 1,
    `answerCount=${answerCountAfterBackfill}`
  );

  await backfillQuestionStats(prisma);
  q1Stats = await prisma.questionStats.findUnique({ where: { questionId: question.id } });
  add(
    'stats: repeated backfill idempotent',
    (q1Stats?.usageCount ?? 0) === usageAfterBackfill &&
      (q1Stats?.answerCount ?? 0) === answerCountAfterBackfill,
    `usage=${q1Stats?.usageCount ?? 0} answer=${q1Stats?.answerCount ?? 0} fallback=${backfill1.usageFallbackCount}`
  );

  const reportResult = await reportFlowQuestion(prisma, {
    flowQuestionId: flowQuestion.id,
    userId: user.id,
    reason: 'OTHER',
    details: 'pipeline smoke test report',
  });
  add(
    'report: FlowQuestion report recorded',
    Boolean(reportResult?.id),
    reportResult?.id ?? 'none'
  );

  let reportRowCount = 0;
  try {
    reportRowCount = await prisma.questionReport.count({
      where: {
        questionId: flowQuestion.id,
        sourceQuestionId: question.id,
      },
    });
  } catch {
    reportRowCount = 0;
  }
  add(
    'report: QuestionReport row exists',
    reportRowCount >= 1,
    `count=${reportRowCount}`
  );

  q1Stats = await prisma.questionStats.findUnique({ where: { questionId: question.id } });
  const reportCountAfterLive = q1Stats?.reportCount ?? 0;
  add(
    'stats: reportCount after report',
    reportCountAfterLive >= 1,
    `reportCount=${reportCountAfterLive}`
  );

  await backfillQuestionStats(prisma);
  q1Stats = await prisma.questionStats.findUnique({ where: { questionId: question.id } });
  const reportCountAfterBackfill = q1Stats?.reportCount ?? 0;
  add(
    'stats: backfill reportCount >= 1',
    reportCountAfterBackfill >= 1,
    `reportCount=${reportCountAfterBackfill}`
  );

  await backfillQuestionStats(prisma);
  q1Stats = await prisma.questionStats.findUnique({ where: { questionId: question.id } });
  add(
    'stats: repeated backfill reportCount idempotent',
    (q1Stats?.reportCount ?? 0) === reportCountAfterBackfill,
    `reportCount=${q1Stats?.reportCount ?? 0}`
  );

  if (user && fq2) {
    const opt3 = fq2.options.find((o) => o.value === '3');
    if (opt3) {
      await prisma.userResponse.deleteMany({
        where: { userId: user.id, questionId: fq2.id },
      });
      await answerQuestion(user.id, fq2.id, [opt3.id]);
      const customResponse = await prisma.userResponse.findUnique({
        where: {
          userId_questionId: { userId: user.id, questionId: fq2.id },
        },
      });
      add(
        'runtime: custom optionId answer recorded',
        Boolean(customResponse?.optionIds?.includes(opt3.id)),
        customResponse?.optionIds?.join(',') ?? 'none'
      );
    } else {
      add('runtime: custom optionId answer recorded', false, 'option 3 missing');
    }
  }

  const archiveResult = await archiveSourceQuestions(prisma, {
    questionId: question.id,
    deactivateFlow: true,
  });
  add(
    'archive: question archived',
    archiveResult.archived === 1,
    `archived=${archiveResult.archived}`
  );

  const archivedQuestion = await prisma.question.findUnique({
    where: { id: question.id },
    select: { lifecycleStatus: true, archivedAt: true },
  });
  add(
    'archive: lifecycleStatus ARCHIVED',
    archivedQuestion?.lifecycleStatus === 'ARCHIVED' && archivedQuestion.archivedAt != null
  );

  const archivedFlow = await loadFlowQuestionWithOptions(question.id);
  add(
    'archive: FlowQuestion isActive false',
    archivedFlow?.isActive === false,
    String(archivedFlow?.isActive)
  );

  const restoreNow = new Date();
  await prisma.question.update({
    where: { id: question.id },
    data: {
      lifecycleStatus: 'PUBLISHED',
      approved: true,
      approvedAt: restoreNow,
      publishedAt: restoreNow,
    },
  });
  await syncPublishedQuestionsToFlow(prisma);
  const restoredFlow = await loadFlowQuestionWithOptions(question.id);
  add(
    'restore: smoke question re-published for next run',
    restoredFlow?.isActive === true,
    String(restoredFlow?.isActive)
  );

  printResults(checks, false);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
