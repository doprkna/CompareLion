import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync } from '@/lib/api-handler';
import { buildSuccess, buildError, ApiErrorCode } from '@parel/api';
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
 * v0.41.3 - C3 Step 4: Unified API envelope
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
    const details: Record<string, string[]> = {};
    parsed.error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!details[path]) details[path] = [];
      details[path].push(err.message);
    });
    return buildError(req, ApiErrorCode.VALIDATION_ERROR, 'Invalid payload', { details });
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

  return buildSuccess(req, {
    feedback: {
      id: feedback.id,
      status: feedback.status,
      createdAt: feedback.createdAt,
    },
    message: 'Feedback submitted successfully',
  });
});
