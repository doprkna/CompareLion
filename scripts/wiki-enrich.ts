#!/usr/bin/env tsx
/**
 * WikiBot (tortoise) - Enrich FlowQuestions with world-context metadata.
 * Uses only internal Wiki Seeds. Produces report; does not silently rewrite.
 * Run: pnpm wiki:enrich [--limit=10]
 */

import '../packages/db/scripts/_loadEnv';
import { ensureDatabaseUrl } from '../packages/db/src/resolveDatabaseUrl';
import { prisma, createOpsRun, finishOpsRun } from '@parel/db';
import { WIKI_SEED_KEYS } from '@parel/core';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

ensureDatabaseUrl();

const DEFAULT_LIMIT = 10;
const REPORT_PATH = resolve(process.cwd(), 'docs', 'wiki-enrich-report.md');

type RegionPolicy = 'userRegion' | 'global' | 'fixed:CZ';

interface MappingResult {
  key: string;
  regionPolicy: RegionPolicy;
  label: string;
  confidence: 'high' | 'low';
}

/** Simple deterministic heuristics: map question text/type to wiki key. */
function proposeMapping(q: { text: string; type: string }): MappingResult | null {
  const t = q.text.toLowerCase();
  const type = q.type?.toUpperCase() || '';

  if (type === 'NUMERIC') {
    if (/\bsleep\b|hours.*night|per night/i.test(t)) {
      return { key: 'sleep_hours_avg', regionPolicy: 'fixed:CZ', label: 'Average sleep hours', confidence: 'high' };
    }
    if (/\bphone\b|screen|hours.*day|per day/i.test(t) && /hour/i.test(t)) {
      return { key: 'screen_time_hours_avg', regionPolicy: 'fixed:CZ', label: 'Average screen time per day', confidence: 'high' };
    }
  }

  if (/\bincome\b|salary|salary|monthly.*earn|earn.*month/i.test(t)) {
    return { key: 'income_monthly_avg', regionPolicy: 'userRegion', label: 'Average monthly income', confidence: 'high' };
  }
  if (/\bspend\b|spending\b|aware.*spend/i.test(t) && !/income|salary/i.test(t)) {
    return { key: 'income_monthly_avg', regionPolicy: 'fixed:CZ', label: 'Spending context (CZ avg income)', confidence: 'low' };
  }

  return null;
}

function parseLimit(): number {
  const arg = process.argv.find((a) => a.startsWith('--limit='));
  if (!arg) return DEFAULT_LIMIT;
  const n = parseInt(arg.split('=')[1], 10);
  return isNaN(n) ? DEFAULT_LIMIT : Math.max(1, Math.min(n, 100));
}

async function main() {
  const limit = parseLimit();
  const run = await createOpsRun(prisma, 'WIKI_ENRICH', 'manual', {
    entityType: 'FLOW',
    params: { limit },
  });

  const candidates = await prisma.flowQuestion.findMany({
    where: {
      wikiFillCandidate: true,
      worldContextKey: null,
    },
    take: limit,
    orderBy: { createdAt: 'asc' },
    select: { id: true, text: true, type: true },
  });

  const updated: Array<{ id: string; title: string; key: string; policy: string }> = [];
  const skipped: Array<{ id: string; title: string; reason: string }> = [];

  for (const q of candidates) {
    const title = q.text.length > 60 ? q.text.slice(0, 57) + '...' : q.text;
    const mapping = proposeMapping(q);

    if (!mapping) {
      skipped.push({ id: q.id, title, reason: 'No mapping heuristics matched' });
      continue;
    }
    if (!WIKI_SEED_KEYS.includes(mapping.key)) {
      skipped.push({ id: q.id, title, reason: `Key "${mapping.key}" not in wiki seeds` });
      continue;
    }
    if (mapping.confidence === 'low') {
      skipped.push({ id: q.id, title, reason: `Low confidence for "${mapping.key}"` });
      continue;
    }

    await prisma.flowQuestion.update({
      where: { id: q.id },
      data: {
        worldContextKey: mapping.key,
        worldContextRegionPolicy: mapping.regionPolicy,
        worldContextLabel: mapping.label,
      },
    });
    updated.push({ id: q.id, title, key: mapping.key, policy: mapping.regionPolicy });
  }

  const reportBody = `# Wiki Enrich Report

Generated: ${new Date().toISOString()}
Limit: ${limit}

## Updated (${updated.length})

| id | question | worldContextKey | regionPolicy |
|----|----------|-----------------|--------------|
${updated.map((u) => `| ${u.id} | ${u.title} | ${u.key} | ${u.policy} |`).join('\n') || '| - | - | - | - |'}

## Skipped (${skipped.length})

| id | question | reason |
|----|----------|--------|
${skipped.map((s) => `| ${s.id} | ${s.title} | ${s.reason} |`).join('\n') || '| - | - | - |'}
`;

  writeFileSync(REPORT_PATH, reportBody, 'utf-8');

  await finishOpsRun(prisma, run.id, 'success', {
    counts: { updated: updated.length, skipped: skipped.length, created: 0, errors: 0 },
    message: `Updated ${updated.length}, skipped ${skipped.length}`,
    reportPath: REPORT_PATH,
  });

  console.log('[WikiBot] Candidates:', candidates.length);
  console.log('[WikiBot] Updated:', updated.length);
  console.log('[WikiBot] Skipped:', skipped.length);
  console.log('[WikiBot] Report:', REPORT_PATH);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    try {
      const run = await prisma.opsRun.findFirst({ where: { type: 'WIKI_ENRICH', status: 'running' }, orderBy: { startedAt: 'desc' } });
      if (run) {
        const err = e as Error;
        await finishOpsRun(prisma, run.id, 'failed', {
          message: String(err?.message ?? e),
          errorStack: err?.stack,
        });
      }
    } catch {}
    await prisma.$disconnect();
    process.exit(1);
  });
