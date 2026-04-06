/**
 * Adventure API
 * v0.36.16 - Adventure Mode v0.1
 */
import { NextRequest } from 'next/server';
export declare const runtime = "nodejs";
/**
 * GET /api/adventure
 * Get current adventure state
 */
export declare const GET: any;
/**
 * POST /api/adventure/start
 * Start a new adventure run
 */
export declare function POST(req: NextRequest): Promise<any>;
