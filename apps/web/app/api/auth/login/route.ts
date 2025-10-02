export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword } from '@/lib/auth/password';
import { LoginSchema } from '@/lib/validation/auth';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { checkRateLimit, recordFailedAttempt, clearAllFailedAttempts } from '@/lib/auth/rateLimit';
import { verifyHCaptcha, shouldVerifyHCaptcha, extractHCaptchaToken } from '@/lib/auth/hcaptcha';
import { logAuditEvent, extractIpFromRequest } from '@/lib/services/auditService';
import { getRequestId, createResponseWithRequestId } from '@/lib/utils/requestId';
import { captureError, createErrorContextFromRequest } from '@/lib/utils/errorTracking';

export async function POST(req: NextRequest) {
  const requestId = getRequestId(req);
  
  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = LoginSchema.safeParse(body);
    if (!validationResult.success) {
      return createResponseWithRequestId(
        { success: false, error: 'Invalid credentials', requestId },
        400,
        requestId
      );
    }

    const { email, password, hcaptchaToken } = validationResult.data;
    const ip = extractIpFromRequest(req);
    
    // Verify hCaptcha if required
    if (shouldVerifyHCaptcha(req)) {
      const captchaToken = hcaptchaToken || extractHCaptchaToken(req);
      if (!captchaToken) {
        return createResponseWithRequestId(
          { 
            success: false, 
            error: 'Please complete the security verification.',
            requestId
          },
          400,
          requestId
        );
      }
      
      const captchaResult = await verifyHCaptcha(captchaToken, ip);
      if (!captchaResult.success) {
        return createResponseWithRequestId(
          { 
            success: false, 
            error: 'Security verification failed. Please try again.',
            requestId
          },
          400,
          requestId
        );
      }
    }
    
    // Check rate limit and lockout status
    const rateLimitResult = await checkRateLimit(ip);
    if (!rateLimitResult.allowed) {
      return createResponseWithRequestId(
        { 
          success: false, 
          error: rateLimitResult.message || 'Too many failed login attempts. Please try again later.',
          requestId
        },
        429,
        requestId
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
      }
    });

    // Always return the same error message to avoid user enumeration
    const errorMessage = 'Invalid credentials';

    if (!user || !user.passwordHash) {
      // Record failed attempt
      await recordFailedAttempt(ip, email);
      
      // Log failed login attempt (user not found)
      await logAuditEvent({
        ip,
        action: 'login_fail',
        meta: { 
          email, 
          success: false, 
          reason: 'user_not_found',
          remainingAttempts: rateLimitResult.remainingAttempts - 1
        },
      });

      return createResponseWithRequestId(
        { success: false, error: errorMessage, requestId },
        401,
        requestId
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(user.passwordHash, password);
    
    if (!isValidPassword) {
      // Record failed attempt
      await recordFailedAttempt(ip, email);
      
      // Log failed login attempt (wrong password)
      await logAuditEvent({
        userId: user.id,
        ip,
        action: 'login_fail',
        meta: { 
          email, 
          success: false, 
          reason: 'invalid_password',
          remainingAttempts: rateLimitResult.remainingAttempts - 1
        },
      });

      return createResponseWithRequestId(
        { success: false, error: errorMessage, requestId },
        401,
        requestId
      );
    }

    // Clear failed attempts on successful login
    await clearAllFailedAttempts(ip);

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Create session and set cookie
    const token = await createSession({
      userId: user.id,
      email: user.email,
    });
    await setSessionCookie(token);

    // Log successful login
    await logAuditEvent({
      userId: user.id,
      ip,
      action: 'login_success',
      meta: { 
        email: user.email, 
        success: true 
      },
    });

    return createResponseWithRequestId({ 
      success: true, 
      message: 'Login successful',
      userId: user.id,
      requestId
    }, 200, requestId);
  } catch (error) {
    console.error('Login error:', error);
    
    // Capture error with Sentry
    captureError(error as Error, {
      ...createErrorContextFromRequest(req, requestId),
      endpoint: '/api/auth/login',
      extra: { requestId }
    });
    
    return createResponseWithRequestId(
      { success: false, error: 'Login failed', requestId },
      500,
      requestId
    );
  }
}