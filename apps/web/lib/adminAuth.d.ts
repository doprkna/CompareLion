/**
 * Admin Authentication Utilities
 * v0.20.1 - Check if user is an admin
 */
/**
 * Check if user is an admin based on role
 */
export declare function isAdmin(userId: string): Promise<boolean>;
/**
 * Check if user is an admin by email (for env-based admin)
 */
export declare function isAdminByEmail(email: string): boolean;
/**
 * Get admin status for user
 */
export declare function getAdminStatus(userId: string, email: string): Promise<boolean>;
