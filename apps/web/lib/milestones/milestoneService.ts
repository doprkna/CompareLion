/**
 * Milestone Nudge Service
 * Duolingo-style progress illusion - server-driven, persisted, rate-limited
 */

import { prisma } from '@/lib/db';
import { getLevelFromXP } from '@/lib/levelCurve';

export type MilestoneEvent =
  | {
      type: 'FLOW_ANSWERED';
      userId: string;
      flowId: string | null;
      flowSessionId?: string | null;
      totalAnswersInFlow: number;
      totalAnswersGlobal?: number;
      xpBefore: number;
      xpAfter: number;
      levelBefore?: number;
      levelAfter?: number;
      now: Date;
    };

export interface MilestonePayload {
  id: string;
  key: string;
  title: string;
  body: string;
  variant: string;
  autoDismissMs: number;
  meta?: Record<string, unknown>;
}

function resolveTemplate(
  template: string,
  ctx: Record<string, unknown>
): string {
  let out = template;
  for (const [k, v] of Object.entries(ctx)) {
    out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v ?? ''));
  }
  return out;
}

function computeLevel(xp: number): number {
  return getLevelFromXP(xp);
}

/**
 * Evaluate and optionally deliver a milestone for an event.
 * Returns payload if delivered, null otherwise.
 */
export async function evaluateMilestoneForEvent(
  event: MilestoneEvent
): Promise<MilestonePayload | null> {
  const levelBefore = event.levelBefore ?? computeLevel(event.xpBefore);
  const levelAfter = event.levelAfter ?? computeLevel(event.xpAfter);

  // Load active rules: GLOBAL + FLOW (matching flowId or scopeRefId null)
  const flowMatch = event.flowId
    ? [{ scopeRefId: event.flowId }, { scopeRefId: null }]
    : [{ scopeRefId: null }];
  const rules = await prisma.milestoneRule.findMany({
    where: {
      isActive: true,
      OR: [
        { scope: 'GLOBAL' },
        { scope: 'FLOW', OR: flowMatch },
      ],
    },
    orderBy: [{ priority: 'desc' }, { key: 'asc' }],
  });

  const now = event.now;
  let bestRule: (typeof rules)[0] | null = null;

  for (const rule of rules) {
    // Check trigger match
    const config = (rule.triggerConfig as Record<string, unknown>) || {};

    if (rule.triggerType === 'ANSWER_COUNT') {
      const everyN = Number(config.everyN);
      if (!everyN || everyN < 1) continue;
      const mod = event.totalAnswersInFlow % everyN;
      if (mod !== 0) continue;
    } else if (rule.triggerType === 'LEVEL_UP') {
      if (levelAfter <= levelBefore) continue;
    } else {
      continue;
    }

    // Rate limits
    const lastDelivery = await prisma.milestoneDelivery.findFirst({
      where: { userId: event.userId, ruleId: rule.id },
      orderBy: { deliveredAt: 'desc' },
    });
    if (lastDelivery && rule.cooldownSeconds > 0) {
      const elapsed = (now.getTime() - lastDelivery.deliveredAt.getTime()) / 1000;
      if (elapsed < rule.cooldownSeconds) continue;
    }

    if (rule.maxPerDay != null) {
      const dayStart = new Date(now);
      dayStart.setHours(0, 0, 0, 0);
      const todayCount = await prisma.milestoneDelivery.count({
        where: {
          userId: event.userId,
          ruleId: rule.id,
          deliveredAt: { gte: dayStart },
        },
      });
      if (todayCount >= rule.maxPerDay) continue;
    }

    if (rule.maxTotal != null) {
      const totalCount = await prisma.milestoneDelivery.count({
        where: { userId: event.userId, ruleId: rule.id },
      });
      if (totalCount >= rule.maxTotal) continue;
    }

    bestRule = rule;
    break;
  }

  if (!bestRule) return null;

  const config = (bestRule.triggerConfig as Record<string, unknown>) || {};
  const ctx: Record<string, unknown> = {
    count: event.totalAnswersInFlow,
    level: levelAfter,
    totalAnswersGlobal: event.totalAnswersGlobal ?? event.totalAnswersInFlow,
    ...config,
  };

  const title = resolveTemplate(bestRule.titleTemplate, ctx);
  const body = resolveTemplate(bestRule.bodyTemplate, ctx);

  await prisma.milestoneDelivery.create({
    data: {
      userId: event.userId,
      ruleId: bestRule.id,
      context: ctx,
      source: 'flow_answer',
      sessionId: event.flowSessionId ?? null,
    },
  });

  return {
    id: bestRule.id,
    key: bestRule.key,
    title,
    body,
    variant: bestRule.uiVariant ?? 'nudge',
    autoDismissMs: 2500,
    meta: process.env.NODE_ENV === 'development' ? ctx : undefined,
  };
}
