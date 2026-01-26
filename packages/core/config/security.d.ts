/**
 * Security Configuration
 *
 * Centralized configuration for security features including:
 * - hCaptcha settings
 * - Demo/dev bypass flags
 * - Environment-specific behavior
 */
export declare const securityConfig: {
    hCaptchaSiteKey: string;
    hCaptchaSecret: string;
    captchaEnabled: boolean;
    demoBypass: boolean;
    rateLimitEnabled: boolean;
    maxFailedAttempts: number;
};
/**
 * Check if captcha should be required for this request
 */
export declare function shouldRequireCaptcha(failedAttempts?: number): boolean;
/**
 * Validate captcha token
 * Returns true if valid or bypass is enabled
 */
export declare function validateCaptcha(token?: string): Promise<boolean>;
