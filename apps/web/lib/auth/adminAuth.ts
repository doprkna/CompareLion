import { NextRequest } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth/session';
import { logAuditEvent, extractIpFromRequest } from '@/lib/services/auditService';
import { logger } from '@/lib/logger';

/**
 * Check if a user is an admin based on environment configuration
 */
export function isAdmin(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS;
  if (!adminEmails) {
    return false;
  }

  const adminList = adminEmails.split(',').map(email => email.trim().toLowerCase());
  return adminList.includes(email.toLowerCase());
}

/**
 * Middleware function to require admin access
 */
export async function requireAdmin(req: NextRequest): Promise<{ 
  success: boolean; 
  error?: string; 
  user?: { id: string; email: string } 
}> {
  try {
    // Get session from cookie
    const session = await getSessionFromCookie();
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    // Get user from database
    const { prisma } = await import('@/lib/db');
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true }
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check if user is admin
    if (!isAdmin(user.email)) {
      // Log unauthorized admin access attempt
      await logAuditEvent({
        userId: user.id,
        ip: extractIpFromRequest(req),
        action: 'admin_access',
        meta: { 
          email: user.email,
          authorized: false,
          endpoint: req.url 
        },
      });

      return { success: false, error: 'Admin access required' };
    }

    // Log successful admin access
    await logAuditEvent({
      userId: user.id,
      ip: extractIpFromRequest(req),
      action: 'admin_access',
      meta: { 
        email: user.email,
        authorized: true,
        endpoint: req.url 
      },
    });

    return { success: true, user };
  } catch (error) {
    logger.error('Admin auth error', error);
    return { success: false, error: 'Authentication failed' };
  }
}

/**
 * Get list of admin emails from environment
 */
export function getAdminEmails(): string[] {
  const adminEmails = process.env.ADMIN_EMAILS;
  if (!adminEmails) {
    return [];
  }

  return adminEmails.split(',').map(email => email.trim().toLowerCase());
}
