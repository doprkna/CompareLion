import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { safeAsync, successResponse } from "@/lib/api-handler";

export const GET = safeAsync(async (_req: NextRequest) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      xp: true,
      funds: true,
      createdAt: true,
    },
  });

    const messagesCount = await prisma.message.count();
    const flowQuestionsCount = await prisma.flowQuestion.count();
    const userResponsesCount = await prisma.userResponse.count();
    
    const avgXP = users.length 
      ? Math.round(users.reduce((a, b) => a + (b.xp || 0), 0) / users.length) 
      : 0;

    // XP distribution buckets
    const xpDistribution = [
      { range: "0–50", count: users.filter(u => (u.xp || 0) <= 50).length },
      { range: "51–100", count: users.filter(u => (u.xp || 0) > 50 && (u.xp || 0) <= 100).length },
      { range: "101–500", count: users.filter(u => (u.xp || 0) > 100 && (u.xp || 0) <= 500).length },
      { range: "501–1000", count: users.filter(u => (u.xp || 0) > 500 && (u.xp || 0) <= 1000).length },
      { range: "1000+", count: users.filter(u => (u.xp || 0) > 1000).length },
    ];

    // Top users by XP
    const topUsers = [...users]
      .sort((a, b) => (b.xp || 0) - (a.xp || 0))
      .slice(0, 10)
      .map((u, i) => ({ 
        rank: i + 1, 
        name: u.name || u.email.split('@')[0], 
        xp: u.xp || 0 
      }));

    // Activity over time (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentMessages = await prisma.message.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

  const recentResponses = await prisma.userResponse.count({
    where: { createdAt: { gte: sevenDaysAgo } },
  });

  return successResponse({
    stats: {
      usersCount: users.length,
      messagesCount,
      flowQuestionsCount,
      userResponsesCount,
      avgXP,
      recentMessages,
      recentResponses,
    },
    xpDistribution,
    topUsers,
  });
});













