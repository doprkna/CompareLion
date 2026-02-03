import { NextResponse } from "next/server";
export declare const runtime = "nodejs";
export declare function POST(): Promise<NextResponse<{
    ok: boolean;
    created: number;
}> | NextResponse<{
    ok: boolean;
    error: any;
}>>;
