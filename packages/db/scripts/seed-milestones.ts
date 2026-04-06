/**
 * Seed milestone nudge rules (idempotent upsert by key)
 * Call from seed-world.ts or run: pnpm exec tsx packages/db/scripts/seed-milestones.ts
 */
import { PrismaClient } from '@parel/db/client';

const prisma = new PrismaClient();

const MILESTONE_RULES = [
  {
    key: 'flow_every_10',
    titleTemplate: 'Nice. {count} answered.',
    bodyTemplate: 'Keep going.',
    triggerType: 'ANSWER_COUNT' as const,
    scope: 'FLOW' as const,
    scopeRefId: null,
    triggerConfig: { everyN: 10 },
    uiVariant: 'nudge',
    priority: 0,
    cooldownSeconds: 120,
    maxPerDay: 5,
    maxTotal: null,
  },
  {
    key: 'level_up_global',
    titleTemplate: 'You reached Level {level}.',
    bodyTemplate: 'New stuff unlocks over time.',
    triggerType: 'LEVEL_UP' as const,
    scope: 'GLOBAL' as const,
    scopeRefId: null,
    triggerConfig: {},
    uiVariant: 'levelup',
    priority: 10,
    cooldownSeconds: 0,
    maxPerDay: null,
    maxTotal: null,
  },
  {
    key: 'flow_every_25_teaser',
    titleTemplate: "You're just getting started.",
    bodyTemplate: 'Come back tomorrow for fresh comparisons.',
    triggerType: 'ANSWER_COUNT' as const,
    scope: 'GLOBAL' as const,
    scopeRefId: null,
    triggerConfig: { everyN: 25 },
    uiVariant: 'nudge',
    priority: 0,
    cooldownSeconds: 0,
    maxPerDay: 2,
    maxTotal: null,
  },
];

export async function seedMilestoneRules(): Promise<number> {
  for (const r of MILESTONE_RULES) {
    await prisma.milestoneRule.upsert({
      where: { key: r.key },
      create: {
        key: r.key,
        isActive: true,
        titleTemplate: r.titleTemplate,
        bodyTemplate: r.bodyTemplate,
        triggerType: r.triggerType,
        scope: r.scope,
        scopeRefId: r.scopeRefId,
        triggerConfig: r.triggerConfig,
        uiVariant: r.uiVariant,
        priority: r.priority,
        cooldownSeconds: r.cooldownSeconds,
        maxPerDay: r.maxPerDay,
        maxTotal: r.maxTotal,
      },
      update: {
        titleTemplate: r.titleTemplate,
        bodyTemplate: r.bodyTemplate,
        triggerConfig: r.triggerConfig,
        cooldownSeconds: r.cooldownSeconds,
        maxPerDay: r.maxPerDay,
        maxTotal: r.maxTotal,
      },
    });
  }
  return MILESTONE_RULES.length;
}

async function main() {
  const count = await seedMilestoneRules();
  console.log(`seed-milestones: ${count} rules`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
