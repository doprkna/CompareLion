import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, notFoundError } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest, ctx: { params: { id: string } }) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!user) return unauthorizedError('Unauthorized');

  const userTest = await prisma.userSynchTest.findUnique({
    where: { id: ctx.params.id },
    include: {
      test: { select: { title: true, description: true } },
      userA_ref: { select: { id: true, username: true, name: true, avatarUrl: true } },
      userB_ref: { select: { id: true, username: true, name: true, avatarUrl: true } },
    },
  });

  if (!userTest) return notFoundError('Test not found');
  if (userTest.userA !== user.id && userTest.userB !== user.id) {
    return unauthorizedError('Access denied');
  }

  if (userTest.status !== 'completed') {
    return NextResponse.json({
      success: true,
      status: userTest.status,
      test: { title: userTest.test?.title || 'Test', description: userTest.test?.description || '' }, // sanity-fix
    });
  }

  function getResultText(score: number): string {
    if (score >= 80) return 'Soul-sync achieved. You two might start a cult.';
    if (score >= 50) return 'Respectful disagreement level.';
    return 'Opposites attract... or destroy universes.';
  }

  return NextResponse.json({
    success: true,
    result: {
      id: userTest.id,
      score: userTest.compatibilityScore,
      resultText: userTest.compatibilityScore ? getResultText(userTest.compatibilityScore) : null,
      shared: userTest.shared,
      userA: userTest.userA_ref,
      userB: userTest.userB_ref,
      test: userTest.test,
      createdAt: userTest.createdAt,
    },
  });
});

