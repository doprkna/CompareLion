import { NextRequest } from 'next/server';
/**
 * Check if a user is an admin based on environment configuration
 */
export declare function isAdmin(email: string): boolean;
/**
 * Middleware function to require admin access
 */
export declare function requireAdmin(req: NextRequest): Promise<{
    success: boolean;
    error?: string;
    user?: {
        id: string;
        email: string;
    };
}>;
/**
 * Get list of admin emails from environment
 */
export declare function getAdminEmails(): string[];
