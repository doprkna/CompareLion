/**
 * Fast Question Report - free vs premium tiers
 * v1: deterministic placeholders + basic counts; extendable for full analytics
 */
import { prisma } from '@/lib/db';

export type ReportTier = 'free' | 'premiumLocked' | 'premium';

export interface FastReportResult {
  tier: ReportTier;
  lines: string[];
  cta?: { label: string; href: string };
  meta?: { isBeta?: boolean };
}

export interface ReportInput {
  userId: string;
  questionId: string;
  region?: string;
}

const KIND_FAST_REPORT = 'FAST_REPORT_QUESTION';

export async function generateFastReport(
  input: ReportInput,
  options: { premiumEnabled?: boolean; userDiamonds?: number; hasUnlock?: boolean }
): Promise<FastReportResult> {
  const { userId, questionId, region = 'global' } = input;
  const { premiumEnabled = false, userDiamonds = 0, hasUnlock = false } = options;

  const question = await prisma.flowQuestion.findUnique({
    where: { id: questionId },
    include: { options: { orderBy: { order: 'asc' } } },
  });
  const myResponse = await prisma.userResponse.findUnique({
    where: { userId_questionId: { userId, questionId } },
  });

  const lines: string[] = [];
  const meta: { isBeta?: boolean } = {};

  if (myResponse) {
    const value = formatResponseValue(myResponse, question?.type);
    lines.push(`Your answer: ${value}`);
    lines.push(`Answered on: ${myResponse.createdAt.toLocaleDateString()}`);
  } else {
    lines.push("You haven't answered this yet.");
    lines.push('Answer it now to compare.');
  }

  let tier: ReportTier = 'free';

  if (premiumEnabled) {
    if (hasUnlock || userDiamonds > 0) {
      tier = 'premium';
      const premiumLines = await getPremiumLines(userId, questionId, region, question?.type, myResponse);
      lines.push(...premiumLines);
      meta.isBeta = true;
    } else {
      tier = 'premiumLocked';
      if (myResponse) {
        lines.push('Want comparisons? Unlock Fast Report.');
      }
      return {
        tier,
        lines,
        cta: { label: 'Unlock with diamonds', href: '/diamondshop' },
        meta,
      };
    }
  } else if (myResponse) {
    lines.push('Want comparisons? Unlock Fast Report.');
  }

  return { tier, lines, meta };
}

function formatResponseValue(
  r: { optionIds: string[]; numericVal: number | null; textVal: string | null; skipped: boolean },
  type?: string
): string {
  if (r.skipped) return '(skipped)';
  if (r.textVal) return r.textVal;
  if (typeof r.numericVal === 'number') return String(r.numericVal);
  if (r.optionIds?.length) return r.optionIds.join(', ');
  return '(no value)';
}

async function getPremiumLines(
  userId: string,
  questionId: string,
  region: string,
  questionType?: string,
  myResponse?: { optionIds: string[]; numericVal: number | null } | null
): Promise<string[]> {
  const lines: string[] = [];

  try {
    const friendIds = await getFriendIds(userId);
    let friendsSimilar = 0;
    if (friendIds.length > 0 && myResponse) {
      if (myResponse.optionIds?.length) {
        friendsSimilar = await prisma.userResponse.count({
          where: {
            questionId,
            userId: { in: friendIds },
            optionIds: { equals: myResponse.optionIds },
          },
        });
      } else if (typeof myResponse.numericVal === 'number') {
        const bucket = getNumericBucket(myResponse.numericVal);
        const friendsInBucket = await prisma.userResponse.count({
          where: {
            questionId,
            userId: { in: friendIds },
            numericVal: { gte: bucket.lo, lte: bucket.hi },
          },
        });
        friendsSimilar = friendsInBucket;
      }
    }
    lines.push(
      friendsSimilar > 0
        ? `${friendsSimilar} friend${friendsSimilar !== 1 ? 's' : ''} answered similarly.`
        : 'No friend data yet.'
    );
  } catch {
    lines.push('No friend data yet.');
  }

  try {
    const total = await prisma.userResponse.count({
      where: { questionId, skipped: false },
    });
    if (total > 0 && myResponse && typeof myResponse.numericVal === 'number') {
      const below = await prisma.userResponse.count({
        where: {
          questionId,
          skipped: false,
          numericVal: { lt: myResponse.numericVal },
        },
      });
      const pct = Math.round((below / total) * 100);
      lines.push(`You're in top ~${100 - pct}% (beta).`);
    } else if (questionType === 'SINGLE_CHOICE' && myResponse?.optionIds?.length) {
      lines.push('Percentile coming soon.');
    } else {
      lines.push('Percentile coming soon.');
    }
  } catch {
    lines.push('Percentile coming soon.');
  }

  if (region && region !== 'global') {
    lines.push(`In ${region}: you're above average.`);
  } else {
    lines.push('Regional stats coming soon.');
  }

  lines.push('VIP comparison: similar to Adventurer.');

  return lines;
}

async function getFriendIds(userId: string): Promise<string[]> {
  const [asUser, asFriend] = await Promise.all([
    prisma.friend.findMany({
      where: { userId, status: 'accepted' },
      select: { friendId: true },
    }),
    prisma.friend.findMany({
      where: { friendId: userId, status: 'accepted' },
      select: { userId: true },
    }),
  ]);
  const ids = new Set<string>([...asUser.map((f) => f.friendId), ...asFriend.map((f) => f.userId)]);
  return Array.from(ids);
}

function getNumericBucket(val: number): { lo: number; hi: number } {
  const range = Math.max(10, Math.abs(val) * 0.2);
  return { lo: val - range, hi: val + range };
}

export async function hasPremiumUnlock(userId: string, questionId: string): Promise<boolean> {
  const u = await prisma.premiumUnlock.findUnique({
    where: {
      userId_kind_refId: { userId, kind: KIND_FAST_REPORT, refId: questionId },
    },
  });
  return !!u;
}

export async function createPremiumUnlock(userId: string, questionId: string): Promise<void> {
  await prisma.premiumUnlock.upsert({
    where: {
      userId_kind_refId: { userId, kind: KIND_FAST_REPORT, refId: questionId },
    },
    create: { userId, kind: KIND_FAST_REPORT, refId: questionId },
    update: {},
  });
}
