/**
 * AURE Life Engine - Yearly Wrap Share Card API
 * Generate shareable PNG card for yearly wrap
 * v0.39.4 - AURE Yearly Wrap
 */
import { NextRequest } from 'next/server';
export declare const runtime = "nodejs";
/**
 * GET /api/aure/life/yearly-wrap/share?wrapId=XYZ
 * Generate shareable PNG card for yearly wrap
 */
export declare function GET(req: NextRequest): Promise<Response>;
