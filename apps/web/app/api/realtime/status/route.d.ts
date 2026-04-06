/**
 * Real-Time Status Endpoint (JSON)
 *
 * Always returns JSON status of realtime service.
 * Client should check this before connecting to SSE.
 */
import { NextRequest, NextResponse } from "next/server";
export declare const runtime = "nodejs";
export declare const dynamic = "force-dynamic";
export declare function GET(request: NextRequest): Promise<NextResponse<{
    ok: boolean;
    mode: "disabled" | "enabled";
    reason: string | undefined;
    updatedAt: string;
}>>;
