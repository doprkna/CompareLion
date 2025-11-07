import { NextRequest } from 'next/server';
import { safeAsync, successResponse } from '@/lib/api-handler';

/**
 * GET /api/health
 * Health check endpoint for monitoring
 */
export const GET = safeAsync(async (_req: NextRequest) => {
  const maintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
  
  return successResponse({
    status: maintenanceMode ? 'maintenance' : 'ok',
    timestamp: new Date().toISOString(),
    version: '0.22.0',
    uptime: process.uptime(),
  });
});
