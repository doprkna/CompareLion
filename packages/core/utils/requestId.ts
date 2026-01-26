// sanity-fix: replaced next/server import with local stub (web-only dependency)
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
const NextResponse = {
  json: (data: any, options?: { status?: number }): NextResponse => {
    return { headers: { set: () => {} } } as NextResponse;
  }
};

/**
 * Generate a unique request ID using Web Crypto API (Edge Runtime compatible)
 */
export function generateRequestId(): string {
  // Use Web Crypto API for Edge Runtime compatibility
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Extract request ID from headers or generate a new one
 */
export function getRequestId(req: NextRequest): string {
  return req.headers.get('x-request-id') || generateRequestId();
}

/**
 * Add request ID to response headers
 */
export function addRequestIdToResponse(response: NextResponse, requestId: string): NextResponse {
  response.headers.set('x-request-id', requestId);
  return response;
}

/**
 * Create a response with request ID
 */
export function createResponseWithRequestId(
  data: any, 
  status: number = 200, 
  requestId: string
): NextResponse {
  const response = NextResponse.json(data, { status });
  return addRequestIdToResponse(response, requestId);
}
