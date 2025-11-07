import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const AnswerSchema = z.object({
  testId: z.string().min(1),
  answers: z.array(z.any()).min(1),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return unauthorizedError('Unauthorized');

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return unauthorizedError('Unauthorized');

  const body = await req.json().catch(() => ({}));
  const parsed = AnswerSchema.safeParse(body);
  if (!parsed.success) {
    return validationError(parsed.error.issues[0]?.message || 'Invalid payload');
  }

  const userTest = await prisma.userSynchTest.findFirst({
    where: {
      id: parsed.data.testId,
      OR: [{ userA: user.id }, { userB: user.id }],
      status: 'pending',
    },
  });

  if (!userTest) return notFoundError('Test not found or already completed');

  const isUserA = userTest.userA === user.id;
  const updateField = isUserA ? 'answersA' : 'answersB';

  await prisma.userSynchTest.update({
    where: { id: userTest.id },
    data: { [updateField]: parsed.data.answers },
  });

  return NextResponse.json({ success: true });
});

