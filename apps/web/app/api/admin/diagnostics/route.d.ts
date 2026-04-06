/**
 * GET /api/admin/diagnostics
 * Admin-only runtime health and seed status
 */
import { NextRequest, NextResponse } from 'next/server';
export declare function GET(_req: NextRequest): Promise<NextResponse<{
    ok: boolean;
    error: string;
}> | NextResponse<{
    ok: boolean;
    meta: Record<string, string | undefined>;
    db: {
        connected: boolean;
        urlRedacted: string | undefined;
        host: string | undefined;
        dbName: string | undefined;
        error: string | undefined;
    };
    seed: {
        markerFound: boolean;
        marker: string | undefined;
        lastSeedAt: string | undefined;
        counts: {
            categories: number;
            flowQuestions: number;
            users: number;
            responses: number;
        };
        notes: string[] | undefined;
    };
    flow: {
        canStart: boolean;
        sampleCategoryId: string | undefined;
        sampleQuestionId: string | undefined;
        error: string | undefined;
    };
    world: {
        counts: Record<string, number | null>;
        empty: string[];
        warnings: string[];
    };
}>>;
