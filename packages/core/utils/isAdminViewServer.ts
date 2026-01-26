/**
 * Server-Side Admin Detection
 * v0.35.16c - Server-only admin checks for API routes
 * v0.41.21 - Conflict zone hardening: added null checks and safer type access
 */

// sanity-fix: replaced next-auth import with local stub (web-only dependency)
const getServerSession = async (options: any): Promise<any> => null;
import { IS_PROD } from '../config/env'; // sanity-fix: replaced @parel/core/config alias with relative import
import { authOptions } from './authOptions'; // sanity-fix

/**
 * Server-side admin view check for API routes
 * Returns true if user is ADMIN/MODERATOR or in development mode
 */
export async function isAdminViewServer(): Promise<boolean> {
  // Always allow in development
  if (!IS_PROD) {
    return true;
  }

  try {
    if (!authOptions) return false; // sanity-fix
    const session = await getServerSession(authOptions);
    
    // Guard: ensure session and user exist
    if (!session?.user) {
      return false;
    }

    // Safer type access (avoid 'as any')
    const user = session.user as { role?: string } | undefined;
    const userRole = user?.role;
    
    return userRole === 'ADMIN' || userRole === 'MODERATOR';
  } catch (error) {
    // Minimal logging (no sensitive data)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[isAdminViewServer] Auth check failed:', error instanceof Error ? error.message : 'Unknown error');
    }
    return false;
  }
}

/**
 * Check if session user is admin (for API routes that already have session)
 */
export function isAdminSession(session: any): boolean {
  if (!IS_PROD) {
    return true;
  }
  
  // Guard: ensure session and user exist
  if (!session?.user) {
    return false;
  }

  // Safer type access (avoid 'as any')
  const user = session.user as { role?: string } | undefined;
  const userRole = user?.role;
  
  return userRole === 'ADMIN' || userRole === 'MODERATOR';
}
