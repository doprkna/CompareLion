export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { isTokenExpired } from '@/lib/auth/tokens';
import { safeAsync, successResponse, validationError } from '@/lib/api-handler';

export const GET = safeAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return validationError('Verification token is required');
  }

  // Find the verification record
  const verification = await prisma.emailVerify.findUnique({
    where: { token },
    include: { user: { select: { id: true, email: true, emailVerifiedAt: true } } }
  });

  if (!verification) {
    return validationError('Invalid or expired verification token');
  }

  // Check if token is expired
  if (isTokenExpired(verification.expiresAt)) {
    // Clean up expired token
    await prisma.emailVerify.delete({
      where: { id: verification.id }
    });
    
    return validationError('Verification token has expired');
  }

  // Check if already verified
  if (verification.user.emailVerifiedAt) {
    // Clean up token since it's no longer needed
    await prisma.emailVerify.delete({
      where: { id: verification.id }
    });
    
    return validationError('Email is already verified');
  }

  // Verify the email
  await prisma.$transaction(async (tx) => {
    // Update user's email verification status
    await tx.user.update({
      where: { id: verification.userId },
      data: { emailVerifiedAt: new Date() }
    });

    // Delete the verification token
    await tx.emailVerify.delete({
      where: { id: verification.id }
    });
  });

  return successResponse(
    undefined, 
    'Email verified successfully'
  );
});
