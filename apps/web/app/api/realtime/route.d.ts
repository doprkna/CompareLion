/**
 * Real-Time Endpoint (Shim)
 *
 * Redirects to /api/realtime/sse for SSE connections.
 * Maintains backward compatibility.
 */
import { NextRequest, NextResponse } from "next/server";
export declare const runtime = "nodejs";
export declare const dynamic = "force-dynamic";
export declare function GET(request: NextRequest): Promise<NextResponse<unknown>>;
