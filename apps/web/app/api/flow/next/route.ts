/**
 * Flow Next Question API
 * Returns next available question for user
 * v0.13.2i
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, authError, notFoundError, getSearchParam } from '@/lib/api-handler';
import { getNextFlowQuestion, getAvailableQuestionCount } from '@/lib/services/flowService';
import { logFlowEvent } from '@/lib/metrics';

/**
 * GET /api/flow/next?categoryId=xxx
 * Get next question in flow
 */
export const GET = safeAsync(async (req: NextRequest) => {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError();
  }

  // Get user ID
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return notFoundError('User');
  }

  // Get optional category filter
  const categoryId = getSearchParam(req, 'categoryId');
  
  // Get optional localization parameters (v0.23.0)
  const lang = getSearchParam(req, 'lang') || 'en';
  const region = getSearchParam(req, 'region') || 'GLOBAL';

  // Get next question
  const question = await getNextFlowQuestion(user.id, categoryId || undefined, { lang, region });

  if (!question) {
    // No more questions available
    const availableCount = await getAvailableQuestionCount(categoryId || undefined);
    
    return NextResponse.json({
      status: 'empty',
      message: 'No more questions available',
      availableCount,
      success: true,
    });
  }

  // Log flow event
  await logFlowEvent('next_question', user.id, {
    questionId: question.id,
    category: question.category,
  });

  return NextResponse.json({
    status: 'ok',
    success: true,
    question: {
      id: question.id,
      text: question.question,
      options: question.options,
      category: question.category,
      difficulty: question.difficulty,
      type: question.type,
    },
  });
});


