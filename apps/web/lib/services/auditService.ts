import { prisma } from '@/lib/db';

export type AuditAction = 
  | 'signup'
  | 'login_success'
  | 'login_fail'
  | 'password_reset_request'
  | 'password_reset_success'
  | 'email_verify_request'
  | 'email_verify_success'
  | 'newsletter_opt_in'
  | 'newsletter_opt_out'
  | 'purchase_succeeded'
  | 'purchase_failed'
  | 'subscription_created'
  | 'subscription_cancelled'
  | 'profile_updated'
  | 'admin_access'
  | 'admin_action';

export interface AuditLogData {
  userId?: string;
  ip: string;
  action: AuditAction;
  meta?: Record<string, any>;
}

/**
 * Log an audit event to the database
 */
export async function logAuditEvent(data: AuditLogData): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        ip: data.ip,
        action: data.action,
        meta: data.meta || null,
      },
    });
  } catch (error) {
    // Don't throw errors from audit logging to avoid breaking main functionality
    console.error('Failed to log audit event:', error);
  }
}

/**
 * Get audit logs with pagination and optional filtering
 */
export async function getAuditLogs(options: {
  limit?: number;
  offset?: number;
  cursor?: string;
  userId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
} = {}) {
  const {
    limit = 20,
    offset = 0,
    cursor,
    userId,
    action,
    startDate,
    endDate,
  } = options;

  const where: any = {};

  if (userId) {
    where.userId = userId;
  }

  if (action) {
    where.action = action;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = startDate;
    }
    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  // Handle cursor-based pagination
  if (cursor) {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      const [timestamp, id] = decoded.split('-');
      const cursorDate = new Date(parseInt(timestamp));
      
      where.OR = [
        {
          createdAt: {
            lt: cursorDate,
          },
        },
        {
          createdAt: cursorDate,
          id: {
            lt: id,
          },
        },
      ];
    } catch {
      // Invalid cursor, ignore it
    }
  }

  // Fetch one extra item to determine if there are more
  const logs = await prisma.auditLog.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
    orderBy: [
      {
        createdAt: 'desc',
      },
      {
        id: 'desc',
      },
    ],
    take: limit + 1,
  });

  const hasMore = logs.length > limit;
  const actualLogs = hasMore ? logs.slice(0, limit) : logs;
  
  let nextCursor: string | undefined;
  if (hasMore && actualLogs.length > 0) {
    const lastLog = actualLogs[actualLogs.length - 1];
    const timestamp = lastLog.createdAt.getTime();
    nextCursor = Buffer.from(`${timestamp}-${lastLog.id}`).toString('base64');
  }

  // Get total count for stats (only if not using cursor)
  let total = 0;
  if (!cursor) {
    total = await prisma.auditLog.count({ where });
  }

  return {
    logs: actualLogs,
    total,
    hasMore,
    nextCursor,
  };
}

/**
 * Get audit statistics for admin dashboard
 */
export async function getAuditStats() {
  const [
    totalLogs,
    signupCount,
    loginSuccessCount,
    loginFailCount,
    recentActivity,
  ] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.count({ where: { action: 'signup' } }),
    prisma.auditLog.count({ where: { action: 'login_success' } }),
    prisma.auditLog.count({ where: { action: 'login_fail' } }),
    prisma.auditLog.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    }),
  ]);

  return {
    totalLogs,
    signupCount,
    loginSuccessCount,
    loginFailCount,
    recentActivity,
  };
}

/**
 * Helper function to extract IP address from request
 */
export function extractIpFromRequest(req: Request): string {
  return (
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

/**
 * Helper function to extract user ID from request headers (set by middleware)
 */
export function extractUserIdFromRequest(req: Request): string | undefined {
  return req.headers.get('x-user-id') || undefined;
}
