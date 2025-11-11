/**
 * Mount Trials Logic
 * v0.34.4 - Trial counter system, rewards, and daily reset
 */

import { prisma } from '@/lib/db';
import { MountTrial, UserMountTrial, MountTrialWithProgress, MountTrialReward } from './types';

/**
 * Get all active trials for a specific mount
 */
export async function getMountTrials(mountId: string): Promise<MountTrial[]> {
  const trials = await prisma.$queryRaw<any[]>`
    SELECT * FROM mount_trials
    WHERE "mountId" = ${mountId}
    AND "isActive" = TRUE
    AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
    ORDER BY "createdAt" DESC
  `;

  return trials.map((trial) => ({
    ...trial,
    createdAt: trial.createdAt.toISOString(),
    updatedAt: trial.updatedAt.toISOString(),
    expiresAt: trial.expiresAt ? trial.expiresAt.toISOString() : null,
  }));
}

/**
 * Get all available trials for a user (with progress)
 */
export async function getUserAvailableTrials(userId: string): Promise<MountTrialWithProgress[]> {
  const trials = await prisma.$queryRaw<any[]>`
    SELECT 
      mt.*,
      umt.id as "userTrialId",
      umt.progress as "userProgress",
      umt.completed as "userCompleted",
      umt."lastAttemptAt" as "userLastAttemptAt",
      umt."completedAt" as "userCompletedAt"
    FROM mount_trials mt
    LEFT JOIN user_mount_trials umt ON mt.id = umt."trialId" AND umt."userId" = ${userId}
    WHERE mt."isActive" = TRUE
    AND (mt."expiresAt" IS NULL OR mt."expiresAt" > NOW())
    ORDER BY mt."createdAt" DESC
  `;

  return trials.map((trial) => {
    const isExpired = trial.expiresAt ? new Date(trial.expiresAt) < new Date() : false;
    const attemptsUsed = trial.userCompleted ? 1 : 0;
    const attemptsRemaining = trial.maxAttempts ? trial.maxAttempts - attemptsUsed : null;

    return {
      id: trial.id,
      mountId: trial.mountId,
      name: trial.name,
      description: trial.description,
      rewardType: trial.rewardType,
      rewardValue: trial.rewardValue,
      maxAttempts: trial.maxAttempts,
      expiresAt: trial.expiresAt ? trial.expiresAt.toISOString() : null,
      isActive: trial.isActive,
      createdAt: trial.createdAt.toISOString(),
      updatedAt: trial.updatedAt.toISOString(),
      userProgress: trial.userTrialId
        ? {
            id: trial.userTrialId,
            userId,
            trialId: trial.id,
            progress: trial.userProgress,
            completed: trial.userCompleted,
            lastAttemptAt: trial.userLastAttemptAt ? trial.userLastAttemptAt.toISOString() : null,
            completedAt: trial.userCompletedAt ? trial.userCompletedAt.toISOString() : null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        : undefined,
      isExpired,
      attemptsRemaining,
    };
  });
}

/**
 * Update user trial progress
 */
export async function updateTrialProgress(
  userId: string,
  trialId: string,
  incrementBy = 1
): Promise<UserMountTrial> {
  // Get trial to check goal
  const trial = await prisma.$queryRaw<any[]>`
    SELECT * FROM mount_trials WHERE id = ${trialId} LIMIT 1
  `;

  if (!trial || trial.length === 0) {
    throw new Error('Trial not found');
  }

  // Get current progress or create new
  const existing = await prisma.$queryRaw<any[]>`
    SELECT * FROM user_mount_trials 
    WHERE "userId" = ${userId} AND "trialId" = ${trialId}
    LIMIT 1
  `;

  const now = new Date();
  let result: any;

  if (existing && existing.length > 0) {
    const newProgress = existing[0].progress + incrementBy;
    
    // Update existing
    result = await prisma.$queryRaw<any[]>`
      UPDATE user_mount_trials
      SET progress = ${newProgress},
          "lastAttemptAt" = ${now},
          "updatedAt" = ${now}
      WHERE "userId" = ${userId} AND "trialId" = ${trialId}
      RETURNING *
    `;
  } else {
    // Create new
    const id = `umt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    result = await prisma.$queryRaw<any[]>`
      INSERT INTO user_mount_trials (id, "userId", "trialId", progress, completed, "lastAttemptAt", "createdAt", "updatedAt")
      VALUES (${id}, ${userId}, ${trialId}, ${incrementBy}, FALSE, ${now}, ${now}, ${now})
      RETURNING *
    `;
  }

  const updated = result[0];

  return {
    id: updated.id,
    userId: updated.userId,
    trialId: updated.trialId,
    progress: updated.progress,
    completed: updated.completed,
    lastAttemptAt: updated.lastAttemptAt ? updated.lastAttemptAt.toISOString() : null,
    completedAt: updated.completedAt ? updated.completedAt.toISOString() : null,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
  };
}

/**
 * Complete a trial and apply rewards
 */
export async function completeTrial(userId: string, trialId: string): Promise<MountTrialReward> {
  // Get trial
  const trial = await prisma.$queryRaw<any[]>`
    SELECT * FROM mount_trials WHERE id = ${trialId} LIMIT 1
  `;

  if (!trial || trial.length === 0) {
    throw new Error('Trial not found');
  }

  const trialData = trial[0];

  // Mark as completed
  const now = new Date();
  await prisma.$queryRaw`
    UPDATE user_mount_trials
    SET completed = TRUE,
        "completedAt" = ${now},
        "updatedAt" = ${now}
    WHERE "userId" = ${userId} AND "trialId" = ${trialId}
  `;

  // Apply reward
  const reward: MountTrialReward = {
    type: trialData.rewardType,
    value: trialData.rewardValue,
    description: `Completed: ${trialData.name}`,
  };

  await applyTrialReward(userId, reward);

  return reward;
}

/**
 * Apply trial reward to user
 */
export async function applyTrialReward(userId: string, reward: MountTrialReward): Promise<void> {
  switch (reward.type) {
    case 'xp':
      // Add XP to user
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: {
            increment: reward.value,
          },
        },
      });
      break;

    case 'gold':
      // Add gold to wallet (assuming gold currency exists)
      await prisma.$executeRaw`
        INSERT INTO wallets ("userId", "currencyKey", balance, "updatedAt")
        VALUES (${userId}, 'gold', ${reward.value}, NOW())
        ON CONFLICT ("userId", "currencyKey")
        DO UPDATE SET balance = wallets.balance + ${reward.value}, "updatedAt" = NOW()
      `;
      break;

    case 'karma':
      // Add karma to user
      await prisma.user.update({
        where: { id: userId },
        data: {
          karma: {
            increment: reward.value,
          },
        },
      });
      break;

    case 'speed':
    case 'badge':
      // These are cosmetic/stat buffs - store in user metadata or separate table
      // For now, just log (implement based on your mount system)
      console.log(`Applied ${reward.type} reward to user ${userId}: +${reward.value}`);
      break;
  }
}

/**
 * Reset daily trials (call via cron at UTC 00:00)
 */
export async function resetDailyTrials(): Promise<void> {
  // Reset progress for non-completed daily trials
  // This is a simple implementation - you may want more sophisticated logic
  await prisma.$executeRaw`
    UPDATE user_mount_trials
    SET progress = 0,
        "lastAttemptAt" = NULL,
        "updatedAt" = NOW()
    WHERE completed = FALSE
    AND "lastAttemptAt" < DATE_TRUNC('day', NOW())
  `;

  console.log('✅ Daily mount trials reset');
}

/**
 * Get trial completion stats (for admin metrics)
 */
export async function getTrialStats(): Promise<{
  totalTrials: number;
  activeTrials: number;
  totalCompletions: number;
  completionRate: number;
}> {
  const trials = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*) as count FROM mount_trials
  `;

  const activeTrials = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*) as count FROM mount_trials
    WHERE "isActive" = TRUE
    AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
  `;

  const completions = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*) as count FROM user_mount_trials WHERE completed = TRUE
  `;

  const attempts = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*) as count FROM user_mount_trials
  `;

  const totalTrials = parseInt(trials[0]?.count || '0');
  const activeTrialsCount = parseInt(activeTrials[0]?.count || '0');
  const totalCompletions = parseInt(completions[0]?.count || '0');
  const totalAttempts = parseInt(attempts[0]?.count || '0');
  const completionRate = totalAttempts > 0 ? (totalCompletions / totalAttempts) * 100 : 0;

  return {
    totalTrials,
    activeTrials: activeTrialsCount,
    totalCompletions,
    completionRate: Math.round(completionRate * 100) / 100,
  };
}




