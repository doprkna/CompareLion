import { NextRequest, NextResponse } from 'next/server';
export declare const runtime = "nodejs";
export declare function POST(_req: NextRequest, { params }: {
    params: {
        id: string;
    };
}): Promise<NextResponse<any>>;
