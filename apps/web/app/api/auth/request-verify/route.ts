export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { generateToken, getTokenExpiry } from '@/lib/auth/tokens';
import { sendEmailVerification } from '@/lib/email/resend';
import { getSessionFromCookie } from '@/lib/auth/session';
import { safeAsync, successResponse, unauthorizedError, notFoundError, validationError, serverError } from '@/lib/api-handler';
import { logger } from '@parel/core/utils/debug';

export const POST = safeAsync(async (req: NextRequest) => {
  // Get the current user from session
  const session = await getSessionFromCookie();
  if (!session) {
    return unauthorizedError('Authentication required');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, emailVerifiedAt: true }
  });

  if (!user) {
    return notFoundError('User');
  }

  // Check if already verified
  if (user.emailVerifiedAt) {
    return validationError('Email already verified');
  }

    // Generate verification token
    const token = generateToken();
    const expiresAt = getTokenExpiry();

    // Delete any existing verification tokens for this user
    await prisma.emailVerify.deleteMany({
      where: { userId: user.id }
    });

    // Create new verification token
    await prisma.emailVerify.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    // Send verification email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/api/auth/verify?token=${token}`;
    
  const emailResult = await sendEmailVerification({
    to: user.email,
    verificationUrl
  });

  if (!emailResult.success) {
    logger.error('[AUTH] Failed to send verification email', emailResult.error);
    return serverError('Failed to send verification email');
  }

  return successResponse(
    { messageId: emailResult.messageId },
    'Verification email sent successfully'
  );
});
