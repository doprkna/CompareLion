import { NextResponse } from "next/server";
export declare const runtime = "nodejs";
export declare function POST(): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    success: boolean;
    message: string;
    stats: {
        users: number;
        messages: number;
        questions: number;
        achievements: any;
        badges: any;
        potions: any;
        duration: string;
    };
}>>;
