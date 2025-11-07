/**
 * Admin Authentication Utilities
 * v0.20.1 - Check if user is an admin
 */

import { prisma } from '@/lib/db';

/**
 * Check if user is an admin based on role
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return user?.role === 'ADMIN' || user?.role === 'DEVOPS';
}

/**
 * Check if user is an admin by email (for env-based admin)
 */
export function isAdminByEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return adminEmails.includes(email);
}

/**
 * Get admin status for user
 */
export async function getAdminStatus(userId: string, email: string): Promise<boolean> {
  // Check role-based admin
  const roleAdmin = await isAdmin(userId);
  if (roleAdmin) return true;

  // Check env-based admin
  return isAdminByEmail(email);
}

