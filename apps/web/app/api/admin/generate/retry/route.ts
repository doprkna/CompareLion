/**
 * Admin API: Retry Failed Generation Jobs
 * 
 * POST - Reset FAILED jobs in a batch back to PENDING
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';
import { GEN_CONFIG } from '@/lib/config/generator';

/**
 * Simple admin authentication
 * Checks for x-admin-token header
 */
function auth(req: NextRequest): boolean {
  const headerToken = req.headers.get('x-admin-token');
  return !!GEN_CONFIG.ADMIN_TOKEN && headerToken === GEN_CONFIG.ADMIN_TOKEN;
}

/**
 * POST /api/admin/generate/retry
 * Reset FAILED jobs to PENDING for retry
 * Requires x-admin-token header
 */
export async function POST(req: NextRequest) {
  // Check authentication
  if (!auth(req)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { batchId } = body;

    if (!batchId) {
      return NextResponse.json(
        { success: false, error: 'batchId is required' },
        { status: 400 }
      );
    }

    // Check if batch exists
    const batch = await prisma.generationBatch.findUnique({
      where: { id: batchId },
      include: {
        _count: {
          select: {
            jobs: {
              where: { status: 'FAILED' },
            },
          },
        },
      },
    });

    if (!batch) {
      return NextResponse.json(
        { success: false, error: 'Batch not found' },
        { status: 404 }
      );
    }

    const failedCount = batch._count.jobs;

    if (failedCount === 0) {
      return NextResponse.json({
        success: true,
        message: 'No failed jobs to retry',
        retriedCount: 0,
      });
    }

    // Reset FAILED jobs back to PENDING
    await prisma.generationJob.updateMany({
      where: { batchId, status: 'FAILED' },
      data: {
        status: 'PENDING',
        error: null,
        startedAt: null,
        finishedAt: null,
      },
    });

    // Reset batch status to PENDING
    await prisma.generationBatch.update({
      where: { id: batchId },
      data: {
        status: 'PENDING',
        failed: 0, // Reset failed count
      },
    });

    return NextResponse.json({
      success: true,
      message: `Reset ${failedCount} failed jobs to PENDING. Run: pnpm gen:questions`,
      retriedCount: failedCount,
    });
  } catch (error) {
    console.error('Error retrying batch:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to retry batch',
      },
      { status: 500 }
    );
  }
}

