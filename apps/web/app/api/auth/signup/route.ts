export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth/password';
import { SignupSchema } from '@/lib/validation/auth';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { checkSignupRateLimit } from '@/lib/security/rateLimit';
import { verifyHCaptcha, isHCaptchaRequired } from '@/lib/security/hcaptcha';
import { logAuditEvent, extractIpFromRequest } from '@/lib/services/auditService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = SignupSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      );
    }

    const { email, password, hcaptchaToken } = validationResult.data;
    const ip = extractIpFromRequest(req);

    // Check rate limit
    const rateLimitResult = await checkSignupRateLimit(req);
    if (!rateLimitResult.allowed) {
      // If rate limited and hCaptcha is configured, require hCaptcha
      if (isHCaptchaRequired(req) && !hcaptchaToken) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Rate limit exceeded. Please complete the captcha.',
            requiresCaptcha: true
          },
          { 
            status: 429,
            headers: {
              'Retry-After': rateLimitResult.retryAfter?.toString() || '3600',
              'X-RateLimit-Limit': '3',
              'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
              'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
            }
          }
        );
      }

      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many signup attempts. Please try again later.' 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '3600',
            'X-RateLimit-Limit': '3',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
          }
        }
      );
    }

    // Verify hCaptcha if provided
    if (hcaptchaToken) {
      const hcaptchaSecret = process.env.HCAPTCHA_SECRET;
      if (hcaptchaSecret) {
        const hcaptchaResult = await verifyHCaptcha(hcaptchaToken, hcaptchaSecret);
        if (!hcaptchaResult.success) {
          return NextResponse.json(
            { success: false, error: hcaptchaResult.error || 'Captcha verification failed' },
            { status: 400 }
          );
        }
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // Log failed signup attempt (account already exists)
      await logAuditEvent({
        ip,
        action: 'signup',
        meta: { 
          email, 
          success: false, 
          reason: 'account_already_exists' 
        },
      });

      return NextResponse.json(
        { success: false, error: 'Account already exists' },
        { status: 400 }
      );
    }

    // Hash password with Argon2id
    const hashedPassword = await hashPassword(password);

    // Create user with wallet and profile in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          emailVerifiedAt: null, // Will be verified later
        }
      });

      // Create wallet with 0 funds and 0 diamonds
      await tx.wallet.create({
        data: {
          userId: user.id,
          tenantId: 'default', // For now, use default tenant
          funds: 0,
          diamonds: 0,
        }
      });

      // Create user profile
      await tx.userProfile.create({
        data: {
          userId: user.id,
        }
      });

      return user;
    });

    // Create session and set cookie
    const token = await createSession({
      userId: result.id,
      email: result.email,
    });
    await setSessionCookie(token);

    // Log successful signup
    await logAuditEvent({
      userId: result.id,
      ip,
      action: 'signup',
      meta: { 
        email: result.email, 
        success: true,
        hasCaptcha: !!hcaptchaToken
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Account created successfully',
      userId: result.id 
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create account' },
      { status: 500 }
    );
  }
}