interface NextRequest {
    headers: {
        get(name: string): string | null;
    };
}
interface NextResponse {
    headers: {
        set(name: string, value: string): void;
    };
}
declare const NextResponse: {
    json: (data: any, options?: {
        status?: number;
    }) => NextResponse;
};
/**
 * Generate a unique request ID using Web Crypto API (Edge Runtime compatible)
 */
export declare function generateRequestId(): string;
/**
 * Extract request ID from headers or generate a new one
 */
export declare function getRequestId(req: NextRequest): string;
/**
 * Add request ID to response headers
 */
export declare function addRequestIdToResponse(response: NextResponse, requestId: string): NextResponse;
/**
 * Create a response with request ID
 */
export declare function createResponseWithRequestId(data: any, status: number | undefined, requestId: string): NextResponse;
export {};
