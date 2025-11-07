/**
 * Feedback API
 * Handles user feedback submissions during beta
 * v0.14.0 - Enhanced with bug auto-creation & screenshot upload
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse, validationError } from '@/lib/api-handler';
import { z } from 'zod';
import { trackEvent } from '@/lib/metrics';

const FeedbackSchema = z.object({
  userId: z.string().optional(),
  category: z.enum(['bug', 'idea', 'praise']),
  message: z.string().min(5, 'Message must be at least 5 characters').max(500, 'Message must be at most 500 characters'),
  page: z.string().optional(),
  userAgent: z.string().optional(),
  screenshot: z.string().optional(), // Base64 encoded screenshot
});

/**
 * POST /api/feedback
 * Submit user feedback
 */
export const POST = safeAsync(async (req: NextRequest) => {
  // Get session (optional - allow anonymous feedback)
  const session = await getServerSession(authOptions);
  
  // Parse and validate request
  const body = await req.json();
  const validation = FeedbackSchema.safeParse(body);

  if (!validation.success) {
    return validationError(validation.error.issues[0]?.message || 'Invalid feedback data');
  }

  const { category, message, page, userAgent, screenshot } = validation.data;

  // Get user ID if authenticated
  let userId: string | undefined = validation.data.userId;
  if (session?.user?.email && !userId) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    userId = user?.id;
  }

  // Map category to FeedbackSubmission fields
  const typeMap = {
    bug: 'bug_report',
    idea: 'feature_request',
    praise: 'general',
  };

  // Store in FeedbackSubmission table
  const feedback = await prisma.feedbackSubmission.create({
    data: {
      userId: userId || 'anonymous',
      type: typeMap[category],
      category,
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} - ${message.slice(0, 50)}${message.length > 50 ? '...' : ''}`,
      description: message,
      page: page || 'unknown',
      userAgent: userAgent || req.headers.get('user-agent') || 'unknown',
      screenshot: screenshot || null,
      priority: category === 'bug' ? 'high' : 'normal',
      status: 'pending',
      submittedAt: new Date(),
    },
  });

  // For bug reports, auto-create error log entry (fire and forget)
  if (category === 'bug') {
    prisma.errorLog.create({
      data: {
        errorType: 'UserReportedBug',
        message: message.slice(0, 255),
        page: page || 'unknown',
        userAgent: userAgent || req.headers.get('user-agent') || 'unknown',
        userId: userId || 'anonymous',
        severity: 'warning',
        status: 'pending fix',
        metadata: {
          feedbackId: feedback.id,
          screenshot: screenshot ? 'attached' : 'none',
        },
      },
    }).catch(() => {
      // Silently fail - error log creation not critical
    });
  }

  // Track event if analytics enabled
  await trackEvent('feedback_submitted', {
    category,
    userId: userId || 'anonymous',
    feedbackId: feedback.id,
  });

  return successResponse({
    message: 'Thanks for your feedback!',
    id: feedback.id,
    bugReported: category === 'bug',
  });
});

