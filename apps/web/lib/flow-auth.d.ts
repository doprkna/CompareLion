/**
 * Flow API auth: session or dev-only smoke-key bypass.
 * Smoke bypass: APP_ENV=dev + x-smoke-key === SMOKE_KEY → authenticate as demo user.
 * Never allows bypass in production.
 */
import { NextRequest } from 'next/server';
export interface FlowUser {
    id: string;
    email: string;
}
/**
 * Returns FlowUser for flow routes, or null if unauthenticated.
 * In dev: accepts x-smoke-key header when SMOKE_KEY matches.
 */
export declare function getFlowUser(req: NextRequest): Promise<FlowUser | null>;
