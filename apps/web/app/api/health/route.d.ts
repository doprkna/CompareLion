/**
 * Health Check Endpoint
 * Lightweight edge runtime check for deployment status
 * v0.35.16d - Vercel production stability
 * v0.41.1 - C3 Step 2: Unified API envelope
 * v0.41.8 - C3 Step 9: DTO Consolidation Batch #1
 */
import { NextRequest, NextResponse } from 'next/server';
export declare const runtime = "edge";
export declare function GET(req: NextRequest): Promise<NextResponse<{
    ok: boolean;
    env: {
        isProd: any;
        hasDb: any;
        hasRedis: any;
    };
    version: string;
}>>;
