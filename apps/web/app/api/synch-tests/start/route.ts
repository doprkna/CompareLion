import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const StartSchema = z.object({
  testId: z.string().min(1),
  targetUserId: z.string().min(1).optional(),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = StartSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message || 'Invalid payload');
  }

  const test = await prisma.synchTest.findUnique({ where: { id: parsed.data.testId } });
  if (!test || !test.isActive) return notFoundError('Test not found or inactive');

  // Check for existing active test with same pair
  if (parsed.data.targetUserId) {
    const existing = await prisma.userSynchTest.findFirst({
      where: {
        testId: test.id,
        status: 'pending',
        OR: [
          { userA: user.id, userB: parsed.data.targetUserId },
          { userA: parsed.data.targetUserId, userB: user.id },
        ],
      },
    });
    if (existing) {
      return validationError('Active test already exists with this user');
    }

    const target = await prisma.user.findUnique({ where: { id: parsed.data.targetUserId }, select: { id: true } });
    if (!target) return notFoundError('Target user not found');
    if (target.id === user.id) return validationError('Cannot test with yourself');

    // Invite mode: create test with specific target
    const userTest = await prisma.userSynchTest.create({
      data: {
        testId: test.id,
        userA: user.id,
        userB: parsed.data.targetUserId,
        answersA: [],
        answersB: [],
        status: 'pending',
      },
      include: { test: { select: { title: true, questions: true } } },
    });

    return NextResponse.json({ success: true, test: userTest }, { status: 201 });
  }

  // Random mode: find another queued user or queue current user
  // TODO: Implement random pairing with region/archetype matching
  // For MVP: simple queue system
  const queuedTest = await prisma.userSynchTest.findFirst({
    where: {
      testId: test.id,
      status: 'pending',
      userB: user.id, // Someone started, waiting for partner
    },
    orderBy: { createdAt: 'asc' },
  });

  if (queuedTest) {
    // Match found - update test with userA
    const matched = await prisma.userSynchTest.update({
      where: { id: queuedTest.id },
      data: { userA: user.id },
      include: { test: { select: { title: true, questions: true } } },
    });
    return NextResponse.json({ success: true, test: matched }, { status: 201 });
  }

  // No match - create queue entry (userB set to self as placeholder, will be updated when matched)
  const userTest = await prisma.userSynchTest.create({
    data: {
      testId: test.id,
      userA: user.id,
      userB: user.id, // Placeholder - will be replaced on match
      answersA: [],
      answersB: [],
      status: 'pending',
    },
    include: { test: { select: { title: true, questions: true } } },
  });

  return NextResponse.json({ success: true, test: userTest, queued: true }, { status: 201 });
});

