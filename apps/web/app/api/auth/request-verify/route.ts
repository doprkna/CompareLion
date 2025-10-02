export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateToken, getTokenExpiry } from '@/lib/auth/tokens';
import { sendEmailVerification } from '@/lib/email/resend';
import { getSessionFromCookie } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    // Get the current user from session
    const session = await getSessionFromCookie();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, emailVerifiedAt: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.emailVerifiedAt) {
      return NextResponse.json(
        { success: false, error: 'Email already verified' },
        { status: 400 }
      );
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
      console.error('Failed to send verification email:', emailResult.error);
      return NextResponse.json(
        { success: false, error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Verification email sent successfully',
      messageId: emailResult.messageId
    });
  } catch (error) {
    console.error('Request verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}
