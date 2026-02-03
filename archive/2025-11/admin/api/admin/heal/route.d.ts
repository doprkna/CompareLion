/**
 * Manual Self-Healing Trigger (v0.11.3)
 *
 * Admin endpoint to manually trigger healing routines.
 */
import { NextResponse } from "next/server";
export declare function POST(): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    timestamp: string;
    results: any;
}>>;
