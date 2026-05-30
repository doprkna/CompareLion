/**
 * CLI: import source questions and/or sync published → FlowQuestion.
 *
 * Usage:
 *   pnpm tsx packages/db/scripts/question-import-sync.ts --action=counts
 *   pnpm tsx packages/db/scripts/question-import-sync.ts --action=import --file=questions.json
 *   pnpm tsx packages/db/scripts/question-import-sync.ts --action=sync
 *   pnpm tsx packages/db/scripts/question-import-sync.ts --action=import-and-sync --file=questions.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../src/client';
import {
  getQuestionPipelineCounts,
  importSourceQuestions,
  syncPublishedQuestionsToFlow,
  type SourceQuestionRow,
} from '../src/questionSource';
import { runWithQuestionPipelineAudit } from '../src/questionSource/pipelineRun';

function parseArgs() {
  const args = process.argv.slice(2);
  const out: Record<string, string> = {};
  for (const arg of args) {
    const m = arg.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return {
    action: out.action ?? 'counts',
    file: out.file,
    sourceName: out.sourceName ?? 'external-catalog',
    seedStats: out.seedStats === 'true',
  };
}

function loadRows(filePath: string): SourceQuestionRow[] {
  const abs = path.resolve(filePath);
  const raw = fs.readFileSync(abs, 'utf-8');
  if (abs.endsWith('.json')) {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [data];
  }
  const lines = raw.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows: SourceQuestionRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
    const row: SourceQuestionRow = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? '';
    });
    rows.push(row);
  }
  return rows;
}

async function main() {
  const { action, file, sourceName, seedStats } = parseArgs();

  console.log(`Question pipeline action: ${action}`);

  if (action === 'import' || action === 'import-and-sync') {
    if (!file) {
      console.error('--file required for import');
      process.exit(1);
    }
    const rows = loadRows(file);
    console.log(`Loaded ${rows.length} rows from ${file}`);
    const importResult = await runWithQuestionPipelineAudit(
      prisma,
      'QUESTION_IMPORT',
      { triggeredBy: 'cli-import-sync', sourceName },
      () => importSourceQuestions(prisma, rows, { sourceName, seedStats }),
      (r) => ({
        counts: {
          recordsProcessed: r.processed,
          recordsCreated: r.imported,
          recordsUpdated: r.updated,
          recordsSkipped: r.skipped,
        },
        summaryJson: { via: 'import-sync', skips: r.skips.slice(0, 10) },
      })
    );
    console.log('Import result:', JSON.stringify(importResult, null, 2));
  }

  if (action === 'sync' || action === 'import-and-sync') {
    const syncResult = await runWithQuestionPipelineAudit(
      prisma,
      'QUESTION_SYNC',
      { triggeredBy: 'cli-import-sync' },
      () => syncPublishedQuestionsToFlow(prisma),
      (s) => ({
        counts: {
          recordsProcessed: s.flowUpserted + s.flowSkipped + s.flowDeactivated,
          recordsCreated: s.flowUpserted,
          recordsUpdated: s.flowDeactivated,
          recordsSkipped: s.flowSkipped,
        },
        summaryJson: {
          via: 'import-sync',
          publishedQuestions: s.publishedQuestions,
          activeFlowQuestions: s.activeFlowQuestions,
        },
      })
    );
    console.log('Sync result:', JSON.stringify(syncResult, null, 2));
  }

  const counts = await getQuestionPipelineCounts(prisma);
  console.log('Counts:', JSON.stringify(counts, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
