export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isTokenExpired } from '@/lib/auth/tokens';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required' },
        { status: 400 }
      );
    }

    // Find the verification record
    const verification = await prisma.emailVerify.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true, emailVerifiedAt: true } } }
    });

    if (!verification) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (isTokenExpired(verification.expiresAt)) {
      // Clean up expired token
      await prisma.emailVerify.delete({
        where: { id: verification.id }
      });
      
      return NextResponse.json(
        { success: false, error: 'Verification token has expired' },
        { status: 400 }
      );
    }

    // Check if already verified
    if (verification.user.emailVerifiedAt) {
      // Clean up token since it's no longer needed
      await prisma.emailVerify.delete({
        where: { id: verification.id }
      });
      
      return NextResponse.json(
        { success: false, error: 'Email is already verified' },
        { status: 400 }
      );
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

    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully' 
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}
