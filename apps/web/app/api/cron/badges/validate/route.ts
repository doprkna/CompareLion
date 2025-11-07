import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { safeAsync, unauthorizedError, successResponse } from "@/lib/api-handler";

/**
 * POST /api/cron/badges/validate
 * Auto-checks for new badge unlocks based on thresholds
 * Checks XP milestones, level ups, event completions, etc.
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const token = req.headers.get("x-cron-token");
  if (process.env.CRON_TOKEN && token !== process.env.CRON_TOKEN) {
    return unauthorizedError("Invalid token");
  }

  const now = new Date();
  let unlocksProcessed = 0;
  let unlocksGranted = 0;

  // Get all active badges that can be auto-unlocked
  const autoUnlockBadges = await prisma.badge.findMany({
    where: {
      isActive: true,
      unlockType: {
        in: ["level", "event"],
      },
    },
  });

  // Get all users (or a batch for performance)
  // For MVP, process users who logged in recently or are active
  const activeUsers = await prisma.user.findMany({
    where: {
      OR: [
        { lastActiveAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }, // Active in last 7 days
        { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, // Created in last 30 days
      ],
    },
    select: {
      id: true,
      xp: true,
      level: true,
    },
    take: 1000, // Limit batch size
  });

  for (const badge of autoUnlockBadges) {
    if (badge.unlockType === "level") {
      // Check level-based badges
      const requiredLevel = badge.requirementValue ? parseInt(badge.requirementValue, 10) : null;
      if (requiredLevel) {
        for (const user of activeUsers) {
          unlocksProcessed++;

          // Check if user already has this badge
          const existing = await prisma.userBadge.findUnique({
            where: {
              userId_badgeId: {
                userId: user.id,
                badgeId: badge.id,
              },
            },
          });

          if (existing) continue;

          // Check if user meets level requirement
          if (user.level >= requiredLevel) {
            // Unlock badge
            await prisma.userBadge.create({
              data: {
                userId: user.id,
                badgeId: badge.id,
                unlockedAt: now,
                isClaimed: false,
              },
            });
            unlocksGranted++;
          }
        }
      }
    } else if (badge.unlockType === "event") {
      // Future: Check event completions
      // For now, skip
    }
  }

  // Throttle: Only process a subset of users per run to avoid spam
  // This is a simple implementation - in production, use a queue system

  return successResponse({
    success: true,
    processed: unlocksProcessed,
    granted: unlocksGranted,
    badgesChecked: autoUnlockBadges.length,
    usersChecked: activeUsers.length,
    message: "Badge validation completed",
  });
});

