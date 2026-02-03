/**
 * Admin API: Question Generation Management
 *
 * GET  - List recent generation batches
 * POST - Create a new generation batch
 */
import { NextRequest, NextResponse } from 'next/server';
export declare const runtime = "nodejs";
/**
 * GET /api/admin/generate
 * List recent generation batches with job statistics
 */
export declare function GET(req: NextRequest): Promise<NextResponse<{
    success: boolean;
    batches: any;
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
/**
 * POST /api/admin/generate
 * Create a new generation batch
 * Requires x-admin-token header
 */
export declare function POST(req: NextRequest): Promise<NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<{
    success: boolean;
    batchId: any;
    message: string;
}>>;
