/**
 * Security Configuration
 *
 * Centralized configuration for security features including:
 * - hCaptcha settings
 * - Demo/dev bypass flags
 * - Environment-specific behavior
 */
import { logger } from '../utils/debug'; // sanity-fix: replaced @parel/core self-import with relative import
import { IS_PROD } from './env';
let redis = null;
if (typeof window === "undefined") {
    try {
        redis = require("@parel/redis")?.redis ?? null;
    }
    catch {
        redis = null;
    }
}
export const securityConfig = {
    // hCaptcha site key from environment
    hCaptchaSiteKey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "",
    // hCaptcha secret key (server-side only)
    hCaptchaSecret: process.env.HCAPTCHA_SECRET || "",
    // Enable captcha only in production AND when site key is configured
    captchaEnabled: !!process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY &&
        IS_PROD,
    // Allow demo/dev bypass when:
    // - Explicitly enabled via env var, OR
    // - Running in development mode
    demoBypass: process.env.NEXT_PUBLIC_ALLOW_DEMO_LOGIN === "true" ||
        !IS_PROD,
    // Rate limiting settings
    rateLimitEnabled: redis !== null || !!process.env.UPSTASH_REDIS_REST_URL,
    // Maximum failed login attempts before requiring captcha
    maxFailedAttempts: 3,
};
/**
 * Check if captcha should be required for this request
 */
export function shouldRequireCaptcha(failedAttempts = 0) {
    // If demo bypass is enabled, never require captcha
    if (securityConfig.demoBypass) {
        return false;
    }
    // If captcha is not configured, don't require it
    if (!securityConfig.captchaEnabled) {
        return false;
    }
    // Require captcha after failed attempts threshold
    return failedAttempts >= securityConfig.maxFailedAttempts;
}
/**
 * Validate captcha token
 * Returns true if valid or bypass is enabled
 */
export async function validateCaptcha(token) {
    // Allow bypass in demo/dev mode
    if (securityConfig.demoBypass) {
        return true;
    }
    // If captcha not enabled, allow through
    if (!securityConfig.captchaEnabled) {
        return true;
    }
    // If no token provided, fail
    if (!token) {
        return false;
    }
    // Verify with hCaptcha API
    try {
        const response = await fetch('https://hcaptcha.com/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `response=${token}&secret=${securityConfig.hCaptchaSecret}`,
        });
        const data = await response.json();
        return data.success === true;
    }
    catch (error) {
        logger.error('hCaptcha verification error', error);
        return false;
    }
}
