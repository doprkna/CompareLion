import { NextRequest, NextResponse } from 'next/server';
export declare const runtime = "nodejs";
export declare function PATCH(req: NextRequest, { params }: {
    params: {
        id: string;
    };
}): Promise<NextResponse<any>>;
