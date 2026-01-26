/**
 * Real-Time Endpoint (Shim)
 * 
 * Redirects to /api/realtime/sse for SSE connections.
 * Maintains backward compatibility.
 */

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // 307 Temporary Redirect to SSE endpoint
  const url = new URL(request.url);
  url.pathname = "/api/realtime/sse";
  return NextResponse.redirect(url, { status: 307 });
}













