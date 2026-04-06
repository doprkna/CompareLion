/**
 * Companion API
 * v0.36.17 - Companions + Pets System v0.1
 */
import { NextRequest } from 'next/server';
export declare const runtime = "nodejs";
/**
 * GET /api/companion
 * Get user's companions
 */
export declare const GET: any;
/**
 * POST /api/companion/equip
 * Equip a companion
 */
export declare function POST(req: NextRequest): Promise<any>;
