import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { getFlowResult } from '@parel/features/flow';
import { safeAsync, successResponse, unauthorizedError, notFoundError, validationError } from '@/lib/api-handler';

/**
 * GET /api/flow/result?categoryId=xxx
 * Get flow completion result
 */
export const GET = safeAsync(async (req: NextRequest) => {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
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
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('categoryId');
  
  if (!categoryId) {
    return validationError('categoryId is required');
  }
  
  // Get flow result
  const result = await getFlowResult(user.id, categoryId);
  
  return successResponse(result);
});


