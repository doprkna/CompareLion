import type { NextRequest } from 'next/server';
export declare function getAuthedUser(req: NextRequest): {
    id: string;
    tenantId: string;
};
