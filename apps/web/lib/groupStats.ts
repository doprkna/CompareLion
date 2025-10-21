/**
 * Group Stats Aggregation Utility
 * 
 * Calculates collective totem statistics from members.
 */

import { prisma } from "@/lib/db";

export interface GroupStats {
  totalXp: number;
  avgKarma: number;
  avgPrestige: number;
  memberCount: number;
}

/**
 * Calculate aggregate stats for a group
 */
export async function calculateGroupStats(groupId: string): Promise<GroupStats> {
  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: {
      user: {
        select: {
          xp: true,
          karmaScore: true,
          prestigeScore: true,
        },
      },
    },
  });

  if (members.length === 0) {
    return {
      totalXp: 0,
      avgKarma: 0,
      avgPrestige: 0,
      memberCount: 0,
    };
  }

  const totalXp = members.reduce((sum, m) => sum + (m.user.xp || 0), 0);
  const totalKarma = members.reduce((sum, m) => sum + (m.user.karmaScore || 0), 0);
  const totalPrestige = members.reduce((sum, m) => sum + (m.user.prestigeScore || 0), 0);

  return {
    totalXp,
    avgKarma: Math.round(totalKarma / members.length),
    avgPrestige: Math.round(totalPrestige / members.length),
    memberCount: members.length,
  };
}

/**
 * Update stored group stats
 */
export async function updateGroupStats(groupId: string): Promise<void> {
  const stats = await calculateGroupStats(groupId);

  await prisma.group.update({
    where: { id: groupId },
    data: {
      totalXp: stats.totalXp,
      avgKarma: stats.avgKarma,
      avgPrestige: stats.avgPrestige,
    },
  });
}

/**
 * Get top groups by total XP
 */
export async function getTopGroups(limit: number = 10) {
  return await prisma.group.findMany({
    orderBy: { totalXp: "desc" },
    take: limit,
    include: {
      groupMembers: {
        select: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Log group activity
 */
export async function logGroupActivity(
  groupId: string,
  type: string,
  message: string,
  userId?: string,
  metadata?: any
) {
  await prisma.groupActivity.create({
    data: {
      groupId,
      userId,
      type,
      message,
      metadata,
    },
  });
}

/**
 * Award weekly bonus to top group
 * (Placeholder for cron job)
 */
export async function awardWeeklyBonus(): Promise<void> {
  // Reset all bonuses
  await prisma.group.updateMany({
    data: { weeklyBonus: false },
  });

  // Find top group
  const topGroup = await prisma.group.findFirst({
    orderBy: { totalXp: "desc" },
    include: {
      groupMembers: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!topGroup) return;

  // Mark as winner
  await prisma.group.update({
    where: { id: topGroup.id },
    data: { weeklyBonus: true },
  });

  // Award 10% XP bonus to all members
  const bonusPromises = topGroup.groupMembers.map((member) => {
    const bonus = Math.floor((member.user.xp || 0) * 0.1);
    return prisma.user.update({
      where: { id: member.userId },
      data: { xp: { increment: bonus } },
    });
  });

  await Promise.all(bonusPromises);

  // Log activity
  await logGroupActivity(
    topGroup.id,
    "weekly_bonus",
    `🏆 ${topGroup.name} won the weekly totem challenge! All members gained +10% XP.`
  );
}










