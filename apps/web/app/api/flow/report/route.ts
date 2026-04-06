import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { safeAsync, successResponse, authError, validationError } from '@/lib/api-handler';
import { getSyntheticGlobalStats, formatHours } from '@/lib/services/syntheticStats';
import { STARTER_FLOW_SLUG } from '@/lib/constants/flow';
import { getWorldContext } from '@parel/core';

export const runtime = 'nodejs';

/**
 * GET /api/flow/report?categoryId=xxx&region=xxx
 * Report payload for Option A (You vs World). Uses synthetic stats when category is starter.
 * Optional region (e.g. CZ) enables World Context rows when data exists.
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return authError();
  const { prisma } = await import('@/lib/db');
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });
  if (!user) return authError();
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('categoryId');
  const regionParam = searchParams.get('region') || '';
  if (!categoryId) return validationError('categoryId required');
  const category = await prisma.sssCategory.findUnique({
    where: { id: categoryId },
    select: { slug: true, id: true }
  });
  if (!category) return validationError('Category not found');
  const isStarter = category.slug === STARTER_FLOW_SLUG;
  const questions = await prisma.flowQuestion.findMany({
    where: { categoryId, isActive: true },
    orderBy: { createdAt: 'asc' },
    include: { options: { orderBy: { order: 'asc' } } },
  });
  const responses = await prisma.userResponse.findMany({
    where: { userId: user.id, questionId: { in: questions.map(q => q.id) } },
    include: { question: true }
  });
  const respMap = new Map(responses.map(r => [r.questionId, r]));
  const rows: Array<{ question: string; you: string; global: string }> = [];
  let n = 312;
  let headlinePercentile = 63;
  let headlineLabel = 'skeptical';
  for (const q of questions.slice(0, 3)) {
    const r = respMap.get(q.id);
    const stats = getSyntheticGlobalStats(
      q.id,
      q.type as 'SINGLE_CHOICE' | 'NUMERIC',
      r ? { optionValue: r.optionIds?.[0] ? q.options.find(o => o.id === r.optionIds[0])?.value : undefined, numericVal: r.numericVal ?? undefined } : undefined
    );
    n = stats.n;
    if (stats.percentileForUserAnswer) headlinePercentile = stats.percentileForUserAnswer;
    let you = '-';
    let global = '-';
    if (r) {
      if (r.skipped) you = 'Skipped';
      else if (q.type === 'SINGLE_CHOICE' && r.optionIds[0]) {
        const opt = q.options.find(o => o.id === r.optionIds[0]);
        you = opt?.label ?? 'Yes/No';
        global = stats.globalPercentYes ? `${stats.globalPercentYes}% Yes` : '18% Yes';
      } else if (q.type === 'NUMERIC' && r.numericVal != null) {
        you = `${r.numericVal}h`;
        global = stats.globalAvg ? `avg: ${formatHours(stats.globalAvg)}` : 'avg: 6h 47m';
      }
    }
    const shortText = q.text.length > 25 ? q.text.slice(0, 22) + '...' : q.text;
    rows.push({ question: shortText, you, global });
  }
  const worldContextRows: Array<{ label: string; formatted: string }> = [];
  const region = regionParam || 'CZ';
  for (const q of questions) {
    const key = (q as any).worldContextKey;
    if (!key) continue;
    const policy = (q as any).worldContextRegionPolicy || 'fixed:CZ';
    const resolvedRegion = policy === 'userRegion' ? region : policy === 'fixed:CZ' ? 'CZ' : policy.startsWith('fixed:') ? policy.slice(7) : 'CZ';
    const ctx = getWorldContext(resolvedRegion, key);
    if (ctx) {
      worldContextRows.push({
        label: (q as any).worldContextLabel || ctx.label,
        formatted: `${ctx.label} (${ctx.year}): ${ctx.value.toLocaleString()} ${ctx.unit} (${ctx.sourceName})`,
      });
    }
  }

  return successResponse({
    headline: `You are more ${headlineLabel} than ${headlinePercentile}% of players.`,
    subheader: `Based on ${n} responses.`,
    rows,
    worldContextRows: worldContextRows.length ? worldContextRows : undefined,
    identityHint: 'You are trending toward: The Curious Realist',
    unlockNote: 'Unlock deeper breakdown at Level 3',
    isStarter
  });
});
