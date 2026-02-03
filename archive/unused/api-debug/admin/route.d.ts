import { NextResponse } from "next/server";
export declare function GET(): Promise<NextResponse<{
    success: boolean;
    message: string;
    suggestion: string;
}> | NextResponse<{
    success: boolean;
    adminUser: {
        id: any;
        email: any;
        name: any;
        level: any;
        xp: any;
        createdAt: any;
        hasPasswordHash: boolean;
        passwordHashLength: any;
        passwordHashPrefix: any;
    };
}> | NextResponse<{
    success: boolean;
    error: any;
    message: string;
}>>;
