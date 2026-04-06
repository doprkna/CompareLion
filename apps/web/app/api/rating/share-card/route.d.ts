/**
 * Rating Share Card API
 * Generate shareable PNG card for rating results
 * v0.38.10 - Shareable Rating Card (PNG Export)
 */
import { NextRequest } from 'next/server';
export declare const runtime = "nodejs";
/**
 * POST /api/rating/share-card
 * Generate shareable PNG card for a rating result
 * Body: { requestId }
 */
export declare function POST(req: NextRequest): Promise<Response>;
