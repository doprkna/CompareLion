import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, authError, notFoundError } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return authError();
  }

  // Get user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      level: true,
      xp: true,
      funds: true,
      diamonds: true,
      streakCount: true,
      lastAnsweredAt: true,
      questionsAnswered: true,
      createdAt: true,
    },
  });

  if (!user) {
    return notFoundError('User');
  }

  // Calculate additional stats
  const totalQuestions = await prisma.flowQuestion.count({
    where: { isActive: true },
  });

  const userResponses = await prisma.userResponse.count({
    where: { userId: user.id },
  });

  // Get user achievements
  const achievements = await prisma.userAchievement.findMany({
    where: { userId: user.id },
    include: {
      achievement: {
        select: {
          id: true,
          code: true,
          title: true,
          description: true,
          icon: true,
          xpReward: true,
        },
      },
    },
    orderBy: { earnedAt: 'desc' },
  });

  const responseData = {
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.avatarUrl,
        avatarUrl: user.avatarUrl,
        level: user.level || 1,
        xp: user.xp || 0,
        funds: user.funds || 0,
        diamonds: user.diamonds || 0,
        streakCount: user.streakCount || 0,
        lastAnsweredAt: user.lastAnsweredAt,
        questionsAnswered: user.questionsAnswered || 0,
        totalQuestions,
        userResponses,
        createdAt: user.createdAt,
        progress: 0, // Will be calculated on frontend
        achievements: achievements.map(ua => ({
          id: ua.achievement.id,
          code: ua.achievement.code,
          title: ua.achievement.title,
          description: ua.achievement.description,
          icon: ua.achievement.icon,
          xpReward: ua.achievement.xpReward,
          earnedAt: ua.earnedAt.toISOString(),
        })),
      },
    },
  };

  return NextResponse.json(responseData);
});