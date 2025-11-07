/**
 * Voting API for UGC Content
 * v0.17.0 - Community voting with duplicate prevention
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse, validationError, unauthorizedError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';

const VoteSchema = z.object({
  submissionId: z.string(),
  voteType: z.enum(['UPVOTE', 'DOWNVOTE']),
});

/**
 * POST /api/vote
 * Cast or update a vote on a submission
 */
export const POST = safeAsync(async (req: NextRequest) => {
  // Get session (allow both authenticated and anonymous voting)
  const session = await getServerSession(authOptions);
  
  // Parse and validate request
  const body = await req.json();
  const validation = VoteSchema.safeParse(body);

  if (!validation.success) {
    return validationError(
      validation.error.issues[0]?.message || 'Invalid vote data'
    );
  }

  const { submissionId, voteType } = validation.data;

  // Get user ID if authenticated, otherwise use session ID from headers
  let userId: string | undefined;
  let sessionId: string | undefined;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    userId = user?.id;
  } else {
    // For anonymous users, use a session identifier (could be from cookie/header)
    sessionId = req.headers.get('x-session-id') || req.ip || 'anonymous';
  }

  if (!userId && !sessionId) {
    return unauthorizedError('Unable to identify user or session');
  }

  // Check if submission exists
  const submission = await prisma.userSubmission.findUnique({
    where: { id: submissionId },
    select: { 
      id: true, 
      userId: true,
      upvotes: true,
      downvotes: true,
      score: true,
    },
  });

  if (!submission) {
    return notFoundError('Submission not found');
  }

  // Check for existing vote
  const existingVote = await prisma.vote.findFirst({
    where: {
      submissionId,
      OR: [
        userId ? { userId } : {},
        sessionId ? { sessionId } : {},
      ].filter(obj => Object.keys(obj).length > 0),
    },
  });

  let voteAction: 'created' | 'updated' | 'removed' = 'created';
  let scoreChange = 0;
  let upvoteDelta = 0;
  let downvoteDelta = 0;

  if (existingVote) {
    // If same vote type, remove the vote
    if (existingVote.voteType === voteType) {
      await prisma.vote.delete({
        where: { id: existingVote.id },
      });
      voteAction = 'removed';
      
      // Update score
      if (voteType === 'UPVOTE') {
        scoreChange = -1;
        upvoteDelta = -1;
      } else {
        scoreChange = 1;
        downvoteDelta = -1;
      }
    } else {
      // Update to opposite vote
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { voteType },
      });
      voteAction = 'updated';
      
      // Update score (swing is 2 points)
      if (voteType === 'UPVOTE') {
        scoreChange = 2;
        upvoteDelta = 1;
        downvoteDelta = -1;
      } else {
        scoreChange = -2;
        upvoteDelta = -1;
        downvoteDelta = 1;
      }
    }
  } else {
    // Create new vote
    await prisma.vote.create({
      data: {
        submissionId,
        userId: userId || null,
        sessionId: sessionId || null,
        voteType,
      },
    });
    
    // Update score
    if (voteType === 'UPVOTE') {
      scoreChange = 1;
      upvoteDelta = 1;
    } else {
      scoreChange = -1;
      downvoteDelta = 1;
    }
  }

  // Update submission scores
  const updatedSubmission = await prisma.userSubmission.update({
    where: { id: submissionId },
    data: {
      score: { increment: scoreChange },
      upvotes: { increment: upvoteDelta },
      downvotes: { increment: downvoteDelta },
    },
    select: {
      id: true,
      score: true,
      upvotes: true,
      downvotes: true,
      userId: true,
    },
  });

  // Award XP to submission author for upvotes (fire and forget)
  if (voteType === 'UPVOTE' && voteAction !== 'removed' && userId !== submission.userId) {
    prisma.user.update({
      where: { id: submission.userId },
      data: {
        xp: { increment: 5 },
      },
    }).catch(() => {
      // Silently fail - XP award is not critical
    });
  }

  // Remove XP if upvote was removed (fire and forget)
  if (voteType === 'UPVOTE' && voteAction === 'removed') {
    prisma.user.update({
      where: { id: submission.userId },
      data: {
        xp: { increment: -5 },
      },
    }).catch(() => {
      // Silently fail - XP removal is not critical
    });
  }

  return successResponse({
    message: `Vote ${voteAction} successfully`,
    action: voteAction,
    submission: {
      id: updatedSubmission.id,
      score: updatedSubmission.score,
      upvotes: updatedSubmission.upvotes,
      downvotes: updatedSubmission.downvotes,
    },
  });
});

/**
 * GET /api/vote
 * Get user's votes
 */
export const GET = safeAsync(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('You must be logged in');
  }

  // Get user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  const { searchParams } = new URL(req.url);
  const submissionId = searchParams.get('submissionId');

  // If submissionId provided, get specific vote
  if (submissionId) {
    const vote = await prisma.vote.findFirst({
      where: {
        submissionId,
        userId: user.id,
      },
    });

    return successResponse({
      vote: vote ? {
        id: vote.id,
        voteType: vote.voteType,
        createdAt: vote.createdAt,
      } : null,
    });
  }

  // Otherwise get all user's votes
  const votes = await prisma.vote.findMany({
    where: { userId: user.id },
    include: {
      submission: {
        select: {
          id: true,
          title: true,
          score: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return successResponse({ votes });
});

