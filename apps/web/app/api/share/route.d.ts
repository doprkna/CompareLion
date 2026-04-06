/**
 * Social Share OG Image Generator
 * Generates Open Graph images for sharing user stats
 * v0.13.2n - Community Growth
 */
import { NextRequest } from 'next/server';
export declare const runtime = "edge";
/**
 * GET /api/share?xp=1000&level=5&streak=7&name=Player
 * Generates OG image with user stats
 */
export declare const GET: (req: NextRequest) => Promise<Response>;
