/**
 * Import source catalog rows into Question (SoT).
 *
 * Usage:
 *   pnpm db:questions:import --file=path/to/catalog.csv
 *   pnpm db:questions:import --file=path/to/catalog.csv --dry-run
 *   pnpm db:questions:import --file=path/to/catalog.json --sourceName=my-catalog
 */

import './_loadEnv';
import { ensureDatabaseUrl } from '../src/resolveDatabaseUrl';
import { prisma } from '../src/client';
import {
  dryRunSourceQuestionsImport,
  importSourceQuestions,
  parseSourceFile,
  sourceNameFromFile,
  validateSourceColumns,
} from '../src/questionSource';
import { runWithQuestionPipelineAudit } from '../src/questionSource/pipelineRun';

ensureDatabaseUrl();

function parseArgs() {
  const args = process.argv.slice(2);
  const out: Record<string, string | boolean> = { dryRun: false };
  for (const arg of args) {
    if (arg === '--dry-run') {
      out.dryRun = true;
    } else {
      const m = arg.match(/^--([^=]+)=(.*)$/);
      if (m) out[m[1]] = m[2];
    }
  }
  return {
    file: typeof out.file === 'string' ? out.file : undefined,
    sourceName: typeof out.sourceName === 'string' ? out.sourceName : undefined,
    dryRun: out.dryRun === true,
  };
}

function printDryRunSummary(
  parsed: ReturnType<typeof parseSourceFile>,
  columns: ReturnType<typeof validateSourceColumns>,
  result: Awaited<ReturnType<typeof dryRunSourceQuestionsImport>>
) {
  console.log('');
  console.log(`File: ${parsed.filePath}`);
  console.log(`Format: ${parsed.format} | Rows: ${parsed.rows.length} | Source: ${result.sourceName}`);
  console.log('');
  console.log('Columns:');
  console.log(`  required present: ${columns.present.join(', ')}`);
  if (columns.missing.length) {
    console.log(`  MISSING required: ${columns.missing.join(', ')}`);
  }
  if (columns.extra.length) {
    console.log(`  non-canonical extra: ${columns.extra.join(', ')}`);
  }
  console.log('');
  console.log('Plan (no DB writes):');
  console.log(`  questions create: ${result.wouldImport}`);
  console.log(`  questions update: ${result.wouldUpdate}`);
  console.log(`  questions skip:   ${result.wouldSkip}`);
  console.log(`  taxonomy create:  ${result.taxonomyWouldCreate}`);
  console.log(`  taxonomy update:  ${result.taxonomyWouldUpdate}`);
  console.log(
    `  lifecycle: ${Object.entries(result.lifecycleCounts)
      .map(([k, v]) => `${k}=${v}`)
      .join(', ') || 'none'}`
  );
  if (result.skips.length) {
    console.log('');
    console.log('Skipped rows:');
    for (const s of result.skips.slice(0, 20)) {
      console.log(`  row ${s.row}: ${s.reason}${s.detail ? ` (${s.detail})` : ''}`);
    }
    if (result.skips.length > 20) {
      console.log(`  ... and ${result.skips.length - 20} more`);
    }
  }
  console.log('');
  console.log('Row preview:');
  for (const r of result.rows.slice(0, 10)) {
    console.log(
      `  #${r.row} ${r.action}${r.sourceRowNumber != null ? ` N#=${r.sourceRowNumber}` : ''} [${r.lifecycleStatus ?? '?'}] ${r.text ?? r.reason ?? ''}`
    );
  }
  if (result.rows.length > 10) {
    console.log(`  ... and ${result.rows.length - 10} more rows`);
  }
  console.log('');
  console.log(columns.ok ? 'Dry-run: OK' : 'Dry-run: OK (with column warnings)');
}

function printImportSummary(result: Awaited<ReturnType<typeof importSourceQuestions>>) {
  console.log('');
  console.log(`Source: ${result.sourceName}`);
  console.log(`  processed: ${result.processed}`);
  console.log(`  imported:  ${result.imported}`);
  console.log(`  updated:   ${result.updated}`);
  console.log(`  skipped:   ${result.skipped}`);
  console.log(`  taxonomy created: ${result.taxonomyCreated}`);
  console.log(`  taxonomy updated: ${result.taxonomyUpdated}`);
  if (result.skips.length) {
    console.log('');
    console.log('Skipped rows:');
    for (const s of result.skips.slice(0, 20)) {
      console.log(`  row ${s.row}: ${s.reason}${s.detail ? ` (${s.detail})` : ''}`);
    }
  }
  console.log('');
  console.log('Import: OK');
}

async function main() {
  const { file, sourceName: sourceNameArg, dryRun } = parseArgs();
  if (!file) {
    console.error('Usage: pnpm db:questions:import --file=<path> [--dry-run] [--sourceName=name]');
    process.exit(1);
  }

  const parsed = parseSourceFile(file);
  const columns = validateSourceColumns(parsed.headers);
  if (!columns.ok) {
    console.error(`Missing required columns: ${columns.missing.join(', ')}`);
    process.exit(1);
  }

  const sourceName = sourceNameArg ?? sourceNameFromFile(file);

  if (dryRun) {
    const result = await dryRunSourceQuestionsImport(prisma, parsed.rows, sourceName);
    printDryRunSummary(parsed, columns, result);
    return;
  }

  const result = await runWithQuestionPipelineAudit(
    prisma,
    'QUESTION_IMPORT',
    { triggeredBy: 'cli', sourceName },
    () => importSourceQuestions(prisma, parsed.rows, { sourceName }),
    (r) => ({
      counts: {
        recordsProcessed: r.processed,
        recordsCreated: r.imported,
        recordsUpdated: r.updated,
        recordsSkipped: r.skipped,
      },
      summaryJson: {
        taxonomyCreated: r.taxonomyCreated,
        taxonomyUpdated: r.taxonomyUpdated,
        skips: r.skips.slice(0, 10),
      },
    })
  );
  printImportSummary(result);
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
