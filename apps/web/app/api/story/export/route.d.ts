/**
 * Parel Story Generator - PNG Export API 2.0
 * Generate PNG grid from story panels (supports 1-8 panels, vertical/grid layouts)
 * v0.40.2 - Parel Stories 2.0 (Extended Stories)
 */
import { NextRequest } from 'next/server';
export declare const runtime = "nodejs";
/**
 * GET /api/story/export?panels=JSON&layoutMode=vertical|grid&title=...&logline=...
 * Generate PNG story grid
 * Query params: panels (JSON), layoutMode (optional, default: grid), title (optional), logline (optional)
 */
export declare function GET(req: NextRequest): Promise<Response>;
