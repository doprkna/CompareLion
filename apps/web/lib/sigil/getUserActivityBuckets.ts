/**
 * getUserActivityBuckets - Activity intensity for last 56 days (0-4).
 * Real data from user_responses; fallback to deterministic placeholder.
 * No DB migrations.
 */
import { prisma } from '@/lib/db';

export interface ActivityBucketsResult {
  buckets: number[];
  placeholder: boolean;
}

const BUCKETS_LEN = 56;
const NUM_LEVELS = 5; // 0..4

function simpleHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h >>> 0;
}

export async function getUserActivityBuckets(userId: string): Promise<ActivityBucketsResult> {
  const fiftySixDaysAgo = new Date();
  fiftySixDaysAgo.setDate(fiftySixDaysAgo.getDate() - BUCKETS_LEN);
  fiftySixDaysAgo.setHours(0, 0, 0, 0);

  const responses = await prisma.userResponse.findMany({
    where: { userId, createdAt: { gte: fiftySixDaysAgo } },
    select: { createdAt: true },
  });

  const countsByDay = new Map<string, number>();
  for (const r of responses) {
    const d = r.createdAt.toISOString().slice(0, 10);
    countsByDay.set(d, (countsByDay.get(d) ?? 0) + 1);
  }

  const buckets: number[] = [];
  let hasAny = false;
  for (let i = 0; i < BUCKETS_LEN; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (BUCKETS_LEN - 1 - i));
    const key = d.toISOString().slice(0, 10);
    const count = countsByDay.get(key) ?? 0;
    if (count > 0) hasAny = true;
    let level = 0;
    if (count >= 11) level = 4;
    else if (count >= 6) level = 3;
    else if (count >= 3) level = 2;
    else if (count >= 1) level = 1;
    buckets.push(level);
  }

  if (hasAny) {
    return { buckets, placeholder: false };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true },
  });
  const seed = `${userId}|${user?.createdAt?.getTime() ?? 0}`;
  const h = simpleHash(seed);

  const placeholderBuckets: number[] = [];
  for (let i = 0; i < BUCKETS_LEN; i++) {
    const v = simpleHash(`${h}:${i}`) % 100;
    placeholderBuckets.push(v < 85 ? 0 : v < 92 ? 1 : v < 97 ? 2 : v < 99 ? 3 : 4);
  }
  return { buckets: placeholderBuckets, placeholder: true };
}
