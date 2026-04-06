/**
 * ensureAlphaFeedbackPoll - Idempotent seed for "Alpha Feedback – v0.1" poll pack.
 * Loads from content pack alpha-feedback-v01.
 */
import type { PrismaClient } from '@parel/db/client';
import { ALPHA_FEEDBACK_PACK_KEY } from '../src/feedbackConstants';
import { loadContentPack, loadPollsFromPack } from '../content/loader';

function getAlphaFeedbackPolls(): Array<{ title: string; question: string; options: string[]; allowFreetext: boolean }> {
  const { manifest, records } = loadContentPack(ALPHA_FEEDBACK_PACK_KEY, loadPollsFromPack);
  const title = manifest.title ?? 'Alpha Feedback – v0.1';
  return records.map((r) => ({ title, question: r.question, options: r.options, allowFreetext: r.allowFreetext }));
}

const ALPHA_CONTRIBUTOR_BADGE = {
  key: 'ALPHA_CONTRIBUTOR',
  name: 'Alpha Contributor',
  description: 'Completed Alpha Feedback – v0.1 and helped shape Parel',
  icon: '🎯',
  rarity: 'rare' as const,
  unlockType: 'special' as const,
  requirementValue: 'alpha_feedback_v01',
};

export async function ensureAlphaFeedbackPoll(prisma: PrismaClient): Promise<{ created: string[]; skipped: string[] }> {
  const created: string[] = [];
  const skipped: string[] = [];

  // Ensure ALPHA_CONTRIBUTOR badge exists (for reward grant)
  const badgeExists = await prisma.badge.findUnique({ where: { key: ALPHA_CONTRIBUTOR_BADGE.key } });
  if (!badgeExists) {
    await prisma.badge.create({
      data: {
        key: ALPHA_CONTRIBUTOR_BADGE.key,
        name: ALPHA_CONTRIBUTOR_BADGE.name,
        description: ALPHA_CONTRIBUTOR_BADGE.description,
        icon: ALPHA_CONTRIBUTOR_BADGE.icon,
        rarity: ALPHA_CONTRIBUTOR_BADGE.rarity,
        unlockType: ALPHA_CONTRIBUTOR_BADGE.unlockType,
        requirementValue: ALPHA_CONTRIBUTOR_BADGE.requirementValue,
        isActive: true,
        slug: ALPHA_CONTRIBUTOR_BADGE.key,
      },
    });
    created.push('Badge(ALPHA_CONTRIBUTOR)');
  }

  const POLLS = getAlphaFeedbackPolls();
  const existing = await prisma.publicPoll.count({ where: { packKey: ALPHA_FEEDBACK_PACK_KEY } });
  if (existing >= POLLS.length) {
    skipped.push('AlphaFeedbackPoll(pack)');
    return { created, skipped };
  }

  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } });
  const anyUser = await prisma.user.findFirst({ select: { id: true } });
  const creatorId = admin?.id ?? anyUser?.id;
  if (!creatorId) {
    skipped.push('AlphaFeedbackPoll(no creator)');
    return { created, skipped };
  }

  for (let i = 0; i < POLLS.length; i++) {
    const p = POLLS[i];
    const existingPoll = await prisma.publicPoll.findFirst({
      where: { packKey: ALPHA_FEEDBACK_PACK_KEY, question: p.question },
    });
    if (existingPoll) {
      skipped.push(`AlphaFeedbackPoll(q${i + 1})`);
      continue;
    }
    await prisma.publicPoll.create({
      data: {
        title: p.title,
        question: p.question,
        options: p.options,
        packKey: ALPHA_FEEDBACK_PACK_KEY,
        region: 'GLOBAL',
        visibility: 'public',
        creatorId,
        allowFreetext: p.allowFreetext,
        premiumCost: 0,
        rewardXP: 25,
      },
    });
    created.push(`AlphaFeedbackPoll(q${i + 1})`);
  }
  return { created, skipped };
}
