/**
 * UGC Question Submission API
 * v0.17.0 - User-generated content system
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse, validationError, unauthorizedError } from '@/lib/api-handler';
import { z } from 'zod';
import { validateUGCContent } from '@/lib/filter';

const QuestionSubmissionSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(300, 'Title must be at most 300 characters'),
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(300, 'Content must be at most 300 characters'),
  description: z.string().max(500).optional(),
  categoryId: z.string().optional(),
  languageId: z.string().optional(),
  tags: z.array(z.string()).max(10).optional(),
  imageUrl: z.string().url().optional(),
  type: z.enum(['QUESTION', 'PACK', 'EVENT']).default('QUESTION'),
});

/**
 * POST /api/ugc/question
 * Submit a new user-generated question
 */
export const POST = safeAsync(async (req: NextRequest) => {
  // Get authenticated session
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('You must be logged in to submit content');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { 
      id: true, 
      role: true,
      userSubmissions: {
        where: {
          status: 'APPROVED',
        },
        take: 1,
      },
    },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  // Parse and validate request
  const body = await req.json();
  const validation = QuestionSubmissionSchema.safeParse(body);

  if (!validation.success) {
    return validationError(
      validation.error.issues[0]?.message || 'Invalid submission data'
    );
  }

  const { title, content, description, categoryId, languageId, tags, imageUrl, type } = validation.data;

  // Profanity filter
  const contentCheck = validateUGCContent(title, content, description);
  if (!contentCheck.valid) {
    return validationError(
      `Content moderation failed: ${contentCheck.errors.join(', ')}`
    );
  }

  // Get default language if not provided
  let finalLanguageId = languageId;
  if (!finalLanguageId) {
    const defaultLang = await prisma.language.findFirst({
      where: { code: 'en' },
      select: { id: true },
    });
    finalLanguageId = defaultLang?.id;
  }

  // Create submission
  const submission = await prisma.userSubmission.create({
    data: {
      userId: user.id,
      type,
      status: 'PENDING',
      title,
      content,
      description,
      categoryId,
      languageId: finalLanguageId,
      tags: tags || [],
      imageUrl,
      score: 0,
      upvotes: 0,
      downvotes: 0,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Check if this is user's first submission
  const isFirstSubmission = user.userSubmissions.length === 0;

  // Award XP for first submission
  if (isFirstSubmission) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        xp: { increment: 15 },
      },
    });
  }

  return successResponse({
    message: isFirstSubmission 
      ? 'Submission created! You earned 15 XP for your first submission.' 
      : 'Submission created and pending moderation.',
    submission: {
      id: submission.id,
      title: submission.title,
      status: submission.status,
      createdAt: submission.createdAt,
    },
    xpAwarded: isFirstSubmission ? 15 : 0,
  });
});

/**
 * GET /api/ugc/question
 * Get user's submissions or all submissions (admin only)
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('You must be logged in');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  // Build where clause
  const where: any = {};
  
  // Non-admin users can only see their own submissions
  if (user.role !== 'ADMIN' && user.role !== 'MOD') {
    where.userId = user.id;
  }

  if (status) {
    where.status = status;
  }

  // Fetch submissions
  const [submissions, total] = await Promise.all([
    prisma.userSubmission.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        moderator: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.userSubmission.count({ where }),
  ]);

  return successResponse({
    submissions,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  });
});

