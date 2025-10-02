import { prisma } from '@/lib/db';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const CLEANUP_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours (cleanup old records)

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  lockoutExpiresAt?: Date;
  message?: string;
}

export async function checkRateLimit(ipAddress: string): Promise<RateLimitResult> {
  const now = new Date();
  const lockoutThreshold = new Date(now.getTime() - LOCKOUT_DURATION_MS);
  
  // Check if IP is currently locked out
  const recentAttempts = await prisma.failedLoginAttempt.findMany({
    where: {
      ipAddress,
      createdAt: {
        gte: lockoutThreshold,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const failedAttempts = recentAttempts.length;
  
  if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
    const oldestRecentAttempt = recentAttempts[recentAttempts.length - 1];
    const lockoutExpiresAt = new Date(oldestRecentAttempt.createdAt.getTime() + LOCKOUT_DURATION_MS);
    
    if (now < lockoutExpiresAt) {
      return {
        allowed: false,
        remainingAttempts: 0,
        lockoutExpiresAt,
        message: `Too many failed login attempts. Please try again in ${Math.ceil((lockoutExpiresAt.getTime() - now.getTime()) / 60000)} minutes.`,
      };
    }
  }

  const remainingAttempts = Math.max(0, MAX_FAILED_ATTEMPTS - failedAttempts);
  
  return {
    allowed: true,
    remainingAttempts,
  };
}

export async function recordFailedAttempt(ipAddress: string, email: string): Promise<void> {
  await prisma.failedLoginAttempt.create({
    data: {
      ipAddress,
      email,
    },
  });
}

export async function clearFailedAttempts(ipAddress: string): Promise<void> {
  // Clean up old failed attempts for this IP
  const cleanupThreshold = new Date(Date.now() - CLEANUP_WINDOW_MS);
  
  await prisma.failedLoginAttempt.deleteMany({
    where: {
      ipAddress,
      createdAt: {
        lt: cleanupThreshold,
      },
    },
  });
}

export async function clearAllFailedAttempts(ipAddress: string): Promise<void> {
  // Clear all failed attempts for successful login
  await prisma.failedLoginAttempt.deleteMany({
    where: {
      ipAddress,
    },
  });
}
