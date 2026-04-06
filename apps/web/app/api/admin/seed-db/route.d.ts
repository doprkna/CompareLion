/**
 * POST /api/admin/seed-db
 * Admin-only. Runs seed-world (dev-only). Calls runSeedWorld internally.
 */
import { NextRequest, NextResponse } from 'next/server';
export declare function POST(_req: NextRequest): Promise<NextResponse<{
    ok: boolean;
    error: string;
}> | NextResponse<{
    ok: boolean;
    message: string;
    stats: Record<string, number>;
}>>;
