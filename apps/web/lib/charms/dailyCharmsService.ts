/**
 * Daily Charms Service (Task System v1)
 * Ensures user has today's charms, records progress, grants XP on completion.
 */

import { prisma } from '@/lib/db';
import { addXP } from '@/lib/services/progressionService';

const CHARM_TARGETS: Record<string, number> = {
  answer_3: 3,
  view_leaderboard: 1,
  send_message: 1,
};

function getTodayUTC(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export async function ensureCharmsForToday(userId: string): Promise<void> {
  const today = getTodayUTC();

  const existing = await prisma.userDailyCharm.findFirst({
    where: { userId, date: today },
    select: { id: true },
  });
  if (existing) return;

  const charms = await prisma.dailyCharm.findMany({
    where: { isActive: true },
    select: { id: true, key: true },
  });

  for (const charm of charms) {
    const target = CHARM_TARGETS[charm.key] ?? 1;
    await prisma.userDailyCharm.upsert({
      where: {
        userId_charmId_date: { userId, charmId: charm.id, date: today },
      },
      create: {
        userId,
        charmId: charm.id,
        date: today,
        target,
      },
      update: {},
    });
  }
}

export async function recordCharmProgress(userId: string, key: string): Promise<{
  progress: number;
  target: number;
  completed: boolean;
  xpGranted?: number;
}> {
  const today = getTodayUTC();

  const charm = await prisma.dailyCharm.findFirst({
    where: { key, isActive: true },
    select: { id: true, xpReward: true },
  });
  if (!charm) {
    return { progress: 0, target: 1, completed: false };
  }

  await ensureCharmsForToday(userId);

  const entry = await prisma.userDailyCharm.findUnique({
    where: { userId_charmId_date: { userId, charmId: charm.id, date: today } },
    select: { id: true, progress: true, target: true, completed: true },
  });

  if (!entry || entry.completed) {
    return {
      progress: entry?.progress ?? 0,
      target: entry?.target ?? 1,
      completed: entry?.completed ?? false,
    };
  }

  const newProgress = Math.min(entry.progress + 1, entry.target);
  const nowCompleted = newProgress >= entry.target;

  await prisma.userDailyCharm.update({
    where: { id: entry.id },
    data: {
      progress: newProgress,
      completed: nowCompleted,
      completedAt: nowCompleted ? new Date() : undefined,
    },
  });

  let xpGranted: number | undefined;
  if (nowCompleted && charm.xpReward > 0) {
    await addXP(userId, charm.xpReward, 'daily_charm');
    xpGranted = charm.xpReward;
  }

  return {
    progress: newProgress,
    target: entry.target,
    completed: nowCompleted,
    xpGranted,
  };
}

export async function getCharmsForToday(userId: string): Promise<{
  date: Date;
  items: Array<{
    key: string;
    title: string;
    progress: number;
    target: number;
    completed: boolean;
    xpReward: number;
  }>;
  total: number;
  completedCount: number;
}> {
  const today = getTodayUTC();
  await ensureCharmsForToday(userId);

  const entries = await prisma.userDailyCharm.findMany({
    where: { userId, date: today },
    include: { charm: true },
    orderBy: { charm: { key: 'asc' } },
  });

  const items = entries.map((e) => ({
    key: e.charm.key,
    title: e.charm.title,
    progress: e.progress,
    target: e.target,
    completed: e.completed,
    xpReward: e.charm.xpReward,
  }));

  return {
    date: today,
    items,
    total: items.length,
    completedCount: items.filter((i) => i.completed).length,
  };
}
