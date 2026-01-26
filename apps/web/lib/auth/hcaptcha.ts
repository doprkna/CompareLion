import { NextRequest } from 'next/server';
import { securityConfig } from '@parel/core/config/security';
import { logger } from '@/lib/logger';

// hCaptcha configuration
const HCAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001'; // Test key
const HCAPTCHA_SECRET_KEY = process.env.HCAPTCHA_SECRET || '0x0000000000000000000000000000000000000000'; // Test secret

// Use security config for bypass logic
const HCAPTCHA_BYPASS = securityConfig.demoBypass || !securityConfig.captchaEnabled;

export interface HCaptchaResult {
  success: boolean;
  errorCodes?: string[];
  challengeTs?: string;
  hostname?: string;
}

/**
 * Verify hCaptcha token (currently bypassed for development)
 */
export async function verifyHCaptcha(token: string, ip?: string): Promise<HCaptchaResult> {
  // If bypass is enabled, always return success
  if (HCAPTCHA_BYPASS) {
    return {
      success: true,
      challengeTs: new Date().toISOString(),
      hostname: 'localhost'
    };
  }

  // Real hCaptcha verification (when bypass is disabled)
  try {
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: HCAPTCHA_SECRET_KEY,
        response: token,
        remoteip: ip || '',
      }),
    });

    const result: HCaptchaResult = await response.json();
    return result;
  } catch (error) {
    logger.error('hCaptcha verification failed', error);
    return {
      success: false,
      errorCodes: ['network-error']
    };
  }
}

/**
 * Middleware to check hCaptcha on sensitive endpoints
 */
export function shouldVerifyHCaptcha(request: NextRequest): boolean {
  const pathname = request.nextUrl.pathname;
  
  // Routes that should be protected with hCaptcha
  const protectedRoutes = [
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/reset',
    '/api/auth/request-reset',
  ];
  
  return protectedRoutes.some(route => pathname.startsWith(route));
}

/**
 * Extract hCaptcha token from request
 */
export function extractHCaptchaToken(request: NextRequest): string | null {
  // Try to get from body first (for POST requests)
  const body = request.body;
  if (body) {
    // Note: This is a simplified version - in practice, you'd need to handle
    // the body parsing properly based on Content-Type
    return null; // Would need proper body parsing
  }
  
  // Try to get from headers
  return request.headers.get('h-captcha-response') || null;
}

/**
 * Get hCaptcha site key for frontend
 */
export function getHCaptchaSiteKey(): string {
  return HCAPTCHA_SITE_KEY;
}

/**
 * Check if hCaptcha is enabled (not bypassed)
 */
export function isHCaptchaEnabled(): boolean {
  return !HCAPTCHA_BYPASS;
}
