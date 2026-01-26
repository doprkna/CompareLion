/**
 * AURE Assist Engine - Screenshot Scraper API
 * Analyze screenshot and suggest actions
 * v0.39.3 - AURE Assist Engine
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { analyzeScreenshot } from '@/lib/aure/assist/screenshotService';

/**
 * POST /api/aure/assist/screenshot
 * Analyze screenshot and suggest actions
 * Body: { imageUrl: string }
 */
export const POST = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const body = await req.json();
  const { imageUrl } = body;

  if (!imageUrl || typeof imageUrl !== 'string') {
    return validationError('imageUrl is required');
  }

  try {
    const analysis = await analyzeScreenshot(imageUrl);

    return successResponse({
      success: true,
      description: analysis.description,
      contextGuess: analysis.contextGuess,
      suggestedActions: analysis.suggestedActions,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to analyze screenshot');
  }
});
