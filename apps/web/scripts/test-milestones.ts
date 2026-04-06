/**
 * Minimal milestone evaluation tests
 * Run: pnpm exec tsx apps/web/scripts/test-milestones.ts
 * Requires: DATABASE_URL, seeded milestone rules (pnpm db:seed:milestones), at least one user in DB
 */
import { prisma } from '../lib/db';
import { evaluateMilestoneForEvent } from '../lib/milestones/milestoneService';

async function run() {
  const user = await prisma.user.findFirst({ select: { id: true } });
  if (!user) {
    console.log('SKIP: No user in DB. Seed demo user first (pnpm db:seed:demo).');
    process.exit(0);
    return;
  }

  const base = {
    userId: user.id,
    flowId: null,
    flowSessionId: null,
    xpBefore: 0,
    now: new Date(),
  };
  let pass = 0;
  let fail = 0;

  // 9 -> 10: ANSWER_COUNT everyN=10 should fire (flow_every_10 or flow_every_25_teaser)
  const at10 = await evaluateMilestoneForEvent({
    ...base,
    type: 'FLOW_ANSWERED',
    totalAnswersInFlow: 10,
    totalAnswersGlobal: 10,
    xpAfter: 100,
    levelAfter: 2,
  });
  if (at10) {
    console.log('PASS: count 10 → milestone fired:', at10.key);
    pass++;
  } else {
    console.log('FAIL: count 10 should fire milestone (no rules seeded?)');
    fail++;
  }

  // 11: should NOT fire (11 % 10 !== 0)
  const at11 = await evaluateMilestoneForEvent({
    ...base,
    type: 'FLOW_ANSWERED',
    totalAnswersInFlow: 11,
    totalAnswersGlobal: 11,
    xpAfter: 110,
    levelAfter: 2,
  });
  if (!at11) {
    console.log('PASS: count 11 → no milestone');
    pass++;
  } else {
    console.log('FAIL: count 11 should NOT fire:', at11.key);
    fail++;
  }

  // 19 -> 20: should fire (everyN=10)
  const at20 = await evaluateMilestoneForEvent({
    ...base,
    type: 'FLOW_ANSWERED',
    totalAnswersInFlow: 20,
    totalAnswersGlobal: 20,
    xpAfter: 200,
    levelAfter: 2,
  });
  if (at20) {
    console.log('PASS: count 20 → milestone fired:', at20.key);
    pass++;
  } else {
    console.log('FAIL: count 20 should fire (may be rate-limited by maxPerDay/cooldown)');
    fail++;
  }

  // Level up: xpBefore < level2, xpAfter >= level2
  const lvlUp = await evaluateMilestoneForEvent({
    ...base,
    type: 'FLOW_ANSWERED',
    totalAnswersInFlow: 5,
    totalAnswersGlobal: 5,
    xpBefore: 40,
    xpAfter: 51, // crosses level 2 (~50)
    levelBefore: 1,
    levelAfter: 2,
  });
  if (lvlUp) {
    console.log('PASS: level up → milestone fired:', lvlUp.key);
    pass++;
  } else {
    console.log('FAIL or SKIP: level up (may be rate-limited)');
    fail++;
  }

  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
