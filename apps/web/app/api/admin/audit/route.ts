export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/adminAuth';
import { getAuditLogs, getAuditStats } from '@/lib/services/auditService';
import { parsePaginationParams, buildPaginationHeaders } from '@/lib/utils/pagination';

export async function GET(req: NextRequest) {
  try {
    // Require admin access
    const adminCheck = await requireAdmin(req);
    if (!adminCheck.success) {
      return NextResponse.json(
        { success: false, error: adminCheck.error },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const paginationParams = parsePaginationParams(searchParams, {
      maxLimit: 100,
      defaultLimit: 20,
    });
    const userId = searchParams.get('userId') || undefined;
    const action = searchParams.get('action') || undefined;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    const stats = searchParams.get('stats') === 'true';

    // Validate parameters
    if (paginationParams.limit && paginationParams.limit > 1000) {
      return NextResponse.json(
        { success: false, error: 'Limit cannot exceed 1000' },
        { status: 400 }
      );
    }

    if (paginationParams.limit && paginationParams.limit < 1) {
      return NextResponse.json(
        { success: false, error: 'Limit must be at least 1' },
        { status: 400 }
      );
    }

    // Get audit logs
    const result = await getAuditLogs({
      limit: paginationParams.limit,
      cursor: paginationParams.cursor,
      userId,
      action,
      startDate,
      endDate,
    });

    // Format response
    const formattedLogs = result.logs.map(log => ({
      id: log.id,
      userId: log.userId,
      userEmail: log.user?.email || null,
      ip: log.ip,
      action: log.action,
      meta: log.meta,
      createdAt: log.createdAt.toISOString(),
    }));

    const response: any = {
      success: true,
      logs: formattedLogs,
      pagination: {
        total: result.total,
        limit: paginationParams.limit,
        cursor: paginationParams.cursor,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
      },
    };

    // Include stats if requested
    if (stats) {
      const auditStats = await getAuditStats();
      response.stats = auditStats;
    }

    const nextResponse = NextResponse.json(response);
    
    // Add pagination headers
    const paginationHeaders = buildPaginationHeaders(result);
    Object.entries(paginationHeaders).forEach(([key, value]) => {
      nextResponse.headers.set(key, value);
    });
    
    return nextResponse;
  } catch (error) {
    console.error('Audit logs fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
