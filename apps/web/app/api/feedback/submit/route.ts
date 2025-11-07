import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, validationError, successResponse } from '@/lib/api-handler';
import { z } from 'zod';

const SubmitFeedbackSchema = z.object({
  message: z.string().min(5).max(5000),
  screenshotUrl: z.string().url().optional(),
  context: z.string().max(500).optional(), // Page, action, etc.
});

/**
 * POST /api/feedback/submit
 * Sends bug report or suggestion (auth optional)
 * Public endpoint (auth optional)
 * v0.29.19 - Ops & Community Tools
 */
export const POST = safeAsync(async (req: NextRequest) => {
  // Get session (optional - allow anonymous feedback)
  const session = await getServerSession(authOptions);
  
  let userId: string | undefined;
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    userId = user?.id;
  }

  const body = await req.json().catch(() => ({}));
  const parsed = SubmitFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return validationError('Invalid payload');
  }

  const { message, screenshotUrl, context } = parsed.data;

  // Create feedback
  const feedback = await prisma.feedback.create({
    data: {
      userId: userId || undefined,
      message: message.trim(),
      screenshotUrl: screenshotUrl || undefined,
      context: context || undefined,
      status: 'NEW',
    },
  });

  return successResponse({
    success: true,
    feedback: {
      id: feedback.id,
      status: feedback.status,
      createdAt: feedback.createdAt,
    },
    message: 'Feedback submitted successfully',
  });
});

