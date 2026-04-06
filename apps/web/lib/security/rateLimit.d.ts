export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    keyGenerator?: (req: Request) => string;
}
export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
}
export declare function checkLoginRateLimit(req: Request): Promise<RateLimitResult>;
export declare function checkSignupRateLimit(req: Request): Promise<RateLimitResult>;
export declare function checkDailyLoginRateLimit(req: Request): Promise<RateLimitResult>;
export declare function trackFailedLogin(req: Request, email: string): Promise<{
    attempts: number;
    locked: boolean;
    lockoutUntil?: number;
}>;
export declare function clearFailedLogins(req: Request, email: string): Promise<void>;
