export interface RateLimitResult {
    allowed: boolean;
    remainingAttempts: number;
    lockoutExpiresAt?: Date;
    message?: string;
}
export declare function checkRateLimit(ipAddress: string): Promise<RateLimitResult>;
export declare function recordFailedAttempt(ipAddress: string, email: string): Promise<void>;
export declare function clearFailedAttempts(ipAddress: string): Promise<void>;
export declare function clearAllFailedAttempts(ipAddress: string): Promise<void>;
