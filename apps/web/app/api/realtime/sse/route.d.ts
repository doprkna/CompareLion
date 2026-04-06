/**
 * Real-Time Server-Sent Events (SSE) Endpoint
 *
 * Always returns SSE stream.
 * If disabled: sends one "disabled" event then closes cleanly.
 * If enabled: sends ping every 15s and broadcasts events.
 */
import { NextRequest } from "next/server";
export declare const runtime = "nodejs";
export declare const dynamic = "force-dynamic";
export declare function GET(request: NextRequest): Promise<Response>;
