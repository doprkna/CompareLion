/**
 * Admin Feedback Update API
 * Update feedback submission status
 * v0.13.2l - Feedback Review System
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { prisma } from '@/lib/db';
import { safeAsync, authError, forbiddenError, notFoundError, successResponse, validationError } from '@/lib/api-handler';
import { z } from 'zod';

const UpdateFeedbackSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'in_progress', 'resolved']),
  adminNotes: z.string().optional(),
});

/**
 * PATCH /api/admin/feedback/[id]
 * Update feedback submission (admin only)
 */
export const PATCH = safeAsync(async (req: NextRequest, { params }: { params: { id: string } }) => {
  // Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return authError();
  }

  // Get user and check admin role
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  if (!user || !['ADMIN', 'MODERATOR'].includes(user.role)) {
    return forbiddenError();
  }

  // Parse and validate request
  const body = await req.json();
  const validation = UpdateFeedbackSchema.safeParse(body);

  if (!validation.success) {
    return validationError(validation.error.issues[0]?.message || 'Invalid data');
  }

  const { status, adminNotes } = validation.data;

  // Check if feedback exists
  const feedback = await prisma.feedbackSubmission.findUnique({
    where: { id: params.id },
  });

  if (!feedback) {
    return notFoundError('Feedback');
  }

  // Update feedback
  const updated = await prisma.feedbackSubmission.update({
    where: { id: params.id },
    data: {
      status,
      adminNotes: adminNotes ?? feedback.adminNotes,
      respondedAt: new Date(),
      respondedBy: user.id,
    },
  });

  return successResponse({
    message: 'Feedback updated successfully',
    data: updated,
  });
});

