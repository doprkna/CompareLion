const NextResponse = {
    json: (data, options) => {
        return { headers: { set: () => { } } };
    }
};
/**
 * Generate a unique request ID using Web Crypto API (Edge Runtime compatible)
 */
export function generateRequestId() {
    // Use Web Crypto API for Edge Runtime compatibility
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
/**
 * Extract request ID from headers or generate a new one
 */
export function getRequestId(req) {
    return req.headers.get('x-request-id') || generateRequestId();
}
/**
 * Add request ID to response headers
 */
export function addRequestIdToResponse(response, requestId) {
    response.headers.set('x-request-id', requestId);
    return response;
}
/**
 * Create a response with request ID
 */
export function createResponseWithRequestId(data, status = 200, requestId) {
    const response = NextResponse.json(data, { status });
    return addRequestIdToResponse(response, requestId);
}
