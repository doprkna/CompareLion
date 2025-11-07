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

  // Find today's active fork (random fallback if none assigned)
  let fork = await prisma.dailyFork.findFirst({
    where: {
      isActive: true,
      createdAt: { gte: today },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Fallback: random active fork
  if (!fork) {
    const activeForks = await prisma.dailyFork.findMany({
      where: { isActive: true },
    });
    if (activeForks.length > 0) {
      const randomIndex = Math.floor(Math.random() * activeForks.length);
      fork = activeForks[randomIndex];
    }
  }

  if (!fork) {
    return NextResponse.json({
      success: true,
      fork: null,
      message: 'No forks available',
    });
  }

  // Check if user already made choice today
  const userChoice = await prisma.userDailyFork.findUnique({
    where: {
      userId_forkId: {
        userId: user.id,
        forkId: fork.id,
      },
    },
  });

  return NextResponse.json({
    success: true,
    fork: {
      id: fork.id,
      key: fork.key,
      title: fork.title,
      description: fork.description,
      optionA: fork.optionA,
      optionB: fork.optionB,
      rarity: fork.rarity,
      createdAt: fork.createdAt,
    },
    userChoice: userChoice ? {
      choice: userChoice.choice,
      resultSummary: userChoice.resultSummary,
      createdAt: userChoice.createdAt,
    } : null,
  });
});

