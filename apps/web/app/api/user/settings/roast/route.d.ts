import { NextRequest, NextResponse } from 'next/server';
export declare const GET: (req: NextRequest) => Promise<NextResponse<{
    enabled: boolean;
    text: null;
    updatedAt: string;
}>>;
export declare const POST: any;
