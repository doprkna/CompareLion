/**
 * POST /api/questions/[id]/fast-report (premium)
 * Unlocks premium report (gates by diamonds + feature flag; no charge v1)
 */
import { NextRequest } from 'next/server';
import { getFlowUser } from '@/lib/flow-auth';
import { prisma } from '@/lib/db';
import { successResponse, authError } from '@/lib/api-handler';
import {
  generateFastReport,
  hasPremiumUnlock,
  createPremiumUnlock,
} from '@/lib/reports/fastQuestionReport';

const PREMIUM_COST = 5; // diamonds (optional v1: can skip deduction)

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getFlowUser(_req as NextRequest);
  if (!user) return authError();

  const { id } = await params;

  const premiumEnabled =
    process.env.NEXT_PUBLIC_PREMIUM_FAST_REPORTS_ENABLED === 'true';
  if (!premiumEnabled) {
    const u = await prisma.user.findUnique({
      where: { id: user.id },
      select: { region: true },
    });
    const report = await generateFastReport(
      { userId: user.id, questionId: id, region: u?.region ?? 'global' },
      { premiumEnabled: false }
    );
    return successResponse({
      tier: report.tier,
      lines: report.lines,
      meta: report.meta,
    });
  }

  const [existingUnlock, userRow] = await Promise.all([
    hasPremiumUnlock(user.id, id),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { diamonds: true, region: true },
    }),
  ]);

  if (existingUnlock) {
    const report = await generateFastReport(
      {
        userId: user.id,
        questionId: id,
        region: userRow?.region ?? 'global',
      },
      { premiumEnabled: true, userDiamonds: 999, hasUnlock: true }
    );
    return successResponse({
      tier: 'premium',
      lines: report.lines,
      meta: report.meta,
    });
  }

  const diamonds = userRow?.diamonds ?? 0;
  if (diamonds < PREMIUM_COST) {
    const report = await generateFastReport(
      {
        userId: user.id,
        questionId: id,
        region: userRow?.region ?? 'global',
      },
      { premiumEnabled: true, userDiamonds: diamonds, hasUnlock: false }
    );
    return successResponse({
      tier: 'premiumLocked',
      lines: report.lines,
      cta: { label: 'Unlock with diamonds', href: '/diamondshop' },
    });
  }

  await createPremiumUnlock(user.id, id);

  const report = await generateFastReport(
    {
      userId: user.id,
      questionId: id,
      region: userRow?.region ?? 'global',
    },
    { premiumEnabled: true, userDiamonds: diamonds, hasUnlock: true }
  );

  return successResponse({
    tier: 'premium',
    lines: report.lines,
    meta: report.meta,
  });
}
