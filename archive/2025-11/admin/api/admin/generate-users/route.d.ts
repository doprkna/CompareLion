import { NextResponse } from "next/server";
export declare const runtime = "nodejs";
export declare function POST(): Promise<NextResponse<{
    ok: boolean;
    count: number;
}> | NextResponse<{
    ok: boolean;
    error: any;
}>>;
