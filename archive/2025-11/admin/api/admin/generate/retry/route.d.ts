/**

// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';
 * Admin API: Retry Failed Generation Jobs
 *
 * POST - Reset FAILED jobs in a batch back to PENDING
 */
import { NextRequest, NextResponse } from 'next/server';
/**
 * POST /api/admin/generate/retry
 * Reset FAILED jobs to PENDING for retry
 * Requires x-admin-token header
 */
export declare function POST(req: NextRequest): Promise<NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<{
    success: boolean;
    message: string;
    retriedCount: any;
}>>;
