/**
 * Server-Side Admin Detection
 * v0.35.16c - Server-only admin checks for API routes
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

/**
 * Server-side admin view check for API routes
 * Returns true if user is ADMIN/MODERATOR or in development mode
 */
export async function isAdminViewServer(): Promise<boolean> {
  // Always allow in development
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    return userRole === 'ADMIN' || userRole === 'MODERATOR';
  } catch {
    return false;
  }
}

/**
 * Check if session user is admin (for API routes that already have session)
 */
export function isAdminSession(session: any): boolean {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  
  const userRole = (session?.user as any)?.role;
  return userRole === 'ADMIN' || userRole === 'MODERATOR';
}
