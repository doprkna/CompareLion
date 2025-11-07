/**
 * UGC Moderation API
 * v0.17.0 - Admin tools for reviewing user submissions
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, successResponse, validationError, unauthorizedError, notFoundError } from '@/lib/api-handler';
import { z } from 'zod';
import { checkUGCBadges } from '@/lib/badge-service';

const ModerationSchema = z.object({
  submissionId: z.string(),
  action: z.enum(['APPROVE', 'REJECT', 'FLAG']),
  note: z.string().max(500).optional(),
});

/**
 * POST /api/ugc/moderate
 * Approve, reject, or flag a submission (Admin/Mod only)
 */
export const POST = safeAsync(async (req: NextRequest) => {
  // Get authenticated session
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return unauthorizedError('You must be logged in');
  }

  // Get user and verify admin/mod role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user) {
    return unauthorizedError('User not found');
  }

  if (user.role !== 'ADMIN' && user.role !== 'MOD') {
    return unauthorizedError('You do not have permission to moderate content');
  }

  // Parse and validate request
  const body = await req.json();
  const validation = ModerationSchema.safeParse(body);

  if (!validation.success) {
    return validationError(
      validation.error.issues[0]?.message || 'Invalid moderation data'
    );
  }

  const { submissionId, action, note } = validation.data;

  // Find submission
  const submission = await prisma.userSubmission.findUnique({
    where: { id: submissionId },
    include: {
      user: {
        select: {
          id: true,
          xp: true,
        },
      },
    },
  });

  if (!submission) {
    return notFoundError('Submission not found');
  }

  // Update submission based on action
  const now = new Date();
  const updateData: any = {
    moderatorId: user.id,
    moderatorNote: note,
    reviewedAt: now,
  };

  if (action === 'APPROVE') {
    updateData.status = 'APPROVED';
    updateData.approvedAt = now;
  } else if (action === 'REJECT') {
    updateData.status = 'REJECTED';
    updateData.rejectedAt = now;
  } else if (action === 'FLAG') {
    updateData.status = 'FLAGGED';
  }

  const updatedSubmission = await prisma.userSubmission.update({
    where: { id: submissionId },
    data: updateData,
    include: {
      user: {
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
    },
  });

  // If approved, create notification and award karma (fire and forget)
  if (action === 'APPROVE') {
    Promise.all([
      prisma.notification.create({
        data: {
          userId: submission.userId,
          title: 'Submission Approved!',
          message: `Your submission "${submission.title}" has been approved and is now live.`,
          type: 'success',
          read: false,
        },
      }),
      prisma.user.update({
        where: { id: submission.userId },
        data: {
          karmaScore: { increment: 10 },
        },
      }),
      checkUGCBadges(submission.userId),
    ]).catch(() => {
      // Silently fail - notifications not critical
    });
  }

  // If rejected, send notification (fire and forget)
  if (action === 'REJECT') {
    prisma.notification.create({
      data: {
        userId: submission.userId,
        title: 'Submission Reviewed',
        message: `Your submission "${submission.title}" was reviewed. ${note ? `Reason: ${note}` : ''}`,
        type: 'info',
        read: false,
      },
    }).catch(() => {
      // Silently fail - notification not critical
    });
  }

  return successResponse({
    message: `Submission ${action.toLowerCase()}ed successfully`,
    submission: updatedSubmission,
  });
});

