/**

// Force Node.js runtime for Prisma (v0.35.16d)
export const runtime = 'nodejs';
 * Queue Statistics API (v0.11.2)
 *
 * Admin endpoint for monitoring BullMQ queue metrics.
 */
import { NextRequest, NextResponse } from "next/server";
export declare function GET(req: NextRequest): Promise<NextResponse<{
    error: string;
}> | NextResponse<{
    timestamp: string;
    health: {
        overall: string;
        components: {
            cpu: string;
            memory: string;
            dbPool: string;
        };
    };
    queues: any;
    system: {
        cpu: any;
        memory: any;
        database: {
            pool: any;
        };
    };
    summary: {
        totalJobs: any;
        activeJobs: any;
        waitingJobs: any;
        failedJobs: any;
    };
}>>;
