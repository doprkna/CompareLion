import { NextRequest, NextResponse } from 'next/server';
export declare const runtime = "nodejs";
export declare function GET(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    error: string;
}> | NextResponse<{
    success: boolean;
    entries: any;
}>>;
