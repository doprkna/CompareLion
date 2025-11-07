export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { isTokenExpired } from '@/lib/auth/tokens';
import { safeAsync, successResponse, validationError } from '@/lib/api-handler';
import { z } from 'zod';

const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Password must contain at least one letter and one number'),
});

export const POST = safeAsync(async (req: NextRequest) => {
  const body = await req.json();
  
  // Validate input
  const validationResult = ResetPasswordSchema.safeParse(body);
  if (!validationResult.success) {
    return validationError('Invalid input data');
  }

  const { token, newPassword } = validationResult.data;

  // Find the reset record
  const resetRecord = await prisma.passwordReset.findUnique({
    where: { token },
    include: { user: { select: { id: true, email: true } } }
  });

  if (!resetRecord) {
    return validationError('Invalid or expired reset token');
  }

  // Check if token is expired
  if (isTokenExpired(resetRecord.expiresAt)) {
    // Clean up expired token
    await prisma.passwordReset.delete({
      where: { id: resetRecord.id }
    });
    
    return validationError('Reset token has expired');
  }

  // Hash the new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password and delete reset token in transaction
  await prisma.$transaction(async (tx) => {
    // Update user's password
    await tx.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash: hashedPassword }
    });

    // Delete the reset token
    await tx.passwordReset.delete({
      where: { id: resetRecord.id }
    });
  });

  return successResponse(undefined, 'Password reset successfully');
});
