import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { startFlow } from '@parel/features/flow';
import { safeAsync, successResponse, authError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';

const StartFlowSchema = z.object({
  categoryId: z.string().min(1)
});

/**
 * POST /api/flow/start
 * Start a new question flow
 */
export const POST = safeAsync(async (req: NextRequest) => {
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
  
  // Parse and validate request
  const body = await req.json();
  const { categoryId } = StartFlowSchema.parse(body);
  
  // Start flow
  const flowSession = await startFlow(user.id, categoryId);
  
  return successResponse(flowSession, 'Flow started');
});


