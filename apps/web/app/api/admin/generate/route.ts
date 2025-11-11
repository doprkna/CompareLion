/**
 * Admin API: Question Generation Management
 * 
 * GET  - List recent generation batches
 * POST - Create a new generation batch
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@parel/db/src/client';
import { GEN_CONFIG } from '@/lib/config/generator';

// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';

/**
 * Simple admin authentication
 * Checks for x-admin-token header
 */
function auth(req: NextRequest): boolean {
  const headerToken = req.headers.get('x-admin-token');
  return !!GEN_CONFIG.ADMIN_TOKEN && headerToken === GEN_CONFIG.ADMIN_TOKEN;
}

/**
 * GET /api/admin/generate
 * List recent generation batches with job statistics
 */
export async function GET(req: NextRequest) {
  try {
    const batches = await prisma.generationBatch.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        _count: {
          select: { jobs: true },
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      batches 
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch batches' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/generate
 * Create a new generation batch
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
    const body = await req.json().catch(() => ({}));
    const language = body.language || GEN_CONFIG.LANGUAGES[0];

    // Get count of leaf categories to set targetCount
    const categoryCount = await prisma.sssCategory.count();

    // Create empty PENDING batch
    // The worker script will create jobs and process them
    const batch = await prisma.generationBatch.create({
      data: {
        language,
        targetCount: categoryCount,
        status: 'PENDING',
        note: 'UI-triggered batch',
      },
    });

    return NextResponse.json({
      success: true,
      batchId: batch.id,
      message: `Batch created. Run: pnpm gen:questions`,
    });
  } catch (error) {
    console.error('Error creating batch:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create batch' 
      },
      { status: 500 }
    );
  }
}

