/**
 * Server-Side Admin Detection
 * v0.35.16c - Server-only admin checks for API routes
 * v0.41.21 - Conflict zone hardening: added null checks and safer type access
 */
/**
 * Server-side admin view check for API routes
 * Returns true if user is ADMIN/MODERATOR or in development mode
 */
export declare function isAdminViewServer(): Promise<boolean>;
/**
 * Check if session user is admin (for API routes that already have session)
 */
export declare function isAdminSession(session: any): boolean;
