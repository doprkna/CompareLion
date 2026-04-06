/**
 * AURE Interaction Engine - Mix Collage API
 * Generate PNG collage from multiple rating requests
 * v0.39.8 - Mix Mode 2.0 (Multi-Image Vibe Story)
 */
import { NextRequest } from 'next/server';
export declare const runtime = "nodejs";
/**
 * GET /api/aure/interaction/mix/collage?requestIds=id1,id2,id3
 * Generate PNG collage from request IDs
 */
export declare function GET(req: NextRequest): Promise<Response>;
