/**
 * Admin Flow Metrics API
 * Returns flow activity statistics
 * v0.13.2i
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { safeAsync } from '@/lib/api-handler';
import { getFlowMetrics } from '@/lib/metrics';

export const runtime = 'nodejs';

export const GET = safeAsync(async (req: NextRequest) => {
  // Require admin access
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  // Get flow metrics
  const metrics = await getFlowMetrics();

  return NextResponse.json(metrics);
});


