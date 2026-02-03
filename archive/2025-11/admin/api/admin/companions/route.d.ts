/**
 * Admin Companions API
 * v0.36.17 - Companions + Pets System v0.1
 */
import { NextRequest } from 'next/server';
export declare const runtime = "nodejs";
/**
 * GET /api/admin/companions
 * List all companions
 */
export declare const GET: any;
/**
 * POST /api/admin/companions
 * Create or update companion
 */
export declare const POST: any;
/**
 * PUT /api/admin/companions/seed
 * Seed default companions
 */
export declare function PUT(req: NextRequest): Promise<any>;
