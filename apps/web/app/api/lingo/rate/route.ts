/**
 * CompareLingo API 1.0
 * Rate text (jokes, slang, captions, etc.)
 * v0.40.4 - CompareLingo 1.0 (Slang, Joke, Caption Rating)
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, unauthorizedError, validationError, successResponse } from '@/lib/api-handler';
import { rateTextLingo, LingoMode } from '@/lib/lingo/lingoService';

/**
 * POST /api/lingo/rate
 * Rate text using CompareLingo
 * Body: { text: string, mode: "joke" | "slang" | "caption" | "pickup" | "meme" | "msg" }
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
  const { text, mode } = body;

  if (!text || typeof text !== 'string') {
    return validationError('text is required');
  }

  if (!mode) {
    return validationError('mode is required (joke|slang|caption|pickup|meme|msg)');
  }

  const validModes: LingoMode[] = ['joke', 'slang', 'caption', 'pickup', 'meme', 'msg'];
  if (!validModes.includes(mode)) {
    return validationError(`Invalid mode. Must be one of: ${validModes.join(', ')}`);
  }

  try {
    const result = await rateTextLingo(text, mode);

    // Check for errors
    if ('error' in result) {
      if (result.error === 'unsafe_content') {
        return validationError('Content does not meet safety guidelines');
      }
      if (result.error === 'invalid_input') {
        return validationError(result.message || 'Invalid input');
      }
      return validationError(result.message || 'Failed to rate text');
    }

    return successResponse({
      success: true,
      scores: result.scores,
      vibeTag: result.vibeTag,
      lingoType: result.lingoType,
      feedback: result.feedback,
      suggestion: result.suggestion || null,
    });
  } catch (error: any) {
    return validationError(error.message || 'Failed to rate text');
  }
});

