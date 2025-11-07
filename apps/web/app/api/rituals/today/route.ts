import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  // Get today's date (start of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find today's active ritual (random fallback if none assigned)
  // For MVP, we'll just return a random active ritual
  const activeRituals = await prisma.ritual.findMany({
    where: { isActive: true },
  });

  if (activeRituals.length === 0) {
    return NextResponse.json({
      success: true,
      ritual: null,
      message: 'No rituals available',
    });
  }

  // Pick random active ritual (could be improved with daily rotation logic)
  const randomIndex = Math.floor(Math.random() * activeRituals.length);
  const ritual = activeRituals[randomIndex];

  // Get user's ritual progress
  const userRitual = await prisma.userRitual.findUnique({
    where: {
      userId_ritualId: {
        userId: user.id,
        ritualId: ritual.id,
      },
    },
  });

  // Check if already completed today
  let completedToday = false;
  if (userRitual?.lastCompleted) {
    const lastCompleted = new Date(userRitual.lastCompleted);
    const todayStart = new Date(today);
    completedToday = lastCompleted >= todayStart;
  }

  return NextResponse.json({
    success: true,
    ritual: {
      id: ritual.id,
      key: ritual.key,
      title: ritual.title,
      description: ritual.description,
      rewardXP: ritual.rewardXP,
      rewardKarma: ritual.rewardKarma,
      timeOfDay: ritual.timeOfDay,
    },
    userProgress: userRitual
      ? {
          streakCount: userRitual.streakCount,
          totalCompleted: userRitual.totalCompleted,
          lastCompleted: userRitual.lastCompleted,
          completedToday,
        }
      : {
          streakCount: 0,
          totalCompleted: 0,
          lastCompleted: null,
          completedToday: false,
        },
  });
});

