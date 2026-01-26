import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { getNextQuestion } from '@parel/features/flow';
import { safeAsync, successResponse, authError, notFoundError, getRequiredSearchParam } from '@/lib/api-handler';

/**
 * GET /api/flow/question?categoryId=xxx
 * Get next question in flow
 */
export const GET = safeAsync(async (req: NextRequest) => {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError();
  }
  
  // Get user ID
  const { prisma } = await import('@/lib/db');
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });
  
  if (!user) {
    return notFoundError('User');
  }
  
  // Get category ID from query
  const categoryId = getRequiredSearchParam(req, 'categoryId');
  
  // Get next question
  const question = await getNextQuestion(user.id, categoryId);
  
  if (!question) {
    return successResponse({ completed: true }, 'No more questions available');
  }
  
  return successResponse(question);
});


