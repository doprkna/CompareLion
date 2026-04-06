import { NextRequest } from 'next/server';
export interface HCaptchaResult {
    success: boolean;
    errorCodes?: string[];
    challengeTs?: string;
    hostname?: string;
}
/**
 * Verify hCaptcha token (currently bypassed for development)
 */
export declare function verifyHCaptcha(token: string, ip?: string): Promise<HCaptchaResult>;
/**
 * Middleware to check hCaptcha on sensitive endpoints
 */
export declare function shouldVerifyHCaptcha(request: NextRequest): boolean;
/**
 * Extract hCaptcha token from request
 */
export declare function extractHCaptchaToken(request: NextRequest): string | null;
/**
 * Get hCaptcha site key for frontend
 */
export declare function getHCaptchaSiteKey(): string;
/**
 * Check if hCaptcha is enabled (not bypassed)
 */
export declare function isHCaptchaEnabled(): boolean;
