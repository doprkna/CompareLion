export const runtime = 'nodejs';

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, hashPassword, isBcryptHash } from '@/lib/auth/password';
import { LoginSchema } from '@parel/validation/auth';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { checkRateLimit, recordFailedAttempt, clearAllFailedAttempts } from '@/lib/auth/rateLimit';
import { verifyHCaptcha, shouldVerifyHCaptcha, extractHCaptchaToken } from '@/lib/auth/hcaptcha';
import { logAuditEvent, extractIpFromRequest } from '@/lib/services/auditService';
import { getRequestId, createResponseWithRequestId } from '@parel/core/utils/requestId';
import { captureError, createErrorContextFromRequest } from '@parel/core/utils/errorTracking';
import { securityConfig } from '@parel/core/config/security';
import { safeAsync } from '@/lib/api-handler';

export const POST = safeAsync(async (req: NextRequest) => {
  const requestId = getRequestId(req);
  
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

    const { email, password, hcaptchaToken, captcha } = validationResult.data;
    const ip = extractIpFromRequest(req);
    
    // Verify hCaptcha if required (with demo bypass support)
    if (shouldVerifyHCaptcha(req)) {
      const captchaToken = captcha || hcaptchaToken || extractHCaptchaToken(req);
      
      // Allow demo bypass token in dev/demo mode
      const isDemoBypass = captchaToken === 'demo-bypass-token' && securityConfig.demoBypass;
      
      if (!captchaToken && !isDemoBypass) {
        return createResponseWithRequestId(
          { 
            success: false, 
            error: 'Please complete the security verification.',
            requiresCaptcha: true,
            requestId
          },
          400,
          requestId
        );
      }
      
      // Skip verification if demo bypass
      if (!isDemoBypass) {
        const captchaResult = await verifyHCaptcha(captchaToken, ip);
        if (!captchaResult.success) {
          return createResponseWithRequestId(
            { 
              success: false, 
              error: 'Security verification failed. Please try again.',
              requiresCaptcha: true,
              requestId
            },
            400,
            requestId
          );
        }
      } else {
        // Demo bypass enabled - skipping captcha verification
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

    // Verify password with unified helper (supports both bcrypt and argon2id)
    const isValidPassword = await verifyPassword(user.passwordHash, password);
    
    // Check if password is using legacy bcrypt hash (needs upgrade)
    const needsRehash = isValidPassword && isBcryptHash(user.passwordHash);
    
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

    // Auto-upgrade bcrypt hashes to argon2id on successful login
    if (needsRehash) {
      try {
        const newHash = await hashPassword(password);
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            passwordHash: newHash,
            lastLoginAt: new Date()
          }
        });
        // Successfully upgraded bcrypt → argon2id
      } catch (rehashError) {
        // Failed to rehash password - continue with login
        // Continue with login even if rehashing fails
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });
      }
    } else {
      // Update last login time only
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });
    }

    // Create session and set cookie
    const token = await createSession({
      userId: user.id,
      email: user.email,
    });
    await setSessionCookie(token);

    // Grant daily login chest (v0.36.30)
    try {
      const { grantDailyLoginChest } = await import('@/lib/services/chestService');
      await grantDailyLoginChest(user.id);
    } catch (error) {
      // Don't fail login if chest grant fails
      logger.debug('[Login] Daily chest grant failed', error);
    }

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
});
