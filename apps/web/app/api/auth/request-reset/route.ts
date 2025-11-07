export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { generateToken, getTokenExpiry } from '@/lib/auth/tokens';
import { sendPasswordReset } from '@/lib/email/resend';
import { logAuditEvent, extractIpFromRequest } from '@/lib/services/auditService';
import { safeAsync, successResponse, validationError } from '@/lib/api-handler';
import { logger } from '@/lib/utils/debug';
import { z } from 'zod';

const RequestResetSchema = z.object({
  email: z.string().email().transform(email => email.toLowerCase().trim())
});

export const POST = safeAsync(async (req: NextRequest) => {
  const body = await req.json();
  
  // Validate input
  const validationResult = RequestResetSchema.safeParse(body);
  if (!validationResult.success) {
    return validationError('Invalid email address');
  }

  const { email } = validationResult.data;
  const ip = extractIpFromRequest(req);

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true }
  });

  // Always return success to prevent user enumeration
  // Even if user doesn't exist, we return the same response
  if (!user) {
    // Log password reset request for non-existent user
    await logAuditEvent({
      ip,
      action: 'password_reset_request',
      meta: { 
        email, 
        success: false, 
        reason: 'user_not_found' 
      },
    });

    return successResponse(
      undefined,
      'If an account with that email exists, a password reset link has been sent'
    );
  }

  // Generate reset token
  const token = generateToken();
  const expiresAt = getTokenExpiry();

  // Delete any existing reset tokens for this user
  await prisma.passwordReset.deleteMany({
    where: { userId: user.id }
  });

  // Create new reset token
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token,
      expiresAt
    }
  });

  // Send reset email
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset?token=${token}`;
  
  const emailResult = await sendPasswordReset({
    to: user.email,
    resetUrl
  });

  if (!emailResult.success) {
    logger.error('[AUTH] Failed to send password reset email', emailResult.error);
    // Still return success to user to prevent enumeration
  }

  // Log successful password reset request
  await logAuditEvent({
    userId: user.id,
    ip,
    action: 'password_reset_request',
    meta: { 
      email: user.email, 
      success: true,
      emailSent: emailResult.success,
      messageId: emailResult.messageId
    },
  });

  return successResponse(
    { messageId: emailResult.messageId },
    'If an account with that email exists, a password reset link has been sent'
  );
});
