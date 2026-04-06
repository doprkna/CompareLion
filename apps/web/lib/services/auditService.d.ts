export type AuditAction = 'signup' | 'login_success' | 'login_fail' | 'password_reset_request' | 'password_reset_success' | 'email_verify_request' | 'email_verify_success' | 'newsletter_opt_in' | 'newsletter_opt_out' | 'purchase_succeeded' | 'purchase_failed' | 'subscription_created' | 'subscription_cancelled' | 'profile_updated' | 'admin_access' | 'admin_action';
export interface AuditLogData {
    userId?: string;
    ip: string;
    action: AuditAction;
    meta?: Record<string, any>;
}
/**
 * Log an audit event to the database
 */
export declare function logAuditEvent(data: AuditLogData): Promise<void>;
/**
 * Get audit logs with pagination and optional filtering
 */
export declare function getAuditLogs(options?: {
    limit?: number;
    offset?: number;
    cursor?: string;
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
}): Promise<{
    logs: any;
    total: number;
    hasMore: boolean;
    nextCursor: string | undefined;
}>;
/**
 * Get audit statistics for admin dashboard
 */
export declare function getAuditStats(): Promise<{
    totalLogs: any;
    signupCount: any;
    loginSuccessCount: any;
    loginFailCount: any;
    recentActivity: any;
}>;
/**
 * Helper function to extract IP address from request
 */
export declare function extractIpFromRequest(req: Request): string;
/**
 * Helper function to extract user ID from request headers (set by middleware)
 */
export declare function extractUserIdFromRequest(req: Request): string | undefined;
